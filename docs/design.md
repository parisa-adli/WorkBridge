# WorkBridge: Design Direction

Status: **agreed** by the project owner (2026-10-28), after review of the prototype. **Revised 2026-10-29** by the project owner: the visual layer follows shadcn/ui (§1, §9); layout and behavior are unchanged. Closes the Part D gate in `docs/upgrade-plan.md` (PRD R9).

This is the fixed target for the Tailwind 4 tokens (Phase 28), the design-system components (Phase 29) and the page re-skins (Part F). Anything not listed here is out of scope for F9.

## 1. Direction

**shadcn/ui, as shipped.** Colors, component styles, radius, focus rings and icons come from shadcn/ui's default theme and component source (new-york style, base color `neutral`, lucide icons). The earlier direction (slate base, one indigo accent) is replaced; it is in git history before this revision.

What stays is the page structure (PRD F9): routes, the sidebar + content layout, where each element sits on a page (tables, modals, menus, filters, forms), flow steps, actions and all behavior.

Rules that follow from it:

- Every existing UI element is replaced by its shadcn equivalent where one exists (§9). Use shadcn components and their variants as shipped. Change their classes only for RTL (logical classes) or accessibility, with a one-line comment saying why.
- Use shadcn's semantic tokens (§2) and no other colors.
- No old color or style is kept just to match a screenshot. A phase that changes the look reviews the screenshot diff and refreshes the baselines.
- Every layout uses logical properties (`ms-`, `pe-`, `start-`, `text-start`) so fa (RTL) and en (LTR) mirror without per-language styles.

## 2. Color tokens

shadcn's semantic variables: light values on `:root`, dark values under the existing `.dark-mode` class on `<html>` (shadcn's docs use `.dark`; `@custom-variant dark (&:where(.dark-mode, .dark-mode *))` stays). `@theme inline` maps each variable to a utility (`bg-background`, `text-muted-foreground`, `border-input`, ...), as shadcn generates it.

| Token | Use |
|---|---|
| `background` / `foreground` | page background, body text |
| `card` / `card-foreground` | cards, tables, modal |
| `popover` / `popover-foreground` | select lists, menus, popovers |
| `primary` / `primary-foreground` | default buttons, active nav, primary badge |
| `secondary` / `secondary-foreground` | secondary buttons and badges |
| `muted` / `muted-foreground` | muted fills, captions, placeholders |
| `accent` / `accent-foreground` | hover and selected items |
| `destructive` | danger buttons, field errors, rejected/closed |
| `border` / `input` / `ring` | dividers, control borders, focus ring |
| `chart-1`–`chart-5`, `sidebar-*` | charts and the shadcn Sidebar |

**Values:** shadcn's default theme for base color `neutral` (oklch), copied verbatim from the shadcn theming docs in Phase 39c. No color outside this set.

**Status:** shadcn has no success or warning token, so status badges use Badge variants and always carry their text:

| Status | Variant |
|---|---|
| open, accepted, verified | `default` |
| pending | `secondary` |
| rejected, closed | `destructive` |

**Contrast:** WCAG 2.2 AA stays the bar (§6). Phase 39c measures the token pairs in both themes and records them here. A shadcn pair that fails AA is the only allowed deviation from the stock values, recorded with its measurement.

### Migration from the Phase 28b tokens

- Phase 39c makes the Phase 28b tokens (`bg`, `surface`, `surface-muted`, `border-strong`, `text`, `text-muted`, `on-primary`, `primary-soft`, `success`, `warning`, `error`, `backdrop`, ...) aliases of the shadcn variables, so pages not yet re-skinned take the new palette.
- Re-skinned pages use only the shadcn token utilities.
- The aliases, the old `primary-*`/`secondary-*` scale and the `.btn`/`.badge`/`.textField__input` classes are deleted in Phase 42, once a grep finds no use of them.

## 3. Spacing

Tailwind 4's default spacing (`--spacing: 0.25rem`, so `p-4` = 16px). Inside components, padding and heights follow shadcn's component source (for example button `h-9 px-4 py-2`, input `h-9 px-3`). Page-level spacing keeps today's layout:

| Purpose | Value |
|---|---|
| Inside cards, modals, table cells | as in the shadcn component |
| Between fields in a form | `gap-5` (20px) |
| Between page sections | `gap-8` (32px) |
| Page gutter | `px-4` mobile, `px-8` from `lg` |
| Min touch target | 24 × 24px (WCAG 2.2 AA, 2.5.8); shadcn's 36px controls meet it |

## 4. Radius

shadcn's `--radius` (0.625rem) and the `--radius-sm/md/lg/xl` it derives in `@theme inline`. They replace the 6/10/16px tokens in Phase 39c. Components keep the radius shadcn gives them.

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

shadcn sets no font, so these fonts stay: Persian text needs Vazirmatn.

### Type scale

Text inside shadcn components keeps shadcn's sizes and weights. The scale below is for page text (headings, body, stats). Persian needs taller lines than Latin; the line heights below suit both.

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
- Focus: every interactive element shows shadcn's focus ring on `:focus-visible` (`ring-ring/50`, 3px, plus `border-ring` on controls). It replaces the global 2px outline in Phase 39c and must stay visible in both themes.
- Keyboard: modals trap focus, close on Escape and return focus to their trigger; menus and the mobile drawer open, move and close by keyboard.
- Forms: every field has a visible `<label>`; errors are linked with `aria-describedby` and announced.
- Status is never color-only: badges always carry text.
- Motion: transitions respect `prefers-reduced-motion`.
- Checked by an axe run per page in CI (Phase 42) and on the reference page (Phase 29).

