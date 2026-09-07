# Susu Management System (Admin Only)

A desktop/web-based Susu management system for a single admin to manage
members, savings, withdrawals, groups, and reports — built to match your
wireframe exactly.

**Stack:** React + Vite + Tailwind (frontend) · Node.js + Express (backend) ·
PostgreSQL (database) · JWT auth · Electron (optional desktop wrapper)

---

## 1. Folder structure

```
susu-management-system/
  backend/     -> Express API + PostgreSQL
  frontend/    -> React + Vite + Tailwind (Members, Savings, Withdrawals, Groups, Reports, Settings)
```

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env      # then edit .env with your real DATABASE_URL and JWT_SECRET
```

Create the database and run the schema:

```bash
psql -U your_pg_user -d susu_db -f sql/schema.sql
```

Create the ONE admin account (the system only ever has one admin, per the design):

```bash
npm run seed:admin
```

Start the API:

```bash
npm run dev      # http://localhost:5000
```

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env      # points VITE_API_URL at your backend
npm run dev       # http://localhost:5173
```

Log in with the admin username/password you created in step 2.

## 4. Turning it into a desktop app (optional, Electron)

The wireframe describes this as a "desktop/web based" system. Once you're
happy with the web version:

```bash
npm run build           # inside frontend/ - builds static files
```

I've set `base: "./"` in `vite.config.js` already so the build works inside
Electron. Next step (I'll guide you through this when you're ready) is
adding an `electron/main.js` that loads the built `dist/index.html` in a
native window.

## 5. Deployment (matches your agreed setup)

- **Backend + PostgreSQL** → Render (Render's free Postgres works well for this)
- **Frontend** → Vercel
- Set `VITE_API_URL` on Vercel to your Render backend URL
- Set `CLIENT_URL` on Render to your Vercel frontend URL (for CORS)

## 6. Screens implemented (matches your wireframe numbering)

| # | Screen | Status |
|---|--------|--------|
| 3.1 | Login | ✅ |
| 3.2 | Dashboard | ✅ |
| 3.3 | Members List | ✅ |
| 3.4 | Add/Edit Member | ✅ |
| 3.5 | Record Savings | ✅ |
| 3.6 | Savings History | ✅ |
| 3.7 | Record Withdrawal | ✅ |
| 3.8 | Withdrawal History | ✅ |
| 3.9 | Groups | ✅ |
| 3.10 | Reports (Savings, Withdrawals, Cashbook) | ✅ |
| 3.11 | Member Statement | ✅ |
| 3.12 | Settings (Profile, Password, Backup/Restore) | ✅ |

## 7. What's intentionally simple (next steps we can build together)

- Backup/restore currently downloads/uploads a JSON file (matches the
  wireframe's "Backup/Restore" without needing cloud storage yet).
- No pagination on Reports yet — fine for small-to-mid susu groups, can add
  later if your member count grows large.
- Electron wrapper is scaffolded conceptually in the README but the actual
  `main.js` isn't written yet — say the word and we'll add it next.
