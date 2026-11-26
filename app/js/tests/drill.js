/* Test 4: modelling drill. Work the numbers yourself; each attempt varies the inputs. */
MDS.makeDrill = (sc, seed) => {
  const r = MDS.rng(seed), B = sc.base;
  const pick = (a, b, step) => Math.round((a + r() * (b - a)) / step) * step;
  const k = MDS.k;
  const qs = [];
  { const fte = B.ps.fte, days = B.ps.days, u = pick(0.6, 0.78, 0.01), f = pick(0.05, 0.15, 0.01), rate = B.ps.rate * 1000;
    const ans = fte * days * u * (1 - f) * rate / 1000;
    qs.push({ q: `PS has ${fte} consultants with ${days} available days each. Utilisation is ${MDS.pc(u, 0)} and ${MDS.pc(f, 0)} of delivered days are free of charge. Day rate £${rate.toLocaleString("en-GB")}. What is annual PS revenue?`, unit: "£k", ans, tol: 0.02,
      work: `${fte} × ${days} × ${u.toFixed(2)} × (1 − ${f.toFixed(2)}) × £${rate.toLocaleString("en-GB")} = ${k(ans)}` }); }
  { const R = Math.round(B.recurring / 10) * 10, c = pick(0.06, 0.14, 0.01), u = pick(0.03, 0.08, 0.01);
    const ans = R * (1 - c) * (1 + u);
    qs.push({ q: `Recurring revenue is ${k(R)}. Next year ${MDS.pc(c, 0)} churns, and remaining customers get a ${MDS.pc(u, 0)} uplift. Ignoring new business, what's next year's recurring revenue?`, unit: "£k", ans, tol: 0.01,
      work: `${k(R)} × (1 − ${c.toFixed(2)}) × (1 + ${u.toFixed(2)}) = ${k(ans)}` }); }
  { const S = Math.round(B.recurring / 10) * 10, ch = Math.round(S * pick(0.05, 0.12, 0.01)), con = Math.round(S * pick(0.01, 0.04, 0.01)), ex = Math.round(S * pick(0.04, 0.12, 0.01)), nw = Math.round(S * 0.08);
    const ans = (S - ch - con + ex) / S * 100;
    qs.push({ q: `Opening recurring revenue ${k(S)}. In the year: churn ${k(ch)}, contraction ${k(con)}, expansion ${k(ex)}, new customers ${k(nw)}. What's net revenue retention?`, unit: "%", ans, tol: 0.006,
      work: `(${S} − ${ch} − ${con} + ${ex}) ÷ ${S} = ${ans.toFixed(1)}%. New customers are excluded.` }); }
  { const R = Math.round(B.recurring / 10) * 10, s = pick(0.2, 0.45, 0.05), g = pick(0.15, 0.35, 0.05);
    const ans = R * s * (1 / (1 - g) - 1);
    qs.push({ q: `${MDS.pc(s, 0)} of ${k(R)} recurring revenue comes from customers paying ${MDS.pc(g, 0)} below list price. If they all move to list, how much annual recurring revenue is added (before any churn)?`, unit: "£k", ans, tol: 0.02,
      work: `They pay (1 − ${g.toFixed(2)}) of list, so list is 1 ÷ ${(1 - g).toFixed(2)} of current: ${k(R)} × ${s.toFixed(2)} × (1 ÷ ${(1 - g).toFixed(2)} − 1) = ${k(ans)}` }); }
  { const O = pick(60, 300, 10), A = pick(80, 240, 10);
    const ans = O / A * 12;
    qs.push({ q: `A migration costs ${k(O)} one-off and saves ${k(A)} a year once live. What's the payback in months (from go-live)?`, unit: "months", ans, tol: 0.03,
      work: `${O} ÷ ${A} × 12 = ${ans.toFixed(1)} months` }); }
  { const cost = B.ps.cost * 1000, days = B.ps.days, f = pick(0.05, 0.15, 0.01), rate = B.ps.rate * 1000, m = pick(0.15, 0.35, 0.05);
    const ans = cost / (days * (1 - f) * rate * (1 - m)) * 100;
    qs.push({ q: `A consultant costs £${cost.toLocaleString("en-GB")} a year, fully loaded, with ${days} available days. Day rate £${rate.toLocaleString("en-GB")}, and ${MDS.pc(f, 0)} of delivered days are free. What utilisation gives a ${MDS.pc(m, 0)} PS gross margin?`, unit: "%", ans, tol: 0.015,
      work: `Revenue needed = cost ÷ (1 − margin). Utilisation = £${cost.toLocaleString("en-GB")} ÷ (${days} × ${(1 - f).toFixed(2)} × £${rate.toLocaleString("en-GB")} × ${(1 - m).toFixed(2)}) = ${ans.toFixed(1)}%` }); }
  { const y0 = MDS.model(sc, MDS.defaults(sc)).yrs[0];
    const ans = y0.margin * 100;
    qs.push({ q: `Using the data room P&L: revenue ${k(y0.rev)} and total costs ${k(y0.cost)}. What's the EBITDA margin?`, unit: "%", ans, tol: 0.01, abs: 0.3,
      work: `(${Math.round(y0.rev)} − ${Math.round(y0.cost)}) ÷ ${Math.round(y0.rev)} = ${ans.toFixed(1)}%` }); }
  { const c = pick(0.06, 0.14, 0.01), u = pick(0.04, 0.10, 0.01);
    const ans = (1 - c) * u / (1 + u) * 100;
    qs.push({ q: `Baseline churn is ${MDS.pc(c, 0)}. You add a ${MDS.pc(u, 0)} price uplift. How many extra percentage points of churn would it take to wipe out the revenue gain entirely?`, unit: "pp", ans, tol: 0.03, abs: 0.15,
      work: `Solve (1 − c − x)(1 + u) = (1 − c): x = (1 − c) × u ÷ (1 + u) = ${(1 - c).toFixed(2)} × ${u.toFixed(2)} ÷ ${(1 + u).toFixed(2)} = ${ans.toFixed(2)} pp. The uplift usually survives a lot of churn. The real risk is losing key accounts.` }); }
  { const T = pick(6000, 14000, 500), h = B.support.howto, d = pick(0.2, 0.5, 0.05), per = pick(900, 1400, 50);
    const ans = T * h * d / per;
    qs.push({ q: `Support handles ${T.toLocaleString("en-GB")} tickets a year. ${MDS.pc(h, 0)} are how-to questions. An AI assistant resolves ${MDS.pc(d, 0)} of those, and an agent handles ${per.toLocaleString("en-GB")} tickets a year. How many FTE of capacity does that free?`, unit: "FTE", ans, tol: 0.03,
      work: `${T} × ${h.toFixed(2)} × ${d.toFixed(2)} ÷ ${per} = ${ans.toFixed(2)} FTE. That's capacity, not cost, until you redeploy or don't replace leavers.` }); }
  { const g = pick(0.04, 0.2, 0.01), m = pick(0.08, 0.3, 0.01);
    const ans = (g + m) * 100;
    qs.push({ q: `Revenue grows ${MDS.pc(g, 0)} a year and EBITDA margin is ${MDS.pc(m, 0)}. What's the Rule of 40 score?`, unit: "score", ans, tol: 0.001, abs: 0.5,
      work: `${(g * 100).toFixed(0)} + ${(m * 100).toFixed(0)} = ${ans.toFixed(0)}${ans >= 40 ? " (passes)" : " (below 40)"}` }); }
  return qs;
};

