# Marketing site — endpoints needed

Seven endpoints the marketing pages (`/`, `/about`, `/careers`, `/terms`,
`/privacy`) and the sign-up flow need from the backend. None of these exist
yet — the frontend is already wired to call them and degrades gracefully
where a static fallback is honest, and shows a real empty/error state where
it isn't (careers roles, contact submission).

All are unauthenticated (`public: true` on the client) and live under
`/api/v1/public/`, alongside the existing `/public/content` and
`/public/plans`.

---

## Priority

If these need to be built in order:

1. **`POST /public/contact-submissions`** — right now the contact form either
   silently fails or (before this pass) faked a thank-you it hadn't earned.
   Nobody who emails through that form is currently reaching anyone.
2. **`GET /public/careers/roles`** — the careers page currently always shows
   "no open roles", which is wrong if roles exist and undersells the team.
3. **`GET /public/legal/consent`** — sign-up has a working checkbox now, but
   its label falls back to generic copy without this.
4. The rest (`marketing-assets`, `faqs`, `contact`, `app-links`) are
   presentation polish — the pages work without them, just with placeholder
   images and the handoff's static FAQ/contact copy.

---

## 1. `GET /public/marketing-assets`

Every image slot on the marketing site in one call. The handoff design ships
no photography — every slot is a labelled placeholder — so this is what
replaces those placeholders once real assets exist. Any field can be `null`;
a `null` slot keeps showing its placeholder rather than a broken image.

**Where it's used:** hero product shot, the five-image screens carousel, the
two "plan bends" photos, the five testimonial portraits, and (on `/about`)
the hero photo and four team portraits.

Response:

```jsonc
{
  "heroPreviewUrl": "https://cdn.lifeplanner.co/marketing/hero.png",
  "screens": [
    { "key": "today", "imageUrl": "https://cdn.lifeplanner.co/marketing/screens/today.png" },
    { "key": "calendar", "imageUrl": null },
    { "key": "goals", "imageUrl": null },
    { "key": "boards", "imageUrl": null },
    { "key": "chat", "imageUrl": null }
  ],
  "bendPrimaryUrl": null,
  "bendDetailUrl": null,
  "testimonialPortraits": [
    { "name": "Priya Raman", "imageUrl": null },
    { "name": "Daniel Okoro", "imageUrl": null },
    { "name": "Elin Sandberg", "imageUrl": null },
    { "name": "Marcus Hale", "imageUrl": null },
    { "name": "Yuki Tanaka", "imageUrl": null }
  ],
  "aboutHeroUrl": null,
  "teamPortraits": [
    { "name": "Ada Kwan", "imageUrl": null },
    { "name": "Marcus Oyelaran", "imageUrl": null },
    { "name": "Rina Halvorsen", "imageUrl": null },
    { "name": "Tomás Ferreira", "imageUrl": null }
  ]
}
```

**The `screens` and portrait `key`/`name` values are fixed** — the frontend
matches on them exactly, so please keep:

- `screens[].key`: `today`, `calendar`, `goals`, `boards`, `chat` (this order)
- `testimonialPortraits[].name`: the five names above, verbatim
- `teamPortraits[].name`: the four names above, verbatim

If portraits end up keyed by an id instead of a name once there's a real CMS
behind this, that's fine — tell us and we'll switch the match key on our end.

---

## 2. `GET /public/faqs`

The seven FAQ accordion entries, so they can be edited without a frontend
deploy.

Response:

```jsonc
{
  "faqs": [
    {
      "question": "Is the free plan actually free, or is it a trial?",
      "answer": "Actually free, with no time limit and no card required. …"
    }
  ]
}
```

**Fallback:** if this 404s or returns an empty list, the page shows the
handoff's own static FAQ copy. Safe to build this whenever — nothing breaks
in the meantime.

---

## 3. `GET /public/contact`

Contact details for the Contact section and the footer.

Response:

```jsonc
{
  "email": "hello@lifeplanner.co",
  "supportHours": "Mon–Fri, 09:00–18:00 GMT",
  "officeAddress": "Life Planner Ltd · 14 Wharf Lane · Bristol BS1 4RN"
}
```

`supportHours` and `officeAddress` are both nullable. **The office address
row is only rendered when `officeAddress` is present** — this is the field
from the original ask ("shown conditionally if it's available"), for
regions or setups with no address to publish.

**Fallback:** the handoff's static email/hours/address until this exists.

---

## 4. `GET /public/careers/roles`

The open-roles list on `/careers`. This is the one piece of that page that
is now genuinely live — no static fallback, because presenting stale or
invented job listings would be actively misleading in a way that placeholder
marketing copy isn't.

Response:

