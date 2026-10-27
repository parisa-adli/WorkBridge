# WorkBridge: Upgrade Plan

Status: draft, 2026-10-27. Breaks `docs/upgrade-prd.md` into small sequential phases. Section references (§) point to `docs/current-state.md`. Bug numbers (#) point to `docs/known-bugs.md`.

**Next.js is not in this plan.** The PRD rules it out (§5 "Switching frameworks"): the client stays a Vite SPA. If that decision changes, a Next.js migration would replace Phases 22–24 (Vite 8 and client TypeScript) and must still come after Part A.

## Progress

**18 of 47 phases done** (Parts A and B). Next: Phase 15 (Express 5).

`✅` = done (deliverables checked, recorded in the PRD §7 Progress table). `⬜` = not started. When a phase is completed, change its heading's `⬜` to `✅`, tick its checkboxes, update the count above and the Overview's Status column, and mark a Part `✅` once all its phases are done.

---

## Rules for every phase

A phase is done only when all of these hold. They are not repeated in each phase's checklist.

- [ ] `npm run build --prefix client` succeeds.
- [ ] `npm run dev` starts both apps and the touched flows work in the browser against the **local** server.
- [ ] `npm test --prefix server` passes (and `npm test --prefix client` once Phase 4 adds it).
- [ ] `npm run lint` passes in every package that has it (client from Phase 1, server from Phase 3).
- [ ] Typecheck passes once TypeScript exists (server from Phase 17, client from Phase 23).
- [ ] CI is green on the PR (from Phase 7).
- [ ] One PR per phase (a sub-phase such as 12a counts as a phase).
- [ ] Phases run strictly in order; a phase starts only after the previous one is merged.

**Full-stack feature phases.** A phase that delivers a feature or a user-facing change does it end to end in one session and one PR: server (model, route, validation, controller), client (service, query hook, components, page) and tests on both sides. A feature is never split into a "server phase" and a "client phase". Only pure tooling and dependency upgrades (Part A, Express 5, Mongoose 9, React 19, Vite 8, the TypeScript conversions) touch a single package, because they don't deliver a feature.

**Pinned bugs.** The server tests assert today's behavior, bugs included. When a phase fixes a bug from `known-bugs.md`, it flips that test to assert the correct behavior and removes the row from `known-bugs.md` in the same PR. A fix without a flipped test is not done.

---

## Overview

| Part | Phases | Goal | Status |
|---|---|---|---|
| A. Safety net | 0–7 | Lint, one test runner, client tests, e2e, CI. Nothing behavioral changes. | ✅ 8/8 |
| B. Security & bugs | 8–14 (12 and 13 split into 12a–c, 13a–b) | Close §6.1, §6.4, §7 on the current stack. | ✅ 10/10 |
| C. Stack + TypeScript + Zod | 15–25 | Major upgrades, TS strict, Zod, API envelope and error codes. | ⬜ 0/11 |
| D. Design & i18n foundation | 26–29 | i18n, Tailwind 4 tokens, design-system components. | ⬜ 0/4 |
| E. Features | 30–38 | F1 → F2 → F6 → F3 → F4 → F5 → F7 → F8 (PRD order). | ⬜ 0/9 |
| F. Finish | 39–43 | Re-skin remaining pages, full translation, screenshot tests, final audit. | ⬜ 0/5 |

Deploy is not planned until PRD open question 1 (hosting) is answered.

---

## Part A: Safety net ✅

### Phase 0: Commit the baseline ✅
**Goal:** the existing server tests and docs are on `main`, so every later phase diffs against a known state.

Files: `server/package.json`, `server/package-lock.json`, `server/tests/*`, `docs/*`, `CLAUDE.md`

- [x] Run `npm test --prefix server` and confirm it passes.
- [x] Commit the working tree on a branch and merge it.

Verify: `git status` is clean on `main`; `npm test --prefix server` passes.

### Phase 1: Client flat ESLint config ✅
**Goal:** `npm run lint --prefix client` works.

Files: `client/eslint.config.js` (new), `client/.eslintrc.cjs` (delete), `client/package.json`, any client files with real lint errors

- [x] Port `.eslintrc.cjs` to `eslint.config.js` (`@eslint/js`, `eslint-plugin-react`, `react-hooks`, `react-refresh`, `globals`).
- [x] Delete `.eslintrc.cjs`.
- [x] Fix errors that are trivial and behavior-neutral (unused imports). For anything that would change behavior (e.g. hook dependency arrays), add a scoped disable with a `TODO(phase 13)` comment instead of fixing it now.

Verify: `npm run lint --prefix client` exits 0; the app behaves as before.

### Phase 2: Server tests on Vitest ✅
**Goal:** one test runner (Vitest) for both packages, as the PRD requires, before any test is added.

Files: `server/package.json`, `server/vitest.config.js` (new), `server/tests/*.js`

- [x] Replace `jest` with `vitest`; move the `jest` config block to `vitest.config.js` (node env, `setupFiles`, 60s timeout, single thread to match `--runInBand`).
- [x] Swap `jest.mock`/`jest.fn` for `vi.*` in `tests/setup.js` and any test that uses them.
- [x] Keep every test and assertion unchanged.

Verify: `npm test --prefix server` runs Vitest with the same number of passing tests as Jest did.

### Phase 3: Server ESLint ✅
**Goal:** the server has a linter.

Files: `server/eslint.config.js` (new), `server/package.json`

- [x] Add a flat config (`@eslint/js` recommended, node globals) and a `lint` script.
- [x] Do not fix the `createError` ReferenceErrors here (they are Phase 12). Disable `no-undef` on those lines with a `TODO(phase 12)` comment so the bugs stay visible.

Verify: `npm run lint --prefix server` exits 0.

### Phase 4: Client test harness + characterization tests ✅
**Goal:** the client has Vitest and tests that pin the must-preserve behaviors in PRD §2 that live in the client.

Files: `client/package.json`, `client/vite.config.js` (test block), `client/src/test/setup.js` (new), new `*.test.js(x)` next to the code below

- [x] Add `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, and a `test` script.
- [x] Tests for `useAuthorize`: role from the first URL segment, `status === 2` required, all three roles.
- [x] Tests for `utils/toPersianNumbers`, `toPersianNumbersWithComma`, `toLocalDateShort` (Persian digits, separators, `fa-IR` dates).
- [x] Test for `httpService`: a 401 triggers one `/user/refresh-token` call and one replay; a second 401 does not loop.
- [x] Test for `useLocalStorageState`: persists and restores (dark mode depends on it). Pin the extra-writes bug if it is observable.

Verify: `npm test --prefix client` passes.

### Phase 5: Config from env ✅
**Goal:** the client can target the local server without editing code, which the e2e test needs.

Files: `client/src/services/httpService.js`, `client/.env.example` (new), `server/.env.example` (new), `README.md`, `CLAUDE.md`

- [x] `BASE_URL` reads `import.meta.env.VITE_BASE_URL`, defaulting to `http://localhost:5000/api`.
- [x] Add `.env.example` files. README: port 3000 for `CLIENT_URL`/`ALLOW_CORS_ORIGIN`; drop the hardcoded-URL note.
- [x] Update the CLAUDE.md "API target" paragraph.

Verify: with no `client/.env`, the dev client talks to `localhost:5000`; with `VITE_BASE_URL` set, it uses that URL. Client tests still pass.

### Phase 6: Playwright e2e (OTP flow) ✅
**Goal:** one end-to-end test covers the OTP login path that must survive every later phase.

Files: `e2e/` (new, at the root, or under `client/`), `playwright.config.js`, root `package.json`

- [x] Global setup starts `mongodb-memory-server`, the server (with test env vars) and the Vite dev server.
- [x] Test: phone → read the OTP from the database → enter it → complete profile as OWNER → sees the "awaiting approval" redirect.
- [x] Second test: set that user to `status: 2` in the DB, log in again, land on `/owner`, create a project, see it in the table.
- [x] Add an `e2e` script.

Verify: `npm run e2e` passes locally twice in a row (no leftover state).

### Phase 7: CI ✅
**Goal:** every PR runs the safety net.

Files: `.github/workflows/ci.yml` (new)

- [x] Jobs: install (cache npm and the mongod binary) → lint (both) → test (both) → client build → e2e.
- [x] Leave a commented placeholder for the typecheck step (enabled in Phases 17 and 23).

Verify: open a PR; all jobs are green. Break a test on a throwaway branch and see CI go red.

---

## Part B: Security & bug fixes (current stack) ✅

### Phase 8: Remove dead code, unused deps, renames ✅
**Goal:** less surface area before the fixes and upgrades. No behavior changes.

Files: `server/utils/functions.js`, `server/app/http/middlewares/user.middleware.js`, `server/utils/constants.js`, `server/package.json`, `client/package.json`, `client/src/features/projects/ProjectTable-v1.jsx`, `client/src/services/proposalServis.js` (+ importers), `server/app/http/validators/category.shcema.js` (+ importers), `README.md`

- [x] Delete `getUserCartDetail`, `checkProductExist`, `invoiceNumberGenerator`, `deleteInvalidPropertyInObject`, `secretKeyGenerator`, `decideAuthMiddleware`, `ROLES.USER`, `ProjectTable-v1.jsx`, `ZARINPAL_CALLBACK_URL`.
- [x] Uninstall `kavenegar`, `axios`, `moment-jalali` (server), `react-icon`, `query-string` (client). Remove the kavenegar mock from `tests/setup.js`. Run `npm prune` on the server for the extraneous packages.
- [x] Rename `proposalServis` → `proposalService`, `category.shcema` → `category.schema`, server package → `workbridge-server`. Update CLAUDE.md.

Verify: grep finds no references to removed names; all checks green.

### Phase 9: Server hardening ✅
**Goal:** close §6.1 items 4 and 10.

Files: `server/app/server.js`, `server/package.json`, `server/tests/security.test.js` (new)

- [x] Serve only `server/uploads/` statically (create the folder with a `.gitkeep`).
- [x] Add `helmet` and a JSON/urlencoded body size limit.
- [x] Tests: `GET /app/server.js` and `/package.json` return 404; an oversized body returns 413.

Verify: the new tests pass; the app still loads (helmet doesn't break CORS with credentials).

### Phase 10: OTP fixes ✅
**Goal:** close §6.1 items 1, 7, 8, 11 and bugs #4, #5, #6, #12.

Files: `server/app/http/controllers/userAuth.controller.js`, `server/app/models/user.js`, `server/app/router/userAuth.js`, `server/tests/auth.test.js`

- [x] Keep no OTP state on the controller instance; pass code and phone through local variables.
- [x] `crypto.randomInt` for codes; clear `otp` after a successful check; validate the phone with `getOtpSchema`.
- [x] Strip `otp` in `toJSON` and in the `check-otp`/`refresh-token` responses.
- [x] Log the code only when `NODE_ENV !== "production"`; return it in the response in non-production (PRD R1).
- [x] Client: `SendOTPForm` shows the returned code in its toast when present; `CheckOTPForm` shows the rate-limit message.
- [x] `express-rate-limit` on `get-otp` and `check-otp` (disabled or raised under test).
- [x] Logout cookie `secure` flag matches login.
- [x] Flip tests for #4, #5, #6; add tests for "no otp in response", rate limit, and two concurrent `get-otp` calls getting their own codes.

Verify: tests pass; the e2e OTP flow still passes.

### Phase 11: Ownership checks and proposal integrity ✅
**Goal:** close §6.1 items 2, 3, 9 and bugs #2, #7, #8.

Files: `server/app/http/controllers/project.controller.js`, `proposal.controller.js`, `server/app/models/proposal.js`, `server/tests/project.test.js`, `proposal.test.js`

- [x] Project read/update/status/delete and proposal status change check `project.owner === req.user._id`; ADMIN bypasses. Others get 403.
- [x] `addNewProposal`: project must exist (404) and be `OPEN` (400); one proposal per freelancer per project (409).
- [x] Add a `project` ref on `Proposal`, set on create. `changeProposalStatus` finds the project through it and returns 404 before writing anything.
- [x] Flip tests for #2, #7, #8; add duplicate-proposal and admin-bypass tests.

Verify: tests pass; e2e still passes.

### Phase 12a: Shared server helpers ✅
**Goal:** prefactor so 12b and 12c change one place. No behavior change except removing `sort=popular`.

Files: `server/utils/functions.js`, `project.controller.js`, `proposal.controller.js`, `category.controller.js`, `admin/user.controller.js`, `userAuth.controller.js`, tests

- [x] Shared helpers: `findByIdOr404`, `cookieOptions(env)`, one project filter/sort builder for both list endpoints; replace the copies.
- [x] Remove `sort=popular` (or define it — PRD open question 4; default: remove).

Verify: tests pass unchanged, apart from the `sort=popular` case.

### Phase 12b: Input safety and validation ✅
**Goal:** close §6.1 items 5, 6 and bugs #1, #3, #9, #10, #13.

Files: `category.controller.js`, `admin/user.controller.js`, `project.controller.js`, `userAuth.controller.js`, `server/app/http/validators/*`, tests for each

- [x] Whitelist category query fields; escape regex input in admin user search.
- [x] Search: switch `$text` to an escaped regex on title, in the shared filter builder (simpler than adding an index; fixes #10).
- [x] Validate project status and user status values (#1); make `budget` and `price` required in the schemas (#9, #13).
- [x] Fix the `completeProfile` email check (#3).

Verify: tests pass, with the pinned tests flipped and new ones for the whitelist and escaping.

### Phase 12c: Server error handling and startup ✅
**Goal:** close the §6.4 server items and bug #11.

Files: `category.controller.js`, `project.controller.js`, `server/app/models/project.js`, `server/app/server.js`, `server/index.js`, tests for each

- [x] Fix `createError` references (#11, `category.controller.js`), the `getListOfOwnerProjects` unknown-category crash, and the `deleteProject` hang (and delete its proposals).
- [x] Connect to Mongo before `listen`; exit on failure. Validate required env vars at startup.
- [x] Remove the `TODO(phase 12)` lint disables from Phase 3.

Verify: tests pass, including new ones for each fix.

### Phase 13a: Route guarding and network errors ✅
**Goal:** the auth-related items of the §7 "Broken client behavior" list.

Files: `ui/ProtectedRoute.jsx`, `App.jsx`, `features/authentication/UserAvatar.jsx`, `services/httpService.js`

- [x] Add the `/not-access` route; fix `ProtectedRoute` effect dependencies and the misleading toast for unauthenticated users.
- [x] `UserAvatar` doesn't crash when logged out.
- [x] Interceptor handles a missing `err.response`.
- [x] Tests for the interceptor network-error case and `ProtectedRoute` redirect.

Verify: client tests pass; manual check of each fix; e2e passes.

### Phase 13b: Client display, form and cache fixes ✅
**Goal:** close the rest of the §7 list and the client §6.4 items.

Files: `hooks/useLocalStorageState.js`, `features/proposals/CreateProposal.jsx`, `features/owner/Stats.jsx`, `pages/CompleteProfile.jsx`, `features/projects/CreateProjectForm.jsx`, mutation hooks in `features/*/use*.js`, row components with `statusStyle`

- [x] `useLocalStorageState` effect deps (flip its pinned test); proposal form loading state and stray `console.log`; "assigned projects" counts projects with a freelancer; remove the stray `;`; fix "انتطار".
- [x] Status rows fall back for unknown values; deadline Invalid Date bug.
- [x] Add the missing invalidations (`owner-projects` on accept, `projects` on proposal create and project create/edit/delete).
- [x] Remove the remaining `TODO(phase 13)` lint disables from Phase 1.

Verify: client tests pass; manual check of each listed fix; e2e passes.

### Phase 14: Single-source constants and shared client helpers ✅
**Goal:** remove the duplication in §6.3 so later phases change one place.

Files: `client/src/constants/` (new: roles, statuses, limits), `server/utils/constants.js`, `ui/StatusBadge.jsx`, `ui/StatusSelect.jsx`, `hooks/useAppMutation.js`, `utils/redirectByRole.js` (all new), every current copy listed in §6.3

- [x] Roles, status codes with labels and badge styles, and validation limits (title 10–30, budget ≥ 100,000) in one module per package; align client and server limits.
- [x] `useAppMutation` (toast + invalidate), `redirectByRole`, `StatusBadge`, `StatusSelect`; replace all copies.
- [x] A test in each package asserts the constant values (PRD R8).

Verify: tests pass; grep finds no leftover `statusStyle` arrays or role string literals outside the constants modules.

---

## Part C: Stack upgrade, TypeScript, Zod ⬜

Dependency upgrades go server first, then client, and each gets its own phase so a regression points at one change. The phases that change API behavior (19, 20, 25) update server and client together.

### Phase 15: Express 5 ⬜
**Goal:** server on Express 5 (PRD R4).

Files: `server/package.json`, `server/app/server.js`, `server/app/router/**`, all controllers

- [ ] Upgrade `express`; remove `express-async-handler` (Express 5 forwards async errors).
- [ ] Fix route path syntax for `path-to-regexp` v8 and any writes to `req.query`.
- [ ] Bump in-major patches for `cookie-parser`, `cors`, `jsonwebtoken`, `http-errors`.

Verify: all API tests pass unchanged; e2e passes.

### Phase 16: Mongoose 9 ⬜
**Goal:** server on Mongoose 9 (PRD R5).

Files: `server/package.json`, `server/app/models/*`, `server/app/server.js`, controllers using changed query APIs

- [ ] Upgrade; drop `useNewUrlParser`/`useUnifiedTopology`; set `strictQuery` explicitly; fix the `ref: "PROPOSAL"` case and the `username` text index and `defaul` typo in `user.js`.
- [ ] Bump `mongodb-memory-server` if needed.
- [ ] `npm audit --prefix server`: 0 high/critical, or list what remains and which phase removes it.

Verify: all tests pass; audit result recorded in the PR.

### Phase 17: Server TypeScript tooling + infrastructure files ⬜
**Goal:** server compiles with `tsc --noEmit` in strict mode, with `allowJs` so the conversion can be split.

Files: `server/tsconfig.json`, `server/package.json` (`tsx watch` replaces nodemon; `typecheck` script), `server/eslint.config.js` (typescript-eslint), `server/utils/*`, `server/app/models/*`, `server/app/http/middlewares/*`, `server/index.js`, `server/app/server.js`, `.github/workflows/ci.yml`

- [ ] Add `typescript`, `tsx`, `typescript-eslint`, `@types/*`; strict `tsconfig` with `allowJs`.
- [ ] Convert utils, models, middlewares, entry and `server.js` to `.ts`.
- [ ] Enable the CI typecheck step for the server.

Verify: `npm run typecheck --prefix server` and lint pass; `npm run dev` works through `tsx watch`.

### Phase 18: Server TypeScript, controllers/routes/tests ⬜
**Goal:** the whole server is TypeScript; `allowJs` off.

Files: `server/app/http/controllers/**`, `server/app/router/**`, `server/app/http/validators/*`, `server/tests/*`

- [ ] Convert remaining files; turn off `allowJs`; no `any` without a comment saying why.

Verify: typecheck passes with `allowJs: false`; tests pass.

### Phase 19: Typed envelope and error codes (server + client) ⬜
**Goal:** every response is `ApiResponse<T>`; errors are `{ statusCode, code, message }`; the client reads the new shapes.

Files: `server/utils/apiResponse.ts`, `server/utils/errorCodes.ts` (new), `server/app/server.ts` error handler, all controllers, `client/src/services/authService.js` (logout and refresh-token callers), `client/src/services/httpService.js`, tests on both sides

- [ ] Server: fix `logout` and `refresh-token` (no capitalized `StatusCode`, use `data`).
- [ ] Server: every thrown error and success payload carries a stable `code`; `message` stays Persian.
- [ ] Client: update the logout/refresh callers and the interceptor to the new shapes.
- [ ] Tests: every route's error responses include a `code` from `errorCodes`; client interceptor test updated.

Verify: tests and e2e pass; client still shows Persian toasts (it reads `message` until Phase 27).

### Phase 20: Zod for auth and profile (server + client) ⬜
**Goal:** the auth domain validates with Zod on both sides in one go: the OTP, complete-profile and update-profile routes, and the forms that call them.

Files: `server/app/http/validators/user.schema.ts`, a `validate(schema)` middleware (new), `userAuth.controller.ts`, `server/package.json`, `client/src/schemas/auth.js` (new), `SendOTPForm`, `CheckOTPForm`, `CompleteProfileForm`, `client/package.json`, tests on both sides

- [ ] Add `zod` to both packages and `@hookform/resolvers` to the client.
- [ ] Server: port the user schemas with the same rules and Persian messages; request types from `z.infer`; validation errors return 400 with the failing field and a `code`.
- [ ] Client: the three forms use `zodResolver` with schemas that mirror the server's, reading limits from the Phase 14 constants.
- [ ] Tests: server validation errors for each route; client schema test that limits match the constants (PRD R8).

Verify: each auth form shows the same Persian messages as before; e2e OTP flow passes.

### Phase 21: React 19 + client in-major bumps + dependency smoke test ⬜
**Goal:** client on React 19 and the latest 7.x/5.x/7.x of Router/Query/RHF (PRD R6).

Files: `client/package.json`, any component broken by React 19

- [ ] Upgrade `react`, `react-dom`, `@types/react*`, `react-router-dom`, `@tanstack/*`, `react-hook-form`, `axios`, `react-hot-toast`, `@headlessui/react`, `react-icons`, `react-loader-spinner`.
- [ ] Smoke-test `react-multi-date-picker`, `react-otp-input`, `react-tag-input-component` in the app (RTL). Record the result in the PR. If one fails, stop and pick a replacement as its own phase before continuing.

Verify: all client tests and e2e pass; manual check of OTP input, tag input and the Persian date picker.

### Phase 22: Vite 8 ⬜
**Goal:** Vite 8 and plugin-react 6.

Files: `client/package.json`, `client/vite.config.js`

- [ ] Upgrade `vite`, `@vitejs/plugin-react`, `vitest`; adjust config for breaking changes.
- [ ] `npm audit --prefix client`: 0 high/critical, or list what remains.

Verify: build, dev, tests, e2e pass.

### Phase 23: Client TypeScript tooling + services/utils/hooks ⬜
**Goal:** client typechecks in strict mode with `allowJs`; the data layer is typed.

Files: `client/tsconfig.json`, `client/package.json` (`typecheck`), `client/eslint.config.js` (typescript-eslint), `client/src/services/*`, `utils/*`, `hooks/*`, `context/*`, `constants/*`, `client/src/types/api.ts` (new: `ApiResponse<T>` and entity types), CI

- [ ] Convert the listed folders; type services against `ApiResponse<T>`.
- [ ] Enable the CI typecheck step for the client.

Verify: typecheck and lint pass; tests pass.

### Phase 24: Client TypeScript, components ⬜
**Goal:** the whole client is TypeScript; `allowJs` off.

Files: `client/src/features/**`, `pages/*`, `ui/*`, `App.jsx`, `main.jsx`, client tests

- [ ] Convert to `.tsx`; type the `Table` compound component and `AppLayout`'s `cloneElement` injection (or replace it with a prop).
- [ ] Turn off `allowJs`.

Verify: typecheck passes with `allowJs: false`; build, tests, e2e pass.

### Phase 25: Zod for projects, proposals, categories and admin (server + client) ⬜
**Goal:** the rest of the API and its forms move to Zod together, and Joi is gone.

Files: `server/app/http/validators/{project,proposal,category}.schema.ts`, project/proposal/category/admin controllers and routers, `client/src/schemas/*`, `CreateProjectForm`, `CreateProposal`, `ChangeProposalStatus`, `ChangeUserStatus`, `server/package.json`, tests on both sides

- [ ] Server: port the remaining schemas; add schemas for routes that had none (project status, proposal status, list queries, route params).
- [ ] Client: each form uses `zodResolver` with a schema mirroring the server's.
- [ ] Remove `joi`.
- [ ] Tests: server validation errors per route; client schema limits match the constants (PRD R8).

Verify: each form shows the same Persian messages as before; tests and e2e pass.

---

## Part D: Design and i18n foundation ⬜

**Gate before Phase 28:** agree on the design direction and the F9 page list (PRD R9). Record it in `docs/design.md`.

### Phase 26: i18n setup ⬜
**Goal:** `react-i18next` runs with `fa` (default) and `en`, and the language switcher works, even though most strings are still hardcoded.

Files: `client/src/i18n/` (new: setup, `fa.json`, `en.json`), `client/src/context/` (language provider), `ui/Header.jsx`, `ui/DashboardHeader.jsx`, `utils/toPersianNumbers`, `utils/toLocalDateShort`, `ui/DatePickerField.jsx`

- [ ] Provider sets `<html lang dir>`; choice persists via `useLocalStorageState`; no browser detection.
- [ ] Number and date formatters take the active locale through `Intl` (Persian output unchanged — the Phase 4 tests prove it).
- [ ] Date picker switches calendar/locale with the language and always stores ISO.
- [ ] Switcher in both headers.

Verify: switching sets `lang`/`dir` without reload; Phase 4 formatter tests pass; add tests for `en` output.

### Phase 27: String extraction and translation checks ⬜
**Goal:** no hardcoded UI strings; server error codes translated on the client.

Files: every client component with Persian literals, `fa.json`, `en.json`, `useAppMutation`, `httpService` error handling, `client/eslint.config.js` (i18n rule), a key-parity script, CI

- [ ] Extract all strings, toasts, validation messages and status labels to keys; fill `en`.
- [ ] Toasts translate the server `code`, falling back to `message`.
- [ ] i18n lint rule for JSX literals; a script that fails when a key exists in only one locale file; a test that every server `errorCodes` entry has a client key (copy of the list, PRD R8).

Verify: lint and the parity check pass in CI; the app reads fully in English (layout may still be LTR-broken until Phase 28).

### Phase 28: Tailwind 4, tokens and logical utilities ⬜
**Goal:** Tailwind 4 with a CSS-first `@theme` holding the agreed light/dark tokens; all physical direction classes replaced (PRD R3, R10).

Files: `client/package.json`, `client/postcss.config.js` / `vite.config.js`, `client/tailwind.config.js` (delete), `client/src/index.css`, every component using `ml-/mr-/pl-/pr-/left-/right-/text-left/text-right`

- [ ] Run the official upgrade tool, then move tokens into `@theme` (light + dark via the existing CSS variables).
- [ ] Replace physical classes with logical ones (`ms-`, `ps-`, `start-`, `text-start`); mirror directional icons.
- [ ] CI grep that fails on physical direction classes.
- [ ] Playwright screenshot baseline for 3–4 key pages in fa/en × light/dark.

Verify: the app looks the same as before in fa (compare screenshots against `main`) and mirrors correctly in en.

### Phase 29: Design-system components ⬜
**Goal:** the `ui/` components from F9 exist, are accessible, and are used by at least one page.

Files: `client/src/ui/` (Button, Input, Select, Textarea, Badge, Table, Pagination, Modal, Card, EmptyState, Skeleton), fonts in `index.css`

- [ ] Build each component on the tokens; visible focus, labelled fields, keyboard-operable Modal.
- [ ] Vazirmatn + a Latin font with `font-display: swap`.
- [ ] Re-skin one page (404 / not-access) end to end as the reference.
- [ ] Unit tests for Modal keyboard behavior and Pagination.

Verify: tests pass; the reference page passes an axe check in both themes.

---

## Part E: Features ⬜

Every feature is built on the new components and in both languages, with server tests and, where it is a user flow, an e2e test.

### Phase 30: Seed script and bilingual content fields (F1 part 1, F10 data) ⬜
**Goal:** `npm run seed --prefix server` creates demo data in both languages.

Files: `server/scripts/seed.ts` (new), `server/package.json`, models `project`, `proposal`, `user` (`translations.en`), `server/app/models/user.js` (`username`, `passwordHash`), client display helper for `translations.en` fallback

- [ ] Optional `translations.en` on the text fields listed in PRD F10; API returns it.
- [ ] Seed: three verified demo accounts with hashed passwords, categories, projects, proposals, both languages. Idempotent.
- [ ] Client shows `translations.en` in English when present; user content renders with `dir="auto"`; category name by language.

Verify: run seed twice, no duplicates; switching language changes demo content without a refetch.

### Phase 31: Demo login (F1 part 2) ⬜
**Goal:** a visitor logs in as any role with one click.

Files: `server/app/router/userAuth.js`, `userAuth.controller.js`, env validation (`DEMO_LOGIN_ENABLED`), `client/src/features/authentication/` (demo tab), `services/authService.js`, e2e

- [ ] `POST /user/demo-login`: only seeded usernames, bcrypt/argon2 check, rate-limited, off when the flag is false, same cookies as OTP.
- [ ] Demo accounts can't change their own role/status or demote other demo accounts.
- [ ] Auth page tab with role picker, pre-filled credentials, credentials shown as text.
- [ ] e2e: demo login per role lands on the right dashboard; OTP e2e still passes.

Verify: tests and e2e pass; flag off returns 404.

### Phase 32: Logout (F2) ⬜
Files: `userAuth.controller.ts` (logout), `server/tests/auth.test.ts`, `ui/HeaderMenu.jsx`, `features/authentication/Logout.tsx`, `useLogout.ts`

- [ ] Server: logout clears both cookies with the same options as login (`cookieOptions`); test that a request after logout gets 401.
- [ ] Client: logout in every authenticated layout header; clears the React Query cache; redirects to `/`.
- [ ] e2e: logout then visiting `/owner` redirects to auth.

Verify: e2e passes.

### Phase 33: Proposal workflow (F6) ⬜
Files: `proposal.controller.ts`, `project.controller.ts`, project router (freelancer read access), client proposal lists, `pages/` new freelancer project detail, admin projects page

- [ ] Accept = assign freelancer + close project + reject other pending proposals, in a transaction (memory server needs a replica set — or use a safe sequence).
- [ ] Only one accepted per project; un-accept clears `freelancer`.
- [ ] Proposal lists show the linked project title; `/freelancer/projects/:id` read-only without others' proposals.
- [ ] ADMIN can't send proposals (server 403, button hidden).

Verify: server tests for each rule; e2e: owner accepts, freelancer sees it accepted.

### Phase 34: Profile page and avatar (F3) ⬜
Files: `server/app/router/userAuth.ts` (multer), `userAuth.controller.ts`, `server/uploads/`, `client/src/pages/Profile.tsx` (new), routes under each role, `UserAvatar`

- [ ] `/<role>/profile` form via `/user/profile` + `PATCH /user/update`; phone read-only.
- [ ] Avatar upload: jpg/png/webp ≤ 2 MB validated on the server, stored in `uploads/`; initials fallback.
- [ ] Tests: oversized and wrong-type uploads rejected.

Verify: tests pass; header updates after saving.

### Phase 35: Admin category management (F4) ⬜
Files: `category.controller.ts`, category schemas, `client/src/features/admin/categories/` (new), `services/categoryService.ts`, `App.tsx` route

- [ ] Fix `type: "project"` on update and `parentId` on create.
- [ ] List + create/edit/delete modals; delete warns about children and is blocked when projects use the category.

Verify: server tests for the two fixes and the delete block.

### Phase 36: Admin user profile view (F5) ⬜
Files: `server/app/http/controllers/admin/user.controller.ts`, `server/tests/admin.test.ts`, `client/src/services/authService.ts`, `client/src/pages/AdminUserProfile.tsx` (new), `features/admin/users/*`, `App.tsx`

- [ ] Server: `/admin/user/profile/:userId` returns 404 for an unknown id, strips `otp`, and populates the project title on proposals; tests for each.
- [ ] Client: service + query hook; `/admin/users/:id` shows info, created/completed projects, proposals; status change in place.

Verify: server tests pass; status change invalidates the user and users-list queries.

### Phase 37: Pagination (F7) ⬜
Files: the four list endpoints, the shared filter builder, client list hooks, `ui/Pagination`, admin dashboard stats

- [ ] `page`/`limit` in, `{ items, total, page, limit }` out; page number in the URL; dashboard counts from `total`.

Verify: server tests for paging bounds; admin user count is no longer capped at 20.

### Phase 38: Real home page stats (F8) ⬜
Files: `server/app/router/stats.ts` (new), router, `pages/Home.tsx`

- [ ] `GET /stats/public` (no auth); Home uses it with a skeleton; remove hardcoded numbers; make or remove dead CTAs and footer links.

Verify: server test for the counts; Home shows seeded numbers.

---

## Part F: Finish ⬜

### Phase 39: Re-skin public and auth pages ⬜
Files: `pages/Home`, `Auth`, `CompleteProfile`, `NotFound`, auth feature components

- [ ] Rebuild on the design-system components; loading/empty/error states; responsive from 360px.

Verify: screenshots fa/en × light/dark; e2e passes.

### Phase 40: Re-skin layouts and dashboards ⬜
Files: `ui/AppLayout`, `Sidebar`, headers, the three `DashboardLayout`/`Stats` sets

- [ ] Sidebar becomes a drawer on mobile; merge the three dashboard/stats copies if they now differ only in data.

Verify: screenshots at 360px and desktop.

### Phase 41: Re-skin tables and detail pages ⬜
Files: project/proposal tables and rows, project detail, freelancer project detail, profile, admin users, admin user profile, admin categories

- [ ] Tables become cards or scroll on mobile; every list has loading, empty and error states.

Verify: screenshots; e2e passes.

### Phase 42: Translation coverage, screenshot and accessibility tests ⬜
Files: locale files, `e2e/` screenshot specs

- [ ] Screenshot tests for every F9 page in fa/en × light/dark.
- [ ] axe check per page in CI (WCAG 2.2 AA contrast in both themes).
- [ ] Zero untranslated strings (lint + parity check already enforce it; fix anything left).

Verify: CI green with the new suites.

### Phase 43: Final audit against the PRD success criteria ⬜
Files: `README.md`, `CLAUDE.md`, `docs/current-state.md`, `docs/known-bugs.md`

- [ ] Walk PRD §1 success criteria 1–6 and §2 must-preserve table; tick each with evidence (test name or screenshot).
- [ ] `npm audit` 0 high/critical in both packages; every dependency on its current major.
- [ ] Update README and CLAUDE.md to the new stack and commands; `known-bugs.md` should be empty or deleted.

Verify: every success criterion has evidence in the PR description.

---

## Decisions this plan makes (change them before starting if you disagree)

- **Jest → Vitest early (Phase 2).** The PRD wants Vitest; switching 678 lines of tests before adding more is cheaper than later.
- **Search uses an escaped regex, not a text index (Phase 12).** Simpler and works with partial words.
- **`sort=popular` is removed (Phase 12)** unless PRD open question 4 is answered otherwise.
- **Tailwind 4 lands in Phase 28 with tokens, before the redesign of pages**, so every phase still builds; pages are re-skinned later one group at a time.
- **Shared constants first, Zod later (Phases 14, 20 and 25).** The constants module is what Zod schemas read their limits from.
- **Zod is split by domain, not by package.** Phase 20 (auth) and Phase 25 (everything else) each move one domain's server routes and client forms together. Phase 20 runs before client TypeScript, so its client schemas start as `.js` and get converted in Phases 23–24.
