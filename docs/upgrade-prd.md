# WorkBridge: Upgrade PRD

Status: draft, 2026-10-27. Based on `docs/current-state.md` (commit `8c488c2`), which section references (§) below point to.

---

## 1. Goals

### Why
WorkBridge is a **portfolio showcase**. Today it can't fill that role: it has known security holes, 57 audited vulnerabilities, no tests, a broken linter, dead template code, and no way for a visitor to get past OTP login. This upgrade turns it into a codebase that can be shown to clients and a demo that anyone can click through.

The app is not deployed with data worth keeping. Breaking API changes, schema changes and database wipes are all allowed.

### Success criteria
The upgrade is done when all of these hold:

1. **Security fixed:** every item in §6.1 is closed, each with a regression test where it can be tested. `npm audit` reports 0 high or critical vulnerabilities in both packages.
2. **Tests + CI:** a GitHub Actions workflow runs lint, typecheck, unit/API tests and one Playwright e2e test on every PR, and it is green on `main`.
3. **Deps current:** every dependency is on its current major version, both packages are TypeScript, and `npm run lint` passes in both.
4. **Features shipped:** every feature in §4 meets its acceptance criteria.
5. **Demo works:** a visitor can open the app, choose a role on the demo login, and use that role's dashboard without a phone number or OTP.
6. **Redesigned and bilingual:** every screen uses the new design system and works in Persian (RTL) and English (LTR), in light and dark mode, with no untranslated strings (F9, F10).

---

## 2. Must preserve

These behaviors must work the same after the upgrade. Any change to them needs a deliberate decision recorded in this document. The redesign (F9) changes how screens look, not these behaviors. The English locale (F10) is added alongside them: Persian behavior stays as it is today.

| Area | Behavior to keep |
|---|---|
| **OTP login** | Phone → 6-digit OTP → (new user) complete profile with name, email and role OWNER/FREELANCER. The 90-second resend timer stays. The session uses httpOnly JWT cookies (access 1 day, refresh 1 year), and the client retries once after a 401 via `/user/refresh-token`. |
| **Roles & verification** | Three roles: OWNER, FREELANCER, ADMIN. New users start as `status: 1` (pending), and an admin must verify them (`status: 2`) before they can use a dashboard. Role dashboards live under `/owner`, `/freelancer` and `/admin`, and each is guarded by role and verification. |
| **RTL** | In Persian, `lang="fa" dir="rtl"` across the app. All layouts, modals, tables and form controls render correctly right-to-left. |
| **Persian as default** | Persian is the default language. Every UI string and every server error message has a Persian version. |
| **Persian digits & dates** | In Persian, numbers render as Persian digits (with thousands separators where they are used today), and dates render in the `fa-IR` (Jalali) calendar. The project deadline keeps its Persian date picker. |
| **Dark mode** | The toggle persists across reloads (localStorage) and covers every screen, using the CSS-variable color tokens. |
| **Core flows** | Owner: create, edit, delete, open/close projects and review proposals. Freelancer: browse and filter projects (URL query params) and send proposals. Admin: list users and change their status. |

---

## 3. Changes

### 3.1 Stack

| Area | From | To |
|---|---|---|
| Language | JavaScript | **TypeScript** (strict) in client and server |
| React | 18.3 | 19.x |
| Build | Vite 6, plugin-react 4 | Vite 8, plugin-react 6 |
| Styling | Tailwind 3 + `tailwind.config.js` | Tailwind 4 (CSS-first config), keeping the existing color tokens |
| Router / Query / Forms | RR 7.0, TanStack Query 5.62, RHF 7.54 | latest 7.x / 5.x / 7.x |
| Server | Express 4.18, Mongoose 7.1, Joi 17, dotenv 16, nodemon 2 | Express 5, Mongoose 9, latest dotenv, `tsx watch` in place of nodemon |
| Validation | Joi 17 (server), hand-written RHF rules (client) | **Zod** on both sides. Server schemas give request types through `z.infer`. Client forms use `@hookform/resolvers/zod`. |
| i18n | none (Persian hardcoded) | `react-i18next` with `fa` and `en` resource files |
| Lint | ESLint 9, legacy `.eslintrc.cjs` (broken) | ESLint flat config + typescript-eslint in **both** packages |
| Tests | none | Vitest (unit, both packages), Supertest + `mongodb-memory-server` (API), Playwright (e2e) |
| CI | none | GitHub Actions: install → lint → typecheck → test → e2e |

