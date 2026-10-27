# WorkBridge: Current State Report

Snapshot of the codebase as of 2026-10-27 (commit `8c488c2`). This report is based on reading the code. Nothing was changed. The only things run were `npm ls`, `npm outdated`, `npm audit` and `eslint`.

---

## 1. Architecture

Monorepo with two independent npm packages and a thin root package:

| Path | Role |
|------|------|
| `package.json` (root) | Only `concurrently`; `npm run dev` starts both apps |
| `client/` | React 18 single-page app built with Vite |
| `server/` | Express 4 REST API on MongoDB (Mongoose) |

### Client (`client/src`)

- **Entry:** `main.jsx` → `BrowserRouter` → `App.jsx`. `App.jsx` sets up `DarkModeProvider`, `QueryClientProvider`, `Toaster` and all routes.
- **Layers** (each feature follows the same flow):
  1. `services/*.js`: API functions on one shared axios instance (`services/httpService.js`). Every call unwraps the server's envelope with `.then(({ data }) => data.data)`.
  2. `features/<domain>/use*.js` and `hooks/*.js`: TanStack Query `useQuery`/`useMutation` wrappers. Mutations show a toast and invalidate query keys.
  3. `features/<domain>/*.jsx`: domain components (tables, rows, forms, modals).
  4. `pages/*.jsx`: thin route components.
  5. `ui/*.jsx`: shared building blocks (`Table` compound component, `Modal`, `RHFSelect`, `Textfield`, `Filter`, `FilterDropDown`, `Toggle`, `AppLayout`, `Sidebar`, `ProtectedRoute`).
- **Layouts:** `features/{owner,freelancer,admin}/*Layout.jsx` each render `AppLayout` with a role-specific `Sidebar`. `AppLayout` injects `isShowSidebar` into the `Sidebar` child via `React.cloneElement`.
- **State:** server state lives only in React Query. The only client state is dark mode (`context/DarkModeContext.jsx` + `hooks/useLocalStorageState.js`) and URL search params for filters (`ui/Filter.jsx`, `ui/FilterDropDown.jsx`).
- **Styling:** Tailwind 3 with CSS-variable color tokens (`tailwind.config.js`, `src/index.css`). RTL (`index.html` has `lang="fa" dir="rtl"`). Persian digits come from `utils/toPersianNumber.js` and dates from `utils/toLocalDateShort.js` (`fa-IR`).

### Server (`server/`)

- **Entry:** `index.js` → `new Application()` (`app/server.js`). The constructor runs, in order: `listen` → `mongoose.connect` → CORS/JSON/urlencoded/static → `cookieParser(secret)` → `/api` routes → 404 handler → error handler.
- **Routing:** `app/router/router.js` mounts the sub-routers (section 3).
- **Controllers:** classes extending `app/http/controllers/controller.js`, which calls `autoBind` in its constructor. Each controller module exports one singleton instance. Every handler is wrapped in `express-async-handler`.
- **Validation:** Joi schemas in `app/http/validators/`. Each rule's `.error()` attaches an `http-errors` instance with a Persian message.
- **Errors:** the error handler in `app/server.js` returns `{ statusCode, message }`.
- **Success shape** (convention, not enforced): `{ statusCode, data: { message?, ...payload } }`.

### How client and server communicate

- REST over HTTPS with JSON bodies. Axios `baseURL` is **hardcoded** in `client/src/services/httpService.js:3` as `https://freelancer-bc.runflare.run/api`, so local development talks to the deployed backend by default.
- **Auth is cookie-based.** The server sets signed, httpOnly `accessToken` (1 day) and `refreshToken` (1 year) JWT cookies (`server/utils/functions.js` `setAccessToken`/`setRefreshToken`). The client sends them with `withCredentials: true`.
- **Token refresh:** a response interceptor catches a 401, calls `GET /user/refresh-token` once (`_retry` flag), then replays the original request.
- **CORS:** `cors({ credentials: true, origin: process.env.ALLOW_CORS_ORIGIN })`, a single origin.

---

## 2. Tech stack (versions)

Format: range declared in `package.json` → version installed in `node_modules`.

