# Ledger — CMS Frontend (Next.js)

Frontend for the Client Management System technical assessment. Talks to the
`cms-backend` Express API over REST.

## Tech Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Plain `fetch` against the Express API — no server-side data layer, since the
  backend already owns auth, validation, and business rules

## Project Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── login/                # public login page
│   │   ├── (app)/                # authenticated route group (guarded layout)
│   │   │   ├── dashboard/
│   │   │   ├── clients/          # list, [id] detail, new, [id]/edit
│   │   │   └── users/            # admin-only team management
│   │   └── layout.tsx            # fonts + providers
│   ├── components/
│   │   ├── ui/                   # button, input, card, badge, toast, etc.
│   │   ├── layout/                # sidebar, topbar, app shell
│   │   ├── pipeline/               # PipelineRail (interactive) + PipelineBoard (aggregate)
│   │   ├── clients/                 # client table, client form, notes panel
│   │   └── dashboard/                # stat card
│   └── lib/
│       ├── api.ts                # typed fetch wrapper for every backend endpoint
│       ├── auth-context.tsx      # token/user state, persisted to localStorage
│       ├── status.ts             # pipeline transition rules (mirrors backend)
│       ├── types.ts
│       └── utils.ts
└── .env.example
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and point it at your running backend:
   ```bash
   cp .env.example .env.local
   ```
   | Variable | Description |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | Base URL of the Express API, including `/api` (default `http://localhost:5000/api`) |

3. Make sure the backend (`cms-backend`) is running first — see its own README.

4. Run the dev server:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.

## How auth works
- On login, the Express API returns a JWT. It's stored in `localStorage` and
  attached as `Authorization: Bearer <token>` on every request via `lib/api.ts`.
- `AuthProvider` (`lib/auth-context.tsx`) validates the stored token against
  `GET /auth/me` on page load and exposes `user`/`token` through `useAuth()`.
- The `(app)` route group's layout redirects to `/login` if there's no
  authenticated user, so every page under it is protected without repeating
  the check.

## Design concept
The app is framed as a **ledger**: every client is one entry moving along a
fixed five-station pipeline (Lead → Onboarding → Active → On Hold → Closed).
That idea is the throughline of the UI:
- The **Pipeline Rail** (client detail page) is the actual status control —
  clicking a reachable station calls the status API. Unreachable stations
  (per the same transition rules enforced server-side) are simply not
  clickable, so the UI can never offer an illegal move.
- The **Pipeline Board** (dashboard) is the same idea aggregated — a manifest
  of how many clients sit at each station right now.
- Deep ink sidebar, warm paper background, hairline borders instead of heavy
  shadows, a serif display face (Fraunces) for headings against a functional
  sans (Inter) and a monospace face (IBM Plex Mono) for IDs/timestamps/data —
  chosen to feel like a working operations tool, not a marketing template.

## Known Limitations
- Auth token is a plain JWT in `localStorage` (no httpOnly cookie / refresh
  rotation) — fine for this assessment, would move to a cookie-based session
  in production.
- No optimistic UI on note creation / status changes — the app refetches
  after each mutation.
- No pagination on the clients table (matches the backend, fine for demo data
  volumes).

## Future Enhancements
- Table pagination and column sorting
- Optimistic updates for notes and status transitions
- File attachments per client
- Toast-driven undo for destructive actions (delete client)
