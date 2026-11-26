MDS.registerScenario({
  id: "harbour",
  name: "Harbour Systems",
  tagline: "Founder-led UK compliance software with sloppy commercials.",
  difficulty: "Standard",
  focus: "Pricing, professional services, R&D focus",
  pmBrief: "We closed on Harbour Systems last week. Founder-led, 60 staff, decent product, sloppy commercials. There's no finance person, just a part-time bookkeeper, so the numbers are yours. Tell me where the value is, then build me a 3-year plan that hits the targets without losing the founder or the customers.",
  profile: [
    ["What they sell", "Compliance and repairs software for UK housing associations: gas safety, damp and mould, repairs scheduling."],
    ["Customers", "200 housing associations. Average recurring spend about £18k a year. The 3 largest are 14% of recurring revenue."],
    ["People", "60 staff: R&D 20, professional services 16, support 10, sales and marketing 6, G&A 8."],
    ["History", "Founded in 2009 by Dave Pryce, who stays on as CEO. Acquired in November 2026."]
  ],
  kpis: [["Recurring share", "65%"], ["Gross retention", "91%"], ["Last price rise", "2022", 1], ["Avg new-deal discount", "22%", 1],
    ["Customers on legacy pricing", "35%", 1], ["PS billable utilisation", "58%", 1], ["Free-of-charge PS days", "18%", 1], ["How-to share of tickets", "40%"]],
  note: "Legacy-priced customers pay about 30% below list. PS day rate is £1,050. R&D effort: 45% legacy maintenance, 30% roadmap, 25% \"Harbour Mobile 2\". Customers tolerate rises up to about inflation (5%).",
  interviews: [
    ["Harbour Mobile 2 is the future of this company. Our customers would walk if we put prices up. They're housing associations, not banks.", "Dave Pryce, founder and CEO"],
    ["We give days away to keep customers sweet. Fixed-price projects overrun and nobody tracks it.", "Priya Shah, Head of Professional Services"],
    ["Half the tickets are people who don't know how to use a feature. Same questions every week.", "Tom Reid, Support Lead"],
    ["I need the discounts to close. Councils compare us with two cheaper competitors.", "Leanne Ford, Sales Director"],
    ["Mobile 2 has been 'three months away' for eighteen months. Most of us would rather fix the scheduling engine.", "Senior engineer, anonymous"],
    ["I do the books two days a week. Nobody's ever asked me for a forecast.", "Bookkeeper, part-time"]
  ],
  base: {
    recurring: 3600, customers: 200, churn: 0.09, other: 250, newBizList: 385, discount: 0.22,
    legacyShare: 0.35, legacyGap: 0.30,
    ps: { fte: 16, cost: 58, days: 210, util: 0.58, foc: 0.18, rate: 1.05, demandGrowth: 0.03 },
    support: { fte: 10, cost: 40, howto: 0.40 },
    rnd: { fte: 20, cost: 68, legacyFte: 9, roadmapFte: 6, petFte: 5, petName: "Harbour Mobile 2" },
    sm: 560, ga: 900, hosting: 460, royalties: 190, royaltiesAfter: 20, reportMigration: 120, infl: 0.03, otherFte: 14,
    sens: { upliftFree: 0.05, aiPriceRef: 3 }
  },
  people: { founder: 68, team: 64, cust: 72, founderLabel: "Founder" },
  targets: [{ type: "margin", min: 0.25 }, { type: "grrAll", min: 0.90 }, { type: "ai", min: 0.02 }, { type: "founder", min: 50 }],
  initiatives: [
    { id: "change", label: "Change control on fixed-price projects", pts: 1, fx: { psDemand: [0.03, 0.06, 0.06] }, people: { team: -2, cust: -2 },
      hint: "Scope changes become chargeable. Recovers overrun days as billable work." },
    { id: "am", label: "Account management for the top 30 customers", pts: 2, fx: { run: [90, 90, 90], churn: [0, -0.012, -0.018], newBiz: [0, 0.08, 0.1] }, people: { cust: 5 },
      hint: "1.5 FTE, £90k a year. Lowers churn and finds expansion from Year 2." },
    { id: "devc", label: "Move 4 R&D roles to the Valsoft dev centre", pts: 2, oneoff: [60, 0, 0], fx: { rndFte: [0, -1.6, -1.6] }, people: { founder: -6, team: -10 },
      hint: "About 40% cheaper per role from Year 2 after a £60k transition.", warn: "Knowledge transfer takes 6–9 months, and the remaining engineers will wonder if they're next. Say so before they ask." }
  ],
  finder: [
    { id: "A", text: "Maintenance pricing: no uplift since 2022", v: "good", fb: "Yes. 5% a year on £3.6m of recurring revenue is about £180k in Year 1, and it compounds. The classic founder-led quick win." },
    { id: "B", text: "Legacy customers paying about 30% below list", v: "good", fb: "Yes. Up to about £540k a year if everyone moves, but churn risk is real. Phase it and lead with value." },
    { id: "C", text: "PS utilisation at 58% and 18% free days", v: "good", fb: "Yes. But utilisation is a ratio: the gain comes from charging for days you give away and needing fewer consultants, not from demand doubling." },
    { id: "D", text: "Harbour Mobile 2 taking 25% of R&D", v: "good", fb: "Strong. 5 FTE (about £340k a year) to cut or redeploy, for example to AI. Costs founder trust, so handle it carefully." },
    { id: "E", text: "Move to a smaller office", v: "bad", fb: "Low value. Rent sits in G&A and might save £40–60k. It costs you credibility as a first move." },
    { id: "F", text: "Cut the sales team", v: "bad", fb: "Risky and small. Saves about £120k but stops new business. Discount discipline is the better sales lever." },
    { id: "G", text: "Hosting at about 8% of revenue", v: "mid", fb: "Real but secondary. A 20% optimisation saves about £90k. Worth doing, not top three." },
    { id: "H", text: "Reporting engine royalties", v: "mid", fb: "Real but secondary. About £170k a year from Year 2 after a £120k migration. A good Year 1 project, not a headline lever." },
    { id: "I", text: "Launch an AI tier straight away", v: "bad", fb: "Too early. No engineers on it and no validated use case. Free up capacity first, then build something customers will pay for." },
    { id: "J", text: "No change control on fixed-price projects", v: "mid", fb: "A real leak, and it's part of lever C. On its own, it's smaller than pricing or utilisation." }
  ],
  events: [
    { title: "The founder goes off script", text: "At Friday's all-hands, Dave tells staff: \"Whatever you hear, prices are not going up this year.\" You'd agreed a 5% uplift in principle on Tuesday.", options: [
      { t: "Correct the record before people leave: thank Dave, then say calmly that the uplift is agreed in principle and the details follow next week.", fx: { founder: -22, team: -6, cust: 0, delivery: 0 }, s: 0, fb: "You win the point and lose the founder. Even a polite public correction undermines him in his own company." },
      { t: "See Dave privately that afternoon. Use the churn and value data to agree how he announces a modest uplift himself.", fx: { founder: 6, team: 2, cust: 0, delivery: 6 }, s: 3, fb: "Best. He keeps face and owns the message. Founders resist changes they didn't author." },
      { t: "Email the Portfolio Manager tonight so they hear it from you first, and ask them to remind Dave what was agreed.", fx: { founder: -15, team: 0, cust: 0, delivery: 3 }, s: 1, fb: "Escalating before you've tried to resolve it yourself signals you can't influence without authority, which is the job." },
      { t: "Let the uplift slip to next year. Dave's goodwill matters more than one year's 5%, and you'll have stronger value data by then.", fx: { founder: 4, team: 0, cust: 2, delivery: -15 }, s: 0, fb: "You've just taught him that saying no in public works. The value case goes with it." }
    ]},
    { title: "Your biggest customer pushes back", text: "Northshore Homes (one of your three largest customers, about 5% of recurring revenue) gets its legacy price letter: +43% at renewal. Their Head of IT calls Dave directly, threatening to go out to tender.", options: [
      { t: "Hold firm on list price. Exempt your biggest account and every legacy customer will ask for the same, and the programme unravels.", fx: { founder: -8, team: 0, cust: -12, delivery: 2 }, s: 0, fb: "Consistent, but you're betting one of your largest accounts on a letter. Large accounts need a negotiated path." },
      { t: "Exempt Northshore quietly for this renewal and revisit next year, once the other legacy customers have moved and the precedent is set.", fx: { founder: 3, team: 0, cust: 4, delivery: -8 }, s: 1, fb: "Calm today, but exemptions don't stay quiet. Every other legacy customer now has a reason to call Dave too." },
      { t: "Meet them with Dave. Offer the rise phased over three years, linked to a value review and a roadmap item they want.", fx: { founder: 6, team: 0, cust: 6, delivery: 4 }, s: 3, fb: "Best. Phasing plus visible value keeps the account and the principle. Bring the founder, since the relationship is his." },
      { t: "Hold the price but have Sales offer 30% off their next module, so the headline rise stands and they still feel looked after.", fx: { founder: 0, team: -2, cust: 2, delivery: -6 }, s: 1, fb: "Moves the leak somewhere else. It undermines the discount governance you're introducing." }
    ]},
    { title: "Head of PS pushes back", text: "Priya says a 75% utilisation target will make her team quit. \"We're not lawyers billing in six-minute units.\"", options: [
      { t: "Keep the 75% target but add a quarterly bonus for consultants who hit it. Incentives shift behaviour faster than debate.", fx: { founder: 0, team: -15, cust: 0, delivery: 2 }, s: 0, fb: "Playbooks are a starting point. Imposed targets, even with a bonus attached, get gamed or quietly ignored." },
      { t: "Record time, write-offs and free days for one quarter first, then set the target with Priya using what the data shows.", fx: { founder: 2, team: 6, cust: 0, delivery: 6 }, s: 3, fb: "Best. You can't manage what nobody records. Targets she helps set stick, and the data usually makes the case for you." },
      { t: "Park utilisation for now and put your energy into pricing, where the founder is already on board and the gains come faster.", fx: { founder: 0, team: 3, cust: 0, delivery: -10 }, s: 0, fb: "PS is probably your biggest lever. Walking away at the first objection is expensive." },
      { t: "Bring in two experienced contractors for a quarter to show the team what good utilisation looks like in practice.", fx: { founder: -2, team: -10, cust: 0, delivery: -2 }, s: 0, fb: "Reads as a threat, and contractors don't fix scoping or free days." }
    ]},
    { title: "Quarter-end discount", text: "Leanne asks you to approve a 35% discount (your cap is 20%) on a £60k deal. She says it's \"now or never\" and the customer signs today.", options: [
      { t: "Decline, and tell Leanne that a cap which bends at quarter-end isn't a cap. Customers who say 'now or never' usually come back.", fx: { founder: -3, team: -6, cust: 0, delivery: 3 }, s: 1, fb: "Principled, but a governance process that only says no gets worked around." },
      { t: "Approve this one, and set up a deal desk from next month: anything above 20% needs the GM's sign-off and a written reason.", fx: { founder: 2, team: 3, cust: 0, delivery: 5 }, s: 3, fb: "Best. You keep the deal, earn credit with Sales and put governance in place with an owner. The aim is fewer exceptions, not zero." },
      { t: "Let it through without comment. It's one £60k deal, and fighting Sales at quarter-end costs more goodwill than it saves.", fx: { founder: 0, team: 0, cust: 0, delivery: -8 }, s: 0, fb: "Everyone learns the cap isn't real." },
      { t: "Approve it only if the customer gives something back, such as a three-year term or a public case study.", fx: { founder: 2, team: 2, cust: 0, delivery: 4 }, s: 2, fb: "Good instinct. Trade discount for value. Pair it with the approval process to get full marks." }
    ]},
    { title: "Support hears about AI", text: "Word gets out about the AI deflection pilot. Two of the best support agents start interviewing elsewhere.", options: [
      { t: "Hold a team meeting and reassure everyone that no support roles are affected, so you keep your best agents through the pilot.", fx: { founder: 0, team: 2, cust: 0, delivery: -6 }, s: 0, fb: "If it isn't true, it destroys trust the moment the pilot launches." },
      { t: "Explain the goal plainly, show how agents move into onboarding and account health, and get them training the assistant.", fx: { founder: 2, team: 8, cust: 3, delivery: 5 }, s: 3, fb: "Best. People resist what's done to them and back what they help build. Redeployment is a real offer here, since onboarding is the root cause anyway." },
      { t: "Pause the pilot for a quarter while things settle, then relaunch once the team has seen the wider plan.", fx: { founder: 0, team: 3, cust: 0, delivery: -8 }, s: 1, fb: "Buys calm and loses momentum on a stated portfolio objective." },
      { t: "Carry on with the pilot as planned. Some attrition is normal in a support change, and backfilling is cheaper than delay.", fx: { founder: 0, team: -12, cust: -4, delivery: 0 }, s: 0, fb: "Losing your best agents during a support change is how customer satisfaction drops." }
    ]},
    { title: "Behind plan at the first review", text: "Six months in, EBITDA is £80k behind your plan because the legacy price moves slipped. Your Portfolio Manager review is next week.", options: [
      { t: "Send a note this week: root cause, revised forecast, recovery actions with dates.", fx: { founder: 0, team: 0, cust: 0, delivery: 8 }, s: 3, fb: "Best. No surprises. Bad news early with a plan builds more trust than good news late." },
      { t: "Pull forward some spend cuts, such as the training budget, so the half-year number lands and the review stays on the plan.", fx: { founder: -3, team: -6, cust: 0, delivery: -4 }, s: 0, fb: "Hides the problem and creates a worse one. Reviewers spot one-off fixes." },
      { t: "Explain in the meeting that the founder's pushback on pricing caused the slip. It's true, and the PM should know where the risk sits.", fx: { founder: -15, team: 0, cust: 0, delivery: -2 }, s: 0, fb: "True or not, blaming the GM to their owner ends the working relationship. Own the gap and the recovery." },
      { t: "Reforecast the full three-year plan downwards before the review, so you go in with a realistic number, not a missed one.", fx: { founder: 0, team: 0, cust: 0, delivery: -6 }, s: 1, fb: "Transparent but defeatist. Explain the gap and how you'll recover it before you move the target." }
    ]}
  ],
  workshop: {
    title: "Pricing playbook kick-off",
    objective: "Agree the 2027 renewal uplift approach, the legacy pricing path and discount governance.",
    slot: 180, kind: "decide", preread: true,
    people: [
      { id: "dave", name: "Dave Pryce", role: "Founder and CEO", must: true, decider: true },
      { id: "leanne", name: "Leanne Ford", role: "Sales Director", must: true },
      { id: "priya", name: "Priya Shah", role: "Head of PS", must: false },
      { id: "tom", name: "Tom Reid", role: "Support Lead", must: false },
      { id: "book", name: "Bookkeeper", role: "Part-time finance", must: false },
      { id: "pm", name: "Portfolio Manager", role: "Your manager", must: false, intimidating: true },
      { id: "reps", name: "4 sales reps", role: "Sales team", must: false, count: 4 },
      { id: "eng", name: "Senior engineer", role: "R&D", must: false }
    ]
  }
});
