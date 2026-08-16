/**
 * Verbatim copy from the Aurora design handoff (Life_Planner_Landing_dc.html).
 * Marked hifi/final by the handoff doc — reproduced as written, not paraphrased.
 */

export const NAV_LINKS = [
  { label: 'Features', id: 'lp-features' },
  { label: 'How it works', id: 'lp-how' },
  { label: 'Screens', id: 'lp-screens' },
  { label: 'Pricing', id: 'lp-pricing' },
  { label: 'FAQ', id: 'lp-faq' },
] as const;

export const HERO = {
  pill: 'Shared boards are here — plan with a coach, a partner, or the whole house',
  pillBadge: 'New',
  h1: ['Your whole life,', 'on one calm page.'],
  sub: 'Goals, habits, tasks, calendar and the people you answer to — together, in one quiet place. Life Planner makes today obvious and keeps the year ahead feeling possible.',
  ctaPrimary: 'Start free — no card',
  ctaSecondary: 'See it in motion',
  trust: 'Free forever tier · Cancel Plus any time · Your data stays yours',
};

export const STATS = [
  { to: 12400, fmt: 'k', label: 'people planning weekly' },
  { to: 1800000, fmt: 'm', label: 'tasks completed' },
  { to: 94, fmt: 'n', suffix: '%', label: 'still going past week three' },
  { to: 49, fmt: 'rating', label: 'average rating' },
] as const;

export const FEATURES = [
  {
    icon: 'flag',
    title: 'Goals with milestones',
    body: 'Break the big thing into steps you can actually tick off. The progress bar fills itself in as milestones land — no fake percentages.',
  },
  {
    icon: 'local_fire_department',
    title: 'Habits that forgive',
    body: 'Daily, weekly, or "three times if I can". Streaks that celebrate the pattern instead of punishing one bad Tuesday.',
  },
  {
    icon: 'calendar_month',
    title: 'A calendar that plans back',
    body: 'See the week as blocks, drag things where they fit, and let Life Planner defend the hours you said mattered most.',
  },
  {
    icon: 'checklist',
    title: 'Flexible tasks',
    body: 'The things with no fixed hour. Log a little, reduce the rest, edit it inline, or clear it entirely when the day changes shape.',
  },
  {
    icon: 'forum',
    title: 'Coach chat, in context',
    body: "Message your coach or accountability partner right beside the plan you're both looking at. Unread counts so nothing gets lost.",
  },
  {
    icon: 'group',
    title: 'Shared boards',
    body: 'Share a board with a partner, a client or the household. Revoke access in one tap — no awkward conversation required.',
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: 'STEP 01',
    title: 'Say what actually matters',
    body: "Two or three goals, the habits you're keeping, the boards you share with someone. It takes one sitting and you never start from a blank page again.",
  },
  {
    step: 'STEP 02',
    title: 'Let the week lay itself out',
    body: 'Milestones and habits become real blocks on real days. Flexible tasks fill the gaps around them instead of nagging you from a sidebar.',
  },
  {
    step: 'STEP 03',
    title: 'Check in, adjust, keep going',
    body: "Open Today, tick what's done, reduce what isn't. Insights show you the shape of the month so the next Sunday takes five minutes, not fifteen.",
  },
] as const;

export const SHOTS = [
  { title: 'Today', blurb: "Everything happening now, and nothing that isn't.", placeholder: 'Screenshot — Today view' },
  { title: 'Calendar', blurb: 'The week as blocks you can move with a drag.', placeholder: 'Screenshot — Calendar / week view' },
  { title: 'Goals & milestones', blurb: 'Progress that fills itself in as milestones land.', placeholder: 'Screenshot — Goals with milestones' },
  { title: 'Shared boards', blurb: 'Plan with a coach, a partner, or the household.', placeholder: 'Screenshot — Shared boards' },
  { title: 'Coach chat', blurb: 'Conversation sitting right beside the plan.', placeholder: 'Screenshot — Coach chat' },
] as const;

export const BEND = {
  kicker: 'Built for real weeks',
  h2: 'The plan should bend before you do.',
  body: 'Life Planner assumes the week will go sideways. Reduce a task instead of failing it. Move a milestone without losing the goal. Miss a habit and keep the streak\u2019s shape. Nothing here is designed to make you feel behind.',
  checklist: [
    'Reduce, log or clear any flexible task inline',
    'Milestones move with the goal, progress recalculates',
    'Light and dark, and a zoom control for tired eyes',
  ],
};

