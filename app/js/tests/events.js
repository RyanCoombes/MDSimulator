/* Test 5: transformation challenges. Six situations, four responses each, consequences carry forward. */
MDS.tests.events = (sc, el) => {
  let i = 0, total = 0, answered = false;
  const m = { founder: sc.people.founder, team: sc.people.team, cust: sc.people.cust, delivery: 50 };
  const order = sc.events.map(ev => ({ ...ev, options: MDS.shuffle(ev.options, MDS.rng(Math.floor(Math.random() * 1e9))) }));
  const meters = () => `<div class="meterrow">${MDS.meterHTML(`${sc.people.founderLabel} trust`, m.founder)}${MDS.meterHTML("Team morale", m.team)}${MDS.meterHTML("Customers", m.cust)}${MDS.meterHTML("Plan delivery", m.delivery)}</div>`;
  const show = () => {
    const ev = order[i];
    answered = false;
    el.innerHTML = `<div class="stack">
      <div class="panel">${meters()}</div>
      <div class="panel"><div class="eyebrow">Situation ${i + 1} of ${order.length}</div><h2 style="margin-top:4px">${MDS.esc(ev.title)}</h2>${ev.inspired ? (() => { const c = MDS.content.cases.find(x => x.id === ev.inspired); return c ? `<div class="small"><span class="pill">Fictional</span> Inspired by a real case: <a href="#library">${MDS.esc(c.title)} (${MDS.esc(c.years)})</a></div>` : ""; })() : ""}<p>${MDS.esc(ev.text)}</p>
        <p class="small dim">What do you do?</p>
        <div class="stack" id="opts">${ev.options.map((o, j) => `<button type="button" class="opt" data-j="${j}" style="text-align:left;font:inherit;color:inherit">${MDS.esc(o.t)}</button>`).join("")}</div>
        <div id="fb" style="margin-top:12px"></div></div></div>`;
    MDS.$$("#opts .opt", el).forEach(b => b.onclick = () => {
      if (answered) return; answered = true;
      const o = ev.options[+b.dataset.j];
      total += o.s;
      Object.keys(m).forEach(key => { m[key] = MDS.clamp(m[key] + (o.fx[key] || 0), 0, 100); });
      const best = ev.options.find(x => x.s === 3);
      MDS.$$("#opts .opt", el).forEach(x => { const oo = ev.options[+x.dataset.j]; x.disabled = true; if (oo.s === 3) x.classList.add("right"); else if (x === b) x.classList.add("wrong"); });
      MDS.$("#fb", el).innerHTML = `<div class="fb ${o.s === 3 ? "good" : o.s >= 1 ? "mid" : "bad"}"><strong>${o.s === 3 ? "Strong response." : o.s >= 1 ? "Partly right." : "This backfires."}</strong> ${MDS.esc(o.fb)}</div>
        ${o.s < 3 ? `<div class="fb good" style="margin-top:8px"><strong>Stronger:</strong> ${MDS.esc(best.t)} ${MDS.esc(best.fb)}</div>` : ""}
        <div style="margin-top:12px"><button class="btn" id="next" type="button">${i + 1 < order.length ? "Next situation →" : "See results"}</button></div>`;
      el.querySelector(".panel").innerHTML = meters();
      MDS.$("#next", el).onclick = () => { i++; i < order.length ? show() : finish(); };
    });
  };
  const finish = () => {
    const judgement = total / (order.length * 3) * 80;
    const health = MDS.clamp(((m.founder + m.team + m.cust + m.delivery) / 4 - 40) / 30 * 20, 0, 20);
    const score = Math.round(judgement + health);
    MDS.setScore(sc.id, "events", score);
    const [g, cls] = MDS.grade(score);
    el.innerHTML = `<div class="stack"><div class="panel">${meters()}</div><div class="panel">
      <div class="row" style="gap:16px"><div class="bigscore">${score}</div><span class="pill ${cls === "pos" ? "ok" : "no"}">${g}</span></div>
      <p class="dim">Judgement ${Math.round(judgement)}/80 (how often you chose the strongest response), plus ${Math.round(health)}/20 for where the people and the plan ended up.</p>
      <p>The pattern behind the strong answers: <strong>keep the GM in charge of their business, turn opinions into evidence, trade rather than concede, tell bad news early, and involve the people who'll live with the change.</strong> These are the stories interviewers want from you, so link each one to something you've actually done.</p>
      <button class="btn" id="again" type="button">Run the challenges again</button></div></div>`;
    MDS.$("#again", el).onclick = () => MDS.tests.events(sc, el);
  };
  show();
};
