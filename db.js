// Flat-file JSON database for Steven's App
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

function load() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch { return { users: [], courses: [], sessions: [], bookings: [], invoices: [], ce_credits: [], _seq: {} }; }
}
function save(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  return salt + ':' + crypto.pbkdf2Sync(pw, salt, 100000, 64, 'sha512').toString('hex');
}
function verifyPassword(pw, stored) {
  const [salt, hash] = stored.split(':');
  return hash === crypto.pbkdf2Sync(pw, salt, 100000, 64, 'sha512').toString('hex');
}
function nextId(db, t) { db._seq[t] = (db._seq[t] || 0) + 1; return db._seq[t]; }

const DB = {
  // Users
  createUser(email, password, full_name, phone, role = 'student', credentials = '') {
    const db = load();
    if (db.users.find(u => u.email === email)) return null;
    const u = { id: nextId(db, 'users'), email, password_hash: hashPassword(password), full_name, phone: phone || '', role, credentials: credentials || '', created_at: new Date().toISOString() };
    db.users.push(u); save(db); return u;
  },
  findUserByEmail(e) { return load().users.find(u => u.email === e) || null; },
  findUserById(id) { return load().users.find(u => u.id === id) || null; },
  authenticateUser(email, pw) {
    const u = this.findUserByEmail(email);
    if (!u || !verifyPassword(pw, u.password_hash)) return null;
    return u;
  },
  updateUser(id, updates) {
    const db = load(); const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    if (updates.password) { updates.password_hash = hashPassword(updates.password); delete updates.password; }
    Object.assign(db.users[idx], updates); save(db); return db.users[idx];
  },
  getAllUsers() { return load().users; },
  getStudents() { return load().users.filter(u => u.role === 'student'); },

  // Courses
  createCourse(title, description, category, format, duration_hours, price, ce_credits, max_students) {
    const db = load();
    const c = { id: nextId(db, 'courses'), title, description, category, format, duration_hours: parseFloat(duration_hours) || 0, price: parseFloat(price) || 0, ce_credits: parseFloat(ce_credits) || 0, max_students: parseInt(max_students) || 30, active: true, created_at: new Date().toISOString() };
    db.courses.push(c); save(db); return c;
  },
  getAllCourses() { return load().courses; },
  getActiveCourses() { return load().courses.filter(c => c.active); },
  findCourseById(id) { return load().courses.find(c => c.id === id) || null; },
  updateCourse(id, updates) {
    const db = load(); const idx = db.courses.findIndex(c => c.id === id);
    if (idx === -1) return null;
    Object.assign(db.courses[idx], updates); save(db); return db.courses[idx];
  },

  // Sessions (scheduled instances of courses)
  createSession(course_id, date, time, location, location_type, spots, notes) {
    const db = load();
    const s = { id: nextId(db, 'sessions'), course_id, date, time, location, location_type, spots_total: parseInt(spots) || 30, spots_taken: 0, notes: notes || '', status: 'upcoming', created_at: new Date().toISOString() };
    db.sessions.push(s); save(db); return s;
  },
  getAllSessions() { return load().sessions; },
  getUpcomingSessions() {
    const today = new Date().toISOString().split('T')[0];
    return load().sessions.filter(s => s.date >= today && s.status === 'upcoming');
  },
  findSessionById(id) { return load().sessions.find(s => s.id === id) || null; },
  updateSession(id, updates) {
    const db = load(); const idx = db.sessions.findIndex(s => s.id === id);
    if (idx === -1) return null;
    Object.assign(db.sessions[idx], updates); save(db); return db.sessions[idx];
  },

  // Bookings
  createBooking(user_id, session_id, amount_paid, payment_status) {
    const db = load();
    if (db.bookings.find(b => b.user_id === user_id && b.session_id === session_id)) return null;
    const b = { id: nextId(db, 'bookings'), user_id, session_id, amount_paid: parseFloat(amount_paid) || 0, payment_status: payment_status || 'pending', booked_at: new Date().toISOString() };
    db.bookings.push(b);
    // increment spots taken
    const sIdx = db.sessions.findIndex(s => s.id === session_id);
    if (sIdx !== -1) db.sessions[sIdx].spots_taken++;
    save(db); return b;
  },
  getBookingsByUser(uid) { return load().bookings.filter(b => b.user_id === uid); },
  getBookingsBySession(sid) { return load().bookings.filter(b => b.session_id === sid); },
  getAllBookings() { return load().bookings; },
  updateBooking(id, updates) {
    const db = load(); const idx = db.bookings.findIndex(b => b.id === id);
    if (idx === -1) return null;
    Object.assign(db.bookings[idx], updates); save(db); return db.bookings[idx];
  },

  // Invoices
  createInvoice(user_id, booking_id, amount, description, due_date) {
    const db = load();
    const inv = { id: nextId(db, 'invoices'), invoice_number: `INV-${String(nextId(db, 'inv_counter')).padStart(4, '0')}`, user_id, booking_id, amount: parseFloat(amount) || 0, description, due_date, status: 'unpaid', created_at: new Date().toISOString(), paid_at: null };
    db.invoices.push(inv); save(db); return inv;
  },
  getInvoicesByUser(uid) { return load().invoices.filter(i => i.user_id === uid); },
  getAllInvoices() { return load().invoices; },
  findInvoiceById(id) { return load().invoices.find(i => i.id === id) || null; },
  updateInvoice(id, updates) {
    const db = load(); const idx = db.invoices.findIndex(i => i.id === id);
    if (idx === -1) return null;
    Object.assign(db.invoices[idx], updates); save(db); return db.invoices[idx];
  },

  // CE Credits
  awardCredit(user_id, course_id, session_id, hours, description) {
    const db = load();
    const c = { id: nextId(db, 'ce_credits'), user_id, course_id, session_id, hours: parseFloat(hours) || 0, description, awarded_at: new Date().toISOString() };
    db.ce_credits.push(c); save(db); return c;
  },
  getCreditsByUser(uid) { return load().ce_credits.filter(c => c.user_id === uid); },
  getAllCredits() { return load().ce_credits; },
  getTotalCreditsByUser(uid) {
    return load().ce_credits.filter(c => c.user_id === uid).reduce((sum, c) => sum + c.hours, 0);
  }
};

module.exports = DB;
