#!/usr/bin/env node
/* Open engagements: checks that the truth can be recovered from the files alone, the way a careful analyst would,
   and that sloppy work scores badly. Run: node tools/tests/engage.test.js */
const fs = require("fs"), vm = require("vm"), path = require("path");
const A = path.join(__dirname, "..", "..", "app") + "/";
const ctx = { localStorage: { getItem: () => null, setItem: () => {} }, console, Math, JSON, document: { createElement: () => ({}) } };
ctx.window = ctx; vm.createContext(ctx);
for (const f of ["js/core.js", "js/engage.js", "scenarios/engagements.js"]) vm.runInContext(fs.readFileSync(A + f, "utf8"), ctx);
const M = ctx.MDS, E = M.ENG;
let fails = 0; const check = (n, ok, x = "") => { console.log(`${ok ? "PASS" : "FAIL"}  ${n}${x ? "  " + x : ""}`); if (!ok) fails++; };
const MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const iso = d => { d = String(d || "").trim(); if (!d) return ""; let m;
  if ((m = d.match(/(\d{4})-(\d{2})-(\d{2})/))) return m[0];
  if ((m = d.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/))) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  if ((m = d.match(/(\d{1,2}) ([A-Za-z]{3}) (\d{4})/))) return `${m[3]}-${String(MON[m[2].toLowerCase()]).padStart(2, "0")}-${m[1].padStart(2, "0")}`; return ""; };
const norm = n => String(n).toUpperCase().replace(/LIMITED/g, "LTD").replace(/CO-OPERATIVE/g, "CO-OP").replace(/VETERINARY$/g, "VETS").replace(/ LTD$/, "").trim();

/* A careful analyst: works only from the files and the price list. */
const solve = (C, F, talk) => {
  const rows = M.csv.parse(M.csv.out(F.crm.rows)), H = rows[0], ix = n => H.indexOf(n), by = new Map();
  rows.slice(1).forEach(r => { const ref = String(r[ix("Ref")]).trim().toUpperCase(); if (!ref || by.has(ref)) return; by.set(ref, r); });
  const led = M.csv.parse(M.csv.out(F.ledger.rows)).slice(1), nameToRef = new Map([...by].map(([ref, r]) => [norm(r[ix("Customer")]), ref])), paid = new Map();
  led.forEach(r => { let ref = String(r[2]).trim().toUpperCase(); if (!ref) ref = nameToRef.get(norm(r[3])); const amt = M.num(r[4]); if (!ref || !isFinite(amt)) return; paid.set(ref, (paid.get(ref) || 0) + amt); });
  const cust = [...by].map(([ref, r]) => {
    const cur = r[ix("Currency")], notes = ix("Notes") >= 0 ? r[ix("Notes")] : "", cancel = iso(r[ix("Cancel date")]) || iso(notes);
    let price = M.num(r[ix("Annual price")]); const status = cancel ? "Cancelled" : r[ix("Status")];
    if (C.mess.crmStale && status === "Live" && paid.get(ref) > 0) price = paid.get(ref);
    return { ref, name: r[ix("Customer")], seg: r[ix("Segment")], plan: r[ix("Plan")], seats: +r[ix("Seats")], gbp: price * (cur === "EUR" ? E.rate : 1), start: iso(r[ix("Start date")]), status, cancel, rep: r[ix("Account owner")] };
  });
  const live = cust.filter(c => c.status === "Live"), sum = (a, f) => a.reduce((x, c) => x + f(c), 0);
  const lost = cust.filter(c => c.status === "Cancelled" && c.cancel >= E.winStart), opening = cust.filter(c => c.start < E.winStart && !(c.status === "Cancelled" && c.cancel < E.winStart));
  let foc;
  if (F.ps) { const p = M.csv.parse(M.csv.out(F.ps.rows)).slice(1); foc = p.reduce((a, r) => a + Math.max(0, r[4] - r[3]), 0) / p.reduce((a, r) => a + +r[4], 0) * 100; }
  else { const m = talk.ps.says.join(" ").match(/sold (\d+) days and delivered (\d+)/); foc = (m[2] - m[1]) / m[2] * 100; }
  const leg = live.filter(c => c.plan === "Legacy");
  return { nums: { live: live.length, arr: sum(live, c => c.gbp) / 1000, churn: sum(lost, c => c.gbp) / sum(opening, c => c.gbp) * 100, legacyShare: leg.length / live.length * 100, legacyGap: sum(leg, c => c.seats * C.perSeat.Standard - c.gbp) / 1000, foc },
    file: M.csv.out([["Ref", "Customer", "Annual price GBP", "Status"]].concat(cust.map(c => [c.ref, c.name, Math.round(c.gbp), c.status]))) };
};

