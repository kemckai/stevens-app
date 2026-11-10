// Seeds only the public course catalog and session schedule.
// Creates NO user accounts (unlike seed.js, which creates demo logins with
// passwords published in the README). Create your own admin with:
//   node create-admin.js you@example.com 'a-strong-password' 'Your Name'
const DB = require('./db');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'db.json');
if (fs.existsSync(dbPath)) { console.log('data/db.json already exists; not overwriting.'); process.exit(0); }

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

console.log('\n✅ Catalog seeded (no user accounts created).');