MDS.tests.drill = (sc, el) => {
  let seed = Math.floor(Math.random() * 1e9), t0 = Date.now(), timer;
  const start = () => {
    const qs = MDS.makeDrill(sc, seed);
    t0 = Date.now();
    el.innerHTML = `<div class="stack"><div class="panel">
      <div class="row" style="justify-content:space-between"><div><h2>Modelling drill</h2><p class="dim" style="margin:0">Ten calculations a Portfolio Manager would expect you to do without a finance team. Use a calculator or a spreadsheet, not the lever lab. Each attempt changes the numbers.</p></div><div class="num" id="clock" aria-live="off">0:00</div></div>
      <div id="qs" style="margin-top:6px">${qs.map((q, i) => `<div class="q"><div><div class="small faint num">Q${i + 1}</div>${MDS.esc(q.q)}<div class="working" id="w${i}" hidden></div></div>
        <div><label class="unit" for="a${i}">Answer (${q.unit})</label><input id="a${i}" inputmode="decimal" autocomplete="off"></div></div>`).join("")}</div>
      <div class="row" style="margin-top:12px"><button class="btn" id="mark" type="button">Mark answers</button><button class="btn ghost" id="newset" type="button">New numbers</button></div>
      <div id="res"></div></div></div>`;
    clearInterval(timer);
    timer = setInterval(() => { const c = MDS.$("#clock", el); if (!c) return clearInterval(timer); const s = Math.floor((Date.now() - t0) / 1000); c.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }, 1000);
    MDS.$("#newset", el).onclick = () => { seed = Math.floor(Math.random() * 1e9); start(); };
    MDS.$("#mark", el).onclick = () => {
      clearInterval(timer);
      let right = 0;
      qs.forEach((q, i) => {
        const raw = MDS.$("#a" + i, el).value.replace(/[£,%k\s]/gi, "");
        const v = parseFloat(raw);
        const ok = isFinite(v) && (Math.abs(v - q.ans) <= Math.abs(q.ans) * q.tol || Math.abs(v - q.ans) <= (q.abs || 0));
        if (ok) right++;
        const w = MDS.$("#w" + i, el); w.hidden = false;
        w.className = "working fb " + (ok ? "good" : "bad");
        w.innerHTML = `<strong>${ok ? "Correct." : isFinite(v) ? "Not quite." : "No answer."}</strong> ${MDS.esc(q.work)}`;
      });
      const score = right / qs.length * 100, secs = Math.round((Date.now() - t0) / 1000);
      MDS.setScore(sc.id, "drill", score);
      const [g, cls] = MDS.grade(score);
      MDS.$("#res", el).innerHTML = `<div class="row" style="margin-top:14px;gap:16px"><div class="bigscore">${right}/${qs.length}</div><span class="pill ${cls === "pos" ? "ok" : "no"}">${g}</span><span class="dim small">in ${Math.floor(secs / 60)}m ${secs % 60}s. Under 15 minutes with 9+ correct is interview-ready.</span></div>`;
    };
  };
  start();
};
