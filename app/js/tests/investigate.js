/* Investigate: query the raw data room, save findings, answer diagnostic questions. */
MDS.investigationQs = sc => {
  const T = MDS.data(sc).tables, sum = (a, f) => a.reduce((x, y) => x + f(y), 0);
  const C = T.customers.rows, P = T.projects.rows, K = T.consultants.rows, S = T.suppliers.rows, X = T.churned.rows, R = T.rnd.rows;
  const D = sc.data, qs = [];
  const groupBy = (rows, key, f) => { const m = {}; rows.forEach(r => { (m[r[key]] = m[r[key]] || []).push(r); }); return Object.entries(m).map(([k, v]) => [k, f(v)]); };
  const top = arr => arr.sort((a, b) => b[1] - a[1])[0];
  const nonLegacy = C.filter(c => c.legacy === "No");
  const reps = groupBy(nonLegacy, "rep", v => sum(v, c => c.discount) / v.length);
  qs.push({ ds: "customers", hint: "Filter legacy pricing = No, group by Sold by, average Discount vs list.", q: "Excluding legacy-priced customers, which salesperson's customers have the highest average discount off list?", kind: "choice", options: reps.map(x => x[0]), ans: top(reps.slice())[0],
    explain: `Group customers (legacy = No) by "Sold by" and average the discount. ${reps.map(([k, v]) => `${k} ${MDS.pc(v)}`).join(", ")}. One person drives the leakage: fix it with approval rules, not a blanket cap.` });
  const legShare = sum(C.filter(c => c.legacy === "Yes"), c => c.arr) / sum(C, c => c.arr);
  qs.push({ ds: "customers", hint: "Group by Legacy pricing and sum ARR, then divide Yes by the total.", q: "What share of recurring revenue (ARR) comes from customers on legacy pricing?", kind: "num", unit: "%", ans: legShare * 100, abs: 1,
    explain: `Filter legacy = Yes and sum ARR, divide by total ARR: ${MDS.pc(legShare)}.` });
  const fx = p => p.pricing === "Fixed";
  const ov = rows => sum(rows, p => p.actual) / sum(rows, p => p.sold) - 1;
  const ovS = ov(P.filter(p => fx(p) && p.scoped_by === "Sales")), ovP = ov(P.filter(p => fx(p) && p.scoped_by === "PS"));
  qs.push({ ds: "projects", hint: "Filter Pricing = Fixed and Scoped by = Sales. Sum Days delivered and Days sold.", q: "For fixed-price projects scoped by Sales (without PS), what's the overall overrun: total days delivered ÷ total days sold − 1?", kind: "num", unit: "%", ans: ovS * 100, abs: 2,
    explain: `Sales-scoped: ${MDS.pc(ovS)}. PS-scoped: ${MDS.pc(ovP)}. The root cause of free days is who scopes the work, not how hard people work.` });
  const a = C.filter(c => c.onboarding === D.onboard.a), b = C.filter(c => c.onboarding === D.onboard.b);
  const ratio = (sum(a, c => c.howto) / a.length) / (sum(b, c => c.howto) / b.length);
  qs.push({ ds: "customers", hint: "Group by Onboarding and average How-to tickets.", q: `How many times more how-to tickets per customer do "${D.onboard.a}" customers raise compared with "${D.onboard.b}" customers?`, kind: "num", unit: "×", ans: ratio, abs: 0.15,
    explain: `Average how-to tickets per customer by onboarding: ${(sum(a, c => c.howto) / a.length).toFixed(1)} vs ${(sum(b, c => c.howto) / b.length).toFixed(1)} = ${ratio.toFixed(2)}×. Onboarding is the lever for support cost.` });
  const low = K.slice().sort((x, y) => x.utilisation - y.utilisation)[0];
  qs.push({ ds: "consultants", hint: "Sort by Utilisation, then look at their Presales days.", q: "Which consultant has the lowest utilisation?", kind: "choice", options: K.map(k => k.name), ans: low.name,
    explain: `${low.name} (${low.grade}) is at ${MDS.pc(low.utilisation)}, but logs ${low.presales} presales days. Senior people supporting sales, unrecorded in the utilisation target, isn't idleness. Ask before you judge.` });
  const t3 = C.slice().sort((x, y) => y.arr - x.arr).slice(0, 3);
  const t3s = sum(t3, c => c.arr) / sum(C, c => c.arr);
  qs.push({ ds: "customers", hint: "Sort ARR from high to low. Add up the top three and divide by total ARR.", q: "What share of ARR do the three largest customers account for?", kind: "num", unit: "%", ans: t3s * 100, abs: 0.6,
    explain: `${t3.map(c => c.name).join(", ")}: ${MDS.pc(t3s)}. Any of them leaving over a price change is a material event.` });
  const upl = S.map(s => [s.supplier, s.annual * (parseFloat(s.uplift) / 100 || 0)]).filter(x => x[1] > 0);
  const u = top(upl.slice());
  qs.push({ ds: "suppliers", hint: "Add a calculated column (annual × uplift %) for contracts with a % uplift.", q: "Which supplier contract adds the most cost at its next renewal (annual cost × renewal uplift %)?", kind: "choice", options: S.map(s => s.supplier), ans: u[0],
    explain: `${u[0]}: about ${MDS.k(u[1])} a year more. Check its notice period: miss it and you're locked in.` });
  const months = groupBy(C, "renewal", v => sum(v, c => c.arr));
  const pm = top(months.slice());
  qs.push({ ds: "customers", hint: "Group by Renewal month and sum ARR.", q: "Which month has the most ARR coming up for renewal?", kind: "choice", options: MDS.MONTHS.slice(), ans: pm[0],
    explain: `${pm[0]} carries ${MDS.k(pm[1])} (${MDS.pc(pm[1] / sum(C, c => c.arr), 0)} of ARR). Price-change letters must land well before then, so this sets your pricing timetable.` });
  const rs = groupBy(X, "reason", v => sum(v, c => c.arr_lost));
  const tr = top(rs.slice());
  qs.push({ ds: "churned", hint: "Group by Exit reason and sum ARR lost.", q: "Measured by ARR lost, what's the most common exit reason among last year's churned customers?", kind: "choice", options: rs.map(x => x[0]), ans: tr[0],
    explain: `${tr[0]}: ${MDS.k(tr[1])} of ${MDS.k(sum(X, c => c.arr_lost))} lost. ${rs.length > 2 ? "Price is rarely the main reason, which matters for your uplift plan." : ""}` });
  const waste = R.filter(e => e.type !== "Legacy" && e.contracted === 0 && e.requests < 5);
  qs.push({ ds: "rnd", hint: "Filter Type ≠ Legacy, Contracted revenue = 0, Customer requests < 5. Sum FTE.", q: "How many R&D FTE work on non-legacy workstreams with no contracted revenue and fewer than 5 customer requests?", kind: "num", unit: "FTE", ans: sum(waste, e => e.fte), abs: 0.01,
    explain: `${waste.map(e => `${e.epic} (${e.fte})`).join(", ")}. That's your redeployable capacity, if you can make the case.` });
  const focs = sum(P, p => p.foc) / sum(P, p => p.actual);
  qs.push({ ds: "projects", hint: "Sum Free days and Days delivered across all projects.", q: "Free days as a share of all PS days delivered last year?", kind: "num", unit: "%", ans: focs * 100, abs: 0.8,
    explain: `Total free days ÷ total delivered days = ${MDS.pc(focs)}.` });
  const lowUse = sum(S.filter(s => s.usage === "Low"), s => s.annual);
  qs.push({ ds: "suppliers", hint: "Filter Usage = Low and sum Annual £k.", q: "How much annual supplier spend (£k) is on contracts flagged as low usage?", kind: "num", unit: "£k", ans: lowUse, abs: 1,
    explain: `Filter usage = Low and sum: ${MDS.k(lowUse)}. Not all of it is removable, but each one needs an owner and a decision before its notice date.` });
  return qs;
};

