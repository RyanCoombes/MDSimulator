/* App shell: home, case pages and routing via plain #name hashes (e.g. #harbour-lab). */
MDS.PHASES = [
  { id: "diagnose", label: "Diagnose", blurb: "Read the data, find the value" },
  { id: "plan", label: "Plan", blurb: "Model it, sequence it, win people" },
  { id: "deliver", label: "Deliver", blurb: "Run the change, handle the blockers" }
];
MDS.TESTS = [
  { id: "room", label: "Brief", phase: "diagnose", scored: false },
  { id: "clean", label: "Check the data", phase: "diagnose", scored: true },
  { id: "investigate", label: "Investigate", phase: "diagnose", scored: true },
  { id: "find", label: "Find the levers", phase: "diagnose", scored: true },
  { id: "drill", label: "Modelling drill", phase: "diagnose", scored: true },
  { id: "model", label: "Build the model", phase: "plan", scored: true },
  { id: "lab", label: "Lever lab", phase: "plan", scored: true },
  { id: "portfolio", label: "Initiative portfolio", phase: "plan", scored: true },
  { id: "stake", label: "Stakeholders", phase: "plan", scored: true },
  { id: "plan", label: "100-day plan", phase: "plan", scored: true },
  { id: "workshop", label: "Workshop", phase: "plan", scored: true },
  { id: "day", label: "A day in the life", phase: "deliver", scored: true },
  { id: "talk", label: "Conversations", phase: "deliver", scored: true },
  { id: "write", label: "Write it", phase: "deliver", scored: true },
  { id: "exec", label: "Run the transformation", phase: "deliver", scored: true },
  { id: "events", label: "Challenges", phase: "deliver", scored: true }
];

MDS.caseStats = id => {
  const scored = MDS.TESTS.filter(t => t.scored), s = scored.map(t => MDS.getScore(id, t.id)).filter(x => x != null);
  return { done: s.length, total: scored.length, avg: s.length ? Math.round(s.reduce((a, b) => a + b, 0) / s.length) : null };
};
MDS.ring = (p, label, cls = "", colour) => `<div class="ring ${cls}" style="--p:${MDS.clamp(p, 0, 100)};--c:${colour || (p >= 70 ? "var(--good)" : p >= 50 ? "var(--warn)" : "var(--acc)")}" role="img" aria-label="${label}"><span>${label}</span></div>`;

