/* Model builder: a named-row financial model. Every cell is a number or formula; scenarios override cells. */
MDS.modelTemplate = () => {
  const R = (id, label, unit, group, cells, tag) => ({ id, label, unit, group, cells, tag });
  const f3 = (y0, f) => [y0, f, f, f];
  return [
    R("uplift", "Annual price uplift", "%", "Assumptions", ["0", "0%", "0%", "0%"], "uplift"),
    R("churn", "Gross churn", "%", "Assumptions", f3("act_churn", "act_churn"), "churn"),
    R("newbiz", "New recurring revenue won", "£k", "Assumptions", f3("act_newbiz", "prev(newbiz)"), "newbiz"),
    R("cleanup", "Legacy price clean-up (ARR added)", "£k", "Assumptions", ["0", "0", "0", "0"], "cleanup"),
    R("ai_rev", "AI tier revenue", "£k", "Assumptions", ["0", "0", "0", "0"], "ai"),
    R("ps_fte", "PS consultants", "FTE", "Assumptions", f3("act_ps_fte", "prev(ps_fte)"), "psfte"),
    R("util", "PS utilisation (delivered ÷ available)", "%", "Assumptions", f3("act_util", "prev(util)"), "util"),
    R("foc", "Free-of-charge share of delivered days", "%", "Assumptions", f3("act_foc", "prev(foc)"), "foc"),
    R("day_rate", "PS day rate", "£k", "Assumptions", f3("act_day_rate", "prev(day_rate)"), "rate"),
    R("sup_fte", "Support FTE", "FTE", "Assumptions", f3("act_sup_fte", "prev(sup_fte)"), "supfte"),
    R("rnd_fte", "R&D FTE", "FTE", "Assumptions", f3("act_rnd_fte", "prev(rnd_fte)"), "rndfte"),
    R("infl", "Cost inflation", "%", "Assumptions", ["0", "act_infl", "act_infl", "act_infl"], "infl"),
    R("cost_index", "Cost index", "x", "Assumptions", f3("1", "prev(cost_index)*(1+infl)")),
    R("savings", "Other cost savings", "£k", "Assumptions", ["0", "0", "0", "0"], "savings"),
    R("one_off", "One-off change costs", "£k", "Assumptions", ["0", "0", "0", "0"], "oneoff"),
    R("recurring", "Recurring revenue", "£k", "Revenue", f3("act_recurring", "prev(recurring)*(1-churn)*(1+uplift)+newbiz+cleanup")),
    R("ps_rev", "Professional services revenue", "£k", "Revenue", f3("ps_fte*act_ps_days*util*(1-foc)*day_rate", "ps_fte*act_ps_days*util*(1-foc)*day_rate")),
    R("other_rev", "Other revenue", "£k", "Revenue", f3("act_other", "prev(other_rev)*(1+infl)")),
    R("revenue", "Total revenue", "£k", "Revenue", f3("recurring+ai_rev+ps_rev+other_rev", "recurring+ai_rev+ps_rev+other_rev")),
    R("ps_cost", "PS delivery cost", "£k", "Costs", f3("ps_fte*act_ps_cost_fte*cost_index", "ps_fte*act_ps_cost_fte*cost_index")),
    R("sup_cost", "Support cost", "£k", "Costs", f3("sup_fte*act_sup_cost_fte*cost_index", "sup_fte*act_sup_cost_fte*cost_index")),
    R("rnd_cost", "R&D cost", "£k", "Costs", f3("rnd_fte*act_rnd_cost_fte*cost_index", "rnd_fte*act_rnd_cost_fte*cost_index")),
    R("sm_cost", "Sales and marketing", "£k", "Costs", f3("act_sm*cost_index", "act_sm*cost_index")),
    R("ga_cost", "G&A", "£k", "Costs", f3("act_ga*cost_index", "act_ga*cost_index")),
    R("hosting", "Hosting", "£k", "Costs", f3("act_hosting*cost_index", "act_hosting*cost_index")),
    R("royalties", "Third-party royalties", "£k", "Costs", f3("act_royalties*cost_index", "act_royalties*cost_index")),
    R("ai_cost", "AI inference (25% of AI revenue)", "£k", "Costs", f3("ai_rev*25%", "ai_rev*25%")),
    R("total_cost", "Total operating cost", "£k", "Costs", f3("ps_cost+sup_cost+rnd_cost+sm_cost+ga_cost+hosting+royalties+ai_cost-savings", "ps_cost+sup_cost+rnd_cost+sm_cost+ga_cost+hosting+royalties+ai_cost-savings")),
    R("ebitda", "EBITDA", "£k", "Outputs", f3("revenue-total_cost-one_off", "revenue-total_cost-one_off")),
    R("margin", "EBITDA margin", "%", "Outputs", f3("ebitda/revenue", "ebitda/revenue")),
    R("grr", "Gross retention", "%", "Outputs", f3("1-churn", "1-churn")),
    R("growth", "Revenue growth", "%", "Outputs", ["0", "revenue/prev(revenue)-1", "revenue/prev(revenue)-1", "revenue/prev(revenue)-1"]),
    R("ai_share", "AI share of revenue", "%", "Outputs", f3("ai_rev/revenue", "ai_rev/revenue")),
    R("rule40", "Rule of 40", "#", "Outputs", ["0", "(growth+margin)*100", "(growth+margin)*100", "(growth+margin)*100"])
  ];
};