MDS.tests.investigate = (sc, el) => {
  const data = MDS.data(sc), T = data.tables;
  const st = MDS.state.inv = MDS.state.inv || {};
  const nb = (MDS.state.findings = MDS.state.findings || {})[sc.id] = (MDS.state.findings[sc.id] || []);
  let ds = "customers", q = null;
  const fresh = () => ({ filters: [], calcs: [], group: "", measures: [["count", ""]], sort: null });
  const views = {}; Object.keys(T).forEach(k => { views[k] = fresh(); });
  const OPS = ["=", "≠", ">", "≥", "<", "≤", "contains"];
  const AGG = ["count", "sum", "avg", "min", "max"];

  const targets = MDS.targetChecks(sc, MDS.model(sc, MDS.defaults(sc)), MDS.people(sc, MDS.defaults(sc), MDS.model(sc, MDS.defaults(sc))));
  el.innerHTML = `<div class="invg">
    <div class="stack" style="min-width:0">
      <div class="panel"><h2>Investigate the data room</h2><p class="dim small" style="margin:0">Filter, calculate, group and chart any dataset. The questions stay pinned beside you, and your answers are kept if you switch tabs. Save what matters to your findings notebook, which also appears in <strong>Brief &amp; notes</strong>.</p></div>
      <div class="row" id="dsTabs" role="tablist"></div>
      <div class="panel" id="dsDesc"></div>
      <div class="panel stack" id="qb"></div>
      <div class="panel"><div class="row" style="justify-content:space-between"><h3 id="resTitle">Results</h3><div class="row"><button class="btn sm ghost" id="copyCsv" type="button">Copy as CSV</button><button class="btn sm" id="saveFind" type="button">Save as finding</button></div></div>
        <div id="chartBox"></div><div class="tblwrap" style="max-height:520px;overflow:auto"><table id="res"></table></div><div class="small faint" id="resNote"></div></div>
      <div class="panel"><h3>Findings notebook</h3><div id="nb" class="stack"></div></div>
    </div>
    <aside class="qside">
      <div class="panel qpanel">
        <div class="eyebrow">The goal</div>
        <ul class="goal">${targets.map(t => `<li>${MDS.esc(t.label)}</li>`).join("")}</ul>
        <div class="row" style="justify-content:space-between;margin-top:10px"><h3 style="margin:0">Diagnostic questions</h3><span class="small faint num" id="qprog"></span></div>
        <p class="small dim" style="margin:4px 0 8px">What a Portfolio Manager would ask in week two. "Where to look" jumps to the right data, for partial credit.</p>
        <div id="iq" class="iq"></div>
        <div class="row" style="margin-top:10px"><button class="btn" id="checkQ" type="button">Check answers</button><button class="btn ghost sm" id="clearQ" type="button">Clear</button></div><div id="iqRes"></div>
      </div>
    </aside>
  </div>`;

  const cols = () => T[ds].cols.map(c => ({ key: c[0], label: c[1], type: c[2] })).concat(views[ds].calcs.map(c => ({ key: c.name, label: c.name, type: "num", calc: c.f })));
  const numCols = () => cols().filter(c => c.type !== "text");

  const rowsWithCalcs = () => {
    const v = views[ds];
    return T[ds].rows.map(r0 => {
      const r = Object.assign({}, r0);
      v.calcs.forEach(c => {
        const comp = MDS.expr.compile(c.f);
        if (comp.err) { r[c.name] = null; return; }
        try { r[c.name] = MDS.expr.evaluate(comp.ast, { get: n => { if (!(n in r)) throw Error(`No column "${n}"`); const x = r[n]; return typeof x === "number" ? x : x === "Yes" ? 1 : x === "No" ? 0 : NaN; }, prev: () => NaN }); }
        catch (e) { r[c.name] = null; }
      });
      return r;
    });
  };
  const passes = (r, f) => {
    const x = r[f.col], c = cols().find(c => c.key === f.col);
    const raw = String(f.val).trim(); if (raw === "" && f.op !== "=") return true;
    let y = raw;
    if (c && c.type !== "text") { y = parseFloat(raw.replace("%", "")); if (c.type === "pct" && /%/.test(raw)) y /= 100; }
    switch (f.op) {
      case "=": return c && c.type !== "text" ? x === y || Math.abs(x - y) < 1e-9 : String(x).toLowerCase() === raw.toLowerCase();
      case "≠": return c && c.type !== "text" ? x !== y : String(x).toLowerCase() !== raw.toLowerCase();
      case ">": return x > y; case "≥": return x >= y; case "<": return x < y; case "≤": return x <= y;
      case "contains": return String(x).toLowerCase().includes(raw.toLowerCase());
    }
    return true;
  };
  const run = () => {
    const v = views[ds];
    let rows = rowsWithCalcs().filter(r => v.filters.every(f => passes(r, f)));
    let outCols, outRows;
    if (v.group) {
      const m = new Map();
      rows.forEach(r => { const k = r[v.group]; if (!m.has(k)) m.set(k, []); m.get(k).push(r); });
      outCols = [{ key: v.group, label: cols().find(c => c.key === v.group).label, type: cols().find(c => c.key === v.group).type }].concat(v.measures.map(([a, c]) => {
        const cc = cols().find(x => x.key === c);
        return { key: a + ":" + c, label: a === "count" ? "Count" : `${a} of ${cc ? cc.label : c}`, type: a === "count" ? "int" : cc ? cc.type : "num" };
      }));
      outRows = [...m.entries()].map(([k, grp]) => {
        const o = { [v.group]: k };
        v.measures.forEach(([a, c]) => {
          const vals = grp.map(r => r[c]).filter(x => typeof x === "number" && isFinite(x));
          o[a + ":" + c] = a === "count" ? grp.length : !vals.length ? null : a === "sum" ? vals.reduce((p, x) => p + x, 0) : a === "avg" ? vals.reduce((p, x) => p + x, 0) / vals.length : a === "min" ? Math.min(...vals) : Math.max(...vals);
        });
        return o;
      });
      outRows.push(Object.assign({ __total: true, [v.group]: "All" }, Object.fromEntries(v.measures.map(([a, c]) => {
        const vals = rows.map(r => r[c]).filter(x => typeof x === "number" && isFinite(x));
        return [a + ":" + c, a === "count" ? rows.length : !vals.length ? null : a === "sum" ? vals.reduce((p, x) => p + x, 0) : a === "avg" ? vals.reduce((p, x) => p + x, 0) / vals.length : a === "min" ? Math.min(...vals) : Math.max(...vals)];
      }))));
    } else { outCols = cols(); outRows = rows; }
    if (v.sort) { const { key, dir } = v.sort; const tot = outRows.filter(r => r.__total); outRows = outRows.filter(r => !r.__total).sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * dir).concat(tot); }
    q = { cols: outCols, rows: outRows, n: rows.length };
    return q;
  };

  const drawTabs = () => {
    MDS.$("#dsTabs", el).innerHTML = Object.entries(T).map(([k, t]) => `<button type="button" class="btn sm ${k === ds ? "" : "ghost"}" data-ds="${k}">${t.label} <span class="num" style="opacity:.7">${t.rows.length}</span></button>`).join("");
    MDS.$("#dsDesc", el).innerHTML = `<strong>${T[ds].label}.</strong> <span class="dim">${T[ds].desc}</span>`;
  };
  const sel = (id, opts, val, attrs = "") => `<select ${attrs} data-f="${id}" style="font:inherit;padding:5px 6px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink)">${opts.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${MDS.esc(v)}" ${v === val ? "selected" : ""}>${MDS.esc(l)}</option>`; }).join("")}</select>`;
  const inp = (id, val, ph, w = 140) => `<input data-f="${id}" value="${MDS.esc(val)}" placeholder="${ph}" style="font:14px var(--mono);padding:5px 8px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink);width:${w}px;max-width:100%">`;
  const drawQB = () => {
    const v = views[ds], cs = cols();
    const colOpts = cs.map(c => [c.key, c.label]);
    MDS.$("#qb", el).innerHTML = `
      <div><strong class="small">Filters</strong><div class="stack" style="gap:6px;margin-top:6px">${v.filters.map((f, i) => `<div class="row" style="gap:6px">${sel("fc" + i, colOpts, f.col)}${sel("fo" + i, OPS, f.op)}${inp("fv" + i, f.val, "value")}<button class="icon" type="button" data-rmf="${i}" aria-label="Remove filter">×</button></div>`).join("")}
        <div><button class="btn sm ghost" type="button" id="addF">+ Filter</button></div></div></div>
      <div><strong class="small">Calculated columns</strong> <span class="hint">Use column keys, e.g. <code>list - arr</code> or <code>if(nps &lt; 0, arr, 0)</code>. Keys: ${numCols().map(c => `<code>${c.key}</code>`).join(" ")}</span>
        <div class="stack" style="gap:6px;margin-top:6px">${v.calcs.map((c, i) => `<div class="row" style="gap:6px">${inp("cn" + i, c.name, "name", 110)} = ${inp("cf" + i, c.f, "formula", 260)}<button class="icon" type="button" data-rmc="${i}" aria-label="Remove column">×</button>${MDS.expr.compile(c.f).err ? `<span class="small neg">${MDS.esc(MDS.expr.compile(c.f).err)}</span>` : ""}</div>`).join("")}
        <div><button class="btn sm ghost" type="button" id="addC">+ Calculated column</button></div></div></div>
      <div class="row" style="gap:8px"><strong class="small">Group by</strong>${sel("grp", [["", "No grouping (show rows)"]].concat(cs.filter(c => c.type !== "num" && c.type !== "pct").map(c => [c.key, c.label])), v.group)}
        ${v.group ? v.measures.map((m, i) => `<span class="row" style="gap:4px">${sel("ma" + i, AGG, m[0])}${m[0] !== "count" ? sel("mc" + i, numCols().map(c => [c.key, c.label]), m[1]) : ""}${i > 0 ? `<button class="icon" type="button" data-rmm="${i}" aria-label="Remove measure">×</button>` : ""}</span>`).join("") + `<button class="btn sm ghost" type="button" id="addM">+ Measure</button>` : ""}
      </div>`;
  };
  const drawRes = () => {
    const r = run(), v = views[ds];
    MDS.$("#resTitle", el).textContent = v.group ? `Grouped by ${r.cols[0].label} (${r.n} rows)` : `${r.n} rows`;
    const shown = r.rows.slice(0, 300);
    MDS.$("#res", el).innerHTML = `<thead><tr>${r.cols.map(c => `<th data-sort="${MDS.esc(c.key)}" style="cursor:pointer" title="Sort">${MDS.esc(c.label)}${v.sort && v.sort.key === c.key ? (v.sort.dir > 0 ? " ▲" : " ▼") : ""}</th>`).join("")}</tr></thead><tbody>` +
      shown.map(row => `<tr class="${row.__total ? "sub" : ""}">${r.cols.map(c => `<td>${MDS.fmtCell(row[c.key], c.type)}</td>`).join("")}</tr>`).join("") +
      (!v.group ? `<tr class="sub">${r.cols.map((c, i) => `<td>${i === 0 ? "Total / avg" : c.type === "num" || c.type === "int" ? MDS.fmtCell(r.rows.reduce((a, x) => a + (typeof x[c.key] === "number" ? x[c.key] : 0), 0), c.type) : c.type === "pct" ? MDS.fmtCell(r.rows.reduce((a, x) => a + (x[c.key] || 0), 0) / Math.max(1, r.rows.length), "pct") : ""}</td>`).join("")}</tr>` : "") + "</tbody>";
    MDS.$("#resNote", el).textContent = r.rows.length > 300 ? `Showing first 300 of ${r.rows.length}.` : "Click a column header to sort. Ungrouped totals sum numbers and average percentages.";
    // chart for grouped results
    const box = MDS.$("#chartBox", el);
    if (v.group && r.rows.length > 1 && r.rows.length <= 25) {
      const data = r.rows.filter(x => !x.__total), key = r.cols[1].key, max = Math.max(...data.map(x => x[key] || 0), 0.0001);
      box.innerHTML = `<div class="stack" style="gap:4px;margin:6px 0 12px">${data.map(x => `<div style="display:grid;grid-template-columns:minmax(90px,200px) 1fr 80px;gap:8px;align-items:center;font-size:13px"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${MDS.esc(x[v.group])}</span><span style="height:12px;background:var(--panel2);border-radius:3px"><i style="display:block;height:100%;width:${Math.max(0, (x[key] || 0) / max * 100)}%;background:var(--acc);border-radius:3px"></i></span><span class="num" style="text-align:right">${MDS.fmtCell(x[key], r.cols[1].type)}</span></div>`).join("")}</div>`;
    } else box.innerHTML = "";
  };
  const drawNB = () => {
    MDS.$("#nb", el).innerHTML = nb.length ? nb.map((f, i) => `<div class="fb"><div class="row" style="justify-content:space-between"><strong>${MDS.esc(f.title)}</strong><button class="icon" type="button" data-rmn="${i}" aria-label="Delete finding">×</button></div><div class="small dim">${MDS.esc(f.query)}</div>${f.note ? `<div style="margin-top:4px">${MDS.esc(f.note)}</div>` : ""}</div>`).join("")
      : `<div class="small dim">No findings yet. Run a query and save what matters, with a note on what it means for the plan.</div>`;
  };
  const describe = () => {
    const v = views[ds];
    return [T[ds].label, ...v.filters.map(f => `${f.col} ${f.op} ${f.val}`), ...v.calcs.map(c => `${c.name} = ${c.f}`), v.group ? `grouped by ${v.group}: ${v.measures.map(m => m[0] + (m[1] ? " " + m[1] : "")).join(", ")}` : ""].filter(Boolean).join(" · ");
  };
  const all = () => { drawTabs(); drawQB(); drawRes(); };

  el.addEventListener("click", e => {
    const b = e.target.closest("button,th"); if (!b) return;
    const v = views[ds], c0 = cols()[0];
    if (b.dataset.ds) { ds = b.dataset.ds; all(); }
    else if (b.id === "addF") { v.filters.push({ col: c0.key, op: "=", val: "" }); drawQB(); }
    else if (b.dataset.rmf) { v.filters.splice(+b.dataset.rmf, 1); drawQB(); drawRes(); }
    else if (b.id === "addC") { v.calcs.push({ name: "calc" + (v.calcs.length + 1), f: "" }); drawQB(); }
    else if (b.dataset.rmc) { v.calcs.splice(+b.dataset.rmc, 1); drawQB(); drawRes(); }
    else if (b.id === "addM") { v.measures.push(["sum", numCols()[0].key]); drawQB(); drawRes(); }
    else if (b.dataset.rmm) { v.measures.splice(+b.dataset.rmm, 1); drawQB(); drawRes(); }
    else if (b.dataset.sort) { const k = b.dataset.sort; v.sort = v.sort && v.sort.key === k ? { key: k, dir: -v.sort.dir } : { key: k, dir: -1 }; drawRes(); }
    else if (b.dataset.rmn) { nb.splice(+b.dataset.rmn, 1); MDS.save(); drawNB(); }
    else if (b.id === "saveFind") {
      const box = document.createElement("div"); box.className = "fb"; box.style.marginTop = "8px";
      box.innerHTML = `<label class="small" for="fTitle">Finding (one line)</label><input id="fTitle" style="width:100%;font:inherit;padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink)" placeholder="e.g. One rep gives 36% average discount">
        <label class="small" for="fNote" style="display:block;margin-top:6px">So what for the plan?</label><input id="fNote" style="width:100%;font:inherit;padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink)"><div class="row" style="margin-top:8px"><button class="btn sm" type="button" id="fOk">Save</button></div>`;
      MDS.$("#saveFind", el).closest(".panel").appendChild(box); MDS.$("#fTitle", el).focus();
      MDS.$("#fOk", el).onclick = () => { nb.push({ title: MDS.$("#fTitle", el).value || "Untitled finding", note: MDS.$("#fNote", el).value, query: describe() }); MDS.save(); box.remove(); drawNB(); if (MDS.refreshBrief) MDS.refreshBrief(); };
    }
    else if (b.id === "copyCsv") {
      const r = q, esc = x => /[",\n]/.test(String(x)) ? `"${String(x).replace(/"/g, '""')}"` : x;
      const csv = [r.cols.map(c => esc(c.label)).join(","), ...r.rows.map(row => r.cols.map(c => esc(row[c.key] == null ? "" : typeof row[c.key] === "number" ? +row[c.key].toFixed(4) : row[c.key])).join(","))].join("\n");
      const done = ok => { b.textContent = ok ? "Copied" : "Copy failed"; setTimeout(() => { b.textContent = "Copy as CSV"; }, 1500); };
      try { navigator.clipboard.writeText(csv).then(() => done(true), () => done(false)); } catch (err) { done(false); }
    }
  });
  el.addEventListener("change", e => {
    const f = e.target.dataset && e.target.dataset.f; if (!f) return;
    const v = views[ds], val = e.target.value, i = +f.slice(2);
    if (f.startsWith("fc")) v.filters[i].col = val; else if (f.startsWith("fo")) v.filters[i].op = val; else if (f.startsWith("fv")) v.filters[i].val = val;
    else if (f.startsWith("cn")) v.calcs[i].name = val.replace(/[^A-Za-z0-9_]/g, "_"); else if (f.startsWith("cf")) v.calcs[i].f = val;
    else if (f === "grp") { v.group = val; v.sort = null; }
    else if (f.startsWith("ma")) { v.measures[i][0] = val; if (val !== "count" && !v.measures[i][1]) v.measures[i][1] = numCols()[0].key; }
    else if (f.startsWith("mc")) v.measures[i][1] = val;
    drawQB(); drawRes();
  });

  // diagnostic questions (answers and hints persist per case)
  const qs = MDS.investigationQs(sc);
  const QA = (MDS.state.invAns = MDS.state.invAns || {})[sc.id] = (MDS.state.invAns[sc.id] || { a: {}, h: {} });
  const qsel = "width:100%;font:inherit;padding:6px 7px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink)";
  MDS.$("#iq", el).innerHTML = qs.map((x, i) => `<div class="qi" id="qi${i}"><div class="small"><span class="num faint">Q${i + 1}</span> ${MDS.esc(x.q)}</div>
    <div class="row" style="gap:6px;margin-top:6px;flex-wrap:nowrap">${x.kind === "choice"
      ? `<select id="ia${i}" aria-label="Answer to question ${i + 1}" style="${qsel}"><option value="">Choose…</option>${x.options.map(o => `<option ${QA.a[i] === o ? "selected" : ""}>${MDS.esc(o)}</option>`).join("")}</select>`
      : `<input id="ia${i}" inputmode="decimal" autocomplete="off" aria-label="Answer to question ${i + 1} in ${x.unit}" placeholder="${x.unit}" value="${MDS.esc(QA.a[i] || "")}" style="${qsel};font-family:var(--mono)">`}
      <button class="btn ghost sm" type="button" data-hint="${i}" style="white-space:nowrap">${QA.h[i] ? "Hint used" : "Where to look"}</button></div>
    <div class="small faint" id="ih${i}" ${QA.h[i] ? "" : "hidden"}>${MDS.esc(x.hint)}</div>
    <div class="working" id="iw${i}" hidden></div></div>`).join("");
  const prog = () => { const n = qs.filter((x, i) => String(QA.a[i] || "").trim()).length; MDS.$("#qprog", el).textContent = `${n}/${qs.length} answered`; };
  prog();
  MDS.$("#iq", el).addEventListener("input", e => { const m = e.target.id.match(/^ia(\d+)$/); if (!m) return; QA.a[+m[1]] = e.target.value; MDS.save(); prog(); });
  MDS.$("#iq", el).addEventListener("change", e => { const m = e.target.id.match(/^ia(\d+)$/); if (!m) return; QA.a[+m[1]] = e.target.value; MDS.save(); prog(); });
  MDS.$("#iq", el).addEventListener("click", e => {
    const b = e.target.closest("[data-hint]"); if (!b) return;
    const i = +b.dataset.hint; QA.h[i] = true; MDS.save();
    b.textContent = "Hint used"; MDS.$("#ih" + i, el).hidden = false;
    ds = qs[i].ds; views[ds] = fresh(); all();
    MDS.$("#dsTabs", el).scrollIntoView({ behavior: "smooth", block: "start" });
  });
  MDS.$("#clearQ", el).onclick = () => { QA.a = {}; QA.marked = false; MDS.save(); MDS.route(); };
  if (QA.marked) { MDS.$("#checkQ", el).disabled = true; MDS.$("#checkQ", el).title = "Already marked. Clear to practise again."; }
  MDS.$("#checkQ", el).onclick = () => {
    if (QA.marked) return;
    QA.marked = true; MDS.$("#checkQ", el).disabled = true;
    let pts = 0, right = 0;
    qs.forEach((x, i) => {
      const raw = MDS.$("#ia" + i, el).value;
      const ok = x.kind === "choice" ? raw === x.ans : Math.abs(parseFloat(String(raw).replace(/[£,%×x\s]/g, "")) - x.ans) <= x.abs;
      if (ok) { right++; pts += QA.h[i] ? 0.6 : 1; }
      const w = MDS.$("#iw" + i, el); w.hidden = false; w.className = "working fb " + (ok ? "good" : "bad");
      w.innerHTML = `<strong>${ok ? (QA.h[i] ? "Correct (with hint)." : "Correct.") : `Answer: ${x.kind === "choice" ? MDS.esc(x.ans) : x.ans.toFixed(x.unit === "£k" ? 0 : 1) + (x.unit === "%" ? "%" : " " + x.unit)}.`}</strong> ${MDS.esc(x.explain)}`;
    });
    const score = pts / qs.length * 100, hints = Object.keys(QA.h).length;
    MDS.setScore(sc.id, "investigate", score, "first");
    const [g, cls] = MDS.grade(score);
    MDS.$("#iqRes", el).innerHTML = `<div class="row" style="margin-top:12px;gap:12px"><div class="bigscore" style="font-size:32px">${Math.round(score)}</div><span class="pill ${cls === "pos" ? "ok" : "no"}">${g}</span></div><div class="small dim">${right}/${qs.length} correct${hints ? `, ${hints} hint${hints > 1 ? "s" : ""} used` : ""}. Save the findings that change your plan: you'll need them for the model and the 100-day plan.</div>`;
  };
  all(); drawNB();
};
