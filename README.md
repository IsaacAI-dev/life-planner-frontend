# Life Planner — Web

The user-facing frontend for Life Planner. Next.js App Router, React 19,
TypeScript, Tailwind v4 and Framer Motion, talking to the existing `user-api`
(`/api/v1`) over REST and Socket.IO.

Frontend only — no backend code, no mock server. Every screen calls the real API.

---

## Quick start

```bash
# Node 20.9+ required (Next 16)
npm install
cp .env.example .env.local     # point at your running user-api
npm run dev                    # http://localhost:3000
```

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

Sign in with the seeded demo account: `demo@lifeplanner.local` / `demo12345`.

| Script | Does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

All three checks pass on this codebase, and `npm audit` reports zero
vulnerabilities.

---

## Screens

| Route | Screen |
| --- | --- |
| `/sign-in`, `/sign-up` | Auth, with the marketing panel from the mockups |
| `/forgot-password`, `/reset-password` | Password recovery |
| `/today` | Greeting, up-next card, timeline, day note, coach panel |
| `/calendar` | Week and month grids, with a read-only imported-event overlay |
| `/flexible` | Non-dated tasks with progress logging |
| `/recurring` | Repeating templates (RRULE) |
| `/goals` | Goals with milestone chips and a featured hero |
| `/insights` | Stat tiles, time by life area, daily chart, coach insight |
| `/chats` | Conversation list, thread, voice notes, locked/read-only states |
| `/shared-boards` | Grants given and received |
| `/shared-boards/[userId]` | Read-only view of someone else's board |
| `/nutrition` | Multi-category food picker, meal plan, country switch |
| `/`, `/about`, `/careers`, `/terms`, `/privacy` | Marketing site — Aurora design, pinned dark, public |
| `/budget` | Two-sided ledger: income rows with status, expenses, totals |
| `/plan` | Plan, billing, seat selection |
| `/plan/seats` | Manage seats on a family plan |
| `/plan/transactions` | Receipts |
| `/welcome` | Public landing page |
| `/seat-invites/[token]` | Public — accept a seat invitation |
| `/security/[token]` | Public — "this wasn't me" |
| `/welcome` | Redirects to `/` — kept so old links resolve |
| `/profile` | Stats, preferences, account, edit dialog |
| `/settings` | Theme, text size, notifications, calendar feed |

---

## Layout

```
src/
├── app/
│   ├── (auth)/        sign-in, sign-up, forgot/reset password
│   ├── (app)/         the fifteen signed-in screens
│   ├── layout.tsx     fonts and the provider stack
│   └── globals.css    design tokens
├── components/
│   ├── ui/            Button, Card, Dialog, Input, Chip, Progress, Avatar…
│   ├── layout/        Sidebar, Header, MobileNav, MobileDrawer, AppShell
│   └── <feature>/     activities, goals, chat, budget, boards, plan, profile
├── lib/
│   ├── api/           one module per domain, over a shared fetch client
│   ├── hooks/         useChatSocket, useLocalStorage
│   ├── providers/     Auth, Theme, Plan, Toast, Query
│   ├── types.ts       every API shape
│   ├── constants.ts   tokens shared with the backend
│   └── format.ts      dates, durations, money
└── middleware.ts      cookie-based route guard
```

---

## Notes for review

**Design tokens are transcribed, not approximated.** `globals.css` carries the
exact CSS variables from `Life_Planner_Web_dc.html` — both themes, every surface,
line and ink value, and the accent gradient. Components reference tokens
(`bg-surface-2`, `text-muted`) rather than raw hex, so the light theme needs no
component-level variants. The `--ui-scale` variable drives the text-size control
by scaling the root font size, which is why spacing is written in `rem`-based
Tailwind units throughout.

**Icons are `lucide-react`, not Material Symbols.** The mockups use an icon font;
this uses a tree-shakeable component library with close visual equivalents. It
avoids a render-blocking font request for what amounts to fifteen glyphs.

**Auth.** Access and refresh tokens live in `localStorage`. `middleware.ts`
redirects on a non-sensitive `lp_auth=1` cookie so signed-out visitors never see
the app shell flash — the API remains the real authority, and a stale cookie
costs one 401. `client.ts` refreshes once on a 401 and retries, with concurrent
401s sharing a single refresh via `refreshInFlight`.

**Chat.** Messages are sent over REST and received over Socket.IO. The POST
response is deliberately not appended to the list — the socket broadcast is the
single source, which is what prevents the double-render the backend README warns
about.

**Responses are unwrapped in one place.** The API nests each resource under a
name (`data.activity`, `data.tokens`, `data.items`). `request()` takes an
`unwrap` key so no call site repeats that detail, and `extract()` falls back to
the sole property when a key differs — a naming mismatch degrades to a working
call rather than `undefined`. See `API_COVERAGE.md` §1 for the full table and
for the list endpoints whose key is inferred rather than confirmed.

**Plan gating reads one endpoint.** `GET /subscription` returns limits and usage
together, so a quota renders without a second call. `PlanProvider` is the only
component that knows what a tier permits. A blocked call returns 402 with
`details.upgradeRequired`, surfaced as `ApiError.upgradeRequired`.