for (const C of M.content.engagements) {
  let worst = 100, lazyMax = 0, rawFile = 0;
  for (let seed = 1; seed <= 12; seed++) {
    const G = M.engGen(C, seed * 7919), F = M.engFiles(C, G, seed * 7919), talk = M.engTalk(C, G), S0 = solve(C, F, talk);
    const got = ["crm", "ledger", "pricelist", "ps", "i_ps", "i_fin"];
    const memo = `We have ${S0.nums.live} live customers and recurring revenue of ${S0.nums.arr.toFixed(0)}k. Gross churn was ${S0.nums.churn.toFixed(1)} percent, concentrated in one segment. Legacy customers pay ${S0.nums.legacyGap.toFixed(0)}k below list. The CRM data had duplicate rows and stale statuses, so these figures rest on my cleaned file and the invoices. First I would recommend a phased legacy price migration, then scoping rules for fixed-price services, and a retention plan for the weakest segment, agreed with the founder before anything is announced to customers or staff.`;
    const good = M.engScore(C, G, { got, days: 1, answers: { nums: Object.fromEntries(Object.entries(S0.nums).map(([k, v]) => [k, v.toFixed(2)])), file: S0.file, issues: G.T.issues, memo } });
    worst = Math.min(worst, good.total);
    if (good.total < 95) console.log("   seed", seed, JSON.stringify(good.nums.filter(n => !n.ok).map(n => [n.k, +n.v.toFixed(2), +n.t.toFixed(2)])), good.file.checks.filter(c => !c[1]).map(c => c[0]));
    /* lazy: take the CRM at face value */
    const rows = F.crm.rows.slice(1).filter(r => r[0]), liveL = rows.filter(r => r[9] === "Live");
    const lazy = M.engScore(C, G, { got: ["crm"], days: 3, answers: { nums: { live: liveL.length, arr: liveL.reduce((a, r) => a + (M.num(r[6]) || 0), 0) / 1000, churn: Math.max(2, Math.round(G.T.churn) - 6) }, file: M.csv.out(F.crm.rows), issues: ["fx", "conc", "plus"], memo: "Pricing is fine and churn is low." } });
    lazyMax = Math.max(lazyMax, lazy.total); rawFile = Math.max(rawFile, lazy.file.ok);
  }
  check(`${C.level.padEnd(9)} ${C.name}: careful work recovers the truth from the files`, worst >= 95, `lowest score over 12 runs = ${worst}`);
  check(`${C.level.padEnd(9)} ${C.name}: taking the CRM at face value scores badly`, lazyMax <= 30 && rawFile <= (C.level === "easy" ? 2 : 1), `highest = ${lazyMax}, raw file passes ${rawFile}/4 checks`);
}
const G1 = M.engGen(M.content.engagements[2], 5), G2 = M.engGen(M.content.engagements[2], 6);
check("a new attempt generates different records", Math.abs(G1.T.arr - G2.T.arr) > 1);
const T = M.content.engagements.map(C => { const G = M.engGen(C, 4242); return `${C.level}: ${G.T.live} live, ARR £${G.T.arr.toFixed(0)}k, churn ${G.T.churn.toFixed(1)}%, legacy ${G.T.legacyShare.toFixed(0)}% (£${G.T.legacyGap.toFixed(0)}k), free days ${G.T.foc.toFixed(0)}%, top discount ${G.T.repDisc[0].disc.toFixed(0)}% vs ${G.T.repDisc[1].disc.toFixed(0)}%`; });
console.log(T.join("\n"));
process.exit(fails ? 1 : 0);
