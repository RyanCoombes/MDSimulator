MDS.registerScenario({
  id: "nordline",
  name: "Nordline Fleet",
  tagline: "Swedish fleet-maintenance software with a retention problem and a half-finished cloud move.",
  difficulty: "Hard",
  focus: "Churn, cloud migration, co-founder dynamics",
  pmBrief: "Nordline looks healthy on recurring revenue but it's leaking customers, and it's paying for two platforms at once because the cloud migration stalled. The co-founders don't agree on much. Fix retention first. Pricing won't save a business that loses one customer in six.",
  profile: [
    ["What they sell", "Fleet maintenance and inspection software for Nordic municipalities and logistics firms. A legacy desktop product plus a newer cloud version."],
    ["Customers", "140 fleets, average recurring spend about £23k a year. 45% are still on the desktop product."],
    ["People", "45 staff in Gothenburg: R&D 18, support 9, professional services 6, sales and marketing 5, G&A 7."],
    ["History", "Founded 2011 by Anna Lind (CEO) and Erik Holm (CTO). Acquired in October 2026."]
  ],
  kpis: [["Recurring share", "77%"], ["Gross retention", "84%", 1], ["Customers on desktop", "45%", 1], ["Hosting (double running)", "£600k", 1],
    ["PS billable utilisation", "66%"], ["Avg new-deal discount", "18%"], ["How-to share of tickets", "30%"], ["Customer success staff", "0", 1]],
  note: "Exit interviews blame desktop bugs, slow support and no one checking in after go-live. Customers here tolerate only about 3% price rises: churn is already high. R&D: 7 FTE legacy, 7 roadmap, 4 on Erik's \"Route Optimiser\".",
  interviews: [
    ["We can't switch off desktop. Municipal customers have procurement cycles of two years.", "Anna Lind, co-founder and CEO"],
    ["Route Optimiser is our moat. Nobody else in the Nordics has it.", "Erik Holm, co-founder and CTO"],
    ["Customers leave quietly. We find out when the renewal doesn't come in.", "Sofia Berg, Support Manager"],
    ["We're paying for the data centre and AWS. The migration stopped when two engineers left.", "DevOps lead"],
    ["Nobody owns a customer after go-live. Sales moves on, PS moves on.", "Account executive"],
    ["The union rep has asked twice what the new owners are planning.", "HR coordinator"]
  ],
  base: {
    recurring: 3280, customers: 140, churn: 0.16, other: 120, newBizList: 420, discount: 0.18,
    legacyShare: 0.20, legacyGap: 0.20,
    ps: { fte: 6, cost: 62, days: 205, util: 0.66, foc: 0.10, rate: 1.15, demandGrowth: 0.02 },
    support: { fte: 9, cost: 44, howto: 0.30 },
    rnd: { fte: 18, cost: 76, legacyFte: 7, roadmapFte: 7, petFte: 4, petName: "Route Optimiser" },
    sm: 420, ga: 620, hosting: 600, royalties: 60, royaltiesAfter: 25, reportMigration: 70, infl: 0.03, otherFte: 12,
    sens: { upliftFree: 0.03, upliftChurn: 0.6, aiPriceRef: 4 }
  },
  people: { founder: 62, team: 58, cust: 55, founderLabel: "Co-founder" },
  targets: [{ type: "margin", min: 0.15 }, { type: "grr3", min: 0.90 }, { type: "ai", min: 0.02 }, { type: "founder", min: 50 }],
  initiatives: [
    { id: "cloud", label: "Finish the cloud migration and switch off desktop", pts: 3, oneoff: [280, 40, 0],
      fx: { hosting: [0, -0.30, -0.42], churn: [0.025, -0.025, -0.035], rndFte: [0, -1, -3] }, people: { team: 5, cust: -6 },
      hint: "£320k over two years. Halves hosting and frees legacy engineers, but forced migration costs churn in Year 1.",
      warn: "Forced migration: expect a churn spike in Year 1. Municipal customers need 12+ months' notice to fit procurement cycles." },
    { id: "cs", label: "Build a customer success team (2 FTE)", pts: 2, fx: { run: [130, 130, 130], churn: [-0.01, -0.03, -0.035], newBiz: [0, 0.08, 0.1] }, people: { cust: 7 },
      hint: "£130k a year. Owns every customer after go-live: health scores, renewals, adoption." },
    { id: "devc", label: "Move 5 R&D roles to the Valsoft dev centre", pts: 2, oneoff: [70, 0, 0], fx: { rndFte: [-0.5, -2, -2] }, people: { founder: -8, team: -12 },
      hint: "About 40% cheaper per role from Year 2.", warn: "In Sweden, the Co-determination Act (MBL) requires negotiation with the union before a decision like this. Build in time and consult early." },
    { id: "tele", label: "Telematics data partnership", pts: 2, fx: { newBiz: [0, 0.12, 0.2], run: [20, 20, 20] }, people: { founder: 4 },
      hint: "Bundle vehicle data from a telematics partner. Lifts new business from Year 2." }
  ],
  finder: [
    { id: "A", text: "Gross retention at 84%: find out why customers leave", v: "good", fb: "Yes, this is the main problem. Losing 16% a year means you're refilling a leaking bucket. Every other lever is worth less until it's fixed." },
    { id: "B", text: "Paying for the data centre and the cloud at once", v: "good", fb: "Yes. £600k hosting is about 14% of revenue. Finishing the migration is the cost lever, and it also removes the desktop product that drives churn." },
    { id: "C", text: "Raise maintenance prices by 8%", v: "bad", fb: "Wrong lever for this business. With churn at 16%, a big price rise speeds up the exits. Fix value and retention first." },
    { id: "D", text: "Nobody owns customers after go-live", v: "good", fb: "Yes, and it's the root cause behind A. A small customer success function is cheap compared with replacing lost recurring revenue." },
    { id: "E", text: "Route Optimiser absorbing 4 engineers", v: "mid", fb: "Real, but it's the CTO co-founder's project. Handle it as a portfolio decision with evidence, not your first move." },
    { id: "F", text: "Cut support headcount", v: "bad", fb: "Slow support is already a reason customers leave. This makes the main problem worse." },
    { id: "G", text: "Raise the PS day rate", v: "mid", fb: "Small. PS is only 6 people. Worth doing later." },
    { id: "H", text: "Mapping API royalties", v: "mid", fb: "Small, about £35k a year. Don't lead with it." },
    { id: "I", text: "Announce AI predictive maintenance now", v: "bad", fb: "Vapourware creates a credibility problem with municipal buyers. Build it on the cloud platform once the migration is done." },
    { id: "J", text: "Move to a cheaper office in Gothenburg", v: "bad", fb: "Small, distracting, and bad for morale during a stressful change." }
  ],
  events: [
    { title: "The co-founders disagree", text: "In your first leadership meeting, Anna wants to keep desktop alive for two more years. Erik wants it switched off this year. They both look at you.", options: [
      { t: "Back Erik's plan. Every month of double running costs about £30k, and a clear decision in week one shows you can lead.", fx: { founder: -12, team: 2, cust: -4, delivery: 4 }, s: 1, fb: "Picking a side between co-founders in week one makes an enemy of the other one." },
      { t: "Say you'll return in two weeks with customer-level data on renewals and procurement windows, then propose a dated sunset both can sign.", fx: { founder: 8, team: 2, cust: 2, delivery: 6 }, s: 3, fb: "Best. You turn a disagreement about opinions into one about evidence, and the founders keep the decision." },
      { t: "Suggest the Portfolio Manager arbitrates, since the owners carry the cost and it keeps you neutral between the founders.", fx: { founder: -8, team: 0, cust: 0, delivery: 2 }, s: 1, fb: "In a decentralised model the business owns the decision. Escalating this early reads as lack of judgement." },
      { t: "Leave it for now. Get to know both founders properly over the first quarter before taking on their biggest disagreement.", fx: { founder: 0, team: -2, cust: -3, delivery: -10 }, s: 0, fb: "Every month of delay costs about £30k in double hosting and more churn." }
    ]},
    { title: "The union asks questions", text: "The union representative asks for a meeting about \"rumours of jobs moving abroad\". You haven't decided anything on the dev centre yet.", options: [
      { t: "Decline politely for now and promise a full briefing once there's a decision, so you don't spread worry about options that may never happen.", fx: { founder: 0, team: -10, cust: 0, delivery: -4 }, s: 0, fb: "Under Swedish co-determination rules, the union must be consulted before important changes are decided. Stonewalling also feeds rumours." },
      { t: "Meet them with Anna. Say options are being assessed, explain the process, and commit to negotiating before anything is decided.", fx: { founder: 4, team: 8, cust: 0, delivery: 4 }, s: 3, fb: "Best. It's legally sound under MBL and it builds trust. Early candour stops rumours from setting the story." },
      { t: "Meet them and say there are no current plans to move jobs. Nothing is decided, and it stops the rumours spreading.", fx: { founder: 0, team: 4, cust: 0, delivery: -6 }, s: 0, fb: "If the dev centre option goes ahead, you've lost all credibility." },
      { t: "Ask HR to meet the union. They know the MBL process, and it keeps you out of a sensitive conversation until there's news.", fx: { founder: 0, team: -3, cust: 0, delivery: 0 }, s: 1, fb: "HR should be involved, but people need to hear about the change from someone who's driving it." }
    ]},
    { title: "A municipality won't migrate", text: "Göteborg Region (7% of recurring revenue) says its procurement rules don't allow moving to cloud until a new tender in 18 months.", options: [
      { t: "Offer a supported desktop extension until their tender, at a premium, with a signed migration date.", fx: { founder: 4, team: -2, cust: 6, delivery: 3 }, s: 3, fb: "Best. You keep the account, cover the cost of running desktop for them, and get a dated exit." },
      { t: "Hold the sunset date. Make one exception and every other desktop customer will find a procurement reason of their own.", fx: { founder: -4, team: 2, cust: -10, delivery: 0 }, s: 0, fb: "You hand them a reason to tender, and they're 7% of revenue." },
      { t: "Move the whole sunset back 18 months so everyone migrates together. One clean cutover is simpler than running exceptions.", fx: { founder: 3, team: -4, cust: 3, delivery: -10 }, s: 1, fb: "One customer sets the timetable for everyone and the double running costs continue." },
      { t: "Offer 40% off the cloud product if they move this year. A big enough saving often gets procurement to find a route.", fx: { founder: 0, team: 0, cust: 4, delivery: -5 }, s: 1, fb: "Procurement rules usually mean they can't accept anyway, and you've set a price precedent." }
    ]},
    { title: "Cloud outage in week three", text: "Three weeks after the first migration wave, the cloud product is down for 5 hours on a Monday morning. Two customers call Anna.", options: [
      { t: "Publish an incident report within 48 hours: cause, fix and prevention. Call the affected customers yourself, with Anna.", fx: { founder: 5, team: 3, cust: 4, delivery: 2 }, s: 3, fb: "Best. Incidents during a migration are expected. Silence is what loses customers." },
      { t: "Pause the next migration wave until the platform has run a full month without incident. Another outage would undo everything.", fx: { founder: 0, team: -3, cust: 0, delivery: -10 }, s: 1, fb: "An overreaction. Fix the root cause and set a clear go criterion for the next wave instead." },
      { t: "Let DevOps own the fix and the customer updates. They understand the cause, and you stepping in could look like panic.", fx: { founder: -4, team: -2, cust: -6, delivery: 0 }, s: 0, fb: "Customers judge the change by how it's handled. That part is yours." },
      { t: "Credit every cloud customer with a free month, unprompted. A generous gesture now buys goodwill for the remaining waves.", fx: { founder: -3, team: 0, cust: 2, delivery: -5 }, s: 1, fb: "Expensive and signals panic. Compensate the affected customers if the contract says so." }
    ]},
    { title: "The CTO's best engineer resigns", text: "Erik's lead engineer on Route Optimiser resigns, saying \"the new owners don't care about innovation\".", options: [
      { t: "Match whatever they've been offered and add a retention bonus. Losing Route Optimiser's lead now would hurt Erik and the roadmap.", fx: { founder: 3, team: -4, cust: 0, delivery: -3 }, s: 1, fb: "Fixes one person, not the reason. Others will notice that resigning works." },
      { t: "Debrief the exit with Erik, then give R&D a clear roadmap story together, including where innovation work like AI fits.", fx: { founder: 6, team: 6, cust: 0, delivery: 4 }, s: 3, fb: "Best. The resignation is a signal about the story people are hearing. Fix the story with the CTO, not around him." },
      { t: "Use the moment to wind down Route Optimiser. Without its lead it was going to struggle anyway, and it frees four engineers.", fx: { founder: -14, team: -4, cust: 0, delivery: 4 }, s: 1, fb: "Maybe the right outcome, but announcing it now looks opportunistic and turns Erik against you." },
      { t: "Accept it gracefully and backfill. People leave after acquisitions, and overreacting tells the team one resignation can shift strategy.", fx: { founder: -4, team: -8, cust: 0, delivery: 0 }, s: 0, fb: "Key-person risk is the number one integration risk in small software firms." }
    ]},
    { title: "\"AI-powered\" marketing", text: "Anna wants to rebrand the product as \"AI-powered fleet intelligence\" at a trade show next month. There's no AI feature yet.", options: [
      { t: "Go with it, but keep the claims general, such as 'AI-ready platform'. Buyers expect some marketing gloss at a trade show.", fx: { founder: 4, team: -3, cust: -6, delivery: -2 }, s: 0, fb: "Municipal buyers check claims, and tenders can require evidence. Even vague AI claims create contractual and reputational risk." },
      { t: "Offer a working pilot instead: one real use case, such as predicting defect inspections, built with five customers.", fx: { founder: 5, team: 4, cust: 5, delivery: 5 }, s: 3, fb: "Best. You keep the energy, make it real and validate willingness to pay before you build." },
      { t: "Say no to AI messaging until the migration is done. Focus is the scarcest resource you have, and the team is stretched.", fx: { founder: -8, team: 0, cust: 0, delivery: -3 }, s: 1, fb: "Sequencing is right, but a flat no ignores a portfolio objective and the founder's energy." },
      { t: "Ask marketing to test the 'AI-powered' message with a few customers first, and go with whatever lands best.", fx: { founder: 0, team: 0, cust: -2, delivery: -2 }, s: 0, fb: "Positioning is a leadership decision with commercial risk, and customers liking a claim doesn't make it true." }
    ]}
  ],
  workshop: {
    title: "Desktop sunset decision",
    objective: "Decide the desktop sunset date, the migration waves and how exceptions are handled.",
    slot: 150, kind: "decide", preread: true,
    people: [
      { id: "anna", name: "Anna Lind", role: "Co-founder and CEO", must: true, decider: true },
      { id: "erik", name: "Erik Holm", role: "Co-founder and CTO", must: true },
      { id: "sofia", name: "Sofia Berg", role: "Support Manager", must: true },
      { id: "devops", name: "DevOps lead", role: "Platform", must: false },
      { id: "ae", name: "Account executive", role: "Sales", must: false },
      { id: "pm", name: "Portfolio Manager", role: "Your manager", must: false, intimidating: true },
      { id: "union", name: "Union representative", role: "Employee rep", must: false },
      { id: "engs", name: "5 engineers", role: "R&D", must: false, count: 5 }
    ]
  }
});
