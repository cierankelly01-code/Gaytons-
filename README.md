# Gaytons Bakery — Trade Ordering Portal

A full-stack trade ordering web application for Gaytons Bakery (Est. 1918). Built with React + Vite + Tailwind on the frontend and Node.js + Express + PostgreSQL (Prisma) on the backend.

## Features

- **Customer Portal** — Browse 243 products, add to basket, submit orders before 3 PM daily cutoff
- **Admin Portal** — Manage orders, generate picking sheets, manage customers and products
- **Security** — JWT auth in HTTP-only cookies, bcrypt, rate limiting, RBAC, audit logging, account lockout
- **Real-time countdown** to daily 3 PM UK cutoff (BST/GMT aware)
- **Picking sheet** — Print-optimised, consolidated by category

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

---

## Setup

### 1. Clone and configure environment

```bash
git clone <repo>

# Server environment
cp .env.example server/.env
# Edit server/.env with your DATABASE_URL, JWT secrets, SMTP config
```

### 2. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3. Set up the database

```bash
cd server

# Run migrations
npx prisma migrate dev --name init

# Seed the database (243 products + admin user)
npm run db:seed
```

**Default admin credentials:**
- Email: `admin@gaytonsbakery.co.uk`
- Password: `Admin@Gaytons1`

### 4. Run in development

Open two terminals:

```bash
# Terminal 1 — Server (port 3001)
cd server && npm run dev

# Terminal 2 — Client (port 5173)
cd client && npm run dev
```

Visit http://localhost:5173

---

## Environment Variables

Copy `.env.example` to `server/.env` and configure:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret for access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (min 32 chars) |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port (587 for TLS, 465 for SSL) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | From address for emails |
| `CLIENT_URL` | Frontend URL (for CORS and email links) |
| `PORT` | Server port (default: 3001) |

---

## Production Build

```bash
# Build frontend
cd client && npm run build

# The built files go to client/dist — serve via nginx or a static host (Vercel/Netlify)

# Server — run with:
cd server && npm start
```

---

## Project Structure

```
/
├── client/          # React + Vite + Tailwind frontend
│   └── src/
│       ├── components/
│       │   ├── auth/        # Login, ProtectedRoute
│       │   ├── customer/    # Dashboard, Catalogue, Basket, etc.
│       │   ├── admin/       # AdminDashboard, OrderMgmt, etc.
│       │   └── shared/      # Common UI components
│       ├── context/         # AuthContext, BasketContext
│       ├── hooks/           # useDebounce, useSessionTimeout
│       ├── api/             # Axios client with interceptors
│       └── utils/           # Formatters
│
└── server/          # Node.js + Express backend
    ├── prisma/
    │   ├── schema.prisma    # Database schema
    │   └── seed.js          # 243 products + admin user
    └── src/
        ├── controllers/     # Request handlers
        ├── routes/          # Express routers
        ├── middleware/       # Auth, RBAC, rate limit, validation
        ├── services/        # Email, order number generation
        └── utils/           # Audit logger, cutoff utils
```

---

## Security Implementation

- JWT tokens in HTTP-only, SameSite=Strict cookies (never localStorage)
- Bcrypt with 12 salt rounds
- Rate limiting: 5 login attempts per 15 minutes per IP
- Account lockout after 5 failed attempts (15 min)
- Full audit log for all actions
- Helmet.js security headers
- Strict CORS whitelist
- express-validator on all inputs
- Session timeout: warning at 25 min, auto-logout at 30 min

---

## Order Cutoff Logic

- Daily cutoff: **3:00 PM UK time** (Europe/London — handles BST/GMT automatically)
- After cutoff: order submission blocked, UI shows "Orders reopen at midnight"
- Delivery date: next working day, skipping weekends and UK bank holidays
- Friday before 3 PM → Monday delivery
