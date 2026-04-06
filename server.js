const express = require('express');
const session = require('express-session');
const path = require('path');
const crypto = require('crypto');
const DB = require('./db');

const app = express();
const PORT = 4001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: crypto.randomBytes(32).toString('hex'), resave: false, saveUninitialized: false, cookie: { maxAge: 24*60*60*1000 } }));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

function requireAuth(req, res, next) {
  if (!req.session.user) { req.session.flash = 'Please log in to continue.'; return res.redirect('/login'); }
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/');
  next();
}

// Helper: get category class
function catClass(cat) {
  const map = { trauma: 'trauma', pediatric: 'pediatric', cardiac: 'cardiac', leadership: 'leadership', consulting: 'consulting' };
  return map[(cat || '').toLowerCase()] || 'default';
}
app.use((req, res, next) => { res.locals.catClass = catClass; next(); });

// ===== PUBLIC =====
app.get('/', (req, res) => {
  const courses = DB.getActiveCourses();
  const sessions = DB.getUpcomingSessions();
  res.render('home', { courses, sessions });
});

app.get('/courses', (req, res) => {
  const courses = DB.getActiveCourses();
  res.render('courses', { courses });
});

app.get('/courses/:id', (req, res) => {
  const course = DB.findCourseById(parseInt(req.params.id));
  if (!course) return res.redirect('/courses');
  const sessions = DB.getUpcomingSessions().filter(s => s.course_id === course.id);
  res.render('course-detail', { course, sessions });
});

app.get('/schedule', (req, res) => {
  const sessions = DB.getUpcomingSessions();
  const courses = DB.getActiveCourses();
  const enriched = sessions.map(s => ({ ...s, course: courses.find(c => c.id === s.course_id) }));
  res.render('schedule', { sessions: enriched });
});

app.get('/about', (req, res) => res.render('about'));
app.get('/contact', (req, res) => res.render('contact'));

app.get('/login', (req, res) => res.render('login'));
app.post('/login', (req, res) => {
  const user = DB.authenticateUser(req.body.email, req.body.password);
  if (!user) { req.session.flash = 'Invalid email or password.'; return res.redirect('/login'); }
  req.session.user = { id: user.id, email: user.email, full_name: user.full_name, role: user.role, credentials: user.credentials };
  res.redirect(user.role === 'admin' ? '/admin' : '/portal');
});

app.get('/register', (req, res) => res.render('register'));
app.post('/register', (req, res) => {
  const { full_name, email, phone, credentials, password, password2 } = req.body;
  if (password !== password2) { req.session.flash = 'Passwords do not match.'; return res.redirect('/register'); }
  const user = DB.createUser(email, password, full_name, phone, 'student', credentials);
  if (!user) { req.session.flash = 'Account with that email already exists.'; return res.redirect('/register'); }
  req.session.flash = 'Account created! Please log in.';
  res.redirect('/login');
});

app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

// ===== STUDENT PORTAL =====
app.get('/portal', requireAuth, (req, res) => {
  const bookings = DB.getBookingsByUser(req.session.user.id);
  const sessions = DB.getAllSessions();
  const courses = DB.getAllCourses();
  const enriched = bookings.map(b => {
    const sess = sessions.find(s => s.id === b.session_id);
    const course = sess ? courses.find(c => c.id === sess.course_id) : null;
    return { ...b, session: sess, course };
  });
  const credits = DB.getTotalCreditsByUser(req.session.user.id);
  res.render('student/dashboard', { bookings: enriched, totalCredits: credits });
});

app.get('/portal/book/:sessionId', requireAuth, (req, res) => {
  const sess = DB.findSessionById(parseInt(req.params.sessionId));
  if (!sess) return res.redirect('/schedule');
  const course = DB.findCourseById(sess.course_id);
  res.render('student/book', { session: sess, course, success: false });
});
app.post('/portal/book/:sessionId', requireAuth, (req, res) => {
  const sess = DB.findSessionById(parseInt(req.params.sessionId));
  if (!sess) return res.redirect('/schedule');
  const course = DB.findCourseById(sess.course_id);
  if (sess.spots_taken >= sess.spots_total) { req.session.flash = 'This session is fully booked.'; return res.redirect('/schedule'); }
  const booking = DB.createBooking(req.session.user.id, sess.id, course.price, 'paid');
  if (!booking) { req.session.flash = 'You are already registered for this session.'; return res.redirect('/portal'); }
  const dueDate = sess.date;
  DB.createInvoice(req.session.user.id, booking.id, course.price, `${course.title} — ${sess.date}`, dueDate);
  DB.updateBooking(booking.id, { payment_status: 'paid' });
  DB.updateInvoice(booking.id, { status: 'paid', paid_at: new Date().toISOString() });
  res.render('student/book', { session: sess, course, success: true });
});

app.get('/portal/bookings', requireAuth, (req, res) => {
  const bookings = DB.getBookingsByUser(req.session.user.id);
  const sessions = DB.getAllSessions();
  const courses = DB.getAllCourses();
  const enriched = bookings.map(b => {
    const sess = sessions.find(s => s.id === b.session_id);
    const course = sess ? courses.find(c => c.id === sess.course_id) : null;
    return { ...b, session: sess, course };
  });
  res.render('student/bookings', { bookings: enriched });
});

