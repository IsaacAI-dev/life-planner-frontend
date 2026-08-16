/** Verbatim legal copy from the Aurora handoff. Treated as final text, not placeholder. */

export const TERMS = {
  title: 'Terms & Conditions',
  updated: 'Last updated 2 August 2026 · These terms replace all previous versions.',
  intro:
    "These are the rules for using Life Planner. We've written them in plain English because terms nobody reads protect nobody. If something here is unclear, email hello@lifeplanner.co and we'll explain it properly.",
  sections: [
    {
      h: '1. Who we are',
      p: 'Life Planner is operated by Life Planner Ltd, a company registered in England and Wales (company number 14829301), whose registered office is 14 Wharf Lane, Bristol BS1 4RN. Where these terms say "we", "us" or "our", they mean that company. Where they say "you", they mean the person or organisation holding the account.',
    },
    {
      h: '2. Your account',
      p: [
        'You need an account to use Life Planner, and you must be at least 16 years old to create one. You are responsible for keeping access to your sign-in method secure — we authenticate with Google and one-time email codes, so losing control of that email account means losing control of your plan.',
        'One account is one person. You may share boards with as many people as your plan allows, but you may not share a single set of credentials between multiple people. If we see credential sharing we\'ll email you before doing anything about it.',
      ],
    },
    {
      h: '3. Free and paid plans',
      p: [
        'The Free plan is genuinely free and has no time limit. We may change what it includes in future, but we will never remove access to data you have already created — if a feature moves to Plus, your existing content stays readable and exportable on Free.',
        "Plus is billed in advance, either monthly or as a three-month term. Prices are shown inclusive of applicable tax where we are required to collect it. We will give you at least 30 days' notice by email before any price increase affects your renewals, and you can cancel before it takes effect.",
      ],
    },
    {
      h: '4. Cancelling and refunds',
      p: 'You can cancel Plus at any time from Settings. Cancellation stops the next renewal; it does not end the term you have already paid for, and you keep Plus features until that term expires. If you cancel within 14 days of a first purchase or an upgrade, email us and we will refund it in full, no questions. Outside that window we refund at our discretion, and we are generous about it when something on our side went wrong.',
    },
    {
      h: '5. Your content',
      p: [
        'Everything you put into Life Planner — goals, milestones, tasks, notes, chat messages, uploaded images — remains yours. You grant us only the licence we need to operate the service: to store your content, display it back to you, sync it across your devices, back it up, and show it to the people you have explicitly shared a board with.',
        'We do not use your content to train machine-learning models, we do not sell it, and we do not show it to advertisers. Support staff access individual accounts only when you ask us to look at something, or in the rare case of investigating abuse, and every such access is logged.',
      ],
    },
    {
      h: '6. Shared boards and other people',
      p: "When you share a board, the people you invite can see everything on that board and any chat attached to it. You can revoke access at any time from the board's settings; revocation is immediate for future access, but we cannot un-see or retrieve anything a person read or copied while they had access. Please share thoughtfully, particularly with health, financial or family information.",
    },
    {
      h: '7. Acceptable use',
      p: "Don't use Life Planner to harass anyone, to store or distribute illegal material, to attempt to breach our security or another user's account, to resell access, or to scrape the service at a scale that degrades it for other people. We may suspend an account that does any of these, and for anything serious we will do so without notice.",
    },
    {
      h: '8. Not medical, legal or financial advice',
      p: 'Life Planner includes nutrition, budget and habit features. These are organisational tools, not professional advice. Nothing the product shows you is a diagnosis, a treatment plan, a financial recommendation or a legal opinion, and you should not treat it as one. Coaches using Life Planner with clients are solely responsible for the advice they give.',
    },
    {
      h: '9. Availability and changes',
      p: 'We aim for high availability but we do not promise the service will be uninterrupted or error-free. We may change, add or remove features as the product develops. If we ever discontinue Life Planner entirely, we will give at least 90 days\' notice and keep export working for the whole of that period.',
    },
    {
      h: '10. Liability',
      p: 'To the extent permitted by law, our total liability to you for any claim relating to the service is limited to the amount you paid us in the twelve months before the claim arose. Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be limited.',
    },
    {
      h: '11. Ending the agreement',
      p: 'You may delete your account at any time from Settings; deletion removes your content from live systems immediately and from backups within 30 days. We may terminate an account for a serious or repeated breach of these terms, and where we do we will tell you why and give you a reasonable opportunity to export your data first.',
    },
    {
      h: '12. Governing law',
      p: 'These terms are governed by the law of England and Wales, and the courts of England and Wales have exclusive jurisdiction. If you are a consumer resident elsewhere in the UK or the EU, this does not deprive you of the protection of the mandatory consumer law of your home country.',
    },
  ],
};

