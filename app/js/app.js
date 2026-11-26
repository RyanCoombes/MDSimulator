/* App shell: home, case pages and routing via plain #name hashes (e.g. #harbour-lab). */
MDS.TESTS = [
  { id: "room", label: "Brief", scored: false },
  { id: "investigate", label: "Investigate", scored: true },
  { id: "model", label: "Build the model", scored: true },
  { id: "stake", label: "Stakeholders", scored: true },
  { id: "plan", label: "100-day plan", scored: true },
  { id: "find", label: "Find the levers", scored: true },
  { id: "lab", label: "Lever lab", scored: true },
  { id: "drill", label: "Modelling drill", scored: true },
  { id: "events", label: "Challenges", scored: true },
  { id: "workshop", label: "Workshop", scored: true }
];

MDS.go = hash => { if (location.hash.slice(1) === hash) MDS.route(); else location.hash = hash; };

MDS.route = () => {
  const h = location.hash.slice(1);
  const view = MDS.$("#view");
  window.scrollTo(0, 0);
  if (h === "frameworks") { MDS.tests.frameworks(view); return; }
  const [id, test] = h.split("-");
  const sc = MDS.scenarios[id];
  if (!sc) { MDS.home(view); return; }
  const t = MDS.TESTS.find(x => x.id === test) ? test : "room";
  view.innerHTML = `
    <header class="case">
      <div><div class="eyebrow">${MDS.esc(sc.difficulty)} · ${MDS.esc(sc.focus)}</div><h1>${MDS.esc(sc.name)}</h1><div class="dim small">${MDS.esc(sc.tagline)} Fictional company; all figures invented.</div></div>
      <a class="btn ghost sm" href="#">All cases</a>
    </header>
    <nav class="tabs" aria-label="Tests">${MDS.TESTS.map((x, i) => {
      const s = MDS.getScore(sc.id, x.id);
      return `<a class="tab" href="#${sc.id}-${x.id}" ${x.id === t ? 'aria-current="page"' : ""}><span class="step">${i + 1}</span>${x.label}${s != null ? `<span class="sc">${s}</span>` : ""}</a>`;
    }).join("")}</nav>
    <section id="test"></section>`;
  MDS.tests[t](sc, MDS.$("#test"));
};

MDS.home = view => {
  const fw = MDS.getScore("global", "frameworks");
  view.innerHTML = `
    <div class="stack">
      <div class="panel">
        <div class="eyebrow">Practice for MD, GM and transformation roles in software</div>
        <h1 style="margin-top:6px">Run the business before you run the interview.</h1>
        <p class="dim" style="max-width:68ch">Each case is a newly acquired vertical software company. Dig through the raw data, build your own financial model, map the stakeholders, write the 100-day plan, test levers under a one-person change budget, do the maths, handle the people and design the workshop that gets it agreed. Every task is scored, and your best score is kept in this browser.</p>
      </div>
      <div class="cases">${MDS.order.map(id => {
        const sc = MDS.scenarios[id];
        const chips = MDS.TESTS.filter(t => t.scored).map(t => { const s = MDS.getScore(id, t.id); return `<span class="chip ${s != null ? "done" : ""}">${t.label} ${s != null ? s : "–"}</span>`; }).join("");
        return `<div class="panel casecard"><div class="diff eyebrow">${MDS.esc(sc.difficulty)}</div><h2>${MDS.esc(sc.name)}</h2>
          <div class="dim small">${MDS.esc(sc.tagline)}</div><div class="small"><strong>Focus:</strong> ${MDS.esc(sc.focus)}</div>
          <div class="scores">${chips}</div><div><a class="btn" href="#${id}-room">Open case</a></div></div>`;
      }).join("")}
        <div class="panel casecard"><div class="diff eyebrow">Any case</div><h2>Frameworks and operating models</h2>
          <div class="dim small">Situational questions on change models, operating models, decision rights, pricing, PS economics, SaaS metrics, integration and facilitation.</div>
          <div class="scores"><span class="chip ${fw != null ? "done" : ""}">Best ${fw != null ? fw : "–"}</span></div>
          <div><a class="btn" href="#frameworks">Start test</a></div></div>
      </div>
      <div class="panel small dim">
        <strong>How scoring works.</strong> Lever lab plans are scored out of 100: targets in the base case (40), resilience in a downside case (20), people (20), and realism (20). The model is a teaching model with invented sensitivities. It shows cause and effect; it isn't a forecast of any real company.
      </div>
    </div>`;
};

window.addEventListener("hashchange", MDS.route);
document.addEventListener("DOMContentLoaded", MDS.route);