### Root
| Package | Declared | Installed |
|---|---|---|
| concurrently (dev) | ^9.1.2 | — |

### Client (`client/package.json`, name `freelancer-app-frontend`)
| Package | Declared | Installed | Latest (npm outdated) |
|---|---|---|---|
| react / react-dom | ^18.3.1 | 18.3.1 | 19.3.1 |
| react-router-dom | ^7.0.2 | 7.0.2 | 7.18.4 |
| @tanstack/react-query | ^5.62.7 | 5.62.10 | 5.105.0 |
| @tanstack/react-query-devtools | ^5.62.10 | 5.62.10 | 5.105.0 |
| axios | ^1.7.9 | 1.7.9 | 1.21.0 |
| react-hook-form | ^7.54.1 | 7.54.1 | 7.91.0 |
| react-hot-toast | ^2.4.1 | 2.4.1 | 2.6.1 |
| @headlessui/react | ^2.2.0 | 2.2.0 | 2.2.10 |
| react-icons | ^5.4.0 | 5.4.0 | 5.7.0 |
| react-icon | ^1.0.0 | 1.0.0 | — (unrelated package, see §6) |
| react-loader-spinner | ^6.1.6 | 6.1.6 | 8.0.2 |
| react-multi-date-picker | ^4.5.2 | 4.5.2 | — |
| react-otp-input | ^3.1.1 | 3.1.1 | — |
| react-tag-input-component | ^2.0.2 | 2.0.2 | — |
| query-string | ^9.1.1 | 9.1.1 | 10.0.0 (unused) |
| vite (dev) | ^6.0.1 | 6.0.3 | 8.3.5 |
| @vitejs/plugin-react (dev) | ^4.3.4 | 4.3.4 | 6.1.2 |
| tailwindcss (dev) | ^3.4.16 | 3.4.16 | 4.3.3 |
| @tailwindcss/forms (dev) | ^0.5.9 | 0.5.9 | 0.5.11 |
| postcss / autoprefixer (dev) | ^8.4.49 / ^10.4.20 | 8.4.49 / 10.4.20 | 8.5.32 / 10.6.2 |
| eslint / @eslint/js (dev) | ^9.15.0 | 9.17.0 | 10.13.0 |
| eslint-plugin-react (dev) | ^7.37.2 | 7.37.2 | 7.37.5 |
| eslint-plugin-react-hooks (dev) | ^5.0.0 | 5.1.0 | 7.1.1 |
| eslint-plugin-react-refresh (dev) | ^0.4.14 | 0.4.16 | 0.5.7 |
| globals (dev) | ^15.12.0 | 15.13.0 | 17.13.0 |
| @types/react / @types/react-dom (dev) | ^18.3.12 / ^18.3.1 | 18.3.16 / 18.3.5 | 19.x |

### Server (`server/package.json`, name `inventory-app`)
| Package | Declared | Installed | Latest |
|---|---|---|---|
| express | ^4.18.2 | 4.18.2 | 5.3.0 |
| mongoose | ^7.1.0 | 7.1.0 | 9.11.4 |
| jsonwebtoken | ^9.0.0 | 9.0.0 | 9.0.3 |
| joi | ^17.9.2 | 17.9.2 | 18.3.0 |
| cookie-parser | ^1.4.6 | 1.4.6 | 1.4.7 |
| cors | ^2.8.5 | 2.8.5 | 2.8.6 |
| dotenv | ^16.0.3 | 16.0.3 | 18.0.9 |
| http-errors | ^2.0.0 | 2.0.0 | 2.0.1 |
| http-status-codes | ^2.2.0 | 2.2.0 | 2.3.0 |
| express-async-handler | ^1.2.0 | 1.2.0 | — |
| auto-bind | ^4.0.0 | 4.0.0 | 5.0.1 |
| axios | ^1.4.0 | 1.6.8 | 1.21.0 (unused) |
| kavenegar | ^1.1.4 | 1.1.4 | — (unused, see §6) |
| moment-jalali | ^0.3.9 | 0.3.9 | — (only in dead code) |
| nodemon (dev) | ^2.0.22 | 2.0.22 | 3.1.14 |