**Remove:** `react-icon`, `query-string` (client), `joi`, `kavenegar`, `axios`, `moment-jalali` (server), and the extraneous packages in `server/node_modules`. **Add:** `helmet`, `express-rate-limit`, `zod`, `@hookform/resolvers`, `i18next` and `react-i18next`.

### 3.2 Architecture

The repo keeps its current shape: `client/` and `server/` stay independent packages, and the layered client flow (service → query hook → component → page) stays. Changes:

- **Config from env:** the client reads `VITE_BASE_URL` (no more hardcoded `BASE_URL`). The server validates its env at startup and exits if a variable is missing. Fix the README to use port 3000.
- **One source for constants:** roles, user/proposal status codes with their label translation keys and badge styles, and validation limits each get one module per package. Client and server limits must match (title 10–30 characters, budget minimum 100,000). Because there is no shared package, each package keeps its own copy, and a test in each checks the values (see §6).
- **Typed API envelope:** `ApiResponse<T> = { statusCode, data: T }` on the server and the client. Every route returns it, including `logout` and `refresh-token` (fixing the capitalized `StatusCode`).
- **Localized messages via codes:** errors become `{ statusCode, code, message }` and success payloads carry a `code`, where `code` is a stable key such as `PROJECT_NOT_FOUND`. The client translates `code` with i18next. `message` is the Persian text, kept as a fallback for unknown codes. Zod validation errors return the failing field and a code. The server holds no translations of its own, so there is one translation source.
- **Locale layer (client):** an i18n provider sets `<html lang dir>` from the active language. Number and date formatting go through `Intl` with the active locale: `utils/toPersianNumbers` and `toLocalDateShort` become locale-aware formatters. Layouts use Tailwind logical utilities (`ms-*`, `ps-*`, `start-*`, `text-start`) so one markup set works in both directions.
- **Server startup order:** connect to MongoDB first, then `listen`. Exit on connection failure.
- **Static files:** serve only an `uploads/` directory, never `server/` (§6.1.4).
- **Shared server helpers:** `findByIdOr404`, one `cookieOptions(env)`, and one project filter/sort builder used by both list endpoints.
- **Shared client helpers:** one `useAppMutation` (toast + invalidate keys), one `redirectByRole`, one `StatusBadge`, one `StatusSelect`.
- **Pagination contract:** list endpoints accept `page` and `limit` and return `{ items, total, page, limit }`.

### 3.3 Code quality and bug fixes

All of §6.1 (security), §6.4 (error handling) and the "Broken client behavior" and "Server-side gaps" lists in §7 get fixed. The main points:

- **OTP:** keep no OTP state on the controller instance. Generate codes with `crypto.randomInt`, clear the OTP after use, rate-limit `get-otp` and `check-otp`, never return `otp` in a response, and log the code only outside production.
- **Ownership checks:** every project mutation and every proposal status change verifies `project.owner === req.user._id`. ADMIN bypasses the check.
- **Input safety:** whitelist the category query, escape regex input, add a text index to `Project` (or switch search to an escaped regex), and validate every request body, query and param with Zod, including project status and proposal status.
- **Proposal integrity:** the project must exist and be `OPEN`. A freelancer can send only one proposal per project. Add a `project` ref on `Proposal`.
- **Error handling:** fix the `createError` ReferenceErrors, treat `modifiedCount === 0` as success, return 404 for missing resources, handle network errors in the axios interceptor, add fallbacks for unknown status values, and fix the `deadline` Invalid Date bug.
- **Client fixes:** `/not-access` route, `ProtectedRoute` effect dependencies, `UserAvatar` crash when logged out, the `useLocalStorageState` effect, the proposal form loading state, the owner "assigned projects" stat, the stray `;`, the "انتطار" typo, and the missing query invalidations.
- **Delete:** the template dead code (`getUserCartDetail`, `checkProductExist`, `invoiceNumberGenerator`, ...), `decideAuthMiddleware`, `ROLES.USER`, `ZARINPAL_CALLBACK_URL`, `ProjectTable-v1.jsx`, and `sort=popular` (or make it sort by proposal count).
- **Naming:** `proposalServis` → `proposalService`, `category.shcema` → `category.schema`, server package `inventory-app` → `workbridge-server`, one brand name ("WorkBridge") everywhere.

