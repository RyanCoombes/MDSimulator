/* Forecast engine: a driver-based 3-year P&L shared by every scenario.
   Scenario data supplies the base numbers, sensitivities and its own initiatives. */

MDS.LEVERS = [
  { grp: "Pricing", items: [
    { id: "uplift", label: "Annual maintenance uplift", min: 0, max: 15, step: 1, unit: "%", def: 0, pts: v => v > 0 ? 1 : 0,
      hint: "Applied each year. Above the scenario's tolerance, churn climbs fast." },
    { id: "cleanup", label: "Move legacy-priced customers to list", min: 0, max: 100, step: 10, unit: "%", def: 0, pts: v => v === 0 ? 0 : v >= 60 ? 3 : 2,
      hint: "Phased over two years. Each conversation is yours to run, and some customers leave." },
    { id: "disc", label: "Cap on new-deal discount", min: 5, max: 35, step: 1, unit: "%", def: null, pts: (v, d) => v !== d ? 1 : 0,
      hint: "Below about 15%, win rates fall and Sales pushes back." }
  ]},
  { grp: "Professional services", items: [
    { id: "util", label: "Billable utilisation target", min: 45, max: 90, step: 1, unit: "%", def: null, pts: (v, d) => Math.abs(v - d) >= 5 ? 2 : v !== d ? 1 : 0,
      hint: "Industry benchmark is about 75%. Only counts if customers buy the days. Above 82% burns people out." },
    { id: "foc", label: "Free-of-charge days", min: 0, max: 30, step: 1, unit: "%", def: null, pts: (v, d) => v !== d ? 1 : 0,
      hint: "Share of delivered days given away. Hard cuts in Year 1 upset customers." },
    { id: "rate", label: "Day-rate change", min: -10, max: 25, step: 1, unit: "%", def: 0, pts: v => v !== 0 ? 1 : 0,
      hint: "Above about 5%, customers buy fewer days." },
    { id: "psfte", label: "PS headcount change", min: -6, max: 4, step: 1, unit: " FTE", def: 0, pts: v => v !== 0 ? 1 : 0,
      hint: "Hires cost about £12k each to recruit. Cuts cost about £15k each and hit morale." }
  ]},
  { grp: "Support and AI", items: [
    { id: "ttt", type: "toggle", label: "Train-the-trainer onboarding", def: false, pts: v => v ? 1 : 0,
      hint: "Cuts how-to tickets by about 30% and nudges churn down from Year 2. £30k one-off." },
    { id: "defl", label: "AI ticket deflection", min: 0, max: 60, step: 5, unit: "%", def: 0, pts: v => v > 0 ? 1 : 0,
      hint: "Share of remaining how-to tickets resolved by an AI assistant. £45k a year in tooling." },
    { id: "attach", label: "AI tier take-up (target)", min: 0, max: 40, step: 1, unit: "%", def: 0, pts: v => v > 0 ? 2 : 0,
      hint: "Share of customers buying the AI tier by Year 3. Needs engineers (R&D group). Ramps slowly." },
    { id: "aiprice", label: "AI tier price per customer", min: 1, max: 10, step: 0.5, unit: "k/yr", def: 3, pts: () => 0,
      hint: "Inference takes about 25% of AI revenue. Priced well above the reference, take-up falls." }
  ]},
  { grp: "R&D", items: [
    { id: "pet", type: "toggle", label: "Stop the founder's pet project", def: false, pts: v => v ? 2 : 0,
      hint: "Frees the engineers on it. Costs founder trust unless you give the founder something better to own." },
    { id: "aife", label: "Engineers on AI features", min: 0, max: 6, step: 1, unit: " FTE", def: 0, pts: () => 0,
      hint: "Taken from freed capacity first, then from the roadmap. 3 or more gives full readiness." },
    { id: "rndcut", label: "Reduce R&D through attrition", min: 0, max: 6, step: 1, unit: " FTE", def: 0, pts: v => v > 0 ? 1 : 0,
      hint: "Not replacing leavers. Comes out of spare capacity, then the roadmap." }
  ]},
  { grp: "Costs", items: [
    { id: "host", label: "Hosting optimisation", min: 0, max: 30, step: 5, unit: "%", def: 0, pts: v => v > 0 ? 1 : 0,
      hint: "One-off cost of about £2k per percentage point." },
    { id: "report", type: "toggle", label: "Replace the third-party royalty component", def: false, pts: v => v ? 2 : 0,
      hint: "One-off migration in Year 1. Most of the royalty goes from Year 2." }
  ]}
];
MDS.BUDGET = 16;