app.get('/portal/invoices', requireAuth, (req, res) => {
  const invoices = DB.getInvoicesByUser(req.session.user.id);
  res.render('student/invoices', { invoices });
});

app.get('/portal/credits', requireAuth, (req, res) => {
  const credits = DB.getCreditsByUser(req.session.user.id);
  const totalHours = DB.getTotalCreditsByUser(req.session.user.id);
  const courses = DB.getAllCourses();
  const enriched = credits.map(c => ({ ...c, course: courses.find(co => co.id === c.course_id) }));
  res.render('student/credits', { credits: enriched, totalHours });
});

app.get('/portal/profile', requireAuth, (req, res) => {
  const profile = DB.findUserById(req.session.user.id);
  res.render('student/profile', { profile, success: false });
});
app.post('/portal/profile', requireAuth, (req, res) => {
  const { full_name, email, phone, credentials, password, password2 } = req.body;
  const updates = { full_name, email, phone, credentials };
  if (password && password === password2) updates.password = password;
  DB.updateUser(req.session.user.id, updates);
  req.session.user.full_name = full_name;
  req.session.user.email = email;
  const profile = DB.findUserById(req.session.user.id);
  res.render('student/profile', { profile, success: true });
});

// ===== ADMIN =====
app.get('/admin', requireAdmin, (req, res) => {
  const students = DB.getStudents();
  const courses = DB.getAllCourses();
  const sessions = DB.getAllSessions();
  const bookings = DB.getAllBookings();
  const invoices = DB.getAllInvoices();
  const revenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  res.render('admin/dashboard', { stats: { students: students.length, courses: courses.length, sessions: sessions.length, bookings: bookings.length, revenue } });
});

app.get('/admin/courses', requireAdmin, (req, res) => {
  const courses = DB.getAllCourses();
  res.render('admin/courses', { courses });
});
app.post('/admin/courses', requireAdmin, (req, res) => {
  const { title, description, category, format, duration_hours, price, ce_credits, max_students } = req.body;
  DB.createCourse(title, description, category, format, duration_hours, price, ce_credits, max_students);
  res.redirect('/admin/courses');
});

app.get('/admin/sessions', requireAdmin, (req, res) => {
  const sessions = DB.getAllSessions();
  const courses = DB.getAllCourses();
  const enriched = sessions.map(s => ({ ...s, course: courses.find(c => c.id === s.course_id) }));
  res.render('admin/sessions', { sessions: enriched, courses });
});
app.post('/admin/sessions', requireAdmin, (req, res) => {
  const { course_id, date, time, location, location_type, spots, notes } = req.body;
  DB.createSession(parseInt(course_id), date, time, location, location_type, spots, notes);
  res.redirect('/admin/sessions');
});

app.get('/admin/bookings', requireAdmin, (req, res) => {
  const bookings = DB.getAllBookings();
  const sessions = DB.getAllSessions();
  const courses = DB.getAllCourses();
  const users = DB.getAllUsers();
  const enriched = bookings.map(b => ({
    ...b,
    user: users.find(u => u.id === b.user_id),
    session: sessions.find(s => s.id === b.session_id),
    course: (() => { const s = sessions.find(s => s.id === b.session_id); return s ? courses.find(c => c.id === s.course_id) : null; })()
  }));
  res.render('admin/bookings', { bookings: enriched });
});

app.get('/admin/invoices', requireAdmin, (req, res) => {
  const invoices = DB.getAllInvoices();
  const users = DB.getAllUsers();
  const enriched = invoices.map(i => ({ ...i, user: users.find(u => u.id === i.user_id) }));
  res.render('admin/invoices', { invoices: enriched });
});
app.post('/admin/invoices/:id/status', requireAdmin, (req, res) => {
  const updates = { status: req.body.status };
  if (req.body.status === 'paid') updates.paid_at = new Date().toISOString();
  DB.updateInvoice(parseInt(req.params.id), updates);
  res.redirect('/admin/invoices');
});

app.get('/admin/students', requireAdmin, (req, res) => {
  const students = DB.getStudents();
  res.render('admin/students', { students });
});

app.get('/admin/credits', requireAdmin, (req, res) => {
  const credits = DB.getAllCredits();
  const users = DB.getAllUsers();
  const courses = DB.getAllCourses();
  const enriched = credits.map(c => ({ ...c, user: users.find(u => u.id === c.user_id), course: courses.find(co => co.id === c.course_id) }));
  res.render('admin/credits', { credits: enriched });
});
app.post('/admin/credits', requireAdmin, (req, res) => {
  const { user_id, course_id, session_id, hours, description } = req.body;
  DB.awardCredit(parseInt(user_id), parseInt(course_id), parseInt(session_id) || 0, hours, description);
  res.redirect('/admin/credits');
});

// 404
app.use((req, res) => {
  res.status(404).send('<html><head><link rel="stylesheet" href="/css/style.css"></head><body style="display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;"><div><h1 style="font-size:4rem;color:var(--accent);">404</h1><p>Page not found.</p><a href="/" class="btn btn-blue" style="margin-top:1rem;">Return Home</a></div></body></html>');
});

app.listen(PORT, () => console.log(`🏥 Steven's App running on http://localhost:${PORT}`));