MDS.evalModel = (rows, acts, overrides = {}) => {
  const byId = Object.fromEntries(rows.map(r => [r.id, r]));
  const memo = {}, errs = {}, visiting = new Set();
  const cellSrc = (id, t) => overrides[id + ":" + t] != null ? overrides[id + ":" + t] : byId[id].cells[t];
  const get = (id, t) => {
    const key = id + ":" + t;
    if (key in memo) return memo[key];
    if (!byId[id]) { if (id in acts) return acts[id]; if (id === "t" || id === "year") return t; throw Error(`Unknown name "${id}"`); }
    if (t < 0) throw Error(`prev(${id}) has no year before Year 0`);
    if (visiting.has(key)) throw Error(`Circular reference via ${id}`);
    visiting.add(key);
    try {
      const c = MDS.expr.compile(cellSrc(id, t));
      if (c.err) throw Error(c.err);
      const v = MDS.expr.evaluate(c.ast, { get: n => get(n, t), prev: n => get(n, t - 1) });
      if (!isFinite(v)) throw Error("Not a number");
      memo[key] = v; return v;
    } finally { visiting.delete(key); }
  };
  const vals = {};
  rows.forEach(r => { vals[r.id] = [0, 1, 2, 3].map(t => { try { return get(r.id, t); } catch (e) { errs[r.id + ":" + t] = e.message; return NaN; } }); });
  return { vals, errs };
};

