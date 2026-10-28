# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

WorkBridge: a freelancing platform (owners post projects, freelancers send proposals, admins manage users). Monorepo with a React client (`client/`) and an Express/MongoDB API (`server/`). UI text is Persian (RTL); server error messages are Persian too.

## Commands

Install: `npm install && npm install --prefix client && npm install --prefix server`

- `npm run dev` (root): runs server (`tsx watch`, port 5000) and client (Vite, port 3000 per `client/vite.config.js`) together via `concurrently`
- `npm run build --prefix client`: production build
- `npm run lint --prefix client`: flat ESLint config (`client/eslint.config.js`).
- `npm run lint --prefix server`: flat ESLint config (`server/eslint.config.js`).
- `npm run typecheck --prefix client`: `tsc --noEmit`, strict with `allowJs: false`: all of `client/src` is `.ts`/`.tsx` (only the Vite, ESLint, PostCSS and Tailwind configs are `.js`). API data is typed against `src/types/api.ts`.
- `npm test --prefix server`: Vitest + Supertest behavior tests (`server/tests/`) against an in-memory MongoDB (the first run downloads a ~600MB mongod binary). They pin current behavior, including the bugs listed in `docs/known-bugs.md`.
- `npm test --prefix client`: Vitest + Testing Library (jsdom) characterization tests next to the code (`*.test.ts(x)`), pinning current behavior.
- `npm run e2e` (root): Playwright suite in `e2e/`. Global setup starts an in-memory MongoDB (seeded with one category), the server and the Vite dev server on free ports, so nothing needs to be running. First run: `npx playwright install chromium`.

The server needs `server/.env`; copy `server/.env.example`.

**API target:** `BASE_URL` in `client/src/services/httpService.ts` reads `VITE_BASE_URL` and defaults to the local server (`http://localhost:5000/api`). To hit the deployed backend (`https://freelancer-bc.runflare.run/api`), set `VITE_BASE_URL` in `client/.env` (see `client/.env.example`).

## Client architecture (`client/src`)

The data flow is layered, and each feature follows it:

1. `services/*Service.ts`: thin API functions on the shared `http` axios instance. They return `data.data`, the server's payload envelope.
2. `features/<domain>/use*.ts`: TanStack Query hooks wrapping those services. Queries use string keys (`["owner-projects"]`, `["projects", queryObject]`, `["project", id]`, ...). Mutations show `toast.success(data.message)` / `toast.error(err?.response?.data?.message)` and call `invalidateQueries` on the affected keys. When you add a mutation, invalidate every key that lists the changed entity.
3. `features/<domain>/*.tsx`: domain components. `pages/` holds thin route components. `ui/` holds shared building blocks (`Table`, `Modal`, `RHFSelect`, `Textfield`, `Filter`, ...). `AppLayout` renders the `Sidebar` and takes the role's nav links as `children`. Forms use React Hook Form; form-field components are generic over the form's values, so `name` must be a field of the form. Forms with validation use `zodResolver` with schemas in `schemas/` (`auth`, `project`, `proposal`, `status`) that mirror the server's and read limits from `constants/`.

**Auth/roles:** login is OTP by phone (`SendOTPForm` → `CheckOTPForm` → `CompleteProfileForm`). The session is httpOnly JWT cookies. `httpService` retries a request once after a 401 by calling `/user/refresh-token`. Routes live in `App.tsx` under `/owner`, `/freelancer` and `/admin`, each wrapped in `ProtectedRoute`. `useAuthorize` reads the role from the **first URL segment** and compares it with `user.role` (`OWNER`/`FREELANCER`/`ADMIN`). It also requires `user.status === 2` (verified). So a new role-scoped page must sit under its role's path prefix.

List filtering and sorting are driven by URL query params: `useProjects` passes `location.search` directly to `/project/list`.

Dark mode lives in `context/DarkModeContext.tsx` and is stored via `useLocalStorageState`. Persian numbers and dates come from `utils/`.

## Server architecture (`server/`)

`index.ts` → `app/server.ts` (an `Application` class: helmet, CORS with credentials, 100kb body limit, static files only from `uploads/` at `/uploads`, signed cookie-parser, routes under `/api`, and a central error handler that returns `{ statusCode, message }`).

The server is all TypeScript: strict `tsconfig.json` with `allowJs: false` (only the ESLint and Vitest configs are `.js`). `tsx` runs it (`dev` is `tsx watch`); Vitest runs the `.ts` tests directly. `npm run typecheck --prefix server` runs `tsc --noEmit`. Any `any` needs a comment saying why. `req.user` is typed in `types/express.d.ts`.

- `app/router/router.js` mounts `/user`, `/category`, `/project`, `/proposal` and `/admin`. Project, proposal and admin routes require `verifyAccessToken` + `isVerifiedUser` (user `status`: 0 rejected, 1 pending, 2 verified). Per-route role checks use `authorize(...ROLES)` from `permission.guard.ts`. Roles are in `utils/constants.ts`.
- Controllers (`app/http/controllers`) are classes extending `Controller`; Express 5 forwards their async errors to the central handler. Input is validated in the router with Zod schemas from `app/http/validators`: `validate(schema, "body" | "query" | "params")` (`middlewares/validate.ts`) rejects with `{ statusCode: 400, code, message, field }` for the first failing field; for the body it also replaces `req.body` with the parsed data (query and params are only checked, Express 5's `req.query` is read-only). Each Zod check's Persian message is registered with its code through `issue(code, message)`; shared pieces (`objectId`, `numeric`, id params, sort/search) are in `common.schema.ts`. Controllers throw `apiError(status, ERROR_CODES.X, persianMessage)` and reply with `sendData(res, status, { message, code: SUCCESS_CODES.X, ... })` (both in `utils/apiResponse.ts`, codes in `utils/errorCodes.ts`). Success bodies are `ApiResponse<T>` = `{ statusCode, data }`; error bodies are `{ statusCode, code, message }`. The client relies on this `data` envelope. Never throw without a code: the server tests fail on any error that falls back to `BAD_REQUEST`/`INTERNAL_ERROR` and on any success `message` without a code.
- Mongoose models: `user`, `project` (status `OPEN`/`CLOSED`), `proposal`, `category`. No SMS is sent: outside production `sendOTP` logs the code and returns it as `data.otp` in the `get-otp` response (the login toast shows it). `get-otp`/`check-otp` are rate-limited per IP (`OTP_RATE_LIMIT`, default 10 per 15 min).

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