```jsonc
{
  "roles": [
    {
      "id": "role_engineer_senior",
      "title": "Senior product engineer",
      "department": "Engineering",
      "body": "TypeScript and Postgres, end to end. You'll own the calendar and flexible-task engine with one other engineer.",
      "location": "Remote in UK / EU",
      "employmentType": "Full time",
      "compensation": "£78–92k",
      "applyUrl": null
    }
  ]
}
```

`applyUrl` is nullable — when absent, the "Apply" button scrolls to the
Contact section on the home page instead (which is how the original design
mock's apply flow already works).

**Frontend behaviour, all three states matter:**
- Loading → three skeleton rows.
- `roles.length > 0` → the list, exactly as designed.
- `roles.length === 0` → a real "No open roles right now" empty state with a
  "Send us a note" CTA, not the role list with nothing in it.

The careers page headline ("Nine people. N open roles.") also reads its
count from this response, so an empty list correctly reads as "Openings when
they're right" rather than a leftover "Four open roles."

---

## 5. `GET /public/app-links`

Official App Store / Google Play badges and their destination URLs. These
are trademarked assets — Apple's and Google's actual badge artwork — which
is why they need to come from the backend rather than being recreated as
generic icons on the frontend.

Response:

```jsonc
{
  "appStore": {
    "url": "https://apps.apple.com/app/life-planner/id0000000000",
    "badgeImageUrl": "https://cdn.lifeplanner.co/badges/app-store-badge.svg"
  },
  "playStore": {
    "url": "https://play.google.com/store/apps/details?id=co.lifeplanner.app",
    "badgeImageUrl": "https://cdn.lifeplanner.co/badges/google-play-badge.svg"
  }
}
```

Either key can be `null` (e.g. before an Android build exists). **The whole
badge row is hidden if both are `null`** — currently that's the default
state, since neither native app exists yet, so nothing renders until this is
wired up. Placed in the footer, next to the social icons.

---

## 6. `GET /public/legal/consent`

Backs the sign-up "I agree to the Terms & Conditions" checkbox. This is
deliberately small — a one-line summary and a version, not the full legal
text, which stays on `/terms` and `/privacy` (those remain the verbatim,
hifi copy from the design handoff, served statically).

Response:

```jsonc
{
  "version": "2026-08-02",
  "updatedAt": "2026-08-02T00:00:00.000Z",
  "summary": "I agree to Life Planner's"
}
```

The frontend appends its own "Terms & Conditions" and "Privacy Policy" links
(to `/terms` and `/privacy`) after `summary`, so keep it as a lead-in
fragment rather than a full sentence with its own period — see how it's
consumed in `src/app/(auth)/sign-up/page.tsx` if the exact join is unclear.

**Fallback:** a plain "I agree to the" if this is unavailable — the checkbox
itself, and the requirement to check it before signing up, work either way.

**Worth deciding together:** should `/terms` and `/privacy` themselves
eventually move behind an endpoint too, so legal copy changes don't need a
frontend deploy? The frontend already has a matching shape ready
(`title`, `updated`, `intro`, `sections: [{h, p}]`) if so — currently unused,
since the handoff copy is marked final. Flagging it here rather than
building it speculatively.

---

## 7. `POST /public/contact-submissions`

The contact form doesn't go anywhere right now. This is the endpoint that
makes "Send message" real.

Payload:

```jsonc
{
  "name": "Ada Lovelace",
  "email": "ada@dusk.app",
  "topic": "Something is broken",
  "message": "The calendar is loading blank."
}
```

`topic` is one of the six fixed options in the dropdown: `Just saying
hello`, `Something is broken`, `Billing or my Plus plan`, `Coaching / team
accounts`, `A feature I wish existed`, `Press or partnerships`.

Response:

```jsonc
{ "id": "sub_8f2a1c", "receivedAt": "2026-08-12T14:03:00.000Z" }
```

**Frontend behaviour:** on success, the form swaps to the "Got it — thank
you." confirmation. On failure, it shows an inline message pointing at the
plain support email instead — it does not fake the thank-you state, since
that would tell someone their message arrived when it didn't.

Basic validation (name required, valid email, message required) already
happens client-side before this is ever called, so the payload reaching this
endpoint should already be well-formed — a 422/400 is still handled, just
shouldn't be the common case.

---

## Summary table

| # | Method | Path | Fallback if missing |
| --- | --- | --- | --- |
| 1 | GET | `/public/marketing-assets` | Placeholder image slots |
| 2 | GET | `/public/faqs` | Static handoff FAQ copy |
| 3 | GET | `/public/contact` | Static handoff contact details |
| 4 | GET | `/public/careers/roles` | None — real empty state, no fake data |
| 5 | GET | `/public/app-links` | Badge row hidden entirely |
| 6 | GET | `/public/legal/consent` | Generic "I agree to the" label |
| 7 | POST | `/public/contact-submissions` | None — form shows a real error, not a fake success |