MDS.allLevers = sc => MDS.LEVERS.flatMap(g => g.items).filter(i => !(sc.hide || []).includes(i.id));

MDS.defaults = sc => {
  const B = sc.base, o = {};
  MDS.LEVERS.flatMap(g => g.items).forEach(i => { o[i.id] = i.def; });
  o.disc = Math.round(B.discount * 100); o.util = Math.round(B.ps.util * 100); o.foc = Math.round(B.ps.foc * 100);
  (sc.initiatives || []).forEach(i => { o["i_" + i.id] = false; });
  return o;
};

MDS.points = (sc, L) => {
  const D = MDS.defaults(sc);
  let p = 0;
  MDS.allLevers(sc).forEach(i => { p += i.pts(L[i.id], D[i.id]); });
  (sc.initiatives || []).forEach(i => { if (L["i_" + i.id]) p += i.pts; });
  return p;
};

MDS.model = (sc, L, opt = {}) => {
  const B = sc.base, S = Object.assign({ upliftFree: 0.05, upliftChurn: 0.45, cleanupChurn: 0.12, discFloor: 0.15, aiPriceRef: 3, focShock: 0.012 }, B.sens || {});
  const down = !!opt.downside;
  const used = MDS.points(sc, L);
  const d = used <= MDS.BUDGET ? 1 : Math.max(0.5, MDS.BUDGET / used);
  const lag = down ? 0.75 : 1;
  const rampBase = [0, 0.5, 0.9, 1];
  const ramp = t => Math.min(1, rampBase[t] * d * lag);
  const u = L.uplift / 100, cleanup = L.cleanup / 100, disc = L.disc / 100;
  const utilT = L.util / 100, focT = L.foc / 100, rateChg = L.rate / 100, defl = L.defl / 100;
  const attach = L.attach / 100, host = L.host / 100;
  const inits = (sc.initiatives || []).filter(i => L["i_" + i.id]);
  const fx = (key, t) => inits.reduce((a, i) => a + ((i.fx[key] || [0, 0, 0])[t - 1] || 0), 0);

  // R&D capacity
  const petFte = B.rnd.petFte || 0;
  const freed = L.pet ? petFte : 0;
  const aiFromRoadmap = Math.max(0, L.aife - freed);
  const spare = Math.max(0, freed - L.aife);
  const cutFromRoadmap = Math.max(0, L.rndcut - spare);
  const roadmap = B.rnd.roadmapFte - aiFromRoadmap - cutFromRoadmap;
  const roadmapFactor = Math.max(0.4, 1 - Math.max(0, B.rnd.roadmapFte - roadmap) * 0.08);
  const readiness = Math.min(1, L.aife / 3) * d;
  const vol = 1 - Math.max(0, S.discFloor - disc) * 2.5;
  const cleanupAdd = B.recurring * B.legacyShare * cleanup * (1 / (1 - B.legacyGap) - 1) * 0.5 * d;
  const aiRamp = [0, 0.15, 0.5, 0.85];
  const priceFactor = L.aiprice > S.aiPriceRef * 1.4 ? (S.aiPriceRef * 1.4) / L.aiprice : 1;
  const ticketCut = B.support.howto * (1 - (1 - (L.ttt ? 0.3 : 0)) * (1 - defl));
  const rateDemand = 1 - Math.max(0, rateChg - 0.05) * 0.6;
  const burnout = utilT > 0.82;
  const otherFte = B.otherFte;

  const yrs = [];
  const ps0 = B.ps.fte * B.ps.days * B.ps.util * (1 - B.ps.foc) * B.ps.rate;
  const billable0 = B.ps.fte * B.ps.days * B.ps.util * (1 - B.ps.foc);
  const newBiz0 = B.newBizList * (1 - B.discount);
  yrs.push(pl({ rec: B.recurring, ai: 0, ps: ps0, other: B.other,
    psC: B.ps.fte * B.ps.cost, supC: B.support.fte * B.support.cost, rndC: B.rnd.fte * B.rnd.cost,
    sm: B.sm, ga: B.ga, host: B.hosting, roy: B.royalties, aiC: 0, run: 0, oneoff: 0,
    churn: B.churn, nrr: null, newBiz: null, cust: B.customers, utilReal: B.ps.util, foc: B.ps.foc,
    psFte: B.ps.fte, supFte: B.support.fte, rndFte: B.rnd.fte, fte: B.ps.fte + B.support.fte + B.rnd.fte + otherFte, idle: 0, aiTake: 0 }));

  let R = B.recurring, aiPrev = 0;
  for (let t = 1; t <= 3; t++) {
    const r = ramp(t), f = Math.pow(1 + B.infl, t);
    const churn = B.churn
      + Math.max(0, u - S.upliftFree) * S.upliftChurn
      + (t <= 2 ? cleanup * B.legacyShare * S.cleanupChurn * 0.5 : 0)
      + (focT < B.ps.foc - 0.08 && t === 1 ? S.focShock : 0)
      + fx("churn", t) * (fx("churn", t) < 0 ? d * lag : 1)
      - (L.ttt && t >= 2 ? 0.005 : 0)
      + (down ? 0.02 : 0);
    const add = t <= 2 ? cleanupAdd : 0;
    const newBiz = newBiz0 / (1 - B.discount) * (1 - disc) * vol * roadmapFactor * (1 + fx("newBiz", t) * d * lag) * (down ? 0.7 : 1);
    const kept = R * (1 - churn) * (1 + u);
    const Rn = kept + add + newBiz;
    const cust = B.customers * (Rn / B.recurring);
    const aiTake = attach * readiness * aiRamp[t] * priceFactor * (down ? 0.5 : 1);
    const ai = cust * aiTake * L.aiprice;

    let psFte = B.ps.fte + L.psfte - (burnout && t >= 2 ? 1 : 0);
    const util = B.ps.util + (utilT - B.ps.util) * r;
    const foc = B.ps.foc + (focT - B.ps.foc) * r;
    const capacity = psFte * B.ps.days * util * (1 - foc);
    const demand = billable0 * (1 + B.ps.demandGrowth * t) * (0.7 + 0.3 * newBiz / newBiz0) * rateDemand * (1 + fx("psDemand", t)) * (down ? 0.9 : 1);
    const billable = Math.min(capacity, demand);
    const ps = billable * B.ps.rate * (1 + rateChg);
    const psCost = psFte * B.ps.cost * f + (t === 1 ? Math.max(0, L.psfte) * 12 + Math.max(0, -L.psfte) * 15 : 0) + (burnout && t === 2 ? 20 : 0);

    const supFte = Math.max(1, B.support.fte * (1 - ticketCut * 0.8 * r) + fx("supFte", t) * d * lag);
    const rndFte = B.rnd.fte - L.rndcut * r + fx("rndFte", t) * (fx("rndFte", t) < 0 ? d * lag : 1);
    const hostC = B.hosting * Math.max(0.2, 1 - host * r + fx("hosting", t) * d * lag) * f;
    const roy = L.report && B.royalties > 0 ? (t === 1 ? B.royalties * f : B.royaltiesAfter) : B.royalties * f;
    const oneoff = t === 1 ? (L.ttt ? 30 : 0) + L.host * 2 + (L.report && B.royalties > 0 ? B.reportMigration : 0) : 0;
    const initOneoff = inits.reduce((a, i) => a + ((i.oneoff || [0, 0, 0])[t - 1] || 0), 0);
    const run = fx("run", t) * f + (defl > 0 ? 45 : 0);
    const nrr = (kept + add + (ai - aiPrev)) / (R + aiPrev);

    yrs.push(pl({ rec: Rn, ai, ps, other: B.other * f,
      psC: psCost, supC: supFte * B.support.cost * f, rndC: rndFte * B.rnd.cost * f,
      sm: B.sm * f * (1 + fx("sm", t) * d), ga: B.ga * f * (1 + fx("ga", t) * d * lag), host: hostC, roy,
      aiC: ai * 0.25, run, oneoff: oneoff + initOneoff, churn, nrr, newBiz, cust, utilReal: billable / (psFte * B.ps.days * (1 - foc)),
      foc, psFte, supFte, rndFte, fte: psFte + supFte + rndFte + otherFte, idle: Math.max(0, capacity - demand), aiTake }));
    R = Rn; aiPrev = ai;
  }
  for (let i = 1; i < yrs.length; i++) yrs[i].growth = yrs[i].rev / yrs[i - 1].rev - 1;
  return { yrs, roadmap, readiness, ticketCut, aiFromRoadmap, cutFromRoadmap, used, delivery: d, burnout, priceFactor };

  function pl(o) {
    o.rev = o.rec + o.ai + o.ps + o.other;
    o.cost = o.psC + o.supC + o.rndC + o.sm + o.ga + o.host + o.roy + o.aiC + o.run + o.oneoff;
    o.ebitda = o.rev - o.cost; o.margin = o.ebitda / o.rev;
    o.recShare = (o.rec + o.ai) / o.rev; o.aiShare = o.ai / o.rev; o.grr = 1 - o.churn;
    return o;
  }
};