`npm ls` also reports extraneous packages in `server/node_modules`: `mongodb@6.19.0`, `@mongodb-js/saslprep`, `whatwg-url`, `tr46`, `mongodb-connection-string-url`.

**`npm audit`:** client has 30 vulnerabilities (1 critical, 16 high); server has 27 (3 critical, 16 high). Notable server ones: `axios`, `body-parser`, `path-to-regexp` (Express 4.18.2), `jws` (jsonwebtoken), `joi`, `form-data`, `cookie`.

---

## 3. API routes

All routes are prefixed with `/api`. "Auth" means the `verifyAccessToken` middleware (`server/app/http/middlewares/user.middleware.js`); it reads the signed `accessToken` cookie and sets `req.user`. "Verified" means `isVerifiedUser`, which requires `req.user.status === 2`. Roles are checked by `authorize(...roles)` (`permission.guard.js`), which reloads the user from the database.

Response bodies below show only the `data` part of `{ statusCode, data }`.

### `/user`: `app/router/userAuth.js` → `UserAuthController` (`controllers/userAuth.controller.js`)
| Method & path | Auth | Request body | Response `data` |
|---|---|---|---|
| POST `/user/get-otp` | none | `{ phoneNumber }` (not validated with `getOtpSchema`) | `{ message, expiresIn: 90000, phoneNumber }` |
| POST `/user/check-otp` | none | `{ otp, phoneNumber }` (`checkOtpSchema`) | `{ message, user }`; sets both cookies |
| POST `/user/complete-profile` | Auth | `{ name, email, role: "OWNER"\|"FREELANCER" }` (`completeProfileSchema`) | `{ message, user }`; re-sets cookies |
| GET `/user/refresh-token` | refresh cookie | — | `{ user }` (top-level key is `StatusCode`, capitalized) |
| PATCH `/user/update` | Auth | `{ name, email, phoneNumber?, biography? }` (`updateProfileSchema`) | `{ message }` |
| GET `/user/profile` | Auth | — | `{ user }` (without `otp`) |
| POST `/user/logout` | none | — | `{ StatusCode, roles: null, auth: false }` (no `data` envelope) |

### `/category`: `app/router/category.js` → `CategoryController`
| Method & path | Auth | Request | Response `data` |
|---|---|---|---|
| GET `/category/list` | none | any query string, passed **directly** to `find()` | `{ categories }` |
| GET `/category/:id` | none | — | `{ category }` |

### `/project`: `app/router/project.js` → `ProjectController`. The router-level guard is Auth + Verified (the role guard is commented out in `router.js:21`)
| Method & path | Roles | Request | Response `data` |
|---|---|---|---|
| GET `/project/list` | any verified | query `search`, `status` (`OPEN`/`CLOSED`), `category` (comma-separated `englishTitle`s or `ALL`), `sort` (`latest`/`earliest`) | `{ projects }` with `category` populated; `owner`, `freelancer` and `proposals` excluded |
| GET `/project/owner-projects` | ADMIN, OWNER | query `search`, `category`, `sort` (`latest`/`earliest`/`popular`) | `{ projects }`: the current user's projects, with `category`, `owner.name` and `freelancer.name` populated |
| POST `/project/add` | ADMIN, OWNER | `{ title (3–30), description, tags[] (≤20), category (ObjectId), budget, deadline }` (`addProjectSchema`) | 201 `{ message, project }` |
| GET `/project/:id` | ADMIN, OWNER | — | `{ project }`: populates category, proposals (with `user.name`), owner and freelancer |
| PATCH `/project/update/:id` | ADMIN, OWNER | same body as `add` | `{ message }` |
| PATCH `/project/:id` | ADMIN, OWNER | `{ status: "OPEN"\|"CLOSED" }` (not validated) | `{ message }` |
| DELETE `/project/:id` | ADMIN, OWNER | — | `{ message }`; returns 400 if a freelancer is assigned |