export const QUOTES = [
  {
    text: "I've started and abandoned six planners. This is the first one that survived a bad month \u2014 because reducing a task felt like a decision, not a failure.",
    name: 'Priya Raman',
    role: 'Product manager, Manchester',
  },
  {
    text: 'I run twelve clients off shared boards. Being able to see their week and message them in the same place cut my admin roughly in half.',
    name: 'Daniel Okoro',
    role: 'Strength coach',
  },
  {
    text: 'My partner and I finally stopped having the same Sunday argument. The board just tells us who said they\u2019d do what.',
    name: 'Elin Sandberg',
    role: 'Architect, Gothenburg',
  },
  {
    text: "The milestones thing sounds small. It isn't. Watching a goal bar move because I actually finished a step is the only motivation that's ever worked on me.",
    name: 'Marcus Hale',
    role: 'PhD student',
  },
  {
    text: "It's the first productivity app I've used that doesn't feel like it's disappointed in me.",
    name: 'Yuki Tanaka',
    role: 'Illustrator, Toronto',
  },
] as const;

export const FREE_PLAN_FEATURES = [
  'Unlimited tasks, habits and activities',
  'Three goals with milestones',
  'Today, calendar and flexible tasks',
  'One shared board, view only',
  'Light and dark themes',
];

export const PLUS_PLAN_FEATURES = [
  'Everything in Free',
  'Unlimited goals and milestones',
  'Unlimited shared boards with access control',
  'Coach chat with unread tracking',
  'Nutrition and budget boards',
  'Insights and full streak history',
  'Support from an actual person',
];

export const FAQS = [
  {
    question: 'Is the free plan actually free, or is it a trial?',
    answer: "Actually free, with no time limit and no card required. You get unlimited tasks, habits and activities, three goals with milestones, the full Today and calendar views, and one shared board in view-only mode. Plenty of people never upgrade, and that's completely fine.",
  },
  {
    question: 'What happens to my data if I cancel Plus?',
    answer: 'Nothing is deleted. Your goals beyond the free limit become read-only rather than disappearing, extra shared boards stop accepting new members, and everything stays exportable. Resubscribe and it all unlocks exactly as you left it.',
  },
  {
    question: 'Can my coach see everything in my account?',
    answer: "No. Coaches only see the specific boards you share with them, plus any chat attached to those boards. Your other goals, budget, nutrition entries and private notes stay invisible. You can revoke a coach's access in one tap from the board settings.",
  },
  {
    question: 'Does it work on my phone?',
    answer: "Yes \u2014 Life Planner is a web app that adapts to phone, tablet and desktop, and you can add it to your home screen so it opens like a native app. Everything syncs the moment you're back online.",
  },
  {
    question: 'What if I miss a few days? Do I lose my streaks?',
    answer: 'Streaks keep their shape. A missed day shows as a gap rather than resetting you to zero, and weekly habits are judged over the week, not the day. We deliberately don\u2019t do the "you\u2019ve broken a 47-day streak" thing.',
  },
  {
    question: 'Can I import from another planner?',
    answer: "You can import tasks and events from any tool that exports CSV or an .ics calendar file, and we have direct importers for the three most-requested apps. If yours isn't supported, send us an export file and we'll usually build a converter within a week.",
  },
  {
    question: 'Do you train AI models on my plans?',
    answer: "No. Not our models, not anyone else's. Your goals, notes and chats are never used as training data, never sold, and never shown to advertisers. That's written into our terms, not just our marketing.",
  },
] as const;

export const CONTACT = {
  kicker: 'Contact us',
  h2: 'Talk to a human, usually within a day.',
  body: 'Bug reports, billing questions, "could it do this?" — all of it lands in the same inbox, and we read every one.',
  email: 'hello@lifeplanner.co',
  hours: 'Mon–Fri, 09:00–18:00 GMT',
  address: 'Life Planner Ltd · 14 Wharf Lane · Bristol BS1 4RN',
  topics: [
    'Just saying hello',
    'Something is broken',
    'Billing or my Plus plan',
    'Coaching / team accounts',
    'A feature I wish existed',
    'Press or partnerships',
  ],
};

export const CLOSING_CTA = {
  h2: 'Next Sunday could feel completely different.',
  body: 'Set it up once. Fifteen minutes. Then just open Today.',
  cta: 'Start free',
};

export const FOOTER = {
  tagline: 'A calmer way to run goals, habits, tasks and the people who keep you honest.',
  legalLine: '© 2026 Life Planner Ltd. Registered in England & Wales, no. 14829301.',
  madeIn: 'Made in Bristol, Lisbon and Toronto.',
  emails: ['hello@lifeplanner.co', 'privacy@lifeplanner.co'],
  address: ['14 Wharf Lane', 'Bristol BS1 4RN'],
};