## 7. F9 page list and re-skin order

From PRD F9. Every page is redesigned on the shadcn components (§9) with its current layout, in fa/en × light/dark, responsive from 360px, with loading, empty and error states for each list.

| Order | Phase | Page | Route(s) |
|---|---|---|---|
| 0 | 29 | 404 and not-access (reference page) | `*`, `/not-access` |
| 1 | 39 | Home | `/` |
| 2 | 39 | Auth (OTP tab and demo login tab) | `/auth` |
| 3 | 39 | Complete profile | `/complete-profile` |
| 4 | 40 | App layout: sidebar (drawer on mobile) and dashboard header | all role routes |
| 5 | 40 | Owner dashboard | `/owner/dashboard` |
| 6 | 40 | Freelancer dashboard | `/freelancer/dashboard` |
| 7 | 40 | Admin dashboard | `/admin/dashboard` |
| 8 | 41a | Owner projects table | `/owner/projects` |
| 9 | 41b | Project detail with its proposals table | `/owner/projects/:id` |
| 10 | 41a | Projects list (freelancer and admin) | `/freelancer/projects`, `/admin/projects` |
| 11 | 41a | Proposals table (freelancer and admin) | `/freelancer/proposals`, `/admin/proposals` |
| 12 | 41a | Admin users | `/admin/users` |
| 13 | 41b | Profile (built in Phase 34, F3) | added in Phase 34 |
| 14 | 41b | Admin user profile (built in Phase 36, F5) | added in Phase 36 |
| 15 | 41b | Admin categories (built in Phase 35, F4) | added in Phase 35 |

Pages 13–15 were created in Part E on the Phase 29 components; Phase 41b moves them onto shadcn and checks them against this document. Phase 42 adds screenshot tests for every row.

## 8. Agreement

- [x] Direction, tokens, fonts, page list and accessibility target agreed by the project owner.
- [x] Revised direction (shadcn/ui look, §1, §2, §9) set by the project owner, 2026-10-29.

## 9. Components and reference page

Phase 29 built the components in `client/src/ui/`: `Button` (and `buttonClass` for links), `Input`, `Select`, `Textarea` (all three through `Field`: visible label, `aria-describedby` error), `Badge`, `Table`, `Pagination`, `Modal` (focus trap, Escape, focus back to the trigger), `Card`, `EmptyState` and `Skeleton`. `pages/NotFound.tsx` and `pages/NotAccess.tsx` are the reference re-skin for Part F; `e2e/reference-pages.spec.js` runs axe on them in fa/en × light/dark.

The standalone prototype that this direction was agreed on (`client/prototype/design.html`) was deleted in Phase 29; it is in git history before that commit.

### shadcn/ui (Phase 39a, revised)

Decision (2026-10-29): from Part F the components are shadcn/ui (copied source on Radix primitives, `cva`, `cn`) with lucide icons. `client/components.json` configures the CLI (`@/` alias; new primitives land in `src/components/ui/`, and the `src/ui/` components wrap them with their current props).

The first version of this decision kept the indigo design exactly. Phase 39a was built that way: shadcn's variables point at the Phase 28b tokens, Modal is on Dialog, Toggle on Switch, `@headlessui/react` removed, Select a native `<select>`.

The same day the project owner revised it: the look follows shadcn as shipped (§1), and every UI element moves to its shadcn equivalent:

| Today | shadcn | Phase |
|---|---|---|
| `react-icons` | lucide-react | 39b |
| Theme tokens, radius, focus ring | shadcn default theme (`neutral`) | 39c |
| Button, Input, Textarea, Badge, Card, Table, Skeleton, Modal (Dialog), Toggle (Switch), Field's label (Label) | stock shadcn source and classes | 39c |
| `Select`, `RHFSelect`, `StatusSelect`, `FilterDropDown` (native `<select>`) | Select, wired to React Hook Form through `Controller` | 39d |
| `RadioInput`, `RadioInputGroup` | RadioGroup | 39d |
| `Filter` (button row) | ToggleGroup | 39d |
| `Textfield` | Input | 39d |
| `DatePickerField` (react-multi-date-picker, Jalali) | Calendar + Popover, if react-day-picker's Persian calendar keeps Jalali input; else restyled with the tokens, reason recorded here | 39d |
| Tag input (react-tag-input-component) | no shadcn equivalent: restyled with Input and Badge styles | 39d |
| `ConfirmDelete` | AlertDialog | 39e |
| `Pagination` | Pagination | 39e |
| `Loading` (react-loader-spinner) | Spinner | 39e |
| `react-hot-toast` | Sonner | 39e |
| `Empty`, `EmptyState` | Empty | 39e |
| `UserAvatar` | Avatar (initials fallback) | 39e |
| Auth OTP/demo switch | Tabs | 39 |
| OTP field (react-otp-input) | InputOTP | 39 |
| `Sidebar` and its mobile drawer | Sidebar (Sheet below `lg`) | 40 |
| `HeaderMenu`; dark-mode and language toggles | DropdownMenu; ghost icon Button | 40 |
| `Stat` | Card | 40 |
| Tables on mobile | Table, one mobile approach | 41a |

A replaced library is uninstalled in the phase that replaces it.
