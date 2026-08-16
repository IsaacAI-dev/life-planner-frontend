# API — open issues

Only what is missing, wrong, or unverified. Everything else is wired and its
shape is confirmed by a collection assertion or a live capture
(`API_COVERAGE_VERIFIED.md`, `API_ANSWERS_ROUND3.md`, `API_ANSWERS_ROUND4.md`).

Round 4 is applied. `/public/plans` is now consumed region-aware, with the seat
tiers visible before signup, and the landing page and signed-in plan page render
through **one shared card component** — so a price quoted to a visitor cannot
drift from the price they are charged.

**There are no unverified response shapes and no guessed request bodies.** One
new issue surfaced while validating this round.

---

## 1. New: the Postman collection is stale for one route

The collection still lists:

```
GET {{userBase}}/seat-invites/{{inviteToken}}
```

Round 3 established by live capture that this path **does not exist** — it
returns a 404 whose body is the generic "No route matches…". The working route
is singular and under `/public`:

```
GET /api/v1/public/seat-invite/:token
```

The client uses the live-verified path. The collection entry should be updated or
removed.

**Why this matters more than one stale URL.** Both of the previous two rounds
concluded that the collection is the contract protecting request bodies — the one
class of error that response verification cannot catch, and the class where all
three real breakages occurred. This is a demonstration that the collection can
drift from the implementation without anything failing. If it can be stale on a
path, it can be stale on a body, and a stale body is the failure mode that
reaches production silently.

Worth considering whether the collection can be generated from the route table
rather than maintained alongside it.

---

## 2. Standing risk: request bodies

Three rounds have verified **responses**. Request bodies have only ever been
checked by diffing against the collection, and every genuine breakage has been
one:

| Round | Broken body | Effect |
| --- | --- | --- |
| 2 | `POST /activities/bulk` — `until` vs `rangeStart`/`rangeEnd` | "Repeat until" silently failed |
| 2 | `PATCH /recurring/:id` — `isActive` vs `active` | Every Repeating toggle failed |
| 3 | `POST …/recommendations/:id/respond` — `DECLINE` vs `DISMISS` | "No thanks" failed on every recommendation |

Nothing is outstanding: every body the client sends has a documented counterpart.
Typechecking caught none of the three, because in each case the type was wrong in
the same way the request was.

Useful note from round 4: the API names the valid set in its rejection
(`Expected 'ACCEPT' | 'DISMISS', received 'DECLINE'`), so reading the 400 body
rather than the status is the fastest route to the answer.

---

## 3. Deliberately not wired

| Endpoint | Why |
| --- | --- |
| `GET /budget/:y/:m/summary` | Deprecated; `/ledger` supersedes it |
| `PATCH /budget/expenses/:id` | Superseded by the month-scoped form |
| `DELETE /budget/expenses/:id` | Superseded by the month-scoped form |
| `GET /seat-invites/:token` | Stale collection entry; the route does not exist (§1) |
| `POST /subscription/verify-purchase` | Wired but uncalled — no store receipt on web |
| `GET /subscription/plans?platform=IOS` | Same: ready for a native wrapper |

`POST /calendar-connections` with `provider: GOOGLE` remains a deliberate 501, so
settings offers only ICS. `GET /budget/:y/:m` still 404s on an untouched month
while `/ledger` returns `200` with `started: false`; the client uses `/ledger`
everywhere.

Coverage: **146 of 150**, the four exceptions being the three deprecated budget
routes and the stale seat-invite entry.

---

## 4. One caching note for whoever deploys the landing page

`/public/plans` is unauthenticated and cacheable, and now returns a **different
body per visitor region**. The cache must vary on `cf-ipcountry` (or whichever
edge header the platform sets) **and** the `country` query parameter.

Without that, the first visitor's currency is served to everyone behind the same
cache key — a Lagos visitor could be quoted USD, or worse, a US visitor quoted
NGN and then charged in their own currency at checkout. The client cannot prevent
this; it is a CDN configuration.

---

## 5. What is left to prove

The client has never run against the backend. That is the only remaining gap, and
it is now purely about whether each screen consumes a known shape correctly.

In order of what would catch the most:

1. **Plan page on a seat-holder account** — `source`, `seat.providerName` and the
   null billing fields together. The one place a wrong read shows someone a
   Manage-billing button for a subscription they do not own.
2. **Landing page pricing** — new this round. Check the seat selector renders
   from `maxSeats`, that `resolvedFrom: EDGE` offers a country picker rather than
   asserting a currency, and that picking one re-queries as `QUERY`.
3. **Insights** — category stats became counts rather than durations, and mood
   became a sparse series. Both charts were rewritten; neither has rendered
   against real data.
4. **A seat-invite link** — the corrected URL and flat body.
5. **Start and stop a timer** — driven by `running` and the aggregates.

Everything else is confirmed by assertion or live capture.
