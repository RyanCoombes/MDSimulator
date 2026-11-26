/* Test 3: lever lab. Set levers and initiatives under a change budget, see the 3-year forecast, submit for a score. */
MDS.tests.lab = (sc, el) => {
  const D = MDS.defaults(sc);
  let L = Object.assign({}, D, MDS.state.lab[sc.id] || {});
  let caseView = "base";

  const fmt = (i, v) => i.unit === "k/yr" ? `£${v}k/yr` : ((i.id === "rate" || i.id === "psfte") && v > 0 ? "+" : "") + v + i.unit;
  const levers = MDS.LEVERS.map(g => ({ grp: g.grp, items: g.items.filter(i => !(sc.hide || []).includes(i.id)) }));

  el.innerHTML = `<div class="lab">
    <div class="stack">
      <div class="panel cap"><div class="row" style="justify-content:space-between"><strong>Change capacity</strong><span class="num" id="capTxt"></span></div>
        <div class="capbar"><i id="capBar"></i></div><div class="hint" id="capHint" style="margin-top:6px"></div></div>
      ${levers.map((g, gi) => `<details class="grp" ${gi < 2 ? "open" : ""}><summary>${g.grp}</summary><div class="body">${g.items.map(i => i.type === "toggle"
        ? `<div class="ctl"><label class="tog" for="c-${i.id}" style="justify-content:flex-start"><input type="checkbox" id="c-${i.id}" data-id="${i.id}" ${L[i.id] ? "checked" : ""}><span>${i.label}${i.id === "pet" ? ` (${MDS.esc(sc.base.rnd.petName)})` : ""}</span></label><div class="hint">${i.hint}</div></div>`
        : `<div class="ctl"><label for="c-${i.id}"><span>${i.label}</span><span class="num" id="o-${i.id}"></span></label><input type="range" id="c-${i.id}" data-id="${i.id}" min="${i.min}" max="${i.max}" step="${i.step}" value="${L[i.id]}"><div class="hint">${i.hint} Today: ${fmt(i, D[i.id])}.</div></div>`).join("")}</div></details>`).join("")}
      <details class="grp" open><summary>${MDS.esc(sc.name)} initiatives</summary><div class="body">${sc.initiatives.map(i => `<div class="ctl"><label class="tog" for="c-i_${i.id}" style="justify-content:flex-start"><input type="checkbox" id="c-i_${i.id}" data-id="i_${i.id}" ${L["i_" + i.id] ? "checked" : ""}><span>${MDS.esc(i.label)} <span class="faint num">(${i.pts} pt${i.pts > 1 ? "s" : ""})</span></span></label><div class="hint">${MDS.esc(i.hint)}</div></div>`).join("")}</div></details>
      <div class="row"><button class="btn ghost" id="reset" type="button">Reset levers</button></div>
    </div>
    <div class="stack">
      <div class="panel">
        <div class="row" style="justify-content:space-between;align-items:baseline">
          <h2>3-year forecast</h2>
          <div class="seg" role="group" aria-label="Case"><button type="button" data-case="base" aria-pressed="true">Base case</button><button type="button" data-case="down" aria-pressed="false">Downside</button></div>
        </div>
        <div class="legend"><span><i style="background:var(--acc)"></i>Revenue</span><span><i style="background:var(--good)"></i>EBITDA</span><span><i style="background:var(--faint)"></i>Do-nothing EBITDA</span></div>
        <div id="chart"></div>
        <p class="small dim" id="caseNote"></p>
        <div class="tblwrap"><table id="pl"></table></div>
      </div>
      <div class="panel"><h3>Portfolio Manager's targets</h3><div class="targets" id="targets"></div></div>
      <div class="panel"><h3>People</h3><div class="meters" id="meters"></div></div>
      <div class="panel"><h3>What your choices set off</h3><ul class="warns" id="warns"></ul></div>
      <div class="panel"><div class="row" style="justify-content:space-between"><div><h3>Submit the plan</h3><div class="small dim">Scored on base-case targets (40), downside resilience (20), people (20) and realism (20).</div></div><button class="btn" id="submit" type="button">Submit for scoring</button></div><div id="result"></div></div>
    </div></div>`;

  const chart = (m, base) => {
    const W = 640, H = 210, pad = { l: 46, r: 10, t: 12, b: 26 };
    const ys = m.yrs, max = Math.max(...ys.map(y => y.rev), ...base.yrs.map(y => y.rev)) * 1.1;
    const min = Math.min(0, ...ys.map(y => y.ebitda), ...base.yrs.map(y => y.ebitda)) * 1.15;
    const sy = v => pad.t + (H - pad.t - pad.b) * (1 - (v - min) / (max - min));
    const gw = (W - pad.l - pad.r) / 4, bw = gw / 4.2;
    const step = max > 6000 ? 2000 : 1000;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Revenue and EBITDA by year">`;
    for (let v = Math.ceil(min / step) * step; v <= max; v += step) s += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${sy(v)}" y2="${sy(v)}" stroke="var(--line)"/><text x="${pad.l - 6}" y="${sy(v) + 4}" text-anchor="end">${v / 1000}m</text>`;
    const bar = (v, x, col) => { const y0 = sy(0), y1 = sy(v); return `<rect x="${x}" y="${Math.min(y0, y1)}" width="${bw}" height="${Math.max(1, Math.abs(y1 - y0))}" rx="2" fill="${col}"/>`; };
    ys.forEach((y, i) => {
      const x = pad.l + gw * i + gw * 0.12;
      s += bar(y.rev, x, "var(--acc)") + bar(y.ebitda, x + bw + 3, y.ebitda < 0 ? "var(--bad)" : "var(--good)") + bar(base.yrs[i].ebitda, x + 2 * bw + 6, "var(--faint)");
      s += `<text x="${x + bw * 1.5 + 3}" y="${H - 8}" text-anchor="middle">${i === 0 ? "Last yr" : "Y" + i} · ${MDS.pc(y.margin, 0)}</text>`;
    });
    return s + "</svg>";
  };

  const render = () => {
    const down = caseView === "down";
    const m = MDS.model(sc, L, { downside: down }), base = MDS.model(sc, D, { downside: down }), p = MDS.people(sc, L, m);
    const mBase = down ? MDS.model(sc, L) : m;
    // capacity
    const used = mBase.used, pct = Math.min(100, used / MDS.BUDGET * 100);
    MDS.$("#capTxt", el).textContent = `${used} / ${MDS.BUDGET} points`;
    MDS.$("#capBar", el).style.width = pct + "%";
    MDS.$("#capBar", el).style.background = used > MDS.BUDGET ? "var(--bad)" : used > MDS.BUDGET * 0.8 ? "var(--warn)" : "var(--good)";
    MDS.$("#capHint", el).textContent = used > MDS.BUDGET ? `Over capacity: benefits land at ${Math.round(mBase.delivery * 100)}% strength. Drop something.` : "Each change you lead costs points. Choose what matters most.";
    MDS.allLevers(sc).filter(i => i.type !== "toggle").forEach(i => { MDS.$("#o-" + i.id, el).textContent = fmt(i, L[i.id]); });
    MDS.$("#chart", el).innerHTML = chart(m, base);
    MDS.$("#caseNote", el).textContent = down ? "Downside: churn +2 points, new business −30%, PS demand −10%, AI take-up halved, every benefit 25% slower." : "Base case. Switch to Downside to stress-test the plan.";
    MDS.$("#pl", el).innerHTML = MDS.plTable(m.yrs, ["Last yr", "Year 1", "Year 2", "Year 3"], { drivers: true });
    const T = MDS.targetChecks(sc, m, p);
    MDS.$("#targets", el).innerHTML = T.map(t => `<div class="target"><span>${t.label}</span><span class="num">${t.val} <span class="pill ${t.ok ? "ok" : "no"}">${t.ok ? "MET" : "MISSED"}</span></span></div>`).join("") +
      `<div class="small dim" style="margin-top:4px">Year 3 EBITDA ${MDS.k(m.yrs[3].ebitda)} vs ${MDS.k(base.yrs[3].ebitda)} if you do nothing (<strong class="${m.yrs[3].ebitda >= base.yrs[3].ebitda ? "pos" : "neg"}">${m.yrs[3].ebitda >= base.yrs[3].ebitda ? "+" : ""}${MDS.k(m.yrs[3].ebitda - base.yrs[3].ebitda)}</strong>).</div>`;
    MDS.$("#meters", el).innerHTML = MDS.meterHTML(`${sc.people.founderLabel} trust`, p.founder) + MDS.meterHTML("Team morale", p.team) + MDS.meterHTML("Customer sentiment", p.cust);
    const w = MDS.warnings(sc, L, m, p);
    MDS.$("#warns", el).innerHTML = w.length ? w.map(([c, t]) => `<li class="${c}">${MDS.esc(t)}</li>`).join("") : `<li>No major side effects. Is the plan ambitious enough?</li>`;
  };

  const sync = () => { MDS.state.lab[sc.id] = L; MDS.save(); render(); MDS.$("#result", el).innerHTML = ""; };
  el.addEventListener("input", e => {
    const id = e.target.dataset && e.target.dataset.id; if (!id) return;
    L[id] = e.target.type === "checkbox" ? e.target.checked : Number(e.target.value);
    sync();
  });
  MDS.$$("[data-case]", el).forEach(b => b.onclick = () => {
    caseView = b.dataset.case; MDS.$$("[data-case]", el).forEach(x => x.setAttribute("aria-pressed", x === b)); render();
  });
  MDS.$("#reset", el).onclick = () => { MDS.state.lab[sc.id] = Object.assign({}, D); MDS.save(); MDS.route(); };
  MDS.$("#submit", el).onclick = () => {
    const s = MDS.labScore(sc, L);
    MDS.setScore(sc.id, "lab", s.total);
    const [g, cls] = MDS.grade(s.total);
    const part = (n, v, mx) => `<div class="kpi"><div class="l">${n}</div><div class="v">${Math.round(v)}<span class="faint" style="font-size:13px">/${mx}</span></div></div>`;
    const missedDown = s.td.filter(t => !t.ok).map(t => t.label);
    MDS.$("#result", el).innerHTML = `<div class="row" style="margin-top:12px;gap:16px"><div class="bigscore">${s.total}</div><span class="pill ${cls === "pos" ? "ok" : "no"}">${g}</span></div>
      <div class="kpis" style="margin-top:10px">${part("Base-case targets", s.base, 40)}${part("Downside resilience", s.downside, 20)}${part("People", s.ppl, 20)}${part("Realism", s.real, 20)}</div>
      <p class="small dim">${missedDown.length ? `In the downside case (targets relaxed slightly) you miss: ${missedDown.map(MDS.esc).join("; ")}.` : "The plan holds up in the downside case."} Now say the plan out loud in two minutes, result first, then the three levers that get you there.</p>`;
  };
  render();
};