MDS.modelChecks = (sc, M, acts) => {
  const base = MDS.evalModel(M.rows, acts);
  const V = base.vals, tag = t => M.rows.find(r => r.tag === t), val = (t, y) => { const r = tag(t); return r ? V[r.id][y] : null; };
  const S = Object.assign({ upliftFree: 0.05, upliftChurn: 0.45, aiPriceRef: 3 }, sc.base.sens || {}), B = sc.base;
  const out = { tie: [], structure: [], reality: [], targets: [] };
  // tie-out
  const tieRow = (id, act, label) => {
    if (!V[id]) return out.tie.push(["r", `No row with name "${id}". The Portfolio Manager will look for ${label}.`]);
    const v = V[id][0], ok = Math.abs(v - act) <= Math.abs(act) * 0.01 + 1;
    out.tie.push([ok ? "g" : "r", ok ? `${label} Year 0 ties to actuals (${MDS.k(v)}).` : `${label} Year 0 is ${MDS.k(v)} but actuals say ${MDS.k(act)}. A model that doesn't tie to last year won't be trusted.`]);
  };
  tieRow("revenue", acts.act_revenue, "Revenue"); tieRow("ebitda", acts.act_ebitda, "EBITDA");
  const nErr = Object.keys(base.errs).length;
  if (nErr) out.tie.push(["r", `${nErr} cell${nErr > 1 ? "s" : ""} in error, e.g. ${Object.entries(base.errs)[0].join(": ")}.`]);
  // structure
  let fCells = 0, all = 0;
  M.rows.forEach(r => [1, 2, 3].forEach(t => { all++; if (!MDS.expr.isNumber(r.cells[t])) fCells++; }));
  const fShare = all ? fCells / all : 0;
  out.structure.push([fShare >= 0.7 ? "g" : "w", `${Math.round(fShare * 100)}% of forecast cells are formulas. ${fShare >= 0.7 ? "Driver-based: easy to flex." : "Too many hard-coded numbers. Drive the forecast from assumptions so it can be flexed."}`]);
  const scen = Object.entries(M.scen || {}).filter(([k, o]) => k !== "Base" && Object.keys(o).length >= 2);
  out.structure.push([scen.length ? "g" : "w", scen.length ? `Scenarios: ${scen.map(s => s[0]).join(", ")}.` : "No alternative scenario with at least 2 changed assumptions. Every plan needs a downside."]);
  // reality checks (evidence based)
  const up = [1, 2, 3].map(y => val("uplift", y) || 0), ch = [1, 2, 3].map(y => val("churn", y));
  if (tag("uplift") && tag("churn")) {
    const maxUp = Math.max(...up);
    if (maxUp > S.upliftFree + 0.005 && Math.max(...ch) <= B.churn + 0.002) out.reality.push(["r", `You raise prices by up to ${MDS.pc(maxUp)} (customers here tolerate about ${MDS.pc(S.upliftFree, 0)}) without any churn response. Price rises above tolerance cost customers.`]);
    else if (maxUp > 0) out.reality.push(["g", "Price assumptions sit within what this customer base tolerates, or carry a churn response."]);
  }
  if (tag("churn") && Math.min(...ch) < B.churn - 0.035) out.reality.push(["w", `Churn falls to ${MDS.pc(Math.min(...ch))} from ${MDS.pc(B.churn)}. Which initiative delivers that? Last year's exit reasons in the data room should back it up.`]);
  if (tag("util")) {
    const u1 = val("util", 1), u3 = Math.max(...[1, 2, 3].map(y => val("util", y)));
    if (u1 > B.ps.util + 0.10) out.reality.push(["w", `Utilisation jumps ${Math.round((u1 - B.ps.util) * 100)} points in Year 1. Behaviour change takes time: about half the gain in Year 1 is typical.`]);
    if (u3 > 0.82) out.reality.push(["r", `Utilisation of ${MDS.pc(u3, 0)} burns people out. Above about 80% you lose consultants.`]);
  }
  if (V.ps_rev) {
    const days0 = V.ps_rev[0] / (val("rate", 0) || B.ps.rate), days3 = V.ps_rev[3] / (val("rate", 3) || B.ps.rate);
    if (days3 > days0 * 1.25) out.reality.push(["r", `Your model bills ${Math.round((days3 / days0 - 1) * 100)}% more PS days in Year 3 than last year. Customers have to buy those days. Where does the demand come from? Higher utilisation should usually mean fewer consultants, not more billing.`]);
  }
  if (tag("ai")) {
    const ai3 = val("ai", 3) || 0, implied = ai3 / (B.customers * S.aiPriceRef);
    if (implied > 0.3) out.reality.push(["r", `AI revenue of ${MDS.k(ai3)} implies about ${Math.round(implied * 100)}% of customers paying a typical AI price. That's ambitious for a first add-on. Build it from customers × take-up × price.`]);
    if (ai3 > 0 && val("ai", 1) > ai3 * 0.5) out.reality.push(["w", "AI revenue arrives very fast. New products usually ramp over 2–3 years."]);
    if (ai3 > 0 && tag("rndfte") && Math.max(...[1, 2, 3].map(y => val("rndfte", y))) < B.rnd.fte && !(sc.base.rnd.petFte)) out.reality.push(["w", "You cut R&D while launching an AI product. Who builds it?"]);
  }
  if (tag("cleanup")) {
    const tot = [1, 2, 3].reduce((a, y) => a + (val("cleanup", y) || 0), 0), max = B.recurring * B.legacyShare * (1 / (1 - B.legacyGap) - 1);
    if (tot > max * 1.02) out.reality.push(["r", `Legacy clean-up adds ${MDS.k(tot)}, but moving every legacy customer to list is only worth about ${MDS.k(max)}.`]);
    if (tot > 0 && Math.max(...ch) <= B.churn + 0.002) out.reality.push(["w", "Legacy clean-up with no churn effect. Some customers facing a 30%+ rise will leave."]);
  }
  if (tag("infl") && Math.max(...[1, 2, 3].map(y => val("infl", y) || 0)) === 0) out.reality.push(["w", "No cost inflation. Salaries will rise."]);
  const changing = ["uplift", "cleanup", "ai", "savings"].some(t => tag(t) && [1, 2, 3].some(y => (val(t, y) || 0) > 0)) || (tag("util") && val("util", 3) > B.ps.util + 0.05);
  if (changing && (!tag("oneoff") || [1, 2, 3].every(y => !(val("oneoff", y) > 0)))) out.reality.push(["w", "Your plan changes the business but carries no one-off costs. Migrations, recruitment, severance and tooling aren't free."]);
  const tpl = MDS.modelTemplate();
  const untouched = tpl.every(t => { const r = M.rows.find(x => x.id === t.id); return r && r.cells.join("|") === t.cells.join("|"); }) && M.rows.length === tpl.length;
  if (untouched) out.reality = [["r", "This is the starting template, unchanged. It forecasts doing nothing. Put your plan into the assumptions."]];
  // Structural honesty: core assumptions must exist, and outputs must be plausible whatever rows drive them.
  const core = { uplift: "price uplift", churn: "churn", util: "PS utilisation", ai: "AI revenue", oneoff: "one-off costs" };
  Object.entries(core).forEach(([t, name]) => { if (!tag(t)) out.reality.push(["r", `The ${name} assumption row has been removed. The PM can't see how you got there, so put it back (the template has it).`]); });
  if (V.revenue && V.ebitda) {
    const cagr = Math.pow(V.revenue[3] / V.revenue[0], 1 / 3) - 1, m3 = V.ebitda[3] / V.revenue[3];
    if (cagr > 0.15) out.reality.push(["r", `Revenue grows ${MDS.pc(cagr, 0)} a year. For a mature vertical software business with no acquisitions in the plan, that needs extraordinary evidence.`]);
    if (m3 > 0.45) out.reality.push(["r", `A Year 3 EBITDA margin of ${MDS.pc(m3, 0)} is above what even best-in-class vertical software usually sustains. Check for missing costs.`]);
    const tagged = new Set(M.rows.filter(r => r.tag).map(r => r.id));
    const revIds = MDS.expr.compile(M.rows.find(r => r.id === "revenue").cells[3]).ast;
    const extra = revIds ? [...MDS.expr.ids(revIds)].filter(id => !["recurring", "ai_rev", "ps_rev", "other_rev"].includes(id) && !tagged.has(id) && M.rows.some(r => r.id === id)) : [];
    if (extra.length) out.reality.push(["r", `Revenue includes ${extra.join(", ")}, which isn't tied to an evidence-checked assumption. Explain where it comes from.`]);
  }
  if (!out.reality.length) out.reality.push(["g", "No evidence conflicts found in the tagged assumptions."]);
  // targets: recomputed by the checker from the model's own drivers, never read from output rows
  const yr = k => [0, 1, 2, 3].map(t => (V[k] ? V[k][t] : NaN));
  const rev = yr("revenue"), ebd = yr("ebitda"), churnR = tag("churn"), aiR = tag("ai");
  const margin = rev.map((r, t) => ebd[t] / r), grr = [0, 1, 2, 3].map(t => churnR ? 1 - V[churnR.id][t] : NaN), aiShare = rev.map((r, t) => aiR ? V[aiR.id][t] / r : 0);
  ["margin", "grr", "ai_share"].forEach(id => { const r = M.rows.find(x => x.id === id); if (r && [1, 2, 3].some(t => MDS.expr.isNumber(r.cells[t]))) out.reality.push(["r", `The ${r.label} row is typed in, not calculated. Outputs must come from the drivers.`]); });
  sc.targets.forEach(t => {
    if (t.type === "margin") out.targets.push([margin[3] >= t.min ? "g" : "r", `EBITDA margin Year 3 ${isFinite(margin[3]) ? MDS.pc(margin[3]) : "n/a"} vs target ${MDS.pc(t.min, 0)} (EBITDA ÷ revenue)`]);
    if (t.type === "grrAll" || t.type === "grr3") { const v = t.type === "grrAll" ? Math.min(grr[1], grr[2], grr[3]) : grr[3]; out.targets.push([v >= t.min - 1e-9 ? "g" : "r", `Gross retention ${t.type === "grrAll" ? "(lowest year)" : "Year 3"} ${isFinite(v) ? MDS.pc(v) : "n/a"} vs target ${MDS.pc(t.min, 0)} (1 − churn)`]); }
    if (t.type === "ai") out.targets.push([aiShare[3] >= t.min ? "g" : "r", `AI share Year 3 ${MDS.pc(aiShare[3] || 0)} vs target ${MDS.pc(t.min, 0)} (AI revenue ÷ revenue)`]);
  });
  const pts = (arr, max, per) => Math.max(0, max - arr.filter(x => x[0] === "r").length * per - arr.filter(x => x[0] === "w").length * (per / 3));
  const share = out.targets.length ? out.targets.filter(x => x[0] === "g").length / out.targets.length : 0;
  const reds = out.reality.filter(x => x[0] === "r").length;
  if (reds && share > 0) out.targets.push(["w", "Targets reached on assumptions the evidence doesn't support count for less: fix the red flags first."]);
  out.score = Math.round(pts(out.tie, 15, 7.5) + pts(out.structure, 15, 7.5) + (untouched ? 0 : pts(out.reality, 25, 6) * (0.4 + 0.6 * share)) + share * 45 * (reds ? Math.max(0.2, 1 - 0.3 * reds) : 1));
  out.base = base;
  return out;
};