/* Status bar: always says where you are in the simulation. */
MDS.hud = (where, detail) => { const el = document.getElementById("hudCtx"); if (el) el.innerHTML = `<i class="live" aria-hidden="true"></i><b>${MDS.esc(where)}</b>${detail ? `<span>${MDS.esc(detail)}</span>` : ""}`; };
MDS.pips = (n, of = 4) => `<span class="pips" role="img" aria-label="Difficulty ${n} of ${of}">${Array.from({ length: of }, (_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("")}</span>`;
MDS.LEVELS = { standard: 2, easy: 1, medium: 2, hard: 3, "very hard": 4 };
MDS.route = () => {
  const h = location.hash.slice(1);
  const view = MDS.$("#view");
  window.scrollTo(0, 0);
  view.style.animation = "none"; void view.offsetWidth; view.style.animation = "";
  const DESK = { frameworks: ["Desk study", "Frameworks and lessons"], interview: ["Interview suite", "Mock interviews"], library: ["Desk study", "Case library"], studies: ["Desk study", "Real company accounts"], engage: ["Field work", "Open engagements"], readiness: ["Interview suite", "Readiness by competency"] };
  if (DESK[h]) { MDS.brief(null); MDS.hud(DESK[h][0], DESK[h][1]); MDS.tests[h](view); return; }
  const [id, test] = h.split("-");
  const sc = MDS.scenarios[id];
  MDS.brief(sc || null);
  if (!sc) { MDS.hud("Assignment board", "Choose a file"); MDS.home(view); return; }
  const t = MDS.TESTS.find(x => x.id === test) ? test : "room";
  const st = MDS.caseStats(id), T0 = MDS.TESTS.find(x => x.id === t), P0 = MDS.PHASES.findIndex(p => p.id === T0.phase);
  MDS.hud(`Posting: ${sc.name}`, `Phase ${P0 + 1} ${MDS.PHASES[P0].label} · ${T0.label}`);
  view.innerHTML = `
    <header class="case">
      <div class="row" style="gap:16px;align-items:center">${MDS.ring(st.avg != null ? st.avg : 0, st.avg != null ? st.avg : "–")}
        <div><div class="fileno">File ${MDS.esc(sc.id.slice(0, 2).toUpperCase())}-0${MDS.order.indexOf(sc.id) + 1} · ${MDS.pips(MDS.LEVELS[sc.difficulty.toLowerCase()] || 2)} ${MDS.esc(sc.difficulty)} · ${MDS.esc(sc.focus)}</div><h1>${MDS.esc(sc.name)}</h1><div class="dim small">${MDS.esc(sc.tagline)} ${st.done}/${st.total} tasks attempted.</div></div></div>
      <div class="row"><button class="btn sm ${MDS.settings.briefOpen ? "" : "ghost"}" id="briefBtn" type="button" aria-expanded="${!!MDS.settings.briefOpen}" aria-controls="brief">Brief &amp; notes</button><a class="btn ghost sm" href="#">Board</a></div>
    </header>
    <nav class="phasenav" aria-label="Tasks">${MDS.PHASES.map((p, pi) => `<div class="phase"><div class="phase-l"><b>${pi + 1}</b> ${p.label}</div><div class="steps">${MDS.TESTS.filter(x => x.phase === p.id).map(x => {
      const s = MDS.getScore(sc.id, x.id);
      return `<a class="step-a" href="#${sc.id}-${x.id}" ${x.id === t ? 'aria-current="page"' : ""}>${x.scored ? `<span class="dot ${s == null ? "" : s >= 70 ? "s" : s >= 55 ? "m" : "l"}"></span>` : ""}${x.label}${s != null ? `<span class="sv">${s}</span>` : ""}</a>`;
    }).join("")}</div></div>`).join("")}</nav>
    <section id="test"></section>`;
  MDS.tests[t](sc, MDS.$("#test"));
};

