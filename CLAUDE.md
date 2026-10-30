# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

WorkBridge: a freelancing platform (owners post projects, freelancers send proposals, admins manage users). Monorepo with a React client (`client/`) and an Express/MongoDB API (`server/`). UI text is Persian (RTL); server error messages are Persian too.

## Commands

Install: `npm install && npm install --prefix client && npm install --prefix server`

- `npm run dev` (root): runs server (`tsx watch`, port 5000) and client (Vite, port 3000 per `client/vite.config.js`) together via `concurrently`
- `npm run build --prefix client`: production build
- `npm run lint --prefix client`: flat ESLint config (`client/eslint.config.js`), then `scripts/check-direction.mjs`, which fails on physical direction classes (`ml-`, `pr-`, `left-`, `text-right`, `border-l`, ...): use logical ones (`ms-`, `pe-`, `start-`, `text-start`, `border-e`) so fa (RTL) and en (LTR) mirror. Arrow icons get `ltr:-scale-x-100`.
- `npm run lint --prefix server`: flat ESLint config (`server/eslint.config.js`).
- `npm run typecheck --prefix client`: `tsc --noEmit`, strict with `allowJs: false`: all of `client/src` is `.ts`/`.tsx` (only the Vite and ESLint configs are `.js`). API data is typed against `src/types/api.ts`.
- `npm test --prefix server`: Vitest + Supertest behavior tests (`server/tests/`) against an in-memory MongoDB (the first run downloads a ~600MB mongod binary). They pin the API's behavior; a behavior change updates its test in the same change.
- `npm run i18n:check --prefix client`: fails when a translation key is in only one of `src/i18n/fa.json`/`en.json` (runs in CI).
- `npm test --prefix client`: Vitest + Testing Library (jsdom) characterization tests next to the code (`*.test.ts(x)`), pinning current behavior.
- `npm run e2e` (root): Playwright suite in `e2e/`. Global setup starts an in-memory MongoDB (seeded with one category), the server and the Vite dev server on free ports, so nothing needs to be running. First run: `npx playwright install chromium`. `e2e/screenshots.spec.js` shoots every F9 page (`docs/design.md` §7) in fa/en × light/dark, the lists, detail pages and owner dashboard (drawer closed and open) also at 360px, runs axe (WCAG 2.2 AA) on each, and compares against committed baselines, one set per platform (`-win32`, `-linux` for CI); refresh them with `npm run e2e -- screenshots --update-snapshots` only for an intended visual change.

The server needs `server/.env`; copy `server/.env.example`.

**API target:** `BASE_URL` in `client/src/services/httpService.ts` reads `VITE_BASE_URL` and defaults to the local server (`http://localhost:5000/api`). To hit the deployed backend (`https://freelancer-bc.runflare.run/api`), set `VITE_BASE_URL` in `client/.env` (see `client/.env.example`).

## Client architecture (`client/src`)

The data flow is layered, and each feature follows it:

1. `services/*Service.ts`: thin API functions on the shared `http` axios instance. They return `data.data`, the server's payload envelope.
2. `features/<domain>/use*.ts`: TanStack Query hooks wrapping those services. Queries use string keys (`["owner-projects"]`, `["projects", queryObject]`, `["project", id]`, ...). Mutations show `toast.success(data.message)` / `toast.error(err?.response?.data?.message)` and call `invalidateQueries` on the affected keys. When you add a mutation, invalidate every key that lists the changed entity.
3. `features/<domain>/*.tsx`: domain components. `pages/` holds thin route components. `ui/` holds shared building blocks (`Table`, `Modal`, `RHFSelect`, `Filter`, ...). `ui/` components are built on shadcn/ui (`components.json`): Radix-backed primitives live in `components/ui/` (`dialog`, `switch`), classes merge with `cn` from `lib/utils.ts`, and `@/` is `src/` (`docs/design.md` §9). `AppLayout` renders the `Sidebar` and takes the role's nav links as `children`. Forms use React Hook Form; form-field components are generic over the form's values, so `name` must be a field of the form. Forms with validation use `zodResolver` with schemas in `schemas/` (`auth`, `project`, `proposal`, `status`) that mirror the server's and read limits from `constants/`.

**Auth/roles:** login is OTP by phone (`SendOTPForm` → `CheckOTPForm` → `CompleteProfileForm`). The session is httpOnly JWT cookies. `httpService` retries a request once after a 401 by calling `/user/refresh-token`. Routes live in `App.tsx` under `/owner`, `/freelancer` and `/admin`, each wrapped in `ProtectedRoute`. `useAuthorize` reads the role from the **first URL segment** and compares it with `user.role` (`OWNER`/`FREELANCER`/`ADMIN`). It also requires `user.status === 2` (verified). So a new role-scoped page must sit under its role's path prefix.

List filtering, sorting and paging are driven by URL query params: `useProjects` passes `location.search` directly to `/project/list`. The four paged lists (`project/list`, `project/owner-projects`, `proposal/list`, `admin/user/list`) take `page`/`limit` (`pageQuery` in `common.schema.ts`) and return `Page<T>` = `{ items, total, page, limit }`; tables render `ui/TablePagination`, and counts come from `total`.