MDS.people = (sc, L, m) => {
  const P = sc.people, D = MDS.defaults(sc);
  const maxChurn = Math.max(...m.yrs.slice(1).map(y => y.churn));
  let founder = P.founder - (L.pet ? (L.aife >= 3 ? 8 : 22) : 0) - Math.max(0, L.uplift - 6) * 2.5
    - L.cleanup * 0.12 - (L.rndcut > 2 ? 10 : 0) - Math.max(0, -L.psfte) * 1.5 + (L.attach > 0 && L.aife >= 3 ? 5 : 0)
    - (m.used > MDS.BUDGET ? 8 : 0);
  let team = P.team - (L.util > 82 ? 22 : L.util > 78 ? 8 : 0) - L.rndcut * 3 - Math.max(0, -L.psfte) * 4
    - (L.defl > 0 && !L.ttt ? 6 : 0) + (L.aife > 0 ? 5 : 0) + (L.pet ? 3 : 0) - (L.disc < D.disc - 7 ? 6 : 0);
  let cust = P.cust - Math.max(0, maxChurn - sc.base.churn) * 380 - (L.foc < D.foc - 8 ? 5 : 0) + (L.ttt ? 5 : 0)
    + (L.attach > 0 ? 3 : 0) - (L.rate > 10 ? 5 : 0);
  (sc.initiatives || []).forEach(i => { if (L["i_" + i.id] && i.people) { founder += i.people.founder || 0; team += i.people.team || 0; cust += i.people.cust || 0; } });
  const c = x => MDS.clamp(Math.round(x), 0, 100);
  return { founder: c(founder), team: c(team), cust: c(cust) };
};