MDS.home = view => {
  const G = k => MDS.getScore("global", k), fw = G("frameworks"), iv = G("interview");
  const all = MDS.order.flatMap(id => MDS.TESTS.filter(t => t.scored).map(t => MDS.getScore(id, t.id))).concat([fw, iv, G("studies"), G("library"), G("engage")]).filter(x => x != null);
  const readiness = all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : 0;
  const plate = v => MDS.ring(v || 0, v != null ? v : "–");
  const stamp = (done, total) => done == null ? "" : `<span class="stamp ${done >= total ? "done" : done ? "go" : ""}">${done >= total ? "Complete" : done ? "In progress" : "Not started"}</span>`;
  const row = (code, title, sub, meta, score, href, label) => `<a class="frow" href="${href}"><span class="code">${code}</span><span class="ftw"><span class="ft">${MDS.esc(title)}</span><span class="fs" style="display:block">${sub}</span></span><span class="fm">${meta}</span>${plate(score)}<span class="fa"><span class="btn sm">${label}</span></span></a>`;
  const E = MDS.content.engagements || [], es = MDS.state.engage || {};
  view.innerHTML = `
    <div class="stack">
      <section class="memo">
        <div class="memo-h"><span>Group portfolio office · standing brief</span><span>To: you, transformation lead</span></div>
        <div><h1>Run the business before you run the interview.</h1>
          <p>You are posted into newly acquired software companies. Work the records, build your own model, set up the programme and live through twelve months of delivery: owners going quiet, founders pushing back, people resigning, and a Portfolio Manager who wants honest status. Then take what you learned into the interview suite.</p></div>
        <div class="memo-side"><span class="lab2">Readiness</span>${MDS.ring(readiness, all.length ? readiness : "–", "lg")}<span class="small faint">${all.length} scores on file</span><a class="btn ghost sm" href="#readiness">By competency</a></div>
      </section>
      <section class="board" aria-label="Guided postings">
        <h2 class="bh">Guided postings <span>Three acquired companies. Diagnose, plan, deliver.</span></h2>
        ${MDS.order.map((id, i) => { const sc = MDS.scenarios[id], st = MDS.caseStats(id);
          const seg = MDS.PHASES.map(p => { const ts = MDS.TESTS.filter(t => t.scored && t.phase === p.id), d = ts.filter(t => MDS.getScore(id, t.id) != null).length; return `<i title="${p.label} ${d}/${ts.length}"><b style="width:${d / ts.length * 100}%"></b></i>`; }).join("");
          const next = st.done ? (MDS.TESTS.find(t => t.scored && MDS.getScore(id, t.id) == null) || { id: "room" }).id : "room";
          return row(`${id.slice(0, 2).toUpperCase()}-0${i + 1}`, sc.name, `${MDS.esc(sc.tagline)} <span class="faint">${MDS.esc(sc.focus)}.</span>`, `<span>${MDS.pips(MDS.LEVELS[sc.difficulty.toLowerCase()] || 2)} ${MDS.esc(sc.difficulty)} · ${st.done}/${st.total} tasks</span><span class="segbar">${seg}</span>${stamp(st.done, st.total)}`, st.avg, `#${id}-${next}`, st.done ? "Continue" : "Open file"); }).join("")}
      </section>
      <section class="board" aria-label="Field work">
        <h2 class="bh">Field work <span>A brief and a few days. Nothing is handed to you. Ask, download, clean, report.</span></h2>
        ${E.map((C, i) => row(`FW-0${i + 1}`, C.name, MDS.esc(C.sector), `<span>${MDS.pips(MDS.LEVELS[C.level] || 2)} ${MDS.esc(C.level)} · ${C.budget} days</span>${stamp(es[C.id] ? (es[C.id].done ? 1 : 0.5) : 0, 1)}`, MDS.getScore("engage", C.id), "#engage", es[C.id] && !es[C.id].done ? "Continue" : "Take it")).join("")}
      </section>
      <section class="board" aria-label="Desk study">
        <h2 class="bh">Desk study <span>Real accounts, real cases and the models behind the work.</span></h2>
        ${row("DS-01", "Real company accounts", `${(MDS.content.studies || []).length} UK software companies from their Companies House filings, unnamed until you've made the call.`, `<span>Easy to hard</span>`, G("studies"), "#studies", "Open")}
        ${row("DS-02", "Case library", `${MDS.content.cases.length} sourced cases, each paused at the decision that mattered.`, `<span>Read and decide</span>`, G("library"), "#library", "Open")}
        ${row("DS-03", "Frameworks and lessons", `${MDS.content.lessons.length} lessons with hands-on exercises, then a quiz that explains every option.`, `<span>${Object.keys(MDS.state.lessons || {}).length}/${MDS.content.lessons.length} practised</span>`, fw, "#frameworks", "Open")}
      </section>
      <section class="board" aria-label="Interview suite">
        <h2 class="bh">Interview suite <span>Turn the work into answers.</span></h2>
        ${row("IV-01", "Mock interviews", "Three rounds and a timed case on real accounts. Add your CV and the job spec to make it about you.", `<span>Live rounds need AI</span>`, iv, "#interview", "Enter")}
        ${row("IV-02", "Readiness by competency", "Every score mapped to the five things the interview tests, with your weakest area first.", `<span>${all.length} scores on file</span>`, all.length ? readiness : null, "#readiness", "Review")}
      </section>
      <p class="small faint" style="margin:0">Scores are marked against each file's own evidence and kept in this browser only. The three guided postings run on teaching models with invented sensitivities: they show cause and effect, not a forecast of any real company.</p>
    </div>`;
};

/* Brief & notes drawer: goals, facts, findings and a notepad, available on every case tab. */
MDS.brief = sc => {
  let a = document.getElementById("brief");
  if (!sc) { if (a) a.remove(); document.body.classList.remove("brief-on"); return; }
  if (!a) { a = document.createElement("aside"); a.id = "brief"; a.className = "brief"; a.setAttribute("aria-label", "Brief and notes"); document.body.appendChild(a); }
  a.dataset.sc = sc.id;
  const open = !!MDS.settings.briefOpen;
  a.hidden = !open; document.body.classList.toggle("brief-on", open);
  MDS.state.notes = MDS.state.notes || {};
  const y0 = MDS.model(sc, MDS.defaults(sc)), T = MDS.targetChecks(sc, y0, MDS.people(sc, MDS.defaults(sc), y0));
  const finds = (MDS.state.findings || {})[sc.id] || [];
  a.innerHTML = `<div class="bhead"><div><div class="eyebrow">${MDS.esc(sc.name)}</div><strong>Brief &amp; notes</strong></div><button class="icon" type="button" id="briefClose" aria-label="Close brief">×</button></div>
    <div class="bbody">
      <section><h4>Targets</h4><ul class="goal">${T.map(t => `<li>${MDS.esc(t.label)}</li>`).join("")}</ul></section>
      <section><h4>From the Portfolio Manager</h4><p class="small">"${MDS.esc(sc.pmBrief)}"</p></section>
      <section><h4>Key facts</h4><div class="bkpis">${sc.kpis.map(([l, v, f]) => `<div class="${f ? "flag" : ""}"><span>${MDS.esc(l)}</span><b class="num">${MDS.esc(v)}</b></div>`).join("")}</div>
        <div class="bkpis" style="margin-top:6px"><div><span>Revenue</span><b class="num">${MDS.k(y0.yrs[0].rev)}</b></div><div><span>EBITDA</span><b class="num">${MDS.k(y0.yrs[0].ebitda)} · ${MDS.pc(y0.yrs[0].margin)}</b></div></div>
        <p class="small faint" style="margin-top:6px">${MDS.esc(sc.note)}</p></section>
      <section><details><summary><h4 style="display:inline">What people said</h4></summary>${sc.interviews.map(([q, w]) => `<p class="small">"${MDS.esc(q)}" <span class="faint">${MDS.esc(w)}</span></p>`).join("")}</details></section>
      <section><h4>Your findings <span class="faint num">${finds.length}</span></h4>${finds.length ? finds.map(f => `<div class="bfind"><strong class="small">${MDS.esc(f.title)}</strong>${f.note ? `<div class="small dim">${MDS.esc(f.note)}</div>` : ""}</div>`).join("") : `<p class="small faint">Save findings from Investigate and they'll appear here.</p>`}</section>
      ${(() => { const C = MDS.carry(sc).notes, pf = ((MDS.state.portfolio || {})[sc.id] || {}).final; return C.length || pf ? `<section><h4>Carried into delivery</h4>${pf ? `<p class="small">Your portfolio: ${Object.keys(pf.items).length} chartered initiatives.</p>` : ""}${C.map(([c, t]) => `<p class="small ${c === "g" ? "pos" : "neg"}">${MDS.esc(t)}</p>`).join("")}</section>` : ""; })()}
      <section><h4>Notepad</h4><label for="bnotes" class="small faint">Your working notes for this case (kept in this browser)</label><textarea id="bnotes" rows="8">${MDS.esc(MDS.state.notes[sc.id] || "")}</textarea></section>
    </div>`;
  a.querySelector("#bnotes").addEventListener("input", e => { MDS.state.notes[sc.id] = e.target.value; MDS.save(); });
  a.querySelector("#briefClose").onclick = () => MDS.toggleBrief(false);
};
MDS.refreshBrief = () => { const a = document.getElementById("brief"); if (a && MDS.scenarios[a.dataset.sc]) MDS.brief(MDS.scenarios[a.dataset.sc]); };
MDS.toggleBrief = on => {
  MDS.settings.briefOpen = on; MDS.saveSettings(); MDS.refreshBrief();
  const b = document.getElementById("briefBtn"); if (b) { b.setAttribute("aria-expanded", on); b.classList.toggle("ghost", !on); }
};
document.addEventListener("click", e => { if (e.target.closest("#briefBtn")) MDS.toggleBrief(!MDS.settings.briefOpen); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && MDS.settings.briefOpen && document.getElementById("brief") && window.innerWidth < 1400) MDS.toggleBrief(false); });

window.addEventListener("hashchange", MDS.route);
document.addEventListener("click", e => { if (e.target.closest("#settingsBtn")) MDS.openSettings(); });
document.addEventListener("DOMContentLoaded", MDS.route);