---

## 4. New features

### F1. Demo login (per role)
> As a **portfolio visitor**, I want to log in as an owner, freelancer or admin with one click, so I can explore the app without a phone number.

Acceptance criteria:
- A seed script (`npm run seed --prefix server`) creates three verified demo accounts (OWNER, FREELANCER, ADMIN) plus sample categories, projects and proposals. All sample content is written in both Persian and English (see F10). Running it twice is safe.
- `/auth` has a "demo login" tab next to the OTP flow. The tab has username and password fields that are **pre-filled** with the chosen role's credentials, and the credentials are also shown as text on the page.
- Picking a role swaps the pre-filled credentials. Clicking "ورود" logs in and redirects to that role's dashboard.
- `POST /user/demo-login` accepts only the seeded demo usernames. Passwords are stored hashed (bcrypt or argon2). The endpoint is rate-limited, and it can be turned off with an env flag (`DEMO_LOGIN_ENABLED`).
- The session is the same cookie-based JWT that OTP login issues, so refresh and logout behave the same.
- A demo user can't change its own role or status, or delete or demote another demo account.
- OTP login still works unchanged (covered by the e2e test).

### F2. Logout
> As a **logged-in user**, I want to log out from any page, so I can end my session.

- A logout action appears in the header or user menu on every authenticated layout.
- It calls `/user/logout`, clears the cookies (the `secure` flag matches login), clears the React Query cache, and redirects to `/`.

### F3. Profile page and avatar
> As a **user**, I want to edit my name, email and biography and upload an avatar, so my profile looks complete to others.

- `/<role>/profile` shows a form pre-filled from `/user/profile` and saves via `PATCH /user/update`. Phone number is read-only.
- Avatar upload accepts jpg, png or webp up to 2 MB, is validated on the server, and is stored under `uploads/`. `UserAvatar` shows the avatar or falls back to initials.
- Success and error toasts appear in Persian, and the header refreshes after saving.

### F4. Admin category management
> As an **admin**, I want to create, edit and delete categories, so owners have the right categories to pick from.

- `/admin/categories` lists categories (title, englishTitle, type, parent) with create, edit and delete actions in modals.
- The bugs are fixed: updating allows type `project`, and `parentId` is saved.
- Deleting a category asks for confirmation and warns when child categories will also be deleted. Deleting a category that projects use is blocked with a Persian error message.

### F5. Admin user profile view
> As an **admin**, I want to see a user's details, projects and proposals before verifying them, so my approval decisions are informed.

- Clicking a user in the users table opens `/admin/users/:id`, which uses `/admin/user/profile/:userId`.
- The page shows user info, created projects, completed projects and proposals, and lets the admin change status in place.

### F6. Proposal workflow
> As an **owner**, I want accepting a proposal to finalize the hire, so the project state is consistent.
> As a **freelancer**, I want to see which project each proposal is for and open project details, so I can decide what to bid on.

