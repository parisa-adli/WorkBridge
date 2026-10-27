# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

WorkBridge: a freelancing platform (owners post projects, freelancers send proposals, admins manage users). Monorepo with a React client (`client/`) and an Express/MongoDB API (`server/`). UI text is Persian (RTL); server error messages are Persian too.

## Commands

Install: `npm install && npm install --prefix client && npm install --prefix server`

- `npm run dev` (root): runs server (`tsx watch`, port 5000) and client (Vite, port 3000 per `client/vite.config.js`) together via `concurrently`
- `npm run build --prefix client`: production build
- `npm run lint --prefix client`: flat ESLint config (`client/eslint.config.js`).
- `npm run lint --prefix server`: flat ESLint config (`server/eslint.config.js`).
- `npm test --prefix server`: Vitest + Supertest behavior tests (`server/tests/`) against an in-memory MongoDB (the first run downloads a ~600MB mongod binary). They pin current behavior, including the bugs listed in `docs/known-bugs.md`.
- `npm test --prefix client`: Vitest + Testing Library (jsdom) characterization tests next to the code (`*.test.js(x)`), pinning current behavior.
- `npm run e2e` (root): Playwright suite in `e2e/`. Global setup starts an in-memory MongoDB (seeded with one category), the server and the Vite dev server on free ports, so nothing needs to be running. First run: `npx playwright install chromium`.

The server needs `server/.env`; copy `server/.env.example`.

**API target:** `BASE_URL` in `client/src/services/httpService.js` reads `VITE_BASE_URL` and defaults to the local server (`http://localhost:5000/api`). To hit the deployed backend (`https://freelancer-bc.runflare.run/api`), set `VITE_BASE_URL` in `client/.env` (see `client/.env.example`).

## Client architecture (`client/src`)

The data flow is layered, and each feature follows it:

1. `services/*Service.js`: thin API functions on the shared `http` axios instance. They return `data.data`, the server's payload envelope.
2. `features/<domain>/use*.js`: TanStack Query hooks wrapping those services. Queries use string keys (`["owner-projects"]`, `["projects", queryObject]`, `["project", id]`, ...). Mutations show `toast.success(data.message)` / `toast.error(err?.response?.data?.message)` and call `invalidateQueries` on the affected keys. When you add a mutation, invalidate every key that lists the changed entity.
3. `features/<domain>/*.jsx`: domain components. `pages/` holds thin route components. `ui/` holds shared building blocks (`Table`, `Modal`, `RHFSelect`, `Textfield`, `Filter`, ...). Forms use React Hook Form.

**Auth/roles:** login is OTP by phone (`SendOTPForm` → `CheckOTPForm` → `CompleteProfileForm`). The session is httpOnly JWT cookies. `httpService` retries a request once after a 401 by calling `/user/refresh-token`. Routes live in `App.jsx` under `/owner`, `/freelancer` and `/admin`, each wrapped in `ProtectedRoute`. `useAuthorize` reads the role from the **first URL segment** and compares it with `user.role` (`OWNER`/`FREELANCER`/`ADMIN`). It also requires `user.status === 2` (verified). So a new role-scoped page must sit under its role's path prefix.

List filtering and sorting are driven by URL query params: `useProjects` passes `location.search` directly to `/project/list`.

Dark mode lives in `context/DarkModeContext.jsx` and is stored via `useLocalStorageState`. Persian numbers and dates come from `utils/`.

## Server architecture (`server/`)

`index.ts` → `app/server.ts` (an `Application` class: helmet, CORS with credentials, 100kb body limit, static files only from `uploads/` at `/uploads`, signed cookie-parser, routes under `/api`, and a central error handler that returns `{ statusCode, message }`).

TypeScript is mid-conversion: strict `tsconfig.json` with `allowJs`, so `.ts` (utils, models, middlewares, entry, `server.ts`) and `.js` (controllers, routers, validators, tests) coexist. `tsx` runs both (`dev` is `tsx watch`; `tests/setup.js` registers `tsx/cjs` so tests can `require` `.ts`). `npm run typecheck --prefix server` runs `tsc --noEmit`. `req.user` is typed in `types/express.d.ts`.

- `app/router/router.js` mounts `/user`, `/category`, `/project`, `/proposal` and `/admin`. Project, proposal and admin routes require `verifyAccessToken` + `isVerifiedUser` (user `status`: 0 rejected, 1 pending, 2 verified). Per-route role checks use `authorize(...ROLES)` from `permission.guard.ts`. Roles are in `utils/constants.ts`.
- Controllers (`app/http/controllers`) are classes extending `Controller`; Express 5 forwards their async errors to the central handler. They validate with Joi schemas from `app/http/validators`, throw `http-errors`, and reply with `{ statusCode, data: { message, ... } }`. The client relies on this `data` envelope.
- Mongoose models: `user`, `project` (status `OPEN`/`CLOSED`), `proposal`, `category`. No SMS is sent: outside production `sendOTP` logs the code and returns it in the `get-otp` response (the login toast shows it). `get-otp`/`check-otp` are rate-limited per IP (`OTP_RATE_LIMIT`, default 10 per 15 min).

## Upgrade progress

When a phase of `docs/upgrade-plan.md` is completed, you **must** do all of the following in the same commit/PR as the phase's changes. A phase without them is not done:

1. **Mark the phase with a green checkmark:** change its heading's `⬜` to `✅` in `docs/upgrade-plan.md` (e.g. `### Phase 15: Express 5 ✅`). When every phase of a Part is done, mark the Part heading `✅` too.
2. Tick the phase's checkboxes in the plan.
3. Update the plan's "Progress" count and next phase, and the Overview table's Status column (e.g. `⬜ 1/11`, then `✅ 11/11`).
4. Add a row to the "§7 Progress" table at the end of `docs/upgrade-prd.md` (phase, date, commit/PR, evidence).

Mark and tick only after checking the phase's deliverables, not just because a commit exists.

## Agent skills

### Issue tracker

Issues live in GitHub Issues on `parisa-adli/WorkBridge` (via `gh`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
