# Steven's App 🏥

Emergency medicine education platform for **Steven Jewell** — ED Charge Nurse, Level I Trauma Center, San Antonio TX.

## Features

- **Public Site** — Courses, schedule, about, contact
- **Student Portal** — Dashboard, bookings, invoices, CE credit tracking, profile
- **Admin Panel** — Course management, session scheduling, bookings, invoices, student management, CE credit awarding
- **6 Course Categories** — Trauma, Pediatric, Cardiac, Leadership, Consulting
- **CE Credits Tracking** — Continuing Education hours for nursing/medical licensure
- **Invoicing System** — Auto-generated invoices with paid/unpaid/overdue status
- **Registration + Booking** — Students register, browse courses, book sessions, pay
- **Mobile Responsive** — Clean medical blue design

## Tech Stack

- Node.js + Express + EJS
- JSON flat-file database (zero external DB dependencies)
- pbkdf2 password hashing
- express-session for auth

## Quick Start

```bash
npm install
node seed.js
node server.js
```

Runs on **http://localhost:4001**

## Demo Accounts

| Role    | Email                        | Password   |
|---------|------------------------------|------------|
| Admin   | steven@stevensapp.com        | admin2026  |
| Student | sarah.nurse@example.com      | demo2026   |
| Student | james.doc@example.com        | demo2026   |
| Student | maria.rn@example.com         | demo2026   |

## Sample Courses

- Advanced Trauma Assessment (8h, $349, 8 CE)
- Pediatric Emergency Essentials (6h, $279, 6 CE)
- Rapid ECG Interpretation (4h, $199, 4 CE)
- Emergency Nursing Leadership (3h, $149, 3 CE)
- Trauma Resuscitation Masterclass (10h, $449, 10 CE)
- 1-on-1 Clinical Consultation (1h, $125)

## Color Scheme

- **Primary Blue:** #0a4d8c
- **Accent Cyan:** #00b4d8
- **Background:** #f0f4f8

---

Built with ⚡ by Hex