**Support is never paywalled.** Free and expired users keep the Support thread,
so the chat page defaults to the first unlocked conversation rather than showing
a wall.

**`useSyncExternalStore` for stored preferences.** Theme, text size and the plan
preview read `localStorage` through `useLocalStorage`, whose server snapshot is
always the fallback. This keeps SSR output matching the first client render and
avoids `setState`-in-effect, which React 19's lint rules reject. It is a less
familiar idiom than `useState` + `useEffect`, so it is called out here.

**Seats grant entitlement, never ownership.** Nothing becomes co-owned on a
family plan. `BoardShare` remains the only way anyone sees anyone else's data,
at the beneficiary's own initiative. No screen treats another person's data as
shared by default.

---

## Responsive behaviour

Built mobile-first, verified from 320 px up.

- Sidebar becomes a five-item bottom tab bar plus a slide-in drawer holding the
  full navigation, plan badge and sign-out.
- Dialogs become bottom sheets, rounded on the top edge only.
- The header search collapses to an icon; "New activity" keeps its icon and
  drops its label.
- The week grid scrolls horizontally at a sensible minimum width rather than
  compressing seven columns into a phone.
- Two-column layouts (Today, Insights, Nutrition, Budget, Chats) stack.
- Content is padded past the tab bar, including `env(safe-area-inset-bottom)`.

Keyboard focus is visible throughout, dialogs close on `Escape` and trap scroll,
icon-only controls carry `aria-label`, and `prefers-reduced-motion` is respected
globally.

---

## Marketing site

`/`, `/about`, `/careers`, `/terms` and `/privacy` are the public marketing
pages, rebuilt from the Aurora design handoff. Copy is verbatim from that
handoff — `src/lib/marketing/content.ts` and `legal.ts` — not paraphrased, and
not fetched from `/public/content` (that endpoint is still valid; the marketing
pages just don't use it, since the handoff copy is the source of truth per its
own fidelity note).

**Pricing is one dynamic piece**, and diverges from the mock on purpose: the
mock only shows a solo Free/Plus pair. A seat picker (`Just me / Two of us /
Three of us`) sits above the cards and swaps in that tier's live price from
`GET /public/plans` — `perSeatAmount` and `savingPercent` come from the API,
never computed client-side.

**Seven more endpoints are proposed and already wired.** Marketing images,
FAQs, contact details, careers roles, app store badges, the sign-up consent
checkbox copy, and the contact form's actual submission — none of these exist
on the backend yet. Each is specified with payload and response in
[`MARKETING_ENDPOINTS.md`](./MARKETING_ENDPOINTS.md), and the frontend is
already calling all seven: gracefully falling back to the handoff's static
copy where that's honest (FAQs, contact details, images), and showing a real
empty or error state where a fallback would be misleading (careers roles,
which never show fake job listings; the contact form, which never fakes a
sent confirmation).

**No photography ships with this build.** The handoff is explicit that images
are out of scope — every photo, screenshot and portrait is a labelled
`ImageSlot` placeholder (`src/components/marketing/ImageSlot.tsx`) saying what
belongs there. Before this goes live, five spots need real assets: the hero
product shot, five "screens" carousel images, two "plan bends" photos, five
testimonial portraits, and the About page's hero photo plus four team
portraits.

**The marketing scope is pinned dark** via the `.lp` class in `globals.css`,
independent of the signed-in app's theme — the Aurora design has no light
variant, so a visitor's OS preference or a signed-in user's own theme choice
never changes these pages.

## Form validation

Every auth page (sign-in, sign-up, forgot/reset password) and the contact
form validate client-side before a request goes out — empty fields, malformed
email, short passwords — with inline errors under the offending field rather
than a generic toast. `src/lib/validation.ts` holds the checks;
`Field`/`Input` in `src/components/ui/Input.tsx` render the error state and an
`invalid` border. The backend's own validation error is still shown as a
toast, but it should now be the exception rather than the primary feedback
mechanism a person sees.

Sign-up also has a required "I agree to the Terms & Conditions and Privacy
Policy" checkbox (`src/components/ui/Checkbox.tsx`) — previously missing
entirely. Its label pulls a short summary from the proposed
`GET /public/legal/consent` (falling back to generic copy), and links to the
existing static `/terms` and `/privacy` pages for the full text.

## Coverage

147 of 150 user-facing endpoints are wired. The three exceptions are deliberate:
the deprecated `GET /budget/:y/:m/summary`, and the two unscoped expense routes
(`PATCH`/`DELETE /budget/expenses/:id`) superseded by their month-scoped forms.

[`API_COVERAGE.md`](./API_COVERAGE.md) is a register of what is still open:
missing endpoints, inconsistencies, and every response shape that has not been
confirmed against a running backend. If a screen renders blank, look there
first. Every response shape and every request body is confirmed against a live backend
rather than inferred — see `API_COVERAGE_VERIFIED.md` and `API_ANSWERS_ROUND3.md`.
The client itself still has not been run against it.

Chart rendering is hand-rolled SVG and CSS rather than a charting library — the
two charts in the mockups are a stacked bar and a progress ring, neither of which
justifies the bundle cost.