**i18n:** `react-i18next`, `fa` (default) and `en` in `src/i18n/`. UI text goes through `t()` (`react/jsx-no-literals` fails lint on literals; it does not check attributes, so `title`/`label`/`alt` need `t()` too). Status badge labels in `constants/` are keys, translated where rendered. Client schema messages use `msg(key)` from `schemas/message.ts`, translated when a parse fails. The `httpService` interceptor translates every server `message` by its `code` (`server.<CODE>` keys; fa keeps the server's Persian text), so toasts need nothing extra; a new server code needs a key in both locales and in the copied list in `src/i18n/serverCodes.test.ts`.

Styling is Tailwind 4 with no JS config: colors are shadcn's variables in `src/index.css` (light values on `:root`, mapped to utilities with `@theme inline`), and `:root.dark-mode` overrides the same variables. New UI uses shadcn's components and tokens (`bg-background`, `text-muted-foreground`, `bg-primary`, `text-destructive`, ...) as shipped, with no other colors (`docs/design.md` §1, §2, §9). Icons are `lucide-react`. Dark mode lives in `context/DarkModeContext.tsx` and is stored via `useLocalStorageState`. Persian numbers and dates come from `utils/`.

## Server architecture (`server/`)

`index.ts` → `app/server.ts` (an `Application` class: helmet, CORS with credentials, 100kb body limit, static files only from `uploads/` at `/uploads`, signed cookie-parser, routes under `/api`, and a central error handler that returns `{ statusCode, message }`).

The server is all TypeScript: strict `tsconfig.json` with `allowJs: false` (only the ESLint and Vitest configs are `.js`). `tsx` runs it (`dev` is `tsx watch`); Vitest runs the `.ts` tests directly. `npm run typecheck --prefix server` runs `tsc --noEmit`. Any `any` needs a comment saying why. `req.user` is typed in `types/express.d.ts`.

- `app/router/router.js` mounts `/user`, `/category`, `/stats` (public home page counts), `/project`, `/proposal` and `/admin`. Project, proposal and admin routes require `verifyAccessToken` + `isVerifiedUser` (user `status`: 0 rejected, 1 pending, 2 verified). Per-route role checks use `authorize(...ROLES)` from `permission.guard.ts`. Roles are in `utils/constants.ts`.
- Controllers (`app/http/controllers`) are classes extending `Controller`; Express 5 forwards their async errors to the central handler. Input is validated in the router with Zod schemas from `app/http/validators`: `validate(schema, "body" | "query" | "params")` (`middlewares/validate.ts`) rejects with `{ statusCode: 400, code, message, field }` for the first failing field; for the body it also replaces `req.body` with the parsed data (query and params are only checked, Express 5's `req.query` is read-only). Each Zod check's Persian message is registered with its code through `issue(code, message)`; shared pieces (`objectId`, `numeric`, id params, sort/search) are in `common.schema.ts`. Controllers throw `apiError(status, ERROR_CODES.X, persianMessage)` and reply with `sendData(res, status, { message, code: SUCCESS_CODES.X, ... })` (both in `utils/apiResponse.ts`, codes in `utils/errorCodes.ts`). Success bodies are `ApiResponse<T>` = `{ statusCode, data }`; error bodies are `{ statusCode, code, message }`. The client relies on this `data` envelope. Never throw without a code: the server tests fail on any error that falls back to `BAD_REQUEST`/`INTERNAL_ERROR` and on any success `message` without a code.
- Mongoose models: `user`, `project` (status `OPEN`/`CLOSED`), `proposal`, `category`. No SMS is sent: outside production `sendOTP` logs the code and returns it as `data.otp` in the `get-otp` response (the login toast shows it). `get-otp`/`check-otp`/`demo-login` are rate-limited per IP (`OTP_RATE_LIMIT`, default 10 per 15 min). `POST /user/demo-login` (username + password, bcrypt hashes) accepts only the usernames in `DEMO_USERS` (OWNER, FREELANCER, ADMIN) and sets the same cookies as OTP; it answers 404 unless `DEMO_LOGIN_ENABLED=true` (required, `true`/`false`, checked at startup). Demo accounts are locked (`isDemoUser`): their status and role can't be changed (`DEMO_ACCOUNT_LOCKED`). The auth page's default demo tab has a role picker that pre-fills and shows each account. `npm run seed --prefix server` (`scripts/seed.ts` → `utils/seedDemoData.ts`, idempotent upserts) creates the demo accounts (keyed by `username`) and bilingual demo categories, projects and proposals; nothing is seeded on startup, and e2e global setup seeds only the accounts.
- Avatars: `PATCH /user/avatar` takes the image as the raw body (`express.raw`, Content-Type `image/jpeg|png|webp`, 2 MB), checks its magic bytes, writes `uploads/<userId>-<ts>.<ext>` and returns `avatarUrl`. Each role has `/<role>/profile`; `UserAvatar` falls back to initials.
- Bilingual content (PRD F10): projects (`title`, `description`, `tags`), proposals (`description`) and users (`name`, `biography`) have an optional `translations.en`; base fields are Persian. Populated user refs select `{ name: 1, translations: 1 }`. On the client, show these fields through `utils/localized.ts` (`localized(item, field)` falls back to the base field; `categoryName()` picks `title`/`englishTitle`), and wrap user content in `dir="auto"`.

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