export const PRIVACY = {
  title: 'Privacy Policy',
  updated: 'Last updated 2 August 2026 · Data controller: Life Planner Ltd, Bristol, UK',
  intro:
    'Life Planner holds a detailed picture of how somebody spends their time, and sometimes what they eat, what they earn and who they answer to. We take that seriously. This policy explains exactly what we collect, why, and what you can do about it.',
  sections: [
    {
      h: '1. What we collect',
      p: [
        { strong: 'Account data.', rest: 'Your email address, display name, optional avatar, and the sign-in method you chose. If you sign in with Google we receive your email, name and profile picture — nothing else, and we never gain access to your Google account itself.' },
        { strong: 'Content you create.', rest: 'Goals, milestones, habits, activities, tasks, calendar entries, notes, chat messages, board memberships and any images you upload.' },
        { strong: 'Billing data.', rest: 'If you subscribe to Plus, our payment processor handles your card. We store only the last four digits, card brand, billing country and invoice history. We never see or store the full card number.' },
        { strong: 'Technical data.', rest: 'IP address, browser and device type, and timestamped records of sign-ins and errors. We keep these for 90 days for security and debugging, then delete them.' },
      ],
    },
    {
      h: '2. Why we process it',
      p: 'To provide the service you asked for (performance of a contract); to keep accounts secure and prevent abuse (legitimate interest); to meet accounting and tax obligations (legal obligation); and, only if you opt in, to send you product news (consent, withdrawable in one click from any email).',
    },
    {
      h: '3. What we never do',
      p: "We do not sell personal data. We do not share it with advertisers or data brokers. We do not run third-party advertising or tracking pixels on the app. We do not use the content of your plans, notes or chats to train machine-learning models — not ours, and not anyone else's.",
    },
    {
      h: '4. Who we share it with',
      p: 'Only the processors we need to run the product: a cloud hosting provider in the EU and UK, a payment processor, a transactional email provider, and a privacy-respecting analytics tool that records page views without cookies or cross-site identifiers. Each is bound by a data processing agreement. And, of course, the people you have chosen to share a board with — that sharing is entirely under your control.',
    },
    {
      h: '5. Cookies',
      p: "We set one essential cookie to keep you signed in and store a small amount of local preference data — your theme, your zoom level, your last open tab — in your browser. That's it. No advertising cookies, no consent banner, because there's nothing to consent to.",
    },
    {
      h: '6. Where your data lives',
      p: 'Primary storage is in Ireland, with encrypted backups in the United Kingdom. Data is encrypted in transit with TLS and at rest. Where a processor operates outside the UK or EEA, transfers rely on the UK International Data Transfer Addendum and the EU Standard Contractual Clauses.',
    },
    {
      h: '7. How long we keep it',
      p: 'Content stays until you delete it or close your account. Deleting your account removes content from live systems immediately and from encrypted backups within 30 days. Invoices are kept for seven years because tax law requires it. Security logs are kept for 90 days.',
    },
    {
      h: '8. Your rights',
      p: "You can access, correct, export, restrict or delete your data, and object to processing based on legitimate interest. Export and delete are self-service in Settings and work immediately. For anything else, email privacy@lifeplanner.co — we respond within 30 days, usually far sooner. If you're unhappy with our answer you can complain to the UK Information Commissioner's Office or your local supervisory authority.",
    },
    {
      h: '9. Children',
      p: 'Life Planner is not intended for anyone under 16. If we learn that we hold data about a child under 16 without appropriate consent, we delete it.',
    },
    {
      h: '10. Changes to this policy',
      p: 'If we make a material change we will email every account holder at least 14 days before it takes effect, and keep the previous version available for comparison. Minor clarifications are published here with an updated date.',
    },
  ],
};