### `/proposal`: `app/router/proposal.js` → `ProposalController`. Router-level guard: Auth + Verified
| Method & path | Roles | Request | Response `data` |
|---|---|---|---|
| GET `/proposal/list` | FREELANCER, ADMIN | query `sort` | `{ proposals }` (the user's own; all of them for ADMIN; no population) |
| POST `/proposal/add` | FREELANCER, ADMIN | `{ description, price, duration, projectId }` (`addProposalSchema`) | 201 `{ message }`; pushes the id to `project.proposals` |
| GET `/proposal/:id` | FREELANCER, ADMIN | — | `{ proposal }` |
| PATCH `/proposal/:id` | OWNER, ADMIN | `{ status: 0\|1\|2 }` (`projectId` is read but never used) | `{ message }`; sets `project.freelancer` to the proposal's user when `status === 2`, otherwise `null` |

### `/admin`: `app/router/admin/admin.routes.js`. Router-level guard: Auth + Verified + `authorize(ADMIN)`
| Method & path | Controller | Request | Response `data` |
|---|---|---|---|
| GET `/admin/user/list` | `admin/user.controller.js` `getAllUsers` | query `page` (1), `limit` (20), `search` (turned into a regex) | `{ users }` |
| PATCH `/admin/user/verify/:userId` | `verifyUser` | `{ status: 0\|1\|2 }` | `{ message }` |
| GET `/admin/user/profile/:userId` | `userProfile` | — | `{ user, createdProjects, completedProjects, proposals }` |
| POST `/admin/category/add` | `CategoryController.addNewCategory` | `{ title, englishTitle, description, type, parent? }` (`addCategorySchema`) | 201 `{ message }` |
| PATCH `/admin/category/update/:id` | `updateCategory` | `{ title?, englishTitle?, description, type }` (`updateCategorySchema`) | `{ message }` |
| DELETE `/admin/category/remove/:id` | `removeCategory` | — | `{ message }`; also deletes child categories |

### What the client actually calls
`authService.js` calls get-otp, check-otp, complete-profile, profile, logout, admin user list and verify. `projectService.js` calls all 7 project routes. `proposalServis.js` calls proposal list, add and change status. `categoryService.js` calls category list.

**Never called by the client:** `/user/update`, `/user/refresh-token` (only via the interceptor), `/proposal/:id`, `/category/:id`, `/admin/user/profile/:id`, and all `/admin/category/*` routes.

---

## 4. Data models (`server/app/models/`)

```
User 1 ──owner──< Project >──category── 1 Category ──parentId──> Category
User 1 ──freelancer──< Project
Project 1 ──proposals[]──< Proposal >──user── 1 User
```

| Model | Fields | Notes |
|---|---|---|
| **User** (`user.js`) | `name`, `avatar`, `biography`, `email`, `phoneNumber`, `password`, `otp{code, expiresIn}`, `resetLink`, `isVerifiedPhoneNumber`, `isActive`, `status` (0 rejected / 1 pending / 2 verified, default 1), `role` (free string, default `"OWNER"`), timestamps | `avatarUrl` virtual built from `SERVER_URL`. `toJSON` strips `password` and `avatar` but **not `otp`**. Text index on a nonexistent `username` field. Typo `defaul: 0` on `otp.code`. `password` and `resetLink` are unused. |
| **Project** (`project.js`) | `title`, `description`, `status` (`OPEN`/`CLOSED`), `category`→Category, `budget`, `tags[]`, `proposals[]`→Proposal, `deadline`, `owner`→User, `freelancer`→User\|null, timestamps | `proposals` has `ref: "PROPOSAL"` (wrong case; the model is named `Proposal`). It works only because `getProjectById` passes `model: "Proposal"` explicitly. There is no text index, but `getListOfProjects` uses `$text` search (see §6). |
| **Proposal** (`proposal.js`) | `price`, `duration` (days), `description`, `user`→User, `status` (0 rejected / 1 pending / 2 accepted), timestamps | **No back-reference to Project.** The link exists only through `Project.proposals[]`. |
| **Category** (`category.js`) | `title` (unique), `englishTitle` (unique), `description` (lowercased), `type` (`project`/`comment`/`post`/`ticket`), `parentId`→Category, `icon{sm,lg}`, timestamps | Text index on `title` and `englishTitle`. |

---

## 5. User flows by role

### Common: authentication (`features/authentication/`)
1. `/auth` → `AuthContainer` step 1, `SendOTPForm`: phone number → `POST /user/get-otp`. The server **prints the OTP to the console** (`userAuth.controller.js:108`); no SMS is sent.
2. Step 2, `CheckOTPForm`: 6-digit OTP with a 90-second resend timer → `POST /user/check-otp`. Cookies are set.
3. If `!user.isActive`, go to `/complete-profile` (`CompleteProfileForm`): name, email, and a role chosen between OWNER and FREELANCER → `POST /user/complete-profile`.
4. New users have `status: 1` (pending), so they are sent to `/` with the toast "your profile is awaiting approval". **An admin must set `status: 2` before the user can use any dashboard.**
5. Logout: there is a `Logout` component, but **it isn't rendered anywhere** (see §7).

`ProtectedRoute` + `useAuthorize` compare the first URL segment (`owner` / `freelancer` / `admin`) with `user.role`, and require `status === 2`.

### Owner (`/owner/*`, `features/owner`, `features/projects`, `features/project`)
- **Dashboard** (`owner/DashboardLayout.jsx`): stats from `/project/owner-projects` (project count, "assigned projects", total proposals).
- **Projects** (`pages/Projects.jsx`): table of the owner's projects (`projects/ProjectTable.jsx`).
  - Create or edit in a modal (`CreateProjectForm`: title, description, budget, category, tags, Persian date picker).
  - Delete with confirmation (`ConfirmDelete`).
  - Open/closed toggle (`ToggleProjectStatus`).
  - Eye icon → `/owner/projects/:id`.
- **Project detail** (`pages/Project.jsx`): the project's proposals table. The owner changes each proposal's status (rejected / pending / accepted) in a modal (`ChangeProposalStatus`). Accepting one assigns that freelancer to the project.

### Freelancer (`/freelancer/*`, `features/freelancer`, `features/proposals`)
- **Dashboard:** stats from `/proposal/list` (proposal count, accepted count, "wallet" = sum of accepted proposal prices).
- **Projects** (`pages/SubmittedProjects.jsx`): all projects from `/project/list`, filtered by URL params `status`, `sort` and `category` (`freelancer/projects/ProjectsHeader.jsx`). Each row has a "send proposal" modal (`CreateProposal`: description, price, duration).
- **Proposals** (`pages/Proposals.jsx`): the freelancer's own proposals (description, duration, price, status). The project title is not shown.

### Admin (`/admin/*`, `features/admin`)
- **Dashboard:** counts of proposals, projects and users.
- **Users** (`features/admin/users`): table of users. Status is changed in a modal → `PATCH /admin/user/verify/:id`.
- **Projects / Proposals:** reuses the freelancer pages (`SubmittedProjects`, `Proposals`), so the admin also sees the "send proposal" button.
- **No admin UI exists for** categories, a user profile view, or editing and deleting projects.
- **No way to become admin:** `completeProfileSchema` only allows OWNER and FREELANCER, so an admin has to be set directly in MongoDB.

### Public
`/` (`pages/Home.jsx`): marketing landing page with hardcoded categories and statistics. `*` → `NotFound`.

---

## 6. Technical debt

### 6.1 Security issues (highest priority)

1. **Concurrent logins can get the wrong OTP.** `UserAuthController` is a singleton, and `getOtp` stores the code on the instance (`this.code`, `this.phoneNumber`, `userAuth.controller.js:22-33`). `saveUser` reads `this.code` later (line 78). If two users request an OTP at the same time, one can get the other's code saved to their account.
2. **Any owner can change any project.** `updateProject`, `changeProjectStatus`, `deleteProject` and `getProjectById` (`project.controller.js`) never check `project.owner === req.user._id`.
3. **Any owner can change any proposal.** `PATCH /proposal/:id` (`changeProposalStatus`) only checks the OWNER role, so any owner can accept or reject proposals on other people's projects and assign freelancers to them.
4. **The server's source code is publicly downloadable.** `express.static(path.join(__dirname, ".."))` (`server.js:44`) serves the whole `server/` directory, so `/app/server.js`, `/utils/functions.js`, `/package.json` and `/node_modules/...` can all be fetched. Dotfiles like `.env` are ignored by default, but everything else is exposed.
5. **NoSQL operator injection.** `CategoryModel.find(req.query)` (`category.controller.js:13`) passes raw query params, including `?title[$ne]=x`-style operators, straight into Mongo.
6. **Regex DoS from user input.** `new RegExp(search, "ig")` (`admin/user.controller.js:16`) compiles user input unescaped. It is admin-only, but invalid input such as `(` throws a 500.
7. **Weak OTP handling:**
   - no rate limiting on `/user/get-otp` or `/user/check-otp`, so a 6-digit code can be brute-forced within its 90-second lifetime;
   - the OTP is not cleared after successful use;
   - codes come from `Math.random()`;
   - the code is logged to stdout.
8. **The OTP leaks back to the client.** `check-otp` returns `user` including `otp`: the query projection only excludes `password`, and `toJSON` doesn't strip `otp`. `refresh-token` also returns the full user.
9. **Proposals aren't checked against their project.** `addNewProposal` never checks that `projectId` exists or is `OPEN`, and never prevents duplicate proposals. A proposal for a nonexistent project is saved and then orphaned.
10. **No security middleware:** no `helmet`, no request body size limit, no rate limiter.
11. **Logout cookie in development.** Logout sets `secure: true` unconditionally (`userAuth.controller.js:202`), while login sets `secure` only outside development. This may stop logout from clearing cookies over plain-HTTP dev setups.
12. **Vulnerable dependencies:** see §2 (`npm audit`).

### 6.2 Hardcoded values
- API URL hardcoded in `client/src/services/httpService.js:3`. `client/.env` defines `VITE_BASE_URL`, but **nothing reads it** (there is no `import.meta.env` anywhere in `client/src`).
- **Port mismatch:** the Vite dev port is `3000` (`client/vite.config.js`), but the README's `CLIENT_URL` and `ALLOW_CORS_ORIGIN` use `5173`. Following the README produces CORS failures against a local server.
- Home page data (category counts, "7423 freelancers", ...) is hardcoded in `pages/Home.jsx`.
- OTP lifetime is set twice: `CODE_EXPIRES = 90s` on the server and `RESEND_TIME = 90` in `CheckOTPForm.jsx`. The server's `expiresIn` response field is ignored.
- Role strings are spread around: `"OWNER"`/`"FREELANCER"`/`"ADMIN"` are literals in `CheckOTPForm`, `CompleteProfileForm`, `usePickUser` and a local `ROLES` object in `useAuthorize` (the server has `utils/constants.js`).
- Status codes `0/1/2` and their Persian labels are hardcoded in each component that shows them (see §6.3).
- Validation limits differ between client and server: the client requires a project title of at least 10 characters with no maximum, while the server caps it at 30 (`project.schema.js`, with an error message that says "product title"). Client budget minimum is 100,000; the server has none.
- Brand naming is inconsistent: "WorkBridge" (README), "فریلنسر اپ"/"FreelancerApp" (Home), "Freelancering App" (`index.html`), "freelancer" (OTP message), `inventory-app` (server package name).

### 6.3 Duplicated logic
- The `statusStyle` array (rejected / pending / accepted badges) is copied into `features/project/ProposalRow.jsx`, `features/proposals/ProposalRow.jsx` and `features/admin/users/UserRow.jsx`. The status `options` array is copied into `ChangeProposalStatus.jsx` and `ChangeUserStatus.jsx`. All copies contain the same typo "انتطار".
- Each mutation hook has the same `onSuccess`/`onError` boilerplate (`features/projects/use*.js`, `useCreateProposal`, `useChangeUserStatus`, `useChangeProposalStatus`), written with the comma operator (`toast.success(...), queryClient.invalidateQueries(...)`).
- Post-login redirect by role is implemented three times: `CheckOTPForm.jsx`, `CompleteProfileForm.jsx`, `hooks/usePickUser.js`.
- Server: category filtering and sorting are copied between `getListOfProjects` and `getListOfOwnerProjects`. Cookie options are copied across `setAccessToken`, `setRefreshToken` and `logout`. The "find by id or 404" helper is written separately in each controller.
- Two `DashboardLayout` + `Stats` triplets (owner, freelancer, admin) and two `ProjectRow`/`ProjectsHeader` pairs (owner vs freelancer).

### 6.4 Missing or incorrect error handling
- **`ReferenceError` instead of the intended error:** `createError` is undefined in `project.controller.js:229` (it imports `createHttpError`) and in `category.controller.js:68,83` (it imports neither). The real error is masked and the client gets a generic 500.
- **Crash on an unknown category:** `getListOfOwnerProjects` destructures `{ _id }` from `findOne` (`project.controller.js:98`), which throws when the category doesn't exist.
- **Proposal status change crashes on orphaned proposals:** `ProjectModel.findOne(...)` returning null leads to `project._id` throwing. The status is also not validated (`Number(undefined)` is `NaN`).
- **Request hangs on failed delete:** `deleteProject` sends no response when `deletedCount === 0`. It also leaves the project's proposals orphaned.
- **Re-saving unchanged data returns 500:** `updateProject`, `updateCategory`, `changeProjectStatus` and `verifyUser` treat `modifiedCount === 0` as a server error, so saving the same values or toggling to the current status fails. `changeProjectStatus` also reports it as "proposal status not updated".
- **Check that never fires:** `if (!updateResult.modifiedCount === 0)` (`userAuth.controller.js:163`) is always false.
- **Wrong 400s and stray objects on project validation:** `getProjectById` and `updateProject` call `findProjectById` before validation. `updateProject` validates *after* destructuring and logs `req.body`. `addNewProposal` pushes into the project *before* checking that the proposal was created.
- **Mongo errors silently swallowed:** `mongoose.connect` failure is only logged, and the server keeps listening. `listen` is called before the DB connects.
- **Client crash on network errors:** `err.response.status` in `httpService.js:20` throws `TypeError` when there is no response (network error, CORS).
- **Client crash on unknown status values:** rows index `statusStyle[status]` / `projectStatus[status]` without a fallback.
- **Client crash when editing a project without a deadline:** `new Date(deadline || "")` (`CreateProjectForm.jsx:44`) starts as Invalid Date. If the user submits without picking a date, `toISOString()` throws `RangeError`.
- **Unescaped user search input on the server:** `search` goes straight into `$text`, but `Project` has no text index, so `/project/list?search=x` makes Mongo error with "text index required" (500).

### 6.5 Outdated or unnecessary dependencies
- `react-icon@1.0.0` (client) is an unrelated package installed next to `react-icons`. It is probably a typo.
- `query-string` (client) is unused; its use is commented out in `hooks/useProjects.js`.
- `kavenegar` and `axios` (server) are unused. SMS sending was replaced by `console.log`.
- `moment-jalali` is only used by the dead `invoiceNumberGenerator`.
- Express 4.18.2 and Mongoose 7.1.0 are far behind, even within their major versions (4.22 and 7.8 respectively). Mongoose 7 ignores the `useNewUrlParser`/`useUnifiedTopology` options passed in `server.js:32`.
- ESLint 9 with a legacy `.eslintrc.cjs` config: `npm run lint` fails immediately (see §7).

---

## 7. Incomplete or broken

**Dead code from another project template** (e-commerce / inventory):
- `server/utils/functions.js` contains `getUserCartDetail` (cart/coupon aggregation over `products`/`coupons` collections that don't exist), `checkProductExist` (requires `../app/models/product`, which doesn't exist), `invoiceNumberGenerator`, `deleteInvalidPropertyInObject` and `secretKeyGenerator`. None are used.
- `ZARINPAL_CALLBACK_URL` (payment gateway) is in the README `.env` but is never read.
- `decideAuthMiddleware` (`user.middleware.js`) and `ROLES.USER` are unused. `sort=popular` sorts by a nonexistent `likes` field.

**Broken client behavior:**
- **There is no way to log out.** `features/authentication/Logout.jsx` and `useLogout.js` exist, but `<Logout />` is not rendered anywhere. `HeaderMenu` only shows a login button when logged out.
- **Unauthorized users hit a dead route.** `ProtectedRoute` redirects to `/not-access` (`ProtectedRoute.jsx:22`), which isn't a route, so it falls through to `NotFound`. The effect also omits `isVerified` from its dependencies (line 23), and an unauthenticated user triggers several navigations plus a misleading "profile not verified" toast.
- **Logged-out visitors can crash the home page.** `UserAvatar` is always rendered and its `onClick` calls `pickUser(user.role)` (`UserAvatar.jsx:10`), which throws when `user` is undefined. Clicking it on the Home page while logged out crashes.
- **Dark mode writes to localStorage on every render.** `useLocalStorageState` has its dependency array outside `useEffect` (`useLocalStorageState.js:12`, comma operator).
- **Proposal form has no loading state and logs data.** `CreateProposal.jsx:81` uses `{0 ? <Loading/> : ...}`, so the button never shows a loading state (`isCreating` is unused). `console.log(data)` was left in.
- **Owner stat counts the wrong thing.** The "assigned projects" stat counts `status === "OPEN"` (`owner/Stats.jsx:11`); it should count projects with a freelancer.
- **Freelancer "wallet" isn't real money.** It sums accepted proposal prices; there is no payment model behind it.
- **Stray character on the profile page.** `pages/CompleteProfile.jsx:7` renders `<CompleteProfileForm />;`, so a literal ";" appears on the page.
- **Stale data after mutations:**
  - accepting a proposal doesn't invalidate `["owner-projects"]`, so the freelancer column stays stale;
  - creating a proposal doesn't invalidate `["projects"]`;
  - project create/edit/delete don't invalidate `["projects"]` (the freelancer/admin list).
- **Proposal lists lack the project.** Freelancer and admin proposal lists don't show which project a proposal belongs to, because the server doesn't populate it and there is no Proposal → Project ref.
- **Freelancers can't open project details.** `GET /project/:id` is restricted to ADMIN/OWNER.
- **Admins can submit proposals.** The admin "projects" page shows the freelancer "send proposal" button, and the server allows ADMIN to post proposals.
- **Accepting a proposal doesn't finish the job.** Other proposals are not rejected, the project is not closed, and two proposals can both be "accepted" (the last one wins `freelancer`).

**Server-side gaps:**
- **No pagination on lists.** Only `/admin/user/list` takes `page`/`limit`. The admin dashboard counts `users.length` from it, so the count is capped at 20.
- **Category admin is broken in several ways:**
  - `updateCategorySchema` allows `"product"` instead of `"project"` (`category.shcema.js:55`), so a project category can't be updated with its own type;
  - `addNewCategory` saves `parent`, but the schema field is `parentId`, so parent links are silently dropped;
  - the validator file name is misspelled (`shcema`).
- **Unused update-profile route:** `/user/update` exists on the server, but there is no profile page in the client.
- **Avatar support is unreachable:** the `avatar` field and `avatarUrl` virtual exist, but multer is commented out (`userAuth.js:3`) and `UserAvatar` uses a static `/user.jpg`.

**Unused client files:**
- `features/projects/ProjectTable-v1.jsx` is unused.
- `services/proposalServis.js` has a misspelled name.
- `react-tag-input-component`'s `name="tags"` is not registered with react-hook-form (tags are managed manually, which is fine, but inconsistent with the other fields).
- Home page CTA buttons ("مشاهده") have no handlers, footer items aren't links, and the Instagram/Telegram anchors have no `href`.

**Tooling:**
- `npm run lint` (client) fails with "ESLint couldn't find an eslint.config.(js|mjs|cjs) file". ESLint 9 needs a flat config, but the repo has `client/.eslintrc.cjs`.
- The server has no linter.

---

## 8. Tests

**None.** Neither `client/package.json` nor `server/package.json` has a `test` script or a test runner dependency. No `*.test.*`, `*.spec.*` or `__tests__` files exist outside `node_modules`. There is no CI configuration (`.github/` doesn't exist).

The highest-value places to add tests first:
1. ownership checks on project and proposal mutations (once they're added);
2. the OTP flow (`getOtp`/`checkOtp`), including concurrent requests;
3. `changeProposalStatus` and its effect on `project.freelancer`;
4. `useAuthorize`'s role-from-URL logic.
