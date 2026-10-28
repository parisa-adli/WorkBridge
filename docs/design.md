# WorkBridge: Design Direction

Status: **agreed** by the project owner (2026-10-28), after review of the prototype. Closes the Part D gate in `docs/upgrade-plan.md` (PRD R9). A visual prototype is at `client/prototype/design.html` (see section 9).

This is the fixed target for the Tailwind 4 tokens (Phase 28), the design-system components (Phase 29) and the page re-skins (Part F). Anything not listed here is out of scope for F9.

## 1. Direction

**Calm and professional.** A neutral slate base, one indigo accent, generous whitespace, soft radii and almost no shadows. Content (projects, budgets, proposals) carries the page; chrome stays quiet.

Rules that follow from it:

- One accent color. Status colors (success, warning, error) are used only for status: badges, toasts, field errors.
- Surfaces are told apart by background tone and a 1px border, not by shadow. A shadow is allowed on overlays only (modal, dropdown, toast).
- Structure stays the same (PRD F9): routes, the sidebar + content layout, flow steps and actions do not change.
- Every layout uses logical properties (`ms-`, `pe-`, `start-`, `text-start`) so fa (RTL) and en (LTR) mirror without per-language styles.

## 2. Color tokens

Semantic tokens, defined as `--color-*` in Tailwind 4 `@theme` so they become utilities (`bg-surface`, `text-muted`, `border-strong`, ...). Dark values replace them under the existing `.dark-mode` class on `<html>` (`@custom-variant dark (&:where(.dark-mode, .dark-mode *))`).

| Token | Use | Light | Dark |
|---|---|---|---|
| `bg` | page background | `#F8FAFC` | `#0B1120` |
| `surface` | cards, tables, sidebar, modal | `#FFFFFF` | `#131C2E` |
| `surface-muted` | input fill, table header, hover row | `#F1F5F9` | `#1E293B` |
| `border` | dividers, card outlines (decorative) | `#E2E8F0` | `#273449` |
| `border-strong` | input and control borders | `#7C8798` | `#64748B` |
| `text` | body text, headings | `#0F172A` | `#F1F5F9` |
| `text-muted` | secondary text, captions, placeholders | `#475569` | `#A0AEC0` |
| `primary` | buttons, links, focus ring, active nav | `#4338CA` | `#818CF8` |
| `primary-hover` | hover/pressed primary | `#3730A3` | `#A5B4FC` |
| `on-primary` | text on `primary` | `#FFFFFF` | `#0B1120` |
| `primary-soft` | primary badge, selected row | `#EEF2FF` | `#1E1B4B` |
| `success` / `success-soft` | accepted, open, verified | `#047857` / `#ECFDF5` | `#34D399` / `#052E25` |
| `warning` / `warning-soft` | pending | `#B45309` / `#FFFBEB` | `#FBBF24` / `#2D1F05` |
| `error` / `error-soft` | rejected, closed, field errors, danger button | `#B91C1C` / `#FEF2F2` | `#F87171` / `#3B0D0D` |
| `backdrop` | modal overlay | `#0F172A` at 50% | `#000000` at 60% |

Badges are `{status}` text on `{status}-soft` background. The danger button is `error` outline in its idle state.

### Measured contrast (WCAG 2.2)

| Pair | Light | Dark | Needs |
|---|---|---|---|
| `text` on `bg` / `surface` / `surface-muted` | 17.1 / 17.9 / 16.3 | 17.2 / 15.5 / 13.4 | 4.5 |
| `text-muted` on `bg` / `surface` / `surface-muted` | 7.2 / 7.6 / 6.9 | 8.4 / 7.6 / 6.5 | 4.5 |
| `on-primary` on `primary` / `primary-hover` | 7.9 / 9.9 | 6.3 / 9.5 | 4.5 |
| `primary` on `surface` / `bg` / `primary-soft` | 7.9 / 7.6 / 7.1 | 5.7 / 6.3 / 5.4 | 4.5 |
| `success` on `success-soft` / `surface` | 5.2 / 5.5 | 7.7 / 8.9 | 4.5 |
| `warning` on `warning-soft` / `surface` | 4.8 / 5.0 | 9.6 / 10.2 | 4.5 |
| `error` on `error-soft` / `surface` | 5.9 / 6.5 | 6.1 / 6.2 | 4.5 |
| `border-strong` on `surface` / `bg` / `surface-muted` | 3.6 / 3.5 / 3.3 | 3.6 / 4.0 / 3.1 | 3 (non-text, 1.4.11) |

`border` is decorative only and is never the sole edge of a control. For comparison, today's `primary-900` (`#4A6DFF`) under white button text is 4.3, which fails; the new `primary` fixes that.

### Migration from today's tokens

Phase 28 moves the current `--color-primary-*` / `--color-secondary-*` scale into `@theme` **unchanged**, so its screenshots match `main` (its Verify step). The semantic tokens above are added beside them in the same phase. Components (Phase 29) and re-skinned pages (Part F) use only the semantic tokens. The old scale and the `.btn`/`.badge`/`.textField__input` classes are deleted in Phase 42, once a grep finds no use of them.

As built in Phase 28b: each token is `--color-<token>`, so the utilities are `bg-bg`, `bg-surface`, `text-text`, `text-text-muted`, `border-border-strong`, and so on. `success`, `warning` and `error` share their names with today's tokens and take the new values above (today's `text-error` field errors and icons turn darker). The radius tokens in section 4 are not in `@theme` yet: `--radius-sm/md/lg` would change Tailwind's own `rounded-sm/md/lg` on every current page, so Phase 29 adds them with the components.

## 3. Spacing