MDS.targetChecks = (sc, m, p, relax) => sc.targets.map(t0 => {
  const ys = m.yrs.slice(1), y3 = m.yrs[3];
  const t = relax ? Object.assign({}, t0, { min: t0.type === "margin" ? t0.min - 0.08 : t0.type.startsWith("grr") ? t0.min - 0.02 : t0.type === "ai" ? t0.min / 2 : t0.type === "founder" ? t0.min - 5 : t0.min }) : t0;
  const r = (label, v, val) => ({ type: t.type, label, v, min: t.min, ok: v >= t.min - 1e-9, val });
  if (t.type === "margin") return r(`EBITDA margin in Year 3 ≥ ${MDS.pc(t.min, 0)}`, y3.margin, MDS.pc(y3.margin));
  if (t.type === "grrAll") { const v = Math.min(...ys.map(y => y.grr)); return r(`Gross retention ≥ ${MDS.pc(t.min, 0)} every year`, v, MDS.pc(v)); }
  if (t.type === "grr3") return r(`Gross retention in Year 3 ≥ ${MDS.pc(t.min, 0)}`, y3.grr, MDS.pc(y3.grr));
  if (t.type === "ai") return r(`AI revenue ≥ ${MDS.pc(t.min, 0)} of revenue in Year 3`, y3.aiShare, MDS.pc(y3.aiShare));
  if (t.type === "founder") return r(`${sc.people.founderLabel} trust ≥ ${t.min}`, p.founder, p.founder);
  return { type: t.type, label: t.type, v: 0, min: 1, ok: false, val: "" };
});

