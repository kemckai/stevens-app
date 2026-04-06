const DB = require('./db');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'db.json');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

console.log('🏥 Seeding Steven\'s App...');

// Admin
const admin = DB.createUser('steven@stevensapp.com', 'admin2026', 'Steven Jewell', '210-555-0100', 'admin', 'BSN, RN, CEN, CPEN');
console.log(`  ✓ Admin: ${admin.email}`);

// Demo students
const s1 = DB.createUser('sarah.nurse@example.com', 'demo2026', 'Sarah Chen, RN', '210-555-0201', 'student', 'BSN, RN');
const s2 = DB.createUser('james.doc@example.com', 'demo2026', 'Dr. James Rivera', '210-555-0202', 'student', 'MD, FACEP');
const s3 = DB.createUser('maria.rn@example.com', 'demo2026', 'Maria Gonzalez, RN', '210-555-0203', 'student', 'MSN, RN, CCRN');
console.log('  ✓ 3 demo students created');

// Courses
const c1 = DB.createCourse('Advanced Trauma Assessment', 'Comprehensive trauma assessment for emergency department nurses and physicians. Covers primary/secondary surveys, FAST exam interpretation, and critical decision-making in the golden hour.', 'Trauma', 'in-person', 8, 349, 8, 25);
const c2 = DB.createCourse('Pediatric Emergency Essentials', 'Evidence-based approaches to pediatric emergencies. Includes airway management, medication dosing, and recognition of critically ill children.', 'Pediatric', 'in-person', 6, 279, 6, 20);
const c3 = DB.createCourse('Rapid ECG Interpretation', 'Master 12-lead ECG interpretation with hands-on practice. From normal sinus to STEMI recognition — build confidence in cardiac emergency management.', 'Cardiac', 'virtual', 4, 199, 4, 40);
const c4 = DB.createCourse('Emergency Nursing Leadership', 'Developing charge nurse and leadership skills in high-acuity environments. Crisis resource management, team communication, and operational excellence.', 'Leadership', 'virtual', 3, 149, 3, 50);
const c5 = DB.createCourse('Trauma Resuscitation Masterclass', 'Advanced resuscitation techniques for Level I trauma centers. Massive transfusion protocols, damage control resuscitation, and team-based approaches.', 'Trauma', 'in-person', 10, 449, 10, 20);
const c6 = DB.createCourse('1-on-1 Clinical Consultation', 'Private consultation session with Steven Jewell. Discuss career development, clinical challenges, department workflows, or certification preparation.', 'Consulting', 'virtual', 1, 125, 0, 1);
console.log('  ✓ 6 courses created');

// Upcoming sessions
const sess1 = DB.createSession(c1.id, '2026-05-15', '08:00', 'University Hospital — San Antonio, TX', 'in-person', 25, 'Bring scrubs. Lunch provided.');
const sess2 = DB.createSession(c2.id, '2026-05-22', '09:00', 'Methodist Hospital — San Antonio, TX', 'in-person', 20, 'Pediatric simulation lab access included.');
const sess3 = DB.createSession(c3.id, '2026-06-03', '18:00', 'Zoom (link sent after registration)', 'virtual', 40, 'Evening session for working nurses.');
const sess4 = DB.createSession(c4.id, '2026-06-10', '12:00', 'Zoom (link sent after registration)', 'virtual', 50, 'Lunch-hour session.');
const sess5 = DB.createSession(c5.id, '2026-06-20', '07:00', 'Brooke Army Medical Center — San Antonio, TX', 'in-person', 20, 'Full day with cadaver lab. Limited spots.');
const sess6 = DB.createSession(c1.id, '2026-07-10', '08:00', 'Houston Methodist — Houston, TX', 'in-person', 25, 'Houston session.');
const sess7 = DB.createSession(c6.id, '2026-05-12', '14:00', 'Zoom (private link)', 'virtual', 1, '');
console.log('  ✓ 7 sessions created');

// Sample bookings
const b1 = DB.createBooking(s1.id, sess1.id, 349, 'paid');
const b2 = DB.createBooking(s2.id, sess1.id, 349, 'paid');
const b3 = DB.createBooking(s1.id, sess3.id, 199, 'paid');
const b4 = DB.createBooking(s3.id, sess5.id, 449, 'pending');
console.log('  ✓ 4 sample bookings created');

// Sample invoices
DB.createInvoice(s1.id, b1.id, 349, 'Advanced Trauma Assessment — May 15, 2026', '2026-05-01');
DB.updateInvoice(1, { status: 'paid', paid_at: '2026-04-20T10:00:00Z' });
DB.createInvoice(s2.id, b2.id, 349, 'Advanced Trauma Assessment — May 15, 2026', '2026-05-01');
DB.updateInvoice(2, { status: 'paid', paid_at: '2026-04-22T14:30:00Z' });
DB.createInvoice(s1.id, b3.id, 199, 'Rapid ECG Interpretation — June 3, 2026', '2026-05-20');
DB.updateInvoice(3, { status: 'paid', paid_at: '2026-04-25T09:00:00Z' });
DB.createInvoice(s3.id, b4.id, 449, 'Trauma Resuscitation Masterclass — June 20, 2026', '2026-06-01');
console.log('  ✓ 4 invoices created');

// CE Credits for completed
DB.awardCredit(s1.id, c1.id, sess1.id, 8, 'Advanced Trauma Assessment — completed');
DB.awardCredit(s2.id, c1.id, sess1.id, 8, 'Advanced Trauma Assessment — completed');
DB.awardCredit(s1.id, c3.id, sess3.id, 4, 'Rapid ECG Interpretation — completed');
console.log('  ✓ 3 CE credit records created');

console.log('\n✅ Database seeded successfully!');