Tailwind 4's default spacing (`--spacing: 0.25rem`, so `p-4` = 16px). No custom scale. The values in use:

| Purpose | Value |
|---|---|
| Inside controls (button, input) | `px-4 py-2.5` (16 / 10px); small: `px-3 py-1.5` |
| Inside cards, modals, table cells | `p-4` mobile, `p-6` from `md` |
| Between fields in a form | `gap-5` (20px) |
| Between page sections | `gap-8` (32px) |
| Page gutter | `px-4` mobile, `px-8` from `lg` |
| Min touch target | 44 × 44px |

## 4. Radius

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 6px | badge, checkbox, tag |
| `--radius-md` | 10px | button, input, select, textarea |
| `--radius-lg` | 16px | card, table wrapper, modal |
| `--radius-full` | 9999px | avatar, pill, toggle |

## 5. Typography

### Fonts

- **Vazirmatn** (variable, OFL) for Persian. The family is renamed from today's `"Vazir"` to `"Vazirmatn"`.
- **Inter** (variable, OFL) for Latin.
- Both self-hosted as `woff2` in `client/public/fonts/` with `font-display: swap`; no Google Fonts request.
- Stacks, set on `<html>` by its `lang` (Phase 26 already sets it):
  - `fa`: `Vazirmatn, Inter, system-ui, sans-serif` (Latin words in Persian text use Vazirmatn's own Latin glyphs, so line metrics stay even).
  - `en`: `Inter, Vazirmatn, system-ui, sans-serif` (Vazirmatn catches Persian user content such as project titles).
- Weights: 400 body, 500 labels and table headers, 700 headings and buttons. `font-black` (900, used in 4 headers today) becomes 700.
- Numbers in tables and stats use `tabular-nums`.

### Type scale

Persian needs taller lines than Latin; the line heights below suit both.

| Token | Size / line height | Use |
|---|---|---|
| `text-xs` | 12 / 18px | badge, caption |
| `text-sm` | 14 / 22px | table cells, helper text, labels |
| `text-base` | 16 / 26px | body, inputs, buttons |
| `text-lg` | 18 / 28px | card title |
| `text-xl` | 20 / 30px | section heading |
| `text-2xl` | 24 / 34px | page title |
| `text-3xl` | 30 / 40px | home hero (mobile), stats numbers |
| `text-4xl` | 36 / 48px | home hero (from `md`) |

## 6. Accessibility target

**WCAG 2.2 AA in both themes and both languages.** Concretely:

- Contrast: 4.5:1 for text, 3:1 for large text, control borders, focus rings and icons that carry meaning (section 2 shows the token pairs meet it).
- Focus: every interactive element shows a 2px `primary` ring with a 2px offset on `:focus-visible`.
- Keyboard: modals trap focus, close on Escape and return focus to their trigger; menus and the mobile drawer open, move and close by keyboard.
- Forms: every field has a visible `<label>`; errors are linked with `aria-describedby` and announced.
- Status is never color-only: badges always carry text.
- Motion: transitions respect `prefers-reduced-motion`.
- Checked by an axe run per page in CI (Phase 42) and on the reference page (Phase 29).

## 7. F9 page list and re-skin order

From PRD F9. Every page is redesigned on the Phase 29 components, in fa/en × light/dark, responsive from 360px, with loading, empty and error states for each list.

| Order | Phase | Page | Route(s) |
|---|---|---|---|
| 0 | 29 | 404 and not-access (reference page) | `*`, `/not-access` |
| 1 | 39 | Home | `/` |
| 2 | 39 | Auth (OTP tab and demo email tab) | `/auth` |
| 3 | 39 | Complete profile | `/complete-profile` |
| 4 | 40 | App layout: sidebar (drawer on mobile) and dashboard header | all role routes |
| 5 | 40 | Owner dashboard | `/owner/dashboard` |
| 6 | 40 | Freelancer dashboard | `/freelancer/dashboard` |
| 7 | 40 | Admin dashboard | `/admin/dashboard` |
| 8 | 41 | Owner projects table | `/owner/projects` |
| 9 | 41 | Project detail with its proposals table | `/owner/projects/:id` |
| 10 | 41 | Projects list (freelancer and admin) | `/freelancer/projects`, `/admin/projects` |
| 11 | 41 | Proposals table (freelancer and admin) | `/freelancer/proposals`, `/admin/proposals` |
| 12 | 41 | Admin users | `/admin/users` |
| 13 | 41 | Profile (built in Phase 34, F3) | added in Phase 34 |
| 14 | 41 | Admin user profile (built in Phase 36, F5) | added in Phase 36 |
| 15 | 41 | Admin categories (built in Phase 35, F4) | added in Phase 35 |

Pages 13–15 are created in Part E already on the new components; Phase 41 only checks them against this document. Phase 42 adds screenshot tests for every row.

## 8. Agreement

- [x] Direction, tokens, fonts, page list and accessibility target agreed by the project owner.

## 9. Prototype

`client/prototype/design.html` shows this direction on realistic screens: the 404 and not-access reference pages, the sidebar layout (a drawer below 768px), dashboard stats, a projects table, a project card, a proposal form, every button, input and badge state, list loading/empty/error states, a modal, and the token, type, radius and spacing scales with contrast computed live. It switches fa/en and light/dark (the `.dark-mode` class), and `?view=all` shows all four side by side.

Preview: `npm run dev`, then open <http://localhost:3000/prototype/design.html>. It is standalone HTML and CSS: the app does not import it and the production build does not include it. It loads Vazirmatn and Inter from Google Fonts; the app will self-host them (§5). Delete it once Phase 29 has built the real components.