/* ---- About ------------------------------------------------------ */

export const ABOUT = {
  kicker: 'About us',
  h1: 'We got tired of planning tools that made us feel behind.',
  intro:
    'Life Planner started in 2023 as a shared spreadsheet between four friends who kept abandoning the same apps. The pattern was always the same: a great first week, a guilty second month, and a graveyard of red overdue badges by spring.',
  beliefsHeading: 'What we believe',
  beliefsIntro:
    "A plan is a guess about the future, and guesses are supposed to change. Software that treats a missed task as a moral failure isn't helping you plan — it's just keeping score. So we built the opposite: a tool where reducing a task is a first-class action, where a broken streak keeps its shape, and where moving a milestone doesn't quietly delete the goal behind it.",
  beliefsSecondary:
    "We also believe planning is rarely solitary. A coach, a partner, a housemate, a physio — most of the plans that stick have somebody else in them. That's why shared boards and chat sit next to the plan itself rather than in a separate product with a separate bill.",
  beliefs: [
    { icon: 'favorite', title: 'Kind by default', body: 'No red overdue counters, no guilt streaks, no notifications designed to make you anxious.' },
    { icon: 'shield', title: 'Your data is yours', body: 'No ad networks, no data brokers, no training models on your private plans. Export everything, any time.' },
    { icon: 'bolt', title: 'Small on purpose', body: 'Nine people, no outside investors, funded entirely by Plus subscriptions. We answer to you.' },
  ],
  peopleHeading: 'The people',
  peopleIntro:
    "We're nine, spread across Bristol, Lisbon and Toronto, and we all use the thing every single day. If you email support, one of the faces below is the one replying.",
  team: [
    { name: 'Ada Kwan', role: 'Co-founder, product' },
    { name: 'Marcus Oyelaran', role: 'Co-founder, engineering' },
    { name: 'Rina Halvorsen', role: 'Design' },
    { name: 'Tomás Ferreira', role: 'Support' },
  ],
};

/* ---- Careers ------------------------------------------------------ */

export const CAREERS = {
  kicker: 'Careers',
  h1: 'Nine people. Four open roles.',
  intro:
    "We hire slowly and keep the team small. Everyone here talks to users, everyone ships, and nobody manages more than four people. If that sounds like relief rather than chaos, read on.",
  perks: [
    { icon: 'schedule', title: 'Your hours, written down', body: 'Four hours of overlap with Bristol, the rest is yours. No standups before 10am anywhere.' },
    { icon: 'groups', title: 'One week together, quarterly', body: 'We meet in one city for a week every quarter, plan the next one, then go home.' },
    { icon: 'payments', title: 'Pay bands, published', body: 'Every role lists its band below. Same band for the same work, wherever you live.' },
  ],
  rolesHeading: 'Open roles',
  rolesSub: 'Applications close when we make an offer, not on a date.',
  roles: [
    {
      title: 'Senior product engineer',
      tag: 'Engineering',
      body: "TypeScript and Postgres, end to end. You'll own the calendar and flexible-task engine with one other engineer.",
      meta: 'Remote in UK / EU · Full time · £78–92k',
    },
    {
      title: 'Product designer',
      tag: 'Design',
      body: 'Second designer on the team. Shared boards, coach chat and the parts of the app two people use at once.',
      meta: 'Remote in UK / EU · Full time · £70–84k',
    },
    {
      title: 'Support lead',
      tag: 'Support',
      body: "You'd be the second person in the inbox and the one who decides what the answers become in the product.",
      meta: 'Remote, Americas time zones · Full time · $72–86k',
    },
    {
      title: 'Coaching partnerships (6-month contract)',
      tag: 'Growth',
      body: 'Talk to coaches, physios and nutritionists using shared boards with clients, and work out what they need next.',
      meta: 'Remote · Contract, 3 days a week · £480/day',
    },
  ],
  hiringHeading: 'How hiring works',
  hiring: [
    { n: '01', title: 'A note, not a form', body: "Email us what you've made and why this role. No cover letter templates." },
    { n: '02', title: '45 minutes, two of us', body: 'A conversation about your work and ours. You get the last fifteen minutes.' },
    { n: '03', title: 'A paid day', body: 'One real problem from our backlog, paid at your day rate. No take-home marathons.' },
    { n: '04', title: 'Offer within a week', body: 'Decision inside five working days of the paid day, either way, with reasons.' },
  ],
  closing: {
    h2: "Nothing here fits, but you'd still like to work here?",
    body: "Tell us what you'd do in your first month. We read every one, and two of the nine started this way.",
    cta: 'Send us a note',
  },
};
