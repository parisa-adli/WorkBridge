# WorkBridge

A freelancing platform that connects project owners with freelancers. Owners post projects, freelancers send proposals, and admins manage users and categories. The UI is bilingual: Persian (RTL, default) and English (LTR).

## Features

- Demo login: pick a role (owner, freelancer, admin) and sign in to a seeded account, no phone needed
- OTP login by phone number, then profile completion with a role. No SMS is sent: outside production the code is shown in the login toast
- **Owner**: create, edit, delete and open/close projects; accept or reject proposals
- **Freelancer**: browse, filter and page through projects; send proposals
- **Admin**: list users and change their status, view a user's profile, manage categories, view all projects and proposals
- Profile page with avatar upload for every role; logout
- Home page with live counts
- Persian and English, light and dark mode, Persian digits and Jalali dates in Persian

## Tech stack

| Part | Stack |
|------|-------|
| Client (`client/`) | React 19, TypeScript (strict), Vite 8, Tailwind CSS 4, shadcn/ui (Radix), lucide-react icons, React Router 7, TanStack Query 5, React Hook Form + Zod, react-i18next, Sonner |
| Server (`server/`) | Node.js, Express 5, TypeScript (strict, run by `tsx`), MongoDB with Mongoose 9, Zod, JWT in httpOnly cookies, helmet, express-rate-limit |
| Tests | Vitest + Testing Library (client), Vitest + Supertest + mongodb-memory-server (server), Playwright + axe (e2e, screenshots in fa/en × light/dark) |
| CI | GitHub Actions: lint, translation parity, typecheck, tests, build, e2e |

## Getting started

Requirements: Node.js 24 and a MongoDB database.

```bash
git clone https://github.com/parisa-adli/WorkBridge.git
cd WorkBridge
npm install
npm install --prefix client
npm install --prefix server
cp server/.env.example server/.env   # then set the secrets
npm run seed --prefix server         # demo accounts, categories, projects and proposals
npm run dev                          # server on :5000, client on :3000
```

The client talks to `http://localhost:5000/api` by default. To use another API, set `VITE_BASE_URL` in `client/.env` (see `client/.env.example`).

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Server (`tsx watch`) and client (Vite) together |
| `npm run e2e` | Playwright suite; starts its own in-memory MongoDB, server and client |
| `npm run build --prefix client` | Production build |
| `npm run lint --prefix client` / `--prefix server` | ESLint (client also checks for physical direction classes) |
| `npm run typecheck --prefix client` / `--prefix server` | `tsc --noEmit` |
| `npm test --prefix client` / `--prefix server` | Vitest |
| `npm run i18n:check --prefix client` | Fails when a key is in only one of `fa.json`/`en.json` |
| `npm run seed --prefix server` | Seeds the demo data (idempotent) |

## Project structure

```
client/src/
  components/ui/  # shadcn/ui primitives
  ui/             # shared building blocks on top of them
  features/       # domain code (auth, projects, proposals, admin, ...)
  pages/          # route pages
  services/       # API calls
  schemas/        # Zod form schemas
  i18n/           # fa.json, en.json
server/
  app/router/        # /user, /category, /stats, /project, /proposal, /admin
  app/http/          # controllers, middlewares, Zod validators
  app/models/        # Mongoose models
  tests/             # API tests
e2e/                 # Playwright specs and screenshot baselines
docs/                # upgrade PRD and plan, design system, current-state report
```
