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