- Accepting a proposal assigns its freelancer, sets the project to `CLOSED`, and rejects the project's other pending proposals, all in one MongoDB transaction (or a safe sequence).
- Only one proposal per project can be accepted. Un-accepting (moving it back to pending or rejected) clears `freelancer` and leaves the project status up to the owner.
- Proposal lists (freelancer and admin) show the project title, which links to the project.
- Freelancers can open `/freelancer/projects/:id` (a read-only detail page without other freelancers' proposals).
- Admins no longer see "send proposal", and the server rejects proposals from ADMIN.

### F7. Pagination
> As a **user** browsing long lists, I want paginated tables, so pages load fast.

- `project/list`, `project/owner-projects`, `proposal/list` and `admin/user/list` accept `page` and `limit` and return `total`.
- Tables show pagination controls with Persian digits. The page number lives in the URL like the other filters.
- Admin dashboard counts come from `total`, not `items.length` (fixes the count capped at 20).

### F8. Real home page stats
> As a **visitor**, I want the landing page to show real numbers, so the site feels alive.

- `GET /stats/public` (no auth) returns counts of freelancers, owners, open projects and projects per category.
- `Home.jsx` uses it, with a loading skeleton. The hardcoded numbers are removed.
- Home CTA buttons and footer links either work or are removed.

### F9. UI redesign
> As a **portfolio visitor or client**, I want a modern, consistent interface, so the product looks credible.
> As a **user**, I want every screen to look and behave the same way, so the app is easy to learn.

- The goal is a modern, professional look that **keeps the project's core structure and functionality**. Routes, page structure, role layouts (sidebar + content), the order of steps in each flow, and every action available today stay the same. Only the visual layer and the components behind it change.
- A small design system lives in `ui/`: color, spacing, radius and type tokens (Tailwind 4 `@theme`, light and dark), plus Button, Input, Select, Textarea, Badge, Table, Pagination, Modal, Card, EmptyState and Skeleton. Every page uses these components; there are no one-off styles.
- Pages are redesigned: home, auth (OTP and demo tabs), complete profile, the three dashboards, project and proposal tables, project detail, profile, admin users, admin user profile, admin categories, and 404 / not-access.
- The layout is responsive from 360px up. The sidebar becomes a drawer on mobile, and tables become cards or scroll horizontally.
- Accessibility: WCAG 2.2 AA contrast in both themes, visible focus, keyboard-operable modals and menus, labelled form fields, and Persian-friendly and Latin fonts (for example Vazirmatn plus a Latin font) with `font-display: swap`.
- Every list has loading, empty and error states.
- Playwright screenshot tests cover key pages in fa/en × light/dark.

### F10. Bilingual (Persian and English)
> As an **English-speaking visitor**, I want to switch the app to English, so I can evaluate it without reading Persian.
> As a **Persian user**, I want the app to stay fully Persian and RTL by default.

- A language switcher appears in the header on every page, including home and auth. The choice persists in localStorage the same way dark mode does. With no saved choice the language is always Persian; there is no browser-language detection.
- Switching applies immediately with no reload. It sets `<html lang>` and `dir` (`fa` → `rtl`, `en` → `ltr`), and the layout mirrors correctly.
- Every UI string, toast, form validation message, status label and server error (through its `code`) is translated. A CI check fails when a key exists in only one of the two locale files or when a JSX literal string is not translated (an i18n lint rule).
- In English, numbers use Latin digits and dates use the Gregorian calendar (`en-US`). In Persian, they behave exactly as today (§2).
- **Date picker:** keep `react-multi-date-picker` (it was checked against both requirements on 2026-10-27).
  - It supports both calendars through `react-date-object`: Persian uses `persian` + `persian_fa` (as today in `ui/DatePickerField.jsx`), and English uses `gregorian` + `gregorian_en`.
  - Its peer dependency is `react >=16.8`, and its build uses none of the APIs React 19 removed (`findDOMNode`, `ReactDOM.render`, `unmountComponentAtNode`, legacy context).
  - The picker switches calendar, locale and direction with the active language. It always stores ISO dates, so the same deadline displays correctly in either language.
- **Demo content is bilingual:**
  - The text fields on Project (`title`, `description`, `tags`), Proposal (`description`) and User (`name`, `biography`) get an optional `translations.en` with the same fields. The base fields hold Persian.
  - The seed script fills both languages for every sample record.
  - The API returns both. The client shows `translations.en` when the language is English and it exists, and falls back to the base field otherwise.
  - Switching language updates UI text and demo content immediately, with no refetch needed.
- Content that users create themselves (projects, proposals and profiles made after seeding) is shown as entered and is not machine-translated. It renders with `dir="auto"` so mixed text displays correctly.
- Category names show `title` in Persian and `englishTitle` in English.
- The OTP SMS and log text are out of scope for translation.

---

## 5. Out of scope

- **Payments / real wallet.** The freelancer "wallet" stays a sum of accepted proposal prices, relabeled so it doesn't imply real money. No payment gateway. Zarinpal references are deleted.
- **Chat and notifications.** No owner–freelancer messaging, email or SMS notifications, or real-time updates.
- **Real SMS delivery.** Kavenegar is removed, and OTP stays in dev mode (see §6, R1).
- **Repo restructure.** No workspaces and no shared package. `client/` and `server/` stay separate.
- **Switching frameworks.** No Next.js. The client stays a Vite SPA.
- **Data migration.** No existing data is kept. The database is reseeded.
- **More languages and content translation.** Only `fa` and `en`. Content that users create is not translated (only the seeded demo content is bilingual), and there are no locale-prefixed URLs (`/en/...`) or SEO per language.

---

## 6. Risks and open questions

### Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | **OTP can't complete in production.** No SMS is sent, and logging the code is a security issue, so on a public deploy only demo login works. | Keep demo login as the public entry point. Show the OTP in the toast only when `NODE_ENV !== "production"`. Say so on the auth page. |
| R2 | **Big-bang migration.** Moving to TypeScript plus six major upgrades at once makes regressions hard to locate. | Phase the work (below). Write characterization tests for §2 behavior *before* the upgrades, and keep each phase in its own PR with CI green. |
| R3 | **Tailwind 4 breaks styling.** The new config model and changed defaults could break RTL utilities and dark-mode tokens. | Do the Tailwind 4 move as part of the redesign (F9) instead of porting the old styles first. Compare screenshots in fa/en × light/dark in Playwright. |
| R4 | **Express 5 changes behavior.** Path syntax (`path-to-regexp` v8), the `req.query` getter and async error handling all change. | Remove `express-async-handler` (Express 5 handles async errors itself), and cover every route with Supertest before switching. |
| R5 | **Mongoose 9 changes behavior.** Query and middleware behavior and `strictQuery` changes. | API tests on `mongodb-memory-server`. |
| R6 | **Dependencies fail on React 19, RTL or LTR.** `react-multi-date-picker` passed a static check (both calendars, compatible peer range, no removed APIs), but its last release was in June 2024 and it hasn't been run on React 19 yet. `react-otp-input` and `react-tag-input-component` haven't been checked. | Early in Phase 3, smoke-test all three on React 19 in fa/RTL and en/LTR. If the date picker fails, pick a replacement then that supports both Jalali and Gregorian on React 19. The Persian date picker must keep working (§2). |
| R7 | **Demo accounts get abused.** Visitors could vandalize shared demo data. | Lock demo accounts (F1), reseed on a schedule or provide an admin "reset demo" endpoint, and rate-limit. |
| R8 | **Constants drift between packages.** Without a shared package, client and server copies of roles, statuses, limits, Zod schemas and error codes can drift apart. | A test in each package asserts the expected values, and a test checks that every server error `code` has a client translation key. Revisit a shared package if the duplication grows: with Zod on both sides, a shared package would remove most of it. |
| R9 | **The redesign has no clear end.** Without a fixed target, design work can expand indefinitely. | Agree on the design direction and the page list (F9) before Phase 4. Build components first, then re-skin pages one at a time. |
| R10 | **Hidden strings and RTL assumptions.** Hardcoded Persian, physical `ml-`/`pr-` classes, and icons that should mirror (arrows) can break English or LTR. | Use the i18n lint rule, a lint rule or grep in CI against physical direction classes, and LTR screenshot tests. |

### Suggested phases
1. **Safety net:** CI, flat ESLint, Vitest/Supertest, and characterization tests for §2 and the §8 hot spots.
2. **Security & bug fixes** (§3.3) on the current stack.
3. **Stack upgrade + TypeScript + Zod:** server first (Express 5, Mongoose 9, Joi → Zod, error codes), then the client (React 19, Vite 8). The client stays on Tailwind 3 styles for now.
4. **Redesign + i18n foundation:** i18n setup and string extraction, Tailwind 4 design tokens and components, logical utilities (F9, F10 groundwork).
5. **Features:** F1 → F2 → F6 → F3 → F4/F5 → F7 → F8. Each one is built on the new components and in both languages.
6. **Finish F9/F10:** re-skin the remaining pages, complete translation coverage, and add screenshot tests.
7. **Deploy** (once the hosting question is answered).

### Open questions
1. **Hosting:** Runflare, Vercel + Render/Railway + Atlas, or something else? This affects cookie `SameSite`/`secure` settings and CORS, because client and API may end up on different domains.
2. **Demo data reset:** scheduled reseed, manual admin button, or neither?
3. **Becoming admin:** is the seed script enough, or is a CLI/env way to promote a user needed?
4. **`sort=popular`:** remove it, or define it as sorting by proposal count?

## 7. Progress

One row per completed phase of `docs/upgrade-plan.md` (its checkboxes are ticked at the same time).

| Phase | Completed | Commit / PR | Evidence |
|---|---|---|---|
| 1. Client flat ESLint config | 2026-10-27 | `f0c156b`, PR #9 | `client/eslint.config.js` in place, `.eslintrc.cjs` removed; `npm run lint --prefix client` 0 errors; 6 `TODO(phase 13)` disables |
| ✅ 8. Remove dead code, unused deps, renames | 2026-10-27 | branch `upgrade/part-b`, closes #11 | Dead helpers, `ROLES.USER`, `ProjectTable-v1.jsx`, `ZARINPAL_CALLBACK_URL`/`KAVENEGAR_API_KEY` removed; 5 deps uninstalled, `npm ls` shows no extraneous server packages; `proposalService.js`, `category.schema.js`, `workbridge-server`; grep outside docs finds no old name; server 56/56, client 22/22, e2e 2/2, both lints 0 errors, client build OK |
| ✅ 9. Server hardening | 2026-10-27 | branch `upgrade/part-b`, closes #12 | Only `server/uploads/` served (at `/uploads`, `.gitkeep` tracked); `helmet` on (cross-origin resource policy so uploads load from the client); JSON/urlencoded limit `100kb`; new `tests/security.test.js`: `/app/server.js` and `/package.json` 404, 200KB body 413, helmet header present; server 60/60, server lint 0 errors, e2e 2/2 (CORS with credentials still works) |
| ✅ 10. OTP fixes | 2026-10-27 | branch `upgrade/part-b`, closes #13 | No OTP state on the controller; `crypto.randomInt` codes, cleared after a successful check, `otp` now required in `checkOtpSchema`; `getOtpSchema` validates the phone; `otp` stripped in `toJSON`; code logged/returned only outside production and shown in the login toast; `express-rate-limit` on `get-otp`/`check-otp` (`OTP_RATE_LIMIT`, 10/15 min); logout `secure` matches login; bugs #4, #5, #6, #12 removed from `known-bugs.md`, tests flipped; new tests: concurrent codes, no code in production, logout cookie, `tests/rateLimit.test.js`, `AuthContainer.test.jsx`; server 67/67, client 25/25, both lints 0 errors, client build OK, e2e 2/2 |
| ✅ 11. Ownership checks and proposal integrity | 2026-10-27 | branch `upgrade/part-b`, closes #14 | `assertProjectOwner` (ADMIN bypass, else 403) on project read/update/status/delete and proposal status change; `addNewProposal` returns 404 (no project), 400 (not `OPEN`), 409 (duplicate); required `project` ref on `Proposal`, set on create; `changeProposalStatus` finds the project through it and 404s before writing; bugs #2, #7, #8 removed from `known-bugs.md`, tests flipped; new tests: duplicate proposal, admin bypass (project update/status/read/delete, proposal accept), other owner can't read/delete; server 73/73, server lint 0 errors, e2e 2/2; client unchanged |
| ✅ 12a. Shared server helpers | 2026-10-27 | branch `upgrade/part-b`, closes #15 | `server/utils/functions.js`: `findByIdOr404` (400 bad id, 404 missing; used for project, proposal and category lookups), `cookieOptions(env)` (login and logout cookies), `buildProjectQuery` + `createdAtSort` (both project lists; proposal list sort); `sort=popular` removed (open question 4: remove), unknown sorts fall back to oldest first; side effects of sharing: `/owner-projects` now also takes `status`/`category=ALL` and skips unknown categories instead of crashing, category lookups return 404 (was 400/500); new tests: owner list filters/sort/popular, `cookieOptions`; server 75/75, server lint 0 errors, e2e 2/2; client unchanged |
| ✅ 12b. Input safety and validation | 2026-10-27 | branch `upgrade/part-b`, closes #16 | Category list keeps only string `title`/`englishTitle`/`type` query values (no operators); `escapeRegex` in `server/utils/functions.js` used by admin user search and by `buildProjectQuery`, which now searches `title` case-insensitively instead of `$text`; `changeProjectStatusSchema` (`OPEN`/`CLOSED`) and `verifyUserSchema` (0/1/2) return 400; `budget` and `price` required in Joi; `completeProfile` checks email duplicates only when an email is sent, excluding the caller; bugs #1, #3, #9, #10, #13 removed from `known-bugs.md`, tests flipped; new tests: `tests/category.test.js` (whitelist, operators ignored, `escapeRegex`), project search literal/case-insensitive, admin search escaping, missing proposal price, profile re-save with own email; server 88/88, server lint 0 errors, e2e 2/2; client unchanged |
| ✅ 12c. Server error handling and startup | 2026-10-27 | branch `upgrade/part-b`, closes #17 | `createError` → `createHttpError` in `updateProject` and category update/remove (no `TODO(phase 12)` disables left); `buildProjectQuery` returns 400 for an unknown or non-string `category` on both project lists (was an empty list / a 500 on `?category=a&category=b`); `deleteProject` returns 404 when nothing is deleted (was a hang) and deletes the project's proposals; `Application.start()` checks `APP_DB`, the three secrets and `ALLOW_CORS_ORIGIN`, connects to Mongo, then listens, and logs and exits 1 on failure (`index.js` calls it); bug #11 removed from `known-bugs.md`; new tests: unknown/array category 400, 500 messages for update/category update/remove, delete removes only that project's proposals, delete 404, `tests/startup.test.js` (missing env, failed connect, connect before listen); server 99/99, server lint 0 errors, e2e 2/2; client unchanged |
| ✅ 13a. Route guarding and network errors | 2026-10-27 | branch `upgrade/part-b`, closes #18 | `/not-access` route (`pages/NotAccess.jsx`, link home); `ProtectedRoute` effect has full deps (`isVerified` added, its `TODO(phase 13)` disable removed) and takes one branch: logged out → `/auth` with no toast, unverified → toast + `/`, wrong role → `/not-access`; children render only for verified users; `UserAvatar` renders nothing when logged out (clicking it threw on `user.role`); interceptor reads `err.response?.status`, so a network error rejects as-is without a refresh; new tests: `ProtectedRoute.test.jsx` (4 redirect cases), `UserAvatar.test.jsx`, interceptor network-error case; client 32/32, client lint 0 errors, client build OK, e2e 2/2; server unchanged |
| ✅ 13b. Client display, form and cache fixes | 2026-10-27 | branch `upgrade/part-b`, closes #19 | `useLocalStorageState` deps inside `useEffect` (pinned extra-writes test flipped: one write per change); `CreateProposal` shows `Loading` while `isCreating`, `console.log` removed; owner "assigned projects" counts projects with a `freelancer`; stray `;` on `CompleteProfile` removed; "انتطار" → "انتظار" in the 5 status lists; user/proposal/project rows fall back to "نامشخص" for unknown statuses; `toLocalDateShort` returns "-" for a missing/invalid date; `CreateProjectForm` starts with no date and refuses to submit without one (was Invalid Date → `RangeError`); invalidations added: `owner-projects` on proposal status change, `projects` on proposal create and project create/edit/delete; last 3 `TODO(phase 13)` disables fixed (`AuthContainer`/`useOutsideClick` deps, `rel="noreferrer"`); new test `toLocalDateShort.test.js`; client 34/34, client lint 0 errors, client build OK, e2e 2/2; server unchanged |
| ✅ 14. Single-source constants and shared client helpers | 2026-10-27 | branch `upgrade/part-b`, closes #20 | `client/src/constants/index.js` (roles, `ROLE_HOME`, `STATUS` 0/1/2 + `STATUS_BADGES`, `PROJECT_STATUS` + badges, `UNKNOWN_STATUS`, `LIMITS`) mirrors `server/utils/constants.js` (roles, `STATUS`, `PROJECT_STATUS`, `LIMITS`); limits aligned: title 10–30 and budget 100,000–1,000,000,000 on both sides (server title min was 3, budget unbounded; client title had no max); models, Joi schemas, `isVerifiedUser` and controllers read the constants; new `useAppMutation` (toast + invalidate) backs all 7 mutation hooks (user/proposal status invalidations moved from the forms into the hooks; proposal status now invalidates `["project"]`), `redirectByRole` replaces the 3 copies (`usePickUser` deleted), `StatusBadge` replaces the 4 row badge maps, `StatusSelect` the 2 option lists; `useAuthorize` uses `ROLE_HOME`; grep finds no `statusStyle` and no role literals outside the constants modules and test fixtures; new tests: `server/tests/constants.test.js`, `client/src/constants/index.test.js`, `StatusBadge.test.jsx`, `redirectByRole.test.js`, project title < 10 and budget out of range → 400 (4 project test titles lengthened to ≥ 10 chars); server 105/105, client 44/44, both lints 0 errors, client build OK, e2e 2/2 |
| ✅ 15. Express 5 | 2026-10-27 | branch `upgrade/part-c`, closes #22 | `express` 4.18 → 5.3; `express-async-handler` removed: routers pass controller methods directly and Express 5 forwards their rejections to the central handler; route paths were already valid for `path-to-regexp` v8 (no wildcard, optional or regex segments); no code writes to `req.query`; `req.body` defaults to `{}` after the parsers (Express 5 leaves it undefined when there is no body, which turned validation 400s into 500s); `cookie-parser` 1.4.7, `cors` 2.8.6, `jsonwebtoken` 9.0.3, `http-errors` 2.0.1; existing tests unchanged; new test: `get-otp` with no body → 400; server 106/106, server lint 0 errors, e2e 2/2; client unchanged |
| ✅ 16. Mongoose 9 | 2026-10-27 | branch `upgrade/part-c`, closes #23 | `mongoose` 7.1 → 9.11 (driver 7.7); `useNewUrlParser`/`useUnifiedTopology` dropped; `mongoose.set("strictQuery", false)` before connect (keeps the Mongoose 7+ behavior: unknown filter keys match nothing instead of being dropped); `Project.proposals` ref `"PROPOSAL"` → `"Proposal"`; `username` removed from the user text index (no such field); `defaul` → `default` on `otp.code`; `findOneAndUpdate` uses `returnDocument: "after"` instead of the deprecated `new: true` (controller and test helper); `mongodb-memory-server` stays on 10.4 (works with Mongoose 9, bump not needed); `npm audit fix` cleared `brace-expansion`, `joi` (17.13.8), `picomatch`; `npm audit --prefix server` leaves 3 high, all `semver` via dev-only `nodemon@2` → `simple-update-notifier`, removed in Phase 17 (`tsx watch` replaces nodemon); existing tests unchanged; server 106/106, server lint 0 errors, e2e 2/2; client unchanged |
