/* App shell: home, case pages and routing via plain #name hashes (e.g. #harbour-lab). */
MDS.PHASES = [
  { id: "diagnose", label: "Diagnose", blurb: "Read the data, find the value" },
  { id: "plan", label: "Plan", blurb: "Model it, sequence it, win people" },
  { id: "deliver", label: "Deliver", blurb: "Run the change, handle the blockers" }
];
MDS.TESTS = [
  { id: "room", label: "Brief", phase: "diagnose", scored: false },
  { id: "investigate", label: "Investigate", phase: "diagnose", scored: true },
  { id: "find", label: "Find the levers", phase: "diagnose", scored: true },
  { id: "drill", label: "Modelling drill", phase: "diagnose", scored: true },
  { id: "model", label: "Build the model", phase: "plan", scored: true },
  { id: "lab", label: "Lever lab", phase: "plan", scored: true },
  { id: "stake", label: "Stakeholders", phase: "plan", scored: true },
  { id: "plan", label: "100-day plan", phase: "plan", scored: true },
  { id: "workshop", label: "Workshop", phase: "plan", scored: true },
  { id: "day", label: "A day in the life", phase: "deliver", scored: true },
  { id: "exec", label: "Run the transformation", phase: "deliver", scored: true },
  { id: "events", label: "Challenges", phase: "deliver", scored: true }
];

MDS.caseStats = id => {
  const scored = MDS.TESTS.filter(t => t.scored), s = scored.map(t => MDS.getScore(id, t.id)).filter(x => x != null);
  return { done: s.length, total: scored.length, avg: s.length ? Math.round(s.reduce((a, b) => a + b, 0) / s.length) : null };
};
MDS.ring = (p, label, cls = "", colour) => `<div class="ring ${cls}" style="--p:${MDS.clamp(p, 0, 100)};--c:${colour || (p >= 70 ? "var(--good)" : p >= 50 ? "var(--warn)" : "var(--acc)")}" role="img" aria-label="${label}"><span>${label}</span></div>`;

MDS.route = () => {
  const h = location.hash.slice(1);
  const view = MDS.$("#view");
  window.scrollTo(0, 0);
  view.style.animation = "none"; void view.offsetWidth; view.style.animation = "";
  if (h === "frameworks") { MDS.tests.frameworks(view); return; }
  const [id, test] = h.split("-");
  const sc = MDS.scenarios[id];
  if (!sc) { MDS.home(view); return; }
  const t = MDS.TESTS.find(x => x.id === test) ? test : "room";
  const st = MDS.caseStats(id);
  view.innerHTML = `
    <header class="case">
      <div class="row" style="gap:16px;align-items:center">${MDS.ring(st.avg != null ? st.avg : 0, st.avg != null ? st.avg : "–")}
        <div><div class="eyebrow">${MDS.esc(sc.difficulty)} · ${MDS.esc(sc.focus)}</div><h1>${MDS.esc(sc.name)}</h1><div class="dim small">${MDS.esc(sc.tagline)} ${st.done}/${st.total} tasks attempted.</div></div></div>
      <a class="btn ghost sm" href="#">All cases</a>
    </header>
    <nav class="phasenav" aria-label="Tasks">${MDS.PHASES.map((p, pi) => `<div class="phase"><div class="phase-l"><b>${pi + 1}</b> ${p.label}</div><div class="steps">${MDS.TESTS.filter(x => x.phase === p.id).map(x => {
      const s = MDS.getScore(sc.id, x.id);
      return `<a class="step-a" href="#${sc.id}-${x.id}" ${x.id === t ? 'aria-current="page"' : ""}>${x.scored ? `<span class="dot ${s == null ? "" : s >= 70 ? "s" : s >= 55 ? "m" : "l"}"></span>` : ""}${x.label}${s != null ? `<span class="sv">${s}</span>` : ""}</a>`;
    }).join("")}</div></div>`).join("")}</nav>
    <section id="test"></section>`;
  MDS.tests[t](sc, MDS.$("#test"));
};

MDS.home = view => {
  const fw = MDS.getScore("global", "frameworks");
  const all = MDS.order.flatMap(id => MDS.TESTS.filter(t => t.scored).map(t => MDS.getScore(id, t.id))).concat([fw]).filter(x => x != null);
  const readiness = all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : 0;
  view.innerHTML = `
    <div class="stack">
      <div class="panel hero">
        <div>
          <div class="eyebrow">Practice for MD, GM and transformation roles in software</div>
          <h1 style="margin-top:8px">Run the business before you run the interview.</h1>
          <p class="dim" style="max-width:62ch">Three newly acquired software companies. Dig through raw data, build your own model, plan the first 100 days, then live through twelve months of delivery: owners going quiet, founders pushing back, people resigning, and a Portfolio Manager who wants honest status.</p>
          <div class="journey">
            <div class="jstep"><b>1 · Diagnose</b><span>Investigate the data room and find the value.</span></div>
            <div class="jstep"><b>2 · Plan</b><span>Model it, map the people, sequence 100 days.</span></div>
            <div class="jstep"><b>3 · Deliver</b><span>Run the change month by month.</span></div>
            <div class="jstep"><b>4 · Prove</b><span>Turn each run into an interview story.</span></div>
          </div>
        </div>
        <div style="text-align:center">${MDS.ring(readiness, all.length ? readiness : "–", "lg")}<div class="small dim" style="margin-top:6px">Readiness<br><span class="faint">${all.length} scores so far</span></div></div>
      </div>
      <div class="cases">${MDS.order.map(id => {
        const sc = MDS.scenarios[id], st = MDS.caseStats(id);
        const bars = MDS.PHASES.map(p => { const ts = MDS.TESTS.filter(t => t.scored && t.phase === p.id), d = ts.filter(t => MDS.getScore(id, t.id) != null).length; return `<div class="pb">${p.label} ${d}/${ts.length}<div class="bar"><i style="width:${d / ts.length * 100}%"></i></div></div>`; }).join("");
        return `<div class="panel casecard">
          <div class="cc-top"><div><div class="diff eyebrow">${MDS.esc(sc.difficulty)}</div><h2 style="margin-top:4px">${MDS.esc(sc.name)}</h2></div>${MDS.ring(st.avg != null ? st.avg : st.done / st.total * 100, st.avg != null ? st.avg : "–")}</div>
          <div class="dim small">${MDS.esc(sc.tagline)}</div><div class="small"><strong>Focus:</strong> ${MDS.esc(sc.focus)}</div>
          <div class="phasebars">${bars}</div>
          <div class="row"><a class="btn" href="#${id}-${st.done ? "exec" : "room"}">${st.done ? "Continue" : "Open case"}</a><a class="btn ghost" href="#${id}-day">A day in the life</a></div></div>`;
      }).join("")}
        <div class="panel casecard">
          <div class="cc-top"><div><div class="diff eyebrow">Any case</div><h2 style="margin-top:4px">Frameworks and operating models</h2></div>${MDS.ring(fw || 0, fw != null ? fw : "–")}</div>
          <div class="dim small">Situational questions on change models, operating models, decision rights, pricing, PS economics, SaaS metrics, integration and facilitation.</div>
          <div><a class="btn" href="#frameworks">Start test</a></div></div>
      </div>
      <div class="panel small dim">
        <strong>About the scores.</strong> Every task is marked against the case's own evidence. The models behind them are teaching models with invented sensitivities. They show cause and effect and the trade-offs, not a forecast of any real company. Scores are kept in this browser only.
      </div>
    </div>`;
};

window.addEventListener("hashchange", MDS.route);
document.addEventListener("DOMContentLoaded", MDS.route);
