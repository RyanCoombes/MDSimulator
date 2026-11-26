/* Stakeholder map: power/interest, stance and engagement approach (Mendelow grid). */
MDS.tests.stake = (sc, el) => {
  const S = sc.stake;
  const st = (MDS.state.stake = MDS.state.stake || {})[sc.id] = (MDS.state.stake || {})[sc.id] || {};
  const APPROACH = { "High|High": "Manage closely", "High|Low": "Keep satisfied", "Low|High": "Keep informed", "Low|Low": "Monitor" };
  const selS = "font:inherit;padding:5px 6px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink)";
  const sel = (k, id, opts) => `<select data-k="${k}" data-id="${id}" style="${selS}" aria-label="${k} for ${MDS.esc((S.find(x => x.id === id) || {}).name || id)}"><option value="">–</option>${opts.map(o => `<option ${st[id] && st[id][k] === o ? "selected" : ""}>${o}</option>`).join("")}</select>`;
  el.innerHTML = `<div class="stack">
    <div class="panel"><h2>Stakeholder map</h2><p class="dim small" style="margin:0">Use the data room (interviews, headcount flight risk, customer concentration) to judge each stakeholder's power over the plan, their interest in it, and where they stand today. Then choose how you'll engage them.</p></div>
    <div class="panel"><div class="tblwrap"><table><thead><tr><th>Stakeholder</th><th>Power</th><th>Interest</th><th>Stance today</th><th>Approach</th></tr></thead><tbody>
      ${S.map(s => `<tr><td style="min-width:220px">${MDS.esc(s.name)}<div class="small" id="sf-${s.id}"></div></td><td>${sel("power", s.id, ["High", "Low"])}</td><td>${sel("interest", s.id, ["High", "Low"])}</td><td>${sel("stance", s.id, ["Champion", "Neutral", "Sceptic", "Blocker"])}</td><td>${sel("approach", s.id, ["Manage closely", "Keep satisfied", "Keep informed", "Monitor"])}</td></tr>`).join("")}
    </tbody></table></div><div class="row" style="margin-top:12px"><button class="btn" id="assess" type="button">Assess my map</button></div><div id="res"></div></div>
    <div class="panel"><h3>Your grid</h3><div id="grid"></div></div></div>`;
  const drawGrid = () => {
    const cell = (p, i, label) => `<div class="fb" style="min-height:110px"><div class="small faint" style="text-transform:uppercase;letter-spacing:.06em">${label}</div>${S.filter(s => st[s.id] && st[s.id].power === p && st[s.id].interest === i).map(s => `<div class="small" style="margin-top:4px">${MDS.esc(s.name.split(",")[0])} <span class="faint">${st[s.id].stance || ""}</span></div>`).join("")}</div>`;
    MDS.$("#grid", el).innerHTML = `<div class="g2">${cell("High", "Low", "High power · low interest: keep satisfied")}${cell("High", "High", "High power · high interest: manage closely")}${cell("Low", "Low", "Low power · low interest: monitor")}${cell("Low", "High", "Low power · high interest: keep informed")}</div>`;
  };
  el.addEventListener("change", e => { const d = e.target.dataset; if (!d.k) return; st[d.id] = st[d.id] || {}; st[d.id][d.k] = e.target.value; MDS.save(); drawGrid(); });
  MDS.$("#assess", el).onclick = () => {
    let got = 0; const max = S.length * 5;
    S.forEach(s => {
      const u = st[s.id] || {}, fb = [];
      if (u.power === s.power) got += 1.5; else fb.push(`power is ${s.power}`);
      if (u.interest === s.interest) got += 1.5; else fb.push(`interest is ${s.interest}`);
      if (u.stance === s.stance) got += 1; else if (u.stance && ["Sceptic", "Blocker"].includes(u.stance) === ["Sceptic", "Blocker"].includes(s.stance)) { got += 0.5; fb.push(`closer to ${s.stance}`); } else fb.push(`stance is ${s.stance}`);
      const right = APPROACH[`${s.power}|${s.interest}`];
      if (u.approach === right) got += 1; else fb.push(`approach: ${right}`);
      MDS.$("#sf-" + s.id, el).innerHTML = (fb.length ? `<span class="neg">${MDS.esc(fb.join("; "))}.</span> ` : `<span class="pos">Spot on.</span> `) + `<span class="faint">${MDS.esc(s.why)}</span>`;
    });
    const score = Math.round(got / max * 100);
    MDS.setScore(sc.id, "stake", score, "first");
    const [g, cls] = MDS.grade(score);
    MDS.$("#res", el).innerHTML = `<div class="row" style="margin-top:12px;gap:16px"><div class="bigscore">${score}</div><span class="pill ${cls === "pos" ? "ok" : "no"}">${g}</span><span class="small dim">Power isn't the same as job title. Key people and big customers can hold more power over the plan than their role suggests.</span></div>`;
  };
  drawGrid();
};
