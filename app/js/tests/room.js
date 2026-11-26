/* Test 1: data room (read-only briefing). */
MDS.plTable = (yrs, heads, opts = {}) => {
  const k = MDS.k, pc = MDS.pc;
  const any = f => yrs.some(f);
  const rows = [
    ["Recurring (maintenance and subscription)", y => k(y.rec)],
    ["AI tier", y => k(y.ai), any(y => y.ai > 0)],
    ["Professional services", y => k(y.ps)],
    ["Other", y => k(y.other)],
    ["Total revenue", y => k(y.rev), true, "sub"],
    ["PS delivery", y => k(-y.psC)],
    ["Support", y => k(-y.supC)],
    ["R&D", y => k(-y.rndC)],
    ["Sales and marketing", y => k(-y.sm)],
    ["G&A", y => k(-y.ga)],
    ["Hosting", y => k(-y.host)],
    ["Third-party royalties", y => k(-y.roy)],
    ["AI inference", y => k(-y.aiC), any(y => y.aiC > 0)],
    ["Initiative running costs and tooling", y => k(-y.run), any(y => y.run > 0)],
    ["One-off change costs", y => k(-y.oneoff), any(y => y.oneoff > 0)],
    ["EBITDA", y => `<span class="${y.ebitda < 0 ? "neg" : ""}">${k(y.ebitda)}</span>`, true, "total"],
    ["EBITDA margin", y => pc(y.margin)],
    ["Recurring share", y => pc(y.recShare, 0)],
    ["Revenue growth", y => y.growth == null ? "–" : pc(y.growth)],
    ["Rule of 40", y => y.growth == null ? "–" : ((y.growth + y.margin) * 100).toFixed(0)]
  ];
  const drivers = [
    ["Customers (approx.)", y => Math.round(y.cust)],
    ["Churn (gross)", y => pc(y.churn)],
    ["Gross retention", y => pc(y.grr)],
    ["Net retention", y => y.nrr == null ? "–" : pc(y.nrr)],
    ["New recurring revenue won", y => y.newBiz == null ? "–" : k(y.newBiz)],
    ["AI tier take-up", y => pc(y.aiTake, 0)],
    ["PS consultants (FTE)", y => y.psFte.toFixed(0)],
    ["PS utilisation achieved", y => pc(y.utilReal, 0)],
    ["Free-of-charge days", y => pc(y.foc, 0)],
    ["Support FTE", y => y.supFte.toFixed(1)],
    ["R&D FTE", y => y.rndFte.toFixed(1)],
    ["Total headcount (FTE)", y => y.fte.toFixed(0)]
  ];
  const body = rows.filter(r => r[2] !== false).map(r => `<tr class="${r[3] || ""}"><td>${r[0]}</td>${yrs.map(y => `<td>${r[1](y)}</td>`).join("")}</tr>`).join("")
    + (opts.drivers ? `<tr class="sec"><td colspan="${yrs.length + 1}">Drivers</td></tr>` + drivers.map(r => `<tr><td>${r[0]}</td>${yrs.map(y => `<td>${r[1](y)}</td>`).join("")}</tr>`).join("") : "");
  return `<thead><tr><th>£k</th>${heads.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${body}</tbody>`;
};

MDS.tests.room = (sc, el) => {
  const y0 = MDS.model(sc, MDS.defaults(sc)).yrs[0];
  el.innerHTML = `<div class="stack">
    <div class="panel"><div class="eyebrow">Your brief from the Portfolio Manager</div>
      <p style="font-size:16px">"${MDS.esc(sc.pmBrief)}"</p>
      <div class="kpis" style="margin-top:10px">${MDS.targetChecks(sc, MDS.model(sc, MDS.defaults(sc)), MDS.people(sc, MDS.defaults(sc), MDS.model(sc, MDS.defaults(sc)))).map(t => `<div class="kpi"><div class="l">Target</div><div style="font-weight:600;font-size:14px">${t.label}</div></div>`).join("")}</div>
      <p class="small dim">You're a team of one: the lever lab gives you a change budget of ${MDS.BUDGET} points over the 3 years.</p>
    </div>
    <div class="g2">
      <div class="panel"><h2>Company profile</h2><div class="small">${sc.profile.map(([a, b]) => `<p><strong>${a}:</strong> ${MDS.esc(b)}</p>`).join("")}</div></div>
      <div class="panel"><h2>Key operating data</h2><div class="kpis">${sc.kpis.map(([l, v, f]) => `<div class="kpi ${f ? "flag" : ""}"><div class="l">${l}</div><div class="v">${v}</div></div>`).join("")}</div>
        <p class="small dim">${MDS.esc(sc.note)}</p></div>
    </div>
    <div class="panel"><h2>Last year's profit and loss (£k)</h2>
      <div class="tblwrap" style="max-width:560px"><table>${MDS.plTable([y0], ["Actual"], { drivers: true })}</table></div>
      <p class="small dim">Costs are fully loaded (salary, on-costs, tools).</p></div>
    <div class="panel"><h2>Interview notes</h2><div class="g2" style="margin-top:8px">${sc.interviews.map(([q, w]) => `<blockquote>"${MDS.esc(q)}"<footer>${MDS.esc(w)}</footer></blockquote>`).join("")}</div></div>
    <div class="row"><a class="btn" href="#${sc.id}-investigate">Next: investigate the raw data →</a><a class="btn ghost" href="#${sc.id}-model">Build the model</a></div>
  </div>`;
};
