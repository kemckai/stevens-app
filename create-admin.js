// Usage: node create-admin.js <email> <password> [full name]
const DB = require('./db');
const fs = require('fs');
const path = require('path');
const [email, password, name] = process.argv.slice(2);
if (!email || !password || password.length < 10) {
  console.error('Usage: node create-admin.js <email> <password (10+ chars)> [full name]');
  process.exit(1);
}
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const u = DB.createUser(email, password, name || 'Admin', '', 'admin', '');
if (!u) { console.error('A user with that email already exists.'); process.exit(1); }
console.log('Admin created:', u.email);
