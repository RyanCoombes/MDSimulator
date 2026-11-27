/* Readiness by competency: maps every score to the five things a Business Transformation Leader interview tests. */
MDS.COMPETENCIES = [
  { id: "fin", name: "Financial modelling and P&L diagnosis", tests: ["clean", "investigate", "drill", "model"], global: ["studies", "engage"], why: "Build the forecast yourself, with no finance team, and find the value in a P&L." },
  { id: "value", name: "Value creation levers: pricing, PS, R&D and AI", tests: ["find", "lab"], global: ["frameworks", "library"], why: "Know which levers move margin and retention, and what each one costs." },
  { id: "deliver", name: "Integration and transformation delivery", tests: ["portfolio", "plan", "exec", "events"], global: [], why: "Set up the programme, sequence it, keep it moving and report it honestly." },
  { id: "people", name: "Leading people through change", tests: ["stake", "workshop", "talk", "day"], global: [], why: "Win founders and teams over without formal authority." },
  { id: "comm", name: "Executive communication and judgement", tests: ["talk", "write", "day"], global: ["interview"], why: "Say it clearly, with numbers, under questioning." }
];
MDS.readiness = () => {
  const comp = MDS.state.comp || {};
  return MDS.COMPETENCIES.map(c => {
    const items = [];
    MDS.order.forEach(id => c.tests.forEach(t => { const T = MDS.TESTS.find(x => x.id === t); items.push({ label: `${MDS.scenarios[id].name}: ${T.label}`, href: `#${id}-${t}`, score: MDS.getScore(id, t) }); }));
    const GL = { studies: ["Real company studies", "#studies"], frameworks: ["Frameworks quiz", "#frameworks"], library: ["Case library", "#library"], interview: ["Mock interviews", "#interview"], engage: ["Open engagements", "#engage"] };
    c.global.forEach(g => items.push({ label: GL[g][0], href: GL[g][1], score: MDS.getScore("global", g) }));
    const rated = (comp[c.id] || []), iv = rated.length ? rated.reduce((a, b) => a + b, 0) / rated.length * 20 : null;
    const done = items.filter(i => i.score != null), vals = done.map(i => i.score).concat(iv != null ? [iv] : []);
    const next = items.filter(i => i.score == null)[0] || done.slice().sort((a, b) => a.score - b.score)[0];
    return Object.assign({}, c, { items, done: done.length, total: items.length, score: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null, interview: iv, ratings: rated.length, next });
  });
};
MDS.tests.readiness = el => {
  const R = MDS.readiness(), scored = R.filter(r => r.score != null);
  const weakest = scored.slice().sort((a, b) => a.score - b.score)[0], untouched = R.filter(r => r.score == null);
  const lr = MDS.state.lessons || {}, nl = MDS.content.lessons.filter(l => lr[l.id]).length;
  el.innerHTML = `<div class="stack">
    <div class="row" style="justify-content:space-between"><div><div class="eyebrow">Readiness</div><h1 style="margin-top:4px">Where you're ready, and where you're not</h1></div><a class="btn ghost sm" href="#">All cases</a></div>
    <div class="panel"><p style="margin:0">Every score in the simulator counts towards one of five competencies that Business Transformation Leader interviews test. A competency with few attempts isn't proven yet, whatever the number says. ${weakest ? `<strong>Weakest so far: ${MDS.esc(weakest.name)} (${weakest.score}).</strong>` : "<strong>Nothing scored yet.</strong>"} ${untouched.length ? `Not started: ${untouched.map(u => MDS.esc(u.name)).join("; ")}.` : ""}</p>
      <p class="small faint" style="margin:8px 0 0">Lessons practised: ${nl}/${MDS.content.lessons.length}. Scores are kept in this browser only.</p></div>
    ${R.map(r => `<div class="panel">
      <div class="row" style="gap:16px;align-items:center;flex-wrap:nowrap">${MDS.ring(r.score || 0, r.score != null ? r.score : "–")}
        <div style="min-width:0;flex:1"><h3 style="margin:0">${MDS.esc(r.name)}</h3><div class="small dim">${MDS.esc(r.why)}</div>
          <div class="small" style="margin-top:4px">${r.done}/${r.total} tasks attempted${r.interview != null ? ` · interviewers rated it ${(r.interview / 20).toFixed(1)}/5 over ${r.ratings} interview${r.ratings > 1 ? "s" : ""}` : " · not yet rated in an interview"}${r.done < r.total / 2 ? ` · <span style="color:var(--warn)">thin evidence</span>` : ""}</div></div>
        ${r.next ? `<a class="btn sm" href="${r.next.href}" style="flex:none">${r.next.score == null ? "Next" : "Redo weakest"}</a>` : ""}</div>
      ${r.next ? `<div class="small faint" style="margin-top:6px">${r.next.score == null ? "Next up" : "Lowest score"}: ${MDS.esc(r.next.label)}${r.next.score != null ? ` (${r.next.score})` : ""}</div>` : ""}
      <details style="margin-top:8px"><summary class="small">All ${r.total} tasks</summary><div class="rdgrid">${r.items.map(i => `<a href="${i.href}" class="small"><span class="dot ${i.score == null ? "" : i.score >= 70 ? "s" : i.score >= 55 ? "m" : "l"}"></span>${MDS.esc(i.label)}<b class="num">${i.score != null ? i.score : "–"}</b></a>`).join("")}</div></details>
    </div>`).join("")}
  </div>`;
};