/* Credit for a target: full when met; otherwise the share of the gap from doing nothing that the plan closes. */
MDS.targetCredit = (t, b) => {
  if (t.ok) return 1;
  const base = b ? b.v : 0;
  if (t.min <= base) return 0;
  return MDS.clamp((t.v - base) / (t.min - base), 0, 1) * 0.8;
};

MDS.warnings = (sc, L, m, p) => {
  const w = [], y1 = m.yrs[1], y3 = m.yrs[3], D = MDS.defaults(sc), S = Object.assign({ upliftFree: 0.05 }, sc.base.sens || {});
  if (JSON.stringify(L) === JSON.stringify(D)) w.push(["r", "Doing nothing: costs inflate every year while churn eats recurring revenue. Pull some levers."]);
  if (m.used > MDS.BUDGET) w.push(["r", `You've committed ${m.used} change points against a capacity of ${MDS.BUDGET}. You're one person: everything slips, and benefits arrive at ${Math.round(m.delivery * 100)}% strength.`]);
  if (L.uplift / 100 > S.upliftFree + 0.03) w.push(["r", `A ${L.uplift}% uplift is well above what these customers tolerate. Churn rises to ${MDS.pc(y1.churn)}.`]);
  else if (L.uplift > 0 && L.uplift / 100 <= S.upliftFree) w.push(["g", `A ${L.uplift}% uplift is defensible. Tie it to the value delivered since the last rise.`]);
  if (L.cleanup >= 60 && L.uplift / 100 > S.upliftFree) w.push(["r", "Legacy clean-up on top of an above-tolerance uplift doubles the price shock for the same customers. Sequence them."]);
  if (L.disc < 15) w.push(["w", "A discount cap under 15% cuts win rates. Sales will fight it, and new business falls."]);
  if (m.burnout) w.push(["r", `A ${L.util}% utilisation target burns people out. You lose a consultant in Year 2 and pay to replace them.`]);
  if (y3.idle > 60) w.push(["w", `PS has about ${Math.round(y3.idle)} more billable days of capacity than customers will buy in Year 3. Achieved utilisation is ${MDS.pc(y3.utilReal, 0)}. Utilisation is a ratio: sell more days, or need fewer people.`]);
  if (L.foc < D.foc - 8) w.push(["w", "Cutting free days hard in Year 1 upsets customers used to them. Agree a write-off approval process instead of a ban."]);
  if (L.util < D.util - 4) w.push(["w", `Lowering the utilisation target to ${L.util}% means paying for more idle consultant time. What problem does that solve?`]);
  if (L.foc > D.foc + 3) w.push(["w", "You're giving away more free days than today. That's margin walking out of the door. What's it buying you?"]);
  if (L.rate > 5) w.push(["w", `A ${L.rate}% day-rate rise means customers buy fewer days.`]);
  if (L.defl > 0 && !L.ttt) w.push(["w", "AI deflection without fixing onboarding automates the symptom. Support staff will read it as a threat to their jobs."]);
  if (L.attach > 0 && m.readiness < 1) w.push(["r", `The AI tier needs engineers and delivery capacity. Readiness is only ${Math.round(m.readiness * 100)}%, so most AI revenue won't arrive.`]);
  if (m.priceFactor < 1) w.push(["w", "The AI tier is priced well above what customers see as its value, so take-up falls."]);
  if (L.attach > 25) w.push(["w", `${L.attach}% take-up is ambitious for a first AI add-on in a small vendor.`]);
  if (m.aiFromRoadmap > 0 || m.cutFromRoadmap > 0) w.push(["w", `Roadmap capacity falls to ${m.roadmap} FTE, so new business slows. Customers notice when promised features slip.`]);
  if (sc.base.rnd.petFte) {
    if (L.pet && L.aife >= 3) w.push(["g", `Stopping ${sc.base.rnd.petName} and moving the team onto AI gives the founder a new story to own.`]);
    else if (L.pet) w.push(["w", `Stopping ${sc.base.rnd.petName} with nothing to replace it reads as a cut. Expect the founder to go around you.`]);
  }
  if (L.rndcut > 3) w.push(["w", "Losing more than 3 R&D roles through attrition takes 12–18 months, and your best people tend to leave first."]);
  if (L.psfte < -2) w.push(["w", "Cutting more than 2 PS roles in a small team leaves you with no cover for holidays or leavers."]);
  (sc.initiatives || []).forEach(i => { if (L["i_" + i.id] && i.warn) w.push([i.warnLevel || "w", i.warn]); });
  const grrT = sc.targets.find(t => t.type === "grrAll" || t.type === "grr3");
  if (grrT && Math.min(...m.yrs.slice(1).map(y => y.grr)) < grrT.min - 0.02) w.push(["r", "Gross retention drops well below target. In a buy-and-hold model, lost customers don't come back."]);
  if (p.founder < 45) w.push(["r", `${sc.people.founderLabel} trust is below 45. In a decentralised model the GM runs the P&L. Lose them and the plan stalls.`]);
  if (y1.ebitda < m.yrs[0].ebitda - 250) w.push(["w", "Year 1 profit dips sharply from one-off costs. Make sure the Portfolio Manager is told in advance, not surprised."]);
  return w;
};

