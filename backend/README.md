# CMS Backend — Client Management System (Express + Prisma + PostgreSQL)

REST API backend for the Client Management System technical assessment.

## Tech Stack
- Node.js + Express + TypeScript
- PostgreSQL (Neon) via Prisma ORM 7 (driver adapter: `@prisma/adapter-pg`)
- JWT authentication (`jsonwebtoken` + `bcryptjs`)
- Zod for request validation

## Project Structure
```
cms-backend/
├── prisma/
│   ├── schema.prisma      # DB models: User, Client, Note
│   └── seed.ts            # Sample data seeder
├── src/
│   ├── controllers/       # Route handlers (business logic)
│   ├── middleware/        # auth, role checks, error handler
│   ├── routes/             # Express routers
│   ├── lib/                 # prisma client, jwt helpers, zod schemas
│   ├── types/               # Express type augmentation
│   └── server.ts            # App entry point
├── .env.example
└── package.json
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in values:
   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |---|---|
   | `DATABASE_URL` | Neon Postgres connection string (include `?sslmode=require`) |
   | `JWT_SECRET` | Any long random string, used to sign JWTs |
   | `PORT` | Port the API runs on (default 5000) |
   | `FRONTEND_URL` | Your frontend's origin, for CORS (default `http://localhost:3000`) |

3. Push schema to your database and generate the Prisma client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. Seed sample data:
   ```bash
   npm run seed
   ```
   This creates:
   - Admin: `admin@cms.com` / `admin123`
   - Staff: `priya@cms.com` / `staff123`
   - Staff: `rahul@cms.com` / `staff123`
   - 6 sample clients across all pipeline statuses

5. Run the dev server:
   ```bash
   npm run dev
   ```
   API available at `http://localhost:5000`.

## Business Rules
- **Roles:** `ADMIN` sees/manages all clients and users. `STAFF` only sees clients assigned to them.
- **Status pipeline:** `LEAD → ONBOARDING → ACTIVE ⇄ ON_HOLD → CLOSED`. Illegal jumps (e.g. `LEAD → ACTIVE` directly) are rejected by the API — see `isValidTransition` in `src/lib/validators.ts`.
- Every status change auto-logs a `Note` entry for audit history.
- Only admins can reassign a client to a different staff member, or delete a client.

## API Documentation

Base URL: `http://localhost:5000/api`

All endpoints except `/auth/register` and `/auth/login` require:
```
Authorization: Bearer <token>
```

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create a new user |
| POST | `/auth/login` | Public | Login, returns `{ token, user }` |
| GET | `/auth/me` | Authenticated | Get current user profile |

**POST /auth/login** body:
```json
{ "email": "admin@cms.com", "password": "admin123" }
```

### Clients
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/clients` | Authenticated | List clients (Staff sees only their own). Supports `?status=` and `?search=` query params |
| GET | `/clients/:id` | Authenticated | Get one client with notes |
| POST | `/clients` | Authenticated | Create a client |
| PATCH | `/clients/:id` | Authenticated | Update client fields |
| PATCH | `/clients/:id/status` | Authenticated | Change status (validates pipeline transition) |
| DELETE | `/clients/:id` | Admin only | Delete a client |

**POST /clients** body:
```json
{
  "name": "Test Client",
  "company": "Test Co",
  "email": "test@client.com",
  "phone": "9999999999",
  "address": "Pune",
  "source": "Referral",
  "status": "LEAD"
}
```

**PATCH /clients/:id/status** body:
```json
{ "status": "ONBOARDING" }
```

### Notes
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/clients/:clientId/notes` | Authenticated | List notes for a client |
| POST | `/clients/:clientId/notes` | Authenticated | Add a note to a client |

### Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/dashboard` | Authenticated | Aggregate stats: total clients, counts by status, conversion rate, recent activity. Admins additionally get per-staff breakdown |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users` | Admin only | List all users (for assignment dropdowns) |

## Error Format
```json
{ "error": "Message describing what went wrong" }
```
Validation errors additionally include a `details` array with per-field messages.

## Known Limitations
- No email notifications on status changes.
- No pagination on `/clients` yet (fine for demo data volumes).
- No refresh-token rotation — JWT is a single long-lived (7 day) token.

## Future Enhancements
- Pagination and sorting on client list
- File attachments on clients
- Email notifications on status changes
- Audit log export (CSV)
