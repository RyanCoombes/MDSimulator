/* 100-day plan activities and stakeholder truths per case.
   Plan phases: w1 = weeks 1–2, w2 = weeks 3–6, w3 = weeks 7–10, w4 = weeks 11–14, later = after day 100, no = not doing. */
(() => {
  const common = [
    { id: "meet", t: "1:1s with the founder and every leadership-team member", best: ["w1"], owner: ["You"], why: "Listen before you propose. The first fortnight sets whether you're seen as a helper or an auditor." },
    { id: "comms", t: "All-staff session: why we're changing, what changes, what doesn't", best: ["w1", "w2"], owner: ["GM"], why: "Silence breeds rumours. The founder or GM should front it, with you alongside, not the other way round." },
    { id: "keyppl", t: "Identify key people and agree retention actions", best: ["w1", "w2"], owner: ["GM", "You"], why: "Key-person loss is the biggest early integration risk. Act before people start interviewing." },
    { id: "pack", t: "Monthly KPI and reporting pack in place", best: ["w1", "w2"], owner: ["You"], why: "With no finance person, you are the reporting. Everything later is measured against this baseline." },
    { id: "baseline", t: "Baseline the numbers: P&L reconciliation, cohorts, pricing, PS data", best: ["w1", "w2"], owner: ["You"], why: "Diagnose before you prescribe. Every target needs a defensible baseline." },
    { id: "time", t: "Introduce time recording and write-off tracking in PS", best: ["w1", "w2"], owner: ["Functional lead"], why: "You can't set a utilisation target on data nobody records. Head of PS should own it." },
    { id: "utilt", t: "Set utilisation and free-day targets with the Head of PS", best: ["w3", "w4"], after: ["time"], strict: true, owner: ["Functional lead", "GM"], why: "Needs a few weeks of recorded data first, and must be co-owned to stick." },
    { id: "scope", t: "Rule: no fixed-price deal without PS scoping sign-off", best: ["w1", "w2"], owner: ["GM"], why: "Cheap, fast and it stops the overrun leak at source: a classic quick win." },
    { id: "deal", t: "Discount approval matrix (deal desk)", best: ["w2", "w3"], after: ["baseline"], owner: ["GM"], why: "Governance with an owner. Introduce after you know where discounts leak." },
    { id: "princ", t: "Agree pricing principles and uplift with the founder", best: ["w2"], after: ["baseline"], owner: ["GM", "You"], why: "The founder must own the price message. Agree principles before any letter goes out." },
    { id: "letters", t: "Send renewal price-change letters", after: ["princ"], owner: ["GM", "Functional lead"], why: "Timing is set by renewal dates and notice periods in the contracts." },
    { id: "rnd", t: "R&D portfolio review with the founder (including the pet project)", best: ["w2", "w3"], after: ["baseline"], owner: ["GM", "You"], why: "Use the data (requests, contracted revenue, months running). Let the founder reach the conclusion." },
    { id: "supplier", t: "Serve notice or renegotiate the largest royalty or supplier contract", owner: ["You", "GM"], why: "Notice periods are hard deadlines. Miss one and you're locked in for another term." },
    { id: "pm1", t: "First update to the Portfolio Manager: findings and draft plan", best: ["w2", "w3"], owner: ["You"], why: "Early, honest, evidence-based. No surprises later." },
    { id: "plan", t: "Agree the 3-year value-creation plan and KPIs with the GM", best: ["w3", "w4"], after: ["baseline", "pm1"], owner: ["GM", "You"], why: "The GM owns the P&L, so the GM owns the plan. You facilitate and hold the numbers." },
    { id: "aipilot", t: "AI pilot with 5–10 customers", best: ["w3", "w4"], after: ["baseline"], owner: ["Functional lead", "GM"], why: "Validate value and willingness to pay before building at scale." },
    { id: "ailaunch", t: "Launch the paid AI tier", best: ["later"], after: ["aipilot"], owner: ["GM"], why: "Only after a pilot proves conversion. Inside 100 days is too early." },
    { id: "restr", t: "Headcount restructuring", best: ["later", "w4"], after: ["comms", "baseline"], owner: ["GM"], why: "Needs a fair process, consultation and a clear rationale. Never a week-one move." },
    { id: "office", t: "Move to a smaller office", best: ["no", "later"], owner: ["GM"], why: "Low value and a morale hit during change. Not a 100-day priority." }
  ];
  const H = MDS.scenarios.harbour, N = MDS.scenarios.nordline, Q = MDS.scenarios.quill;
  H.plan = { start: "1 December 2026", activities: common.map(a => ({ ...a })), letters: ["w2"], lettersWhy: "42% of ARR renews in April. Housing associations need about 90 days' notice, so letters must land in weeks 3–6 (by early January) or you lose a full year of uplift.",
    supplier: ["w1"], supplierWhy: "The ReportCo contract (£190k, 12% uplift, auto-renews for 3 years) needs 120 days' notice before April 2027. That's this week. Serve protective notice now and negotiate after.",
    extra: [] };
  N.plan = { start: "1 November 2026", activities: common.map(a => ({ ...a })), letters: ["w4", "later"], lettersWhy: "Price rises are low priority here: churn is the problem, and the January renewals are already too close. Fix retention first. Send letters later, for next year's cycle.",
    supplier: ["w2", "w3"], supplierWhy: "The data centre contract auto-renews for 2 years with 180 days' notice before December 2027. You have until about June, but decide the migration plan first.",
    extra: [
      { id: "union", t: "Open MBL negotiations with the union before any dev-centre decision", best: ["w2", "w3"], before: ["restr"], owner: ["GM"], why: "Sweden's Co-determination Act requires negotiation before important changes are decided. Missing it is a legal breach." },
      { id: "sunset", t: "Announce the desktop sunset date to customers (12 months' notice)", best: ["w3", "w4"], after: ["baseline"], owner: ["GM"], why: "Municipal procurement cycles need long notice. Announce after you've agreed the plan with both co-founders." },
      { id: "cs", t: "Stand up customer success for the top 40 accounts", best: ["w2", "w3"], owner: ["Functional lead"], why: "Retention is the main problem. Start where the revenue is." }
    ] };
  Q.plan = { start: "1 December 2026", activities: common.map(a => ({ ...a })), letters: ["w3", "w4"], lettersWhy: "The peak renewal month is October. Letters in weeks 7–14, after pricing principles are agreed, give plenty of notice.",
    supplier: ["w1", "w2"], supplierWhy: "DocAssemble (£120k, 10% uplift) auto-renews for 2 years with 90 days' notice before June 2027, so notice is due by early March. Decide in the first six weeks.",
    extra: [
      { id: "dpo", t: "Data processing statement for AI drafting, with the DPO", best: ["w1", "w2"], before: ["aipilot"], owner: ["Functional lead", "You"], why: "Law firms won't pilot without it. It's the gate for the whole AI revenue line." },
      { id: "intws", t: "Quill and Lexia integration design workshop", best: ["w2", "w3"], after: ["meet"], owner: ["You"], why: "Both MDs design the combined model together before anything moves." },
      { id: "redeploy", t: "UK support consultation, with redeployment options first", best: ["w3", "w4"], after: ["intws", "comms"], before: ["restr"], owner: ["GM"], why: "UK redundancy requires fair process and consultation. Redeployment into onboarding keeps knowledge and helps churn." }
    ] };

  H.stake = [
    { id: "dave", name: "Dave Pryce, founder and CEO", power: "High", interest: "High", stance: "Sceptic", why: "Runs the P&L and the culture. Publicly against price rises, and Mobile 2 is his baby." },
    { id: "leanne", name: "Leanne Ford, Sales Director", power: "High", interest: "High", stance: "Sceptic", why: "Owns new business and will resist discount governance. Needed for any pricing change." },
    { id: "priya", name: "Priya Shah, Head of PS", power: "Low", interest: "High", stance: "Champion", why: "Frustrated by overruns nobody tracks. A natural ally if she co-designs the fix." },
    { id: "kieran", name: "Kieran Doyle, lead engineer (scheduling)", power: "High", interest: "High", stance: "Champion", why: "A flight-risk key person with 12 years' tenure. Engineers would rather fix scheduling than build Mobile 2. Influential way beyond his title." },
    { id: "mark", name: "Mark Collins, account executive", power: "Low", interest: "High", stance: "Blocker", why: "His deals carry 36% average discounts. Discount governance directly hits him." },
    { id: "pm", name: "Portfolio Manager", power: "High", interest: "High", stance: "Champion", why: "Your manager and sponsor. Wants the targets hit without losing the founder." },
    { id: "top3", name: "Top 3 customers (14% of ARR)", power: "High", interest: "Low", stance: "Neutral", why: "Can hurt you badly if they leave, but they don't care about internal change unless it touches their price or service." },
    { id: "support", name: "Support team", power: "Low", interest: "High", stance: "Sceptic", why: "AI deflection feels like a threat to their jobs. They'll decide whether it's adopted." },
    { id: "book", name: "Part-time bookkeeper", power: "Low", interest: "Low", stance: "Neutral", why: "Useful for data, but not affected by or influential over the plan." }
  ];
  N.stake = [
    { id: "anna", name: "Anna Lind, co-founder and CEO", power: "High", interest: "High", stance: "Neutral", why: "The decider. Cautious about desktop sunset because of municipal customers." },
    { id: "erik", name: "Erik Holm, co-founder and CTO", power: "High", interest: "High", stance: "Sceptic", why: "Wants desktop gone, but will fight for Route Optimiser and against moving roles to a dev centre." },
    { id: "union", name: "Union representative", power: "High", interest: "High", stance: "Sceptic", why: "Under MBL, the union must be negotiated with before major changes. Already asking questions." },
    { id: "sofia", name: "Sofia Berg, Support Manager", power: "Low", interest: "High", stance: "Champion", why: "Sees churn first-hand. Natural owner for customer success." },
    { id: "devops", name: "DevOps lead", power: "High", interest: "High", stance: "Neutral", why: "Single point of failure for the cloud migration and a high flight risk. Influence far beyond the title." },
    { id: "nils", name: "Nils Åberg, Route Optimiser lead", power: "Low", interest: "High", stance: "Blocker", why: "His project is the obvious candidate to stop." },
    { id: "gr", name: "Göteborg Region (7% of ARR)", power: "High", interest: "Low", stance: "Neutral", why: "Only cares if the change touches their contract and procurement rules." },
    { id: "pm", name: "Portfolio Manager", power: "High", interest: "High", stance: "Champion", why: "Your sponsor." }
  ];
  Q.stake = [
    { id: "graham", name: "Graham Holt, Quill founder", power: "High", interest: "High", stance: "Sceptic", why: "Feels sidelined by Lexia. Could leave, and with him the UK customer relationships." },
    { id: "carmen", name: "Carmen Vidal, Lexia MD", power: "High", interest: "High", stance: "Champion", why: "Pushing for integration, but on her terms. An ally who needs boundaries." },
    { id: "headps", name: "Head of PS (Quill)", power: "Low", interest: "High", stance: "Champion", why: "Living with the overruns. Will back packaged implementations." },
    { id: "uksup", name: "UK support team", power: "Low", interest: "High", stance: "Blocker", why: "Their roles are at risk from the support merger." },
    { id: "dpo", name: "Data protection officer (outsourced)", power: "High", interest: "Low", stance: "Neutral", why: "Can stop the AI line with one opinion, but isn't engaged day to day." },
    { id: "lawfirms", name: "Large customers' compliance partners", power: "High", interest: "Low", stance: "Sceptic", why: "Gatekeepers for AI adoption at their firms. Need evidence, not enthusiasm." },
    { id: "lexfin", name: "Lexia Finance Manager", power: "Low", interest: "Low", stance: "Neutral", why: "Will run shared finance if it goes ahead. Low influence on the decision." },
    { id: "pm", name: "Portfolio Manager", power: "High", interest: "High", stance: "Champion", why: "Your sponsor." }
  ];
})();
