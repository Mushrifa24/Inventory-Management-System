# Inventory Management System — Intern Project

You've been given a **partially completed** Inventory Management System
(Node/Express + PostgreSQL backend, React frontend). Your job is to get it
running, understand how it works, and complete the three tasks in `TASKS.md`.

You will **not** be told exactly which lines to change — part of the assessment
is reading the existing code, finding the gap, and following the patterns
already in the project. Treat it like joining a real team's codebase.

This exercise is scoped to roughly **1 – 1.5 days** of work.

---

## Project structure

```
backend/     Node + Express API (PostgreSQL via the `pg` library)
  migrations/   SQL schema
  src/
    routes/     one file per area (auth, products, inventory,
                suppliers, purchases, sales, dashboard, reports)
    middleware/ auth (JWT) middleware
    db.js       database connection pool
    migrate.js  applies the migration
    seed.js     inserts demo data
frontend/    React app (Vite)
  src/
    pages/      one file per screen
    components/ layout + route guard
    context/    auth state
    api.js      small fetch helper used to call the backend
```

---

## Setup

### Prerequisites
- **Node.js 18+**
- **PostgreSQL** running locally (v14+ is fine)

### 1. Database

Create an empty database called `inventory` (use pgAdmin, `createdb inventory`,
or any SQL client). Note the username, password, host and port of your
PostgreSQL server — you'll need them in the next step.

### 2. Backend

```bash
cd backend
cp .env.example .env     # then open .env and set DATABASE_URL (see below)
npm install
npm run migrate          # creates the tables
npm run seed             # loads demo products, suppliers, a purchase and a sale
npm run dev              # starts the API on http://localhost:4000
```

**`.env`** — update `DATABASE_URL` to match your own PostgreSQL login. The
format is:

```
DATABASE_URL=postgres://USERNAME:PASSWORD@HOST:PORT/inventory
```

For a default local install that's usually something like
`postgres://postgres:yourpassword@localhost:5432/inventory`. Leave
`JWT_SECRET` and `PORT` as they are.

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev              # starts the app on http://localhost:5173
```

Open **http://localhost:5173** and log in.

### Logins (created by `npm run seed`)
- **Admin:** `admin@example.com` / `password123`
- **Staff:** `staff@example.com` / `password123`

You can also register a new account from the login screen.

---

## Notes & tips

- The backend must be running for the frontend to work — the frontend proxies
  `/api` calls to `http://localhost:4000`.
- Re-running `npm run seed` resets the demo data (products, suppliers,
  purchases, sales) but keeps the two logins — handy if you want a clean slate.
- If the API won't start, the most common cause is a wrong `DATABASE_URL` in
  `backend/.env`. The error message will usually say so.
- Commit your work incrementally with meaningful messages, and keep a few short
  notes on anything you found broken or had to figure out — you'll be asked
  about it.

## What to do

Open **`TASKS.md`** and work through the three tasks.