MDS.tests.model = (sc, el) => {
  const acts = MDS.data(sc).actuals;
  const store = MDS.state.models = MDS.state.models || {};
  let M = store[sc.id] || (store[sc.id] = { rows: MDS.modelTemplate(), scen: { Base: {}, Downside: {} }, active: "Base" });
  const save = () => { MDS.save(); };
  const fmt = (v, unit) => !isFinite(v) ? "#ERR" : unit === "%" ? (v * 100).toFixed(1) + "%" : unit === "£k" ? (Math.abs(v) < 10 && v !== 0 ? v.toFixed(2) : Math.round(v).toLocaleString("en-GB")) : unit === "x" ? v.toFixed(3) : (Math.round(v * 10) / 10).toLocaleString("en-GB");
  const groups = ["Assumptions", "Revenue", "Costs", "Outputs", "Other"];
  /* Spreadsheet round trip: tab-separated text pastes straight into cells. */
  el.addEventListener("click", e => {
    const b = e.target.closest("#xlA, #xlM, #xlChk"); if (!b) return;
    const T = MDS.modelTemplate();
    if (b.id === "xlChk") {
      const lines = MDS.$("#xlIn", el).value.split(/\n/).map(l => l.trim()).filter(Boolean), nums = l => (l.replace(/[£,]/g, "").match(/-?\d+(\.\d+)?/g) || []).map(Number).slice(-3);
      const find = re => lines.find(l => re.test(l)), rl = find(/rev/i) || lines[0], el2 = find(/ebitda|profit/i) || lines[1];
      const mine = [rl ? nums(rl) : [], el2 ? nums(el2) : []];
      if (mine[0].length < 3 || mine[1].length < 3) { MDS.$("#xlRes", el).innerHTML = `<span class="neg">I need two rows with three numbers each: Revenue and EBITDA for Years 1 to 3.</span>`; return; }
      const v = MDS.evalModel(T, acts).vals, want = [v.revenue.slice(1, 4), v.ebitda.slice(1, 4)], tol = [0.015, 0.04];
      let ok = 0; const cell = (r, i) => { const good = Math.abs(mine[r][i] - want[r][i]) <= Math.abs(want[r][i]) * tol[r] + 1; if (good) ok++; return `<td class="${good ? "pos" : "neg"}">${Math.round(mine[r][i]).toLocaleString("en-GB")}${good ? " ✓" : ` (model: ${Math.round(want[r][i]).toLocaleString("en-GB")})`}</td>`; };
      const html = `<div class="tblwrap"><table><thead><tr><th></th><th>Year 1</th><th>Year 2</th><th>Year 3</th></tr></thead><tbody>${["Revenue", "EBITDA"].map((n, r) => `<tr><td>${n}</td>${[0, 1, 2].map(i => cell(r, i)).join("")}</tr>`).join("")}</tbody></table></div>`;
      const score = Math.round(ok / 6 * 100); MDS.setScore(sc.id, "xl", score);
      MDS.$("#xlRes", el).innerHTML = html + `<p>${ok}/6 cells within tolerance (revenue 1.5%, EBITDA 4%). ${ok === 6 ? `<span class="pos">Your spreadsheet reproduces the do-nothing forecast.</span>` : "The usual causes: churn applied to the wrong base, cost inflation not compounding, or PS revenue missing the free-of-charge days."}</p>`;
      return;
    }
    const pc = id => ["churn", "util", "foc", "infl"].some(k => id.includes(k)) || id === "act_discount" || id.includes("share") || id.includes("gap");
    const text = b.id === "xlA" ? "Actual\tValue\n" + Object.entries(acts).map(([k, val]) => `${k}\t${pc(k) ? +(val * 100).toFixed(2) + "%" : +(+val).toFixed(2)}`).join("\n")
      : "Row\tName\tUnit\tLast year\tEach forecast year\n" + T.map(r => `${r.id}\t${r.label}\t${r.unit}\t${r.cells[0]}\t${r.cells[1]}`).join("\n");
    const out = MDS.$("#xlOut", el); out.hidden = false; out.value = text; out.focus(); out.select();
    const done = ok => MDS.toast(ok ? "Copied. Paste into cell A1 of your sheet." : "Select all the text in the box and copy it, then paste into cell A1.");
    try { navigator.clipboard.writeText(text).then(() => done(true), () => done(false)); } catch (err) { done(false); }
  });

  el.innerHTML = `<div class="stack">
    <div class="panel"><h2>Build the value-creation model</h2>
      <p class="dim small" style="margin:0">Every cell is a number or a formula. Reference rows by name (<code>recurring</code>), the year before with <code>prev(recurring)</code>, and actuals with <code>act_…</code>. Functions: <code>min max sum avg if round abs pow</code>. Percentages can be typed as <code>5%</code>. <span style="color:var(--acc)">Blue</span> = hard-coded input, black = formula. Click a cell to see and edit its formula.</p></div>
    <details class="panel" id="xl"><summary><strong>Prefer a real spreadsheet?</strong> <span class="small dim">Copy the data into Excel or Google Sheets, build the do-nothing forecast there, and paste your answer back to check it${MDS.getScore(sc.id, "xl") != null ? ` · best ${MDS.getScore(sc.id, "xl")}` : ""}</span></summary>
      <p class="small dim">In the job you'll build this in a spreadsheet, alone. The exercise: reproduce the three-year <strong>do-nothing</strong> forecast (no levers pulled) using last year's actuals and the model's rules. Copy each block, paste it into cell A1 of a sheet, and build from there.</p>
      <div class="row"><button class="btn sm" type="button" id="xlA">Copy last year's actuals</button><button class="btn sm ghost" type="button" id="xlM">Copy the model's rules</button></div>
      <textarea id="xlOut" rows="5" readonly hidden style="width:100%;margin-top:8px;font:12px var(--mono);padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--panel2);color:var(--ink)"></textarea>
      <label class="small" for="xlIn" style="display:block;margin-top:12px"><strong>Paste your result back:</strong> two rows from your sheet, Revenue then EBITDA, for Years 1 to 3 (in £k). Labels in the first column are fine.</label>
      <textarea id="xlIn" rows="3" placeholder="Revenue&#9;5400&#9;5450&#9;5500&#10;EBITDA&#9;700&#9;690&#9;680" style="width:100%;font:13px var(--mono);padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink)"></textarea>
      <div class="row" style="margin-top:8px"><button class="btn sm" type="button" id="xlChk">Check my forecast</button></div><div id="xlRes" class="small" style="margin-top:8px"></div></details>
    <div class="panel"><div class="row" style="justify-content:space-between">
      <div class="row"><strong class="small">Scenario</strong><span id="scTabs" class="row" style="gap:6px"></span><button class="btn sm ghost" id="addSc" type="button">+ Scenario</button></div>
      <div class="row"><button class="btn sm ghost" id="addRow" type="button">+ Row</button><button class="btn sm ghost" id="tmpl" type="button">Reset to template</button><button class="btn sm ghost" id="blank" type="button">Blank model</button><button class="btn sm ghost" id="csv" type="button">Copy as CSV</button></div></div>
      <div class="small dim" id="scNote" style="margin-top:6px"></div>
      <div class="tblwrap" style="margin-top:8px"><table id="mt"></table></div>
      <div class="small neg" id="errNote"></div></div>
    <div class="g2">
      <div class="panel"><h3>Scenario comparison (Year 3)</h3><div class="tblwrap"><table id="cmp"></table></div><div id="spark" style="margin-top:10px"></div></div>
      <div class="panel"><h3>Actuals you can reference</h3><div class="small" style="max-height:300px;overflow:auto">${Object.entries(acts).map(([k, v]) => `<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding:3px 0"><code>${k}</code><span class="num">${Math.abs(v) < 1 && v !== 0 ? MDS.pc(v) : (Math.round(v * 100) / 100).toLocaleString("en-GB")}</span></div>`).join("")}</div></div>
    </div>
    <div class="panel"><div class="row" style="justify-content:space-between"><div><h3>Review by the Portfolio Manager</h3><div class="small dim">Ties to actuals (15), structure and scenarios (15), evidence and realism (25, scaled by how many targets the plan reaches), targets in the base scenario (45).</div></div><button class="btn" id="review" type="button">Submit model for review</button></div><div id="rev"></div></div>
  </div>`;

  const overrides = () => M.active === "Base" ? {} : (M.scen[M.active] || {});
  const draw = () => {
    const ov = overrides(), res = MDS.evalModel(M.rows, acts, ov);
    MDS.$("#scTabs", el).innerHTML = Object.keys(M.scen).map(s => `<button type="button" class="btn sm ${s === M.active ? "" : "ghost"}" data-sc="${MDS.esc(s)}">${MDS.esc(s)}${s !== "Base" ? ` <span class="num" style="opacity:.7">${Object.keys(M.scen[s]).length}</span>` : ""}</button>`).join("");
    MDS.$("#scNote", el).textContent = M.active === "Base" ? "Editing the base model. Changes here flow into every scenario unless a scenario overrides that cell." : `Editing "${M.active}": cells you change here are overrides (marked ●) on top of the base model. Clear a cell to remove its override.`;
    let html = `<thead><tr><th>Name</th><th>Line</th><th>Unit</th><th>Year 0 (actual)</th><th>Year 1</th><th>Year 2</th><th>Year 3</th><th></th></tr></thead><tbody>`;
    groups.forEach(gp => {
      const rs = M.rows.filter(r => (groups.includes(r.group) ? r.group : "Other") === gp);
      if (!rs.length) return;
      html += `<tr class="sec"><td colspan="8">${gp}</td></tr>`;
      rs.forEach(r => {
        const idx = M.rows.indexOf(r);
        html += `<tr><td><code>${MDS.esc(r.id)}</code></td><td style="min-width:180px;text-align:left;font-family:var(--body)">${MDS.esc(r.label)}</td><td class="small">${MDS.esc(r.unit)}</td>` +
          [0, 1, 2, 3].map(t => {
            const key = r.id + ":" + t, src = ov[key] != null ? ov[key] : r.cells[t], isNum = MDS.expr.isNumber(src), err = res.errs[key];
            return `<td style="padding:2px 3px"><input data-cell="${idx}:${t}" value="${MDS.esc(err ? "#ERR" : fmt(res.vals[r.id][t], r.unit))}" title="${MDS.esc(err ? err : "=" + src)}" aria-label="${MDS.esc(r.label)} year ${t}"
              style="width:104px;text-align:right;font:13px var(--mono);padding:4px 6px;border:1px solid ${ov[key] != null ? "var(--warn)" : "var(--line)"};border-radius:4px;background:${err ? "color-mix(in srgb,var(--bad) 12%,var(--panel))" : "var(--panel)"};color:${isNum ? "var(--acc)" : "var(--ink)"};${r.group === "Outputs" || r.id === "ebitda" ? "font-weight:600" : ""}">${ov[key] != null ? '<span style="color:var(--warn)">●</span>' : ""}</td>`;
          }).join("") +
          `<td style="white-space:nowrap"><button class="icon" type="button" data-fill="${idx}" title="Copy Year 1 formula to Years 2 and 3" aria-label="Fill right">→</button><button class="icon" type="button" data-up="${idx}" aria-label="Move up">↑</button><button class="icon" type="button" data-del="${idx}" aria-label="Delete row">×</button></td></tr>`;
      });
    });
    MDS.$("#mt", el).innerHTML = html + "</tbody>";
    const ne = Object.keys(res.errs).length;
    MDS.$("#errNote", el).textContent = ne ? `${ne} cell(s) in error. Hover a #ERR cell to see why.` : "";
    // comparison
    const keyRows = ["revenue", "ebitda", "margin", "grr", "ai_share", "rule40"].filter(id => M.rows.some(r => r.id === id));
    const results = Object.keys(M.scen).map(s => [s, MDS.evalModel(M.rows, acts, s === "Base" ? {} : M.scen[s]).vals]);
    MDS.$("#cmp", el).innerHTML = `<thead><tr><th>Year 3</th>${results.map(([s]) => `<th>${MDS.esc(s)}</th>`).join("")}</tr></thead><tbody>${keyRows.map(id => { const r = M.rows.find(x => x.id === id); return `<tr><td>${MDS.esc(r.label)}</td>${results.map(([, v]) => `<td>${fmt(v[id][3], r.unit)}</td>`).join("")}</tr>`; }).join("")}</tbody>`;
    if (M.rows.some(r => r.id === "ebitda")) {
      const W = 420, H = 140, pad = 34, series = results.map(([s, v]) => [s, v.ebitda]);
      const all = series.flatMap(x => x[1]).filter(isFinite), mx = Math.max(...all, 1), mn = Math.min(...all, 0);
      const sx = t => pad + t * (W - pad - 10) / 3, sy = v => 10 + (H - 30) * (1 - (v - mn) / (mx - mn || 1));
      const cols = ["var(--acc)", "var(--bad)", "var(--good)", "var(--warn)", "var(--faint)"];
      MDS.$("#spark", el).innerHTML = `<div class="small dim">EBITDA by scenario (£k)</div><svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="EBITDA by scenario">
        <line x1="${pad}" x2="${W - 10}" y1="${sy(0)}" y2="${sy(0)}" stroke="var(--line)"/>
        ${[0, 1, 2, 3].map(t => `<text x="${sx(t)}" y="${H - 6}" text-anchor="middle">Y${t}</text>`).join("")}
        <text x="${pad - 4}" y="${sy(mx) + 4}" text-anchor="end">${Math.round(mx)}</text><text x="${pad - 4}" y="${sy(mn) + 4}" text-anchor="end">${Math.round(mn)}</text>
        ${series.map(([s, v], i) => `<polyline fill="none" stroke="${cols[i % 5]}" stroke-width="2" points="${v.map((y, t) => isFinite(y) ? `${sx(t)},${sy(y)}` : "").join(" ")}"/><text x="${W - 12}" y="${sy(v[3]) - 4}" text-anchor="end" style="fill:${cols[i % 5]}">${MDS.esc(s)}</text>`).join("")}</svg>`;
    }
  };

  el.addEventListener("focusin", e => {
    const c = e.target.dataset && e.target.dataset.cell; if (!c) return;
    const [i, t] = c.split(":").map(Number), r = M.rows[i], ov = overrides(), key = r.id + ":" + t;
    e.target.value = ov[key] != null ? ov[key] : r.cells[t]; e.target.select();
  });
  el.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.dataset && e.target.dataset.cell) e.target.blur(); });
  el.addEventListener("focusout", e => {
    const c = e.target.dataset && e.target.dataset.cell; if (!c) return;
    const [i, t] = c.split(":").map(Number), r = M.rows[i], key = r.id + ":" + t, v = e.target.value.trim().replace(/^=/, "");
    if (M.active === "Base") r.cells[t] = v === "" ? "0" : v;
    else { const o = M.scen[M.active]; if (v === "" || v === r.cells[t]) delete o[key]; else o[key] = v; }
    save();
    if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest("button") && el.contains(e.relatedTarget)) return;
    draw();
  });
  el.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.sc) { M.active = b.dataset.sc; save(); draw(); }
    else if (b.dataset.fill) { const r = M.rows[+b.dataset.fill]; if (M.active === "Base") { r.cells[2] = r.cells[1]; r.cells[3] = r.cells[1]; } else { const o = M.scen[M.active], k1 = o[r.id + ":1"]; if (k1 != null) { o[r.id + ":2"] = k1; o[r.id + ":3"] = k1; } } save(); draw(); }
    else if (b.dataset.up) { const i = +b.dataset.up; if (i > 0) [M.rows[i - 1], M.rows[i]] = [M.rows[i], M.rows[i - 1]]; save(); draw(); }
    else if (b.dataset.del) { const r = M.rows[+b.dataset.del]; const used = M.rows.filter(x => x !== r && x.cells.some(c => MDS.expr.compile(c).ast && MDS.expr.ids(MDS.expr.compile(c).ast).has(r.id))); if (used.length) { b.title = `Used by ${used.map(x => x.id).join(", ")}`; MDS.$("#errNote", el).textContent = `Can't delete "${r.id}": it's used by ${used.map(x => x.id).join(", ")}. Change those formulas first.`; return; } M.rows.splice(+b.dataset.del, 1); save(); draw(); }
    else if (b.id === "addRow" || b.id === "addSc") {
      const isRow = b.id === "addRow";
      const box = document.createElement("div"); box.className = "fb"; box.style.marginTop = "8px";
      box.innerHTML = isRow ? `<div class="row"><label class="small">Name <input id="nrId" placeholder="e.g. cs_cost" style="font:13px var(--mono);padding:5px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink);width:130px"></label>
        <label class="small">Line <input id="nrLabel" placeholder="Customer success cost" style="font:inherit;padding:5px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink);width:200px"></label>
        <label class="small">Unit <select id="nrUnit" style="font:inherit;padding:5px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink)"><option>£k</option><option>%</option><option>FTE</option><option>#</option><option>x</option></select></label>
        <label class="small">Section <select id="nrGroup" style="font:inherit;padding:5px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink)">${groups.map(gp => `<option>${gp}</option>`).join("")}</select></label>
        <label class="small">Assumption type <select id="nrTag" style="font:inherit;padding:5px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink)"><option value="">None</option><option value="oneoff">One-off cost</option><option value="savings">Cost saving</option></select></label>
        <button class="btn sm" type="button" id="nrOk">Add row</button></div><div class="small dim" id="nrErr"></div><div class="hint">Remember to reference the new row somewhere (e.g. add it into total_cost) or it won't affect EBITDA.</div>`
        : `<div class="row"><label class="small">Scenario name <input id="nsName" placeholder="Upside" style="font:inherit;padding:5px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink)"></label><button class="btn sm" type="button" id="nsOk">Create</button></div>`;
      b.closest(".panel").appendChild(box);
      if (isRow) MDS.$("#nrOk", el).onclick = () => {
        const id = MDS.$("#nrId", el).value.trim();
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(id) || M.rows.some(r => r.id === id) || id in acts) { MDS.$("#nrErr", el).textContent = "Use a unique name with letters, numbers and underscores, starting with a letter."; return; }
        M.rows.push({ id, label: MDS.$("#nrLabel", el).value || id, unit: MDS.$("#nrUnit", el).value, group: MDS.$("#nrGroup", el).value, tag: MDS.$("#nrTag", el).value || undefined, cells: ["0", "0", "0", "0"] }); save(); box.remove(); draw();
      };
      else MDS.$("#nsOk", el).onclick = () => { const n = MDS.$("#nsName", el).value.trim(); if (n && !M.scen[n]) { M.scen[n] = {}; M.active = n; save(); } box.remove(); draw(); };
    }
    else if (b.id === "tmpl" || b.id === "blank") {
      if (b.dataset.confirm !== "1") { b.dataset.confirm = "1"; const t = b.textContent; b.textContent = "Click again to confirm"; setTimeout(() => { b.dataset.confirm = ""; b.textContent = t; }, 2500); return; }
      M = store[sc.id] = b.id === "tmpl" ? { rows: MDS.modelTemplate(), scen: { Base: {}, Downside: {} }, active: "Base" }
        : { rows: [{ id: "revenue", label: "Total revenue", unit: "£k", group: "Outputs", cells: ["act_revenue", "0", "0", "0"] }, { id: "ebitda", label: "EBITDA", unit: "£k", group: "Outputs", cells: ["act_ebitda", "0", "0", "0"] }], scen: { Base: {} }, active: "Base" };
      save(); draw();
    }
    else if (b.id === "csv") {
      const res = MDS.evalModel(M.rows, acts, overrides());
      const csv = ["name,line,unit,Y0,Y1,Y2,Y3,Y0 formula,Y1 formula,Y2 formula,Y3 formula", ...M.rows.map(r => [r.id, `"${r.label}"`, r.unit, ...res.vals[r.id].map(v => isFinite(v) ? +v.toFixed(4) : "#ERR"), ...r.cells.map(c => `"${c}"`)].join(","))].join("\n");
      try { navigator.clipboard.writeText(csv).then(() => { b.textContent = "Copied"; setTimeout(() => { b.textContent = "Copy as CSV"; }, 1500); }, () => { b.textContent = "Copy failed"; }); } catch (err) { b.textContent = "Copy failed"; }
    }
    else if (b.id === "review") {
      const c = MDS.modelChecks(sc, M, acts);
      MDS.setScore(sc.id, "model", c.score);
      const [g, cls] = MDS.grade(c.score);
      const list = (t, arr) => `<h4 style="margin:14px 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--dim)">${t}</h4><ul class="warns">${arr.map(([k, m]) => `<li class="${k}">${MDS.esc(m)}</li>`).join("") || "<li>Nothing to check.</li>"}</ul>`;
      MDS.$("#rev", el).innerHTML = `<div class="row" style="margin-top:12px;gap:16px"><div class="bigscore">${c.score}</div><span class="pill ${cls === "pos" ? "ok" : "no"}">${g}</span></div>` +
        list("Ties to actuals", c.tie) + list("Structure and scenarios", c.structure) + list("Evidence and realism", c.reality) + list("Targets (base scenario)", c.targets) +
        `<p class="small dim">Reality checks look at rows tagged as assumptions (uplift, churn, utilisation, AI revenue, clean-up, one-off costs). Rename or delete those and the PM can't follow your logic.</p>`;
    }
  });
  draw();
};