/* Plan score out of 100: base targets 40, downside resilience 20, people 20, realism 20. */
MDS.labScore = (sc, L) => {
  const D = MDS.defaults(sc);
  const m = MDS.model(sc, L), p = MDS.people(sc, L, m);
  const md = MDS.model(sc, L, { downside: true }), pd = MDS.people(sc, L, md);
  const mb = MDS.model(sc, D), pb = MDS.people(sc, D, mb), mbd = MDS.model(sc, D, { downside: true }), pbd = MDS.people(sc, D, mbd);
  const tb = MDS.targetChecks(sc, m, p), td = MDS.targetChecks(sc, md, pd, true);
  const bb = MDS.targetChecks(sc, mb, pb), bd = MDS.targetChecks(sc, mbd, pbd, true);
  const credit = (ts, bs) => ts.reduce((a, t, i) => a + MDS.targetCredit(t, bs[i]), 0) / ts.length;
  const base = 40 * credit(tb, bb);
  const downside = 20 * credit(td, bd);
  const avg = (p.founder + p.team + p.cust) / 3;
  const ppl = MDS.clamp((avg - 40) / 35 * 20, 0, 20);
  const w = MDS.warnings(sc, L, m, p);
  const idle = m.used === 0;
  const real = idle ? 0 : MDS.clamp(20 - 5 * w.filter(x => x[0] === "r").length - 1 * w.filter(x => x[0] === "w").length, 0, 20);
  const pplS = idle ? Math.min(ppl, 5) : ppl;
  return { total: Math.round(base + downside + pplS + real), base, downside, ppl: pplS, real, m, md, p, tb, td, w };
};
