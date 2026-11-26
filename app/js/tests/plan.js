/* 100-day plan: place activities into phases, assign owners, get assessed on sequencing, timing and capacity. */
MDS.tests.plan = (sc, el) => {
  const PL = sc.plan;
  const acts = PL.activities.concat(PL.extra);
  const PH = [["", "Unplaced"], ["w1", "Weeks 1–2"], ["w2", "Weeks 3–6"], ["w3", "Weeks 7–10"], ["w4", "Weeks 11–14"], ["later", "After day 100"], ["no", "Not doing"]];
  const ORD = { "": 99, w1: 1, w2: 2, w3: 3, w4: 4, later: 5, no: 99 };
  const OWN = ["You", "GM", "Functional lead", "Portfolio Manager"];
  const st = (MDS.state.plans = MDS.state.plans || {})[sc.id] = (MDS.state.plans || {})[sc.id] || {};
  const selS = "font:inherit;padding:5px 6px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink)";
  el.innerHTML = `<div class="stack">
    <div class="panel"><h2>Your 100-day plan</h2><p class="dim small" style="margin:0">You start on ${PL.start}. Put each activity in a phase and give it an owner. Order matters, deadlines in the data room are real, and you can personally lead about 4 things per phase. "GM" means the founder or managing director of the business.</p></div>
    <div class="panel"><div class="tblwrap"><table><thead><tr><th>Activity</th><th>When</th><th>Owner</th></tr></thead><tbody>${acts.map(a => `<tr><td style="min-width:260px">${MDS.esc(a.t)}<div class="small" id="pf-${a.id}"></div></td>
      <td><select data-ph="${a.id}" style="${selS}" aria-label="When: ${MDS.esc(a.t)}">${PH.map(([v, l]) => `<option value="${v}" ${st[a.id] && st[a.id].ph === v ? "selected" : ""}>${l}</option>`).join("")}</select></td>
      <td><select data-ow="${a.id}" style="${selS}" aria-label="Owner: ${MDS.esc(a.t)}"><option value="">Choose…</option>${OWN.map(o => `<option ${st[a.id] && st[a.id].ow === o ? "selected" : ""}>${o}</option>`).join("")}</select></td></tr>`).join("")}</tbody></table></div>
      <div class="row" style="margin-top:12px"><button class="btn" id="assess" type="button">Assess my plan</button><span class="small dim" id="load"></span></div><div id="res"></div></div>
    <div class="panel"><h3>Timeline</h3><div id="tl"></div></div></div>`;
  const drawTL = () => {
    MDS.$("#tl", el).innerHTML = `<div class="g3" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))">${PH.slice(1, 6).map(([v, l]) => {
      const items = acts.filter(a => st[a.id] && st[a.id].ph === v);
      const mine = items.filter(a => st[a.id].ow === "You").length;
      return `<div class="fb"><div class="row" style="justify-content:space-between"><strong class="small">${l}</strong><span class="num small ${mine > 4 && v !== "later" ? "neg" : "faint"}">You: ${mine}</span></div>${items.map(a => `<div class="small" style="margin-top:4px">• ${MDS.esc(a.t)}</div>`).join("") || `<div class="small faint">Nothing yet</div>`}</div>`;
    }).join("")}</div>`;
  };
  el.addEventListener("change", e => {
    const d = e.target.dataset; if (!d.ph && !d.ow) return;
    const id = d.ph || d.ow; st[id] = st[id] || {}; if (d.ph != null) st[id].ph = e.target.value; else st[id].ow = e.target.value;
    MDS.save(); drawTL();
  });
  MDS.$("#assess", el).onclick = () => {
    let got = 0, max = 0; const notes = [];
    const ph = id => (st[id] || {}).ph || "", ow = id => (st[id] || {}).ow || "";
    acts.forEach(a => {
      const p = ph(a.id), best = a.id === "letters" ? PL.letters : a.id === "supplier" ? PL.supplier : a.best, why = a.id === "letters" ? PL.lettersWhy : a.id === "supplier" ? PL.supplierWhy : a.why;
      const fb = []; let ok = true;
      max += 3;
      if (!p) { fb.push(["r", "Not placed."]); ok = false; }
      else if (best && best.includes(p)) got += 2;
      else if (best && p !== "no" && best.some(b => Math.abs(ORD[b] - ORD[p]) === 1)) { got += 1; fb.push(["w", `Close. Better in ${best.map(b => PH.find(x => x[0] === b)[1]).join(" or ")}.`]); }
      else { fb.push(["r", `Better in ${best.map(b => PH.find(x => x[0] === b)[1]).join(" or ")}.`]); ok = false; }
      (a.after || []).forEach(d => { const pd = ph(d); if (p && p !== "no" && (pd === "no" || !pd || ORD[pd] > ORD[p] || (ORD[pd] === ORD[p] && (p === "w1" || a.strict) && d !== "meet"))) { got -= 1; fb.push(["r", `Depends on "${acts.find(x => x.id === d).t}", which isn't done first.`]); ok = false; } });
      (a.before || []).forEach(d => { const pd = ph(d); if (pd && pd !== "no" && (!p || p === "no" || ORD[p] >= ORD[pd])) { got -= 1; fb.push(["r", `Must happen before "${acts.find(x => x.id === d).t}".`]); ok = false; } });
      if (p && p !== "no") { if (a.owner.includes(ow(a.id))) got += 1; else { fb.push(["w", ow(a.id) ? `Owner: better ${a.owner.join(" or ")}.` : "No owner."]); } }
      else if (p === "no" && (best || []).includes("no")) got += 1;
      MDS.$("#pf-" + a.id, el).innerHTML = fb.length ? fb.map(([c, t]) => `<span class="${c === "r" ? "neg" : ""}" style="${c === "w" ? "color:var(--warn)" : ""}">${MDS.esc(t)}</span>`).join(" ") + ` <span class="faint">${MDS.esc(why)}</span>` : `<span class="pos">Good.</span> <span class="faint">${MDS.esc(why)}</span>`;
      void ok;
    });
    ["w1", "w2", "w3", "w4"].forEach(p => { const n = acts.filter(a => ph(a.id) === p && ow(a.id) === "You").length; if (n > 4) { got -= (n - 4) * 2; notes.push(["r", `${PH.find(x => x[0] === p)[1]}: you personally own ${n} activities. You're one person: delegate to the GM and functional leads.`]); } });
    ["meet", "baseline", "keyppl", "pack", "comms"].forEach(id => { if (ph(id) === "no") { got -= 4; notes.push(["r", `Skipping "${acts.find(x => x.id === id).t}" is a fundamental gap.`]); } });
    const score = MDS.clamp(Math.round(got / max * 100), 0, 100);
    MDS.setScore(sc.id, "plan", score);
    const [g, cls] = MDS.grade(score);
    MDS.$("#res", el).innerHTML = `<div class="row" style="margin-top:12px;gap:16px"><div class="bigscore">${score}</div><span class="pill ${cls === "pos" ? "ok" : "no"}">${g}</span><span class="small dim">Feedback is shown under each activity.</span></div>` +
      (notes.length ? `<ul class="warns" style="margin-top:10px">${notes.map(([c, t]) => `<li class="${c}">${MDS.esc(t)}</li>`).join("")}</ul>` : "");
  };
  drawTL();
};
