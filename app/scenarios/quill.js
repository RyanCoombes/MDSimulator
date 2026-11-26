MDS.registerScenario({
  id: "quill",
  name: "Quill Legal",
  tagline: "Loss-making UK legal software being combined with a Spanish sister company.",
  difficulty: "Very hard",
  focus: "Turnaround, integration of two acquisitions, AI revenue",
  pmBrief: "Quill is losing money, and we've just bought Lexia in Madrid to put alongside it. I want one combined plan: get Quill profitable, take the duplication out with Lexia, and give me a credible AI revenue line. Legal is where AI drafting is actually selling. Be careful: the founder already feels sidelined.",
  profile: [
    ["What they sell", "Practice management and document automation for small UK law firms (2–20 lawyers)."],
    ["Customers", "260 firms, average recurring spend about £5.8k a year. Low ticket, high volume."],
    ["People", "41 staff: PS 14, R&D 12, support 7, sales and marketing 4, G&A 4."],
    ["The deal", "Acquired 2025. Lexia (Madrid, e-billing for Spanish firms, 30 staff) was acquired in 2026. Both report into you for integration."]
  ],
  kpis: [["EBITDA margin", "−9%", 1], ["Recurring share", "57%"], ["PS share of revenue", "40%", 1], ["PS utilisation", "55%", 1],
    ["Free-of-charge days", "22%", 1], ["Gross retention", "89%", 1], ["Avg new-deal discount", "25%", 1], ["Customers on legacy pricing", "40%", 1]],
  note: "Implementations are sold fixed-price and overrun by 35% on average. Legacy customers pay about 25% below list. Lexia runs its own support desk and finance team. R&D: 5 FTE legacy, 4 roadmap, 3 on Graham's \"client portal\".",
  interviews: [
    ["Since Lexia arrived, I've gone from founder to footnote.", "Graham Holt, founder and CEO"],
    ["We run support for 400 firms with 5 people. Quill uses 7 for 260.", "Carmen Vidal, Lexia Managing Director"],
    ["Every data migration is a bespoke project. We quote fixed price and pray.", "Head of PS"],
    ["Firms ask about AI drafting every week. Two competitors charge £150 a user a month for it.", "Sales lead"],
    ["Our document engine costs us £120k a year in royalties.", "Lead developer"],
    ["Clients won't let client data near a model unless we can prove where it goes.", "Data protection officer (outsourced)"]
  ],
  base: {
    recurring: 1500, customers: 260, churn: 0.11, other: 80, newBizList: 300, discount: 0.25,
    legacyShare: 0.40, legacyGap: 0.25,
    ps: { fte: 14, cost: 52, days: 205, util: 0.55, foc: 0.22, rate: 0.85, demandGrowth: 0.04 },
    support: { fte: 7, cost: 38, howto: 0.45 },
    rnd: { fte: 12, cost: 62, legacyFte: 5, roadmapFte: 4, petFte: 3, petName: "the client portal" },
    sm: 300, ga: 520, hosting: 180, royalties: 120, royaltiesAfter: 30, reportMigration: 90, infl: 0.03, otherFte: 8,
    sens: { upliftFree: 0.05, aiPriceRef: 2.5 }
  },
  people: { founder: 58, team: 56, cust: 64, founderLabel: "Founder" },
  targets: [{ type: "margin", min: 0.12 }, { type: "grr3", min: 0.91 }, { type: "ai", min: 0.04 }, { type: "founder", min: 45 }],
  initiatives: [
    { id: "packs", label: "Package implementations into 3 fixed offers with change control", pts: 2, oneoff: [25, 0, 0],
      fx: { psDemand: [0.02, 0.06, 0.08], churn: [0, -0.01, -0.015] }, people: { team: 3, cust: 3 },
      hint: "Standard scope, standard price, chargeable changes. Better onboarding lowers churn." },
    { id: "support", label: "Merge Quill support into Lexia's desk", pts: 2, oneoff: [40, 0, 0], fx: { supFte: [0, -2, -2.5], churn: [0.005, 0, 0] }, people: { team: -8, cust: -3, founder: -4 },
      hint: "One desk with English-speaking agents in Madrid.", warn: "Merging support across two countries means UK roles at risk. Run a fair consultation and keep service levels visible to UK customers." },
    { id: "shared", label: "Shared finance, HR and G&A with Lexia", pts: 2, oneoff: [50, 0, 0], fx: { ga: [0, -0.18, -0.22] }, people: { team: -3 },
      hint: "One finance and back-office team for both companies." },
    { id: "xsell", label: "Cross-sell Lexia e-billing to Quill customers", pts: 2, fx: { newBiz: [0, 0.2, 0.3], rndFte: [1, 1, 1] }, people: { founder: 4 },
      hint: "Needs 1 engineer to localise for UK billing rules." }
  ],
  finder: [
    { id: "A", text: "PS: 55% utilisation, 22% free days, 35% overruns", v: "good", fb: "Yes, the biggest problem. PS is 40% of revenue and running at a heavy loss. Package it, control scope, charge for changes." },
    { id: "B", text: "Duplicate support and back office with Lexia", v: "good", fb: "Yes. This is the integration synergy. Real money, but people risk in two countries, so sequence it carefully." },
    { id: "C", text: "Legacy pricing (40% of customers) and 25% discounts", v: "good", fb: "Yes. Price leakage on a small ticket. Clean-up and discount governance are worth more than they look." },
    { id: "D", text: "AI drafting: customers asking, competitors charging", v: "good", fb: "Yes, and here it's a revenue lever, not just efficiency. Data protection is the gate: solve that first." },
    { id: "E", text: "Document engine royalties at £120k", v: "mid", fb: "Real (about 5% of revenue), but a migration project. Year 2 rather than first." },
    { id: "F", text: "Hire a full-time CFO", v: "bad", fb: "£120k+ on a £2.6m business. Shared finance with Lexia solves the same problem for a fraction." },
    { id: "G", text: "Rebrand Quill as Lexia", v: "bad", fb: "Brand decisions can wait. UK law firms bought Quill, and the founder would take it as erasure." },
    { id: "H", text: "Cut the sales team", v: "bad", fb: "Only 4 people in S&M. You'd stop new business on a shrinking base." },
    { id: "I", text: "Stop the client portal", v: "mid", fb: "Frees 3 engineers who could build the AI drafting tier, but the founder already feels sidelined. Timing matters." },
    { id: "J", text: "Move hosting to a cheaper provider", v: "mid", fb: "£180k, so a 20% saving is about £36k. Fine later." }
  ],
  events: [
    { title: "\"Founder to footnote\"", text: "Graham tells you he's thinking of leaving. \"Lexia gets the investment, Quill gets the cuts.\"", options: [
      { t: "Tell him the plan is the plan.", fx: { founder: -15, team: -3, cust: 0, delivery: 0 }, s: 0, fb: "Losing the founder of a loss-making UK business mid-turnaround puts customer relationships at risk." },
      { t: "Give him a real role in the combined plan. He leads the UK AI drafting product, where his domain knowledge is the advantage, with clear targets.", fx: { founder: 12, team: 3, cust: 2, delivery: 5 }, s: 3, fb: "Best. You redirect his energy to something that matters and has a number on it. Status plus purpose." },
      { t: "Offer him a retention bonus.", fx: { founder: 4, team: 0, cust: 0, delivery: -2 }, s: 1, fb: "Money buys time, not commitment. The underlying issue is role and respect." },
      { t: "Let the Portfolio Manager handle it.", fx: { founder: -6, team: 0, cust: 0, delivery: -2 }, s: 1, fb: "He's telling you because you're closest to the change. Deal with it first, then keep the PM informed." }
    ]},
    { title: "A fixed-price project blows up", text: "A 20-lawyer firm's migration is 60% over budget. The managing partner demands the rest of the work for free and threatens a bad review on the Law Society forum.", options: [
      { t: "Give them the free days. Reputation matters.", fx: { founder: 2, team: -4, cust: 3, delivery: -6 }, s: 1, fb: "Fine once, but it confirms the pattern your PS team already follows." },
      { t: "Review the contract and the change log together. Fund what was in the original scope, offer a capped fixed price for what wasn't, and use it as the template for change control.", fx: { founder: 3, team: 4, cust: 2, delivery: 5 }, s: 3, fb: "Best. Fair, documented, and it turns a crisis into the process fix you needed." },
      { t: "Stop work until they pay.", fx: { founder: -2, team: 0, cust: -10, delivery: -2 }, s: 0, fb: "Escalates a commercial dispute into a public one with a small, connected community." },
      { t: "Blame the previous PS lead in the customer meeting.", fx: { founder: -4, team: -10, cust: -2, delivery: 0 }, s: 0, fb: "Customers don't care whose fault it was. Your team will remember you said it." }
    ]},
    { title: "Lexia's MD wants control", text: "Carmen proposes that Madrid runs all support and PS for both businesses from next month.", options: [
      { t: "Agree. Her numbers are better.", fx: { founder: -12, team: -10, cust: -4, delivery: 4 }, s: 1, fb: "Efficient on paper, but the UK customers, the UK team and the founder all lose at once." },
      { t: "Agree a staged design: shared tooling and one ticket queue first, then a combined desk with UK-hours coverage, with service levels both MDs sign off.", fx: { founder: 4, team: 3, cust: 3, delivery: 5 }, s: 3, fb: "Best. You take the synergy without a big-bang cutover, and both leaders own it." },
      { t: "Refuse. The businesses stay separate.", fx: { founder: 4, team: 2, cust: 0, delivery: -10 }, s: 0, fb: "Then why did we buy Lexia? Integration synergy is a stated objective." },
      { t: "Ask the Portfolio Manager to choose between them.", fx: { founder: -2, team: 0, cust: 0, delivery: -3 }, s: 1, fb: "This is exactly the coordination the role exists to do." }
    ]},
    { title: "UK support roles at risk", text: "Your support merger plan puts 3 UK roles at risk. One of them is a 12-year employee customers ask for by name.", options: [
      { t: "Run a proper consultation with HR. Look first at redeployment into onboarding and customer success, and keep the named contact for key accounts.", fx: { founder: 3, team: 4, cust: 3, delivery: 3 }, s: 3, fb: "Best. Lawful, humane and commercially sensible. Redeploying institutional knowledge into onboarding attacks churn too." },
      { t: "Announce the redundancies in a team email.", fx: { founder: -6, team: -15, cust: -3, delivery: 0 }, s: 0, fb: "UK redundancy needs a fair process and consultation. An email is legally risky and damaging." },
      { t: "Delay the merger indefinitely.", fx: { founder: 2, team: 3, cust: 0, delivery: -8 }, s: 1, fb: "Avoids the conversation and the value." },
      { t: "Keep everyone and hope attrition sorts it out.", fx: { founder: 0, team: 2, cust: 0, delivery: -4 }, s: 1, fb: "Sometimes right in a small team, but it needs a date and a plan, not hope." }
    ]},
    { title: "AI and client confidentiality", text: "A large customer's compliance partner asks: \"Where does our client data go when your AI drafts a document?\" Nobody has a written answer.", options: [
      { t: "Say it's all secure and move on.", fx: { founder: 0, team: 0, cust: -10, delivery: -4 }, s: 0, fb: "Lawyers will ask for it in writing. An unsupported claim can end the AI line before it starts." },
      { t: "Pause sales of the AI tier. Produce a data processing statement with the DPO: model provider, data residency, retention, no training on customer data. Then relaunch with it.", fx: { founder: 3, team: 2, cust: 8, delivery: 2 }, s: 3, fb: "Best. In legal, trust is the product. A clear data position becomes a sales asset against competitors who are vague." },
      { t: "Drop AI. Too risky for lawyers.", fx: { founder: -4, team: -2, cust: 0, delivery: -10 }, s: 0, fb: "Customers are asking for it and competitors are charging for it. Manage the risk, don't run from it." },
      { t: "Refer them to the model provider's website.", fx: { founder: 0, team: 0, cust: -5, delivery: -2 }, s: 1, fb: "Your customers' data relationship is with you, not your supplier." }
    ]},
    { title: "Cash pressure", text: "Year 1 is still loss-making. The Portfolio Manager asks whether you can stop the AI investment to protect cash.", options: [
      { t: "Stop it straight away.", fx: { founder: -6, team: -3, cust: 0, delivery: -8 }, s: 1, fb: "Protects cash and gives up the one growth line in the plan." },
      { t: "Show a stage-gated plan: a smaller first release to 20 pilot firms, a go/no-go on paid conversion at month 6, and the cost-out timing that funds it.", fx: { founder: 4, team: 2, cust: 0, delivery: 6 }, s: 3, fb: "Best. You answer a cash question with numbers and a decision gate, not a defence of your plan." },
      { t: "Argue that AI is strategic and can't be cut.", fx: { founder: 2, team: 0, cust: 0, delivery: -4 }, s: 0, fb: "\"Strategic\" without numbers loses to a cash concern every time." },
      { t: "Cut sales and marketing instead, without telling the founder.", fx: { founder: -12, team: -4, cust: 0, delivery: -3 }, s: 0, fb: "Changing the GM's business behind their back ends the relationship." }
    ]}
  ],
  workshop: {
    title: "Quill and Lexia integration design",
    objective: "Design the combined support and back-office model and agree the first 90-day integration steps.",
    slot: 240, kind: "design", preread: true,
    people: [
      { id: "graham", name: "Graham Holt", role: "Quill founder and CEO", must: true, decider: true },
      { id: "carmen", name: "Carmen Vidal", role: "Lexia MD", must: true, decider: true },
      { id: "headps", name: "Head of PS (Quill)", role: "PS", must: false },
      { id: "supuk", name: "UK Support Lead", role: "Support", must: true },
      { id: "supes", name: "Madrid Support Lead", role: "Support", must: true },
      { id: "fin", name: "Lexia Finance Manager", role: "Finance", must: false },
      { id: "pm", name: "Portfolio Manager", role: "Your manager", must: false, intimidating: true },
      { id: "agents", name: "8 support agents", role: "Support", must: false, count: 8 }
    ]
  }
});
