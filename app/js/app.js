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

/* Breadcrumb, sidebar tree and quick jump. The sidebar holds the whole simulation; the open posting expands to its tasks. */
MDS.hud = (where, detail) => { const el = document.getElementById("hudCtx"); if (el) el.innerHTML = `<b>${MDS.esc(where)}</b>${detail ? `<i class="sep">/</i><span>${MDS.esc(detail)}</span>` : ""}`; };
MDS.pips = (n, of = 4) => `<span class="lv" role="img" aria-label="Difficulty ${n} of ${of}">${Array.from({ length: of }, (_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("")}</span>`;
MDS.LEVELS = { standard: 2, easy: 1, medium: 2, hard: 3, "very hard": 4 };
MDS.ICO = { home: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z", file: "M6 3h9l4 4v14H6zM14 3v5h5", field: "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.800 7 11 7 11zM12 12.500a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5z", book: "M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11", chart: "M4 20V10M10 20V4M16 20v-8M22 20H2", mic: "M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM6 11a6 6 0 0 0 12 0M12 17v4", target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" };
MDS.ico = k => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.700" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${MDS.ICO[k]}"/></svg>`;
MDS.dests = () => {
  const G = k => MDS.getScore("global", k), out = [{ href: "#", label: "Home", group: "", ico: "home" }];
  MDS.order.forEach(id => { const sc = MDS.scenarios[id]; out.push({ href: `#${id}-room`, label: sc.name, group: "Postings", ico: "file", score: MDS.caseStats(id).avg, sc: id });
    MDS.TESTS.forEach(t => out.push({ href: `#${id}-${t.id}`, label: t.label, group: sc.name, child: id, phase: t.phase, score: MDS.getScore(id, t.id), scored: t.scored })); });
  out.push({ href: "#engage", label: "Open engagements", group: "Field work", ico: "field", score: G("engage") },
    { href: "#studies", label: "Real company accounts", group: "Desk study", ico: "chart", score: G("studies") }, { href: "#library", label: "Case library", group: "Desk study", ico: "book", score: G("library") }, { href: "#frameworks", label: "Frameworks and lessons", group: "Desk study", ico: "book", score: G("frameworks") },
    { href: "#interview", label: "Mock interviews", group: "Interview", ico: "mic", score: G("interview") }, { href: "#readiness", label: "Readiness", group: "Interview", ico: "target" });
  return out;
};
MDS.sideNav = () => {
  const nav = document.getElementById("sideNav"); if (!nav) return;
  const h = "#" + location.hash.slice(1), cur = h === "#" ? "#" : h, open = cur.slice(1).split("-")[0], D = MDS.dests();
  const item = d => `<a class="ni" href="${d.href}" ${d.href === cur || (d.sc && d.sc === open && MDS.scenarios[open]) && d.href === cur ? 'aria-current="page"' : ""}>${d.ico ? MDS.ico(d.ico) : `<i class="nd ${d.score == null ? "" : d.score >= 70 ? "s" : d.score >= 55 ? "m" : "l"}"></i>`}<span class="nt">${MDS.esc(d.label)}</span>${d.score != null ? `<span class="ns">${d.score}</span>` : ""}</a>`;
  let html = `<div class="nav">${item(D[0])}</div>`, last = "";
  D.slice(1).filter(d => !d.child).forEach(d => {
    if (d.group !== last) { html += `${last ? "</div>" : ""}<div class="nlab">${d.group}</div><div class="nav">`; last = d.group; }
    html += item(d);
    if (d.sc && d.sc === open) html += `<div class="snav">${MDS.PHASES.map(p => `<div class="ph">${p.label}</div>` + D.filter(x => x.child === d.sc && x.phase === p.id).map(item).join("")).join("")}</div>`;
  });
  nav.innerHTML = html + "</div>";
  const all = MDS.order.flatMap(id => MDS.TESTS.filter(t => t.scored).map(t => MDS.getScore(id, t.id))).concat(["frameworks", "interview", "studies", "library", "engage"].map(k => MDS.getScore("global", k))).filter(x => x != null);
  const r = all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : 0;
  document.getElementById("sideFoot").innerHTML = `<a class="ni" href="#readiness" style="padding:0"><span class="nt">Readiness</span><span class="ns">${all.length ? r : "–"}</span></a><div class="rbar"><i style="width:${r}%"></i></div><span class="small faint">${all.length} score${all.length === 1 ? "" : "s"} so far</span>`;
  const on = nav.querySelector('[aria-current="page"]'); if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest" });
  document.body.classList.remove("nav-open");
};
MDS.palette = () => {
  if (document.querySelector(".pal")) return;
  const D = MDS.dests().map(d => ({ href: d.href, label: d.child ? `${d.group}: ${d.label}` : d.label, group: d.child ? "" : d.group }));
  const m = document.createElement("div"); m.className = "modal pal"; m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="Jump to"><input type="text" id="palIn" placeholder="Jump to a posting, task or section…" autocomplete="off" aria-controls="palRes"><div class="res" id="palRes" role="listbox"></div></div>`;
  document.body.appendChild(m); requestAnimationFrame(() => m.classList.add("on"));
  const inp = m.querySelector("#palIn"), res = m.querySelector("#palRes"); let list = [], k = 0;
  const close = () => { m.classList.remove("on"); setTimeout(() => m.remove(), 150); };
  const go = d => { close(); if (d) location.hash = d.href.slice(1); };
  const draw = () => { const q = inp.value.toLowerCase().trim().split(/\s+/).filter(Boolean); list = D.filter(d => q.every(w => d.label.toLowerCase().includes(w))).slice(0, 40); k = Math.min(k, Math.max(0, list.length - 1));
    res.innerHTML = list.length ? list.map((d, i) => `<div class="pi ${i === k ? "on" : ""}" role="option" aria-selected="${i === k}" data-i="${i}">${MDS.esc(d.label)}${d.group ? `<small>${MDS.esc(d.group)}</small>` : ""}</div>`).join("") : `<div class="none">Nothing matches.</div>`;
    const on = res.querySelector(".on"); if (on) on.scrollIntoView({ block: "nearest" }); };
  inp.oninput = () => { k = 0; draw(); };
  inp.onkeydown = e => { if (e.key === "ArrowDown") { k = Math.min(list.length - 1, k + 1); draw(); e.preventDefault(); } else if (e.key === "ArrowUp") { k = Math.max(0, k - 1); draw(); e.preventDefault(); } else if (e.key === "Enter") go(list[k]); else if (e.key === "Escape") close(); };
  res.onclick = e => { const x = e.target.closest("[data-i]"); if (x) go(list[+x.dataset.i]); };
  m.onclick = e => { if (e.target === m) close(); };
  draw(); inp.focus();
};
document.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); MDS.palette(); } });
document.addEventListener("click", e => { if (e.target.closest("#jumpBtn")) MDS.palette(); else if (e.target.closest("#menuBtn")) document.body.classList.toggle("nav-open"); else if (e.target.closest("#scrim")) document.body.classList.remove("nav-open"); });
MDS.route = () => {
  const h = location.hash.slice(1);
  MDS.sideNav();
  const view = MDS.$("#view");
  window.scrollTo(0, 0);
  view.style.animation = "none"; void view.offsetWidth; view.style.animation = "";
  const DESK = { frameworks: ["Desk study", "Frameworks and lessons"], interview: ["Interview", "Mock interviews"], library: ["Desk study", "Case library"], studies: ["Desk study", "Real company accounts"], engage: ["Field work", "Open engagements"], readiness: ["Interview", "Readiness"] };
  if (DESK[h]) { MDS.brief(null); MDS.hud(DESK[h][0], DESK[h][1]); MDS.tests[h](view); return; }
  const [id, test] = h.split("-");
  const sc = MDS.scenarios[id];
  MDS.brief(sc || null);
  if (!sc) { MDS.hud("Home"); MDS.home(view); return; }
  const t = MDS.TESTS.find(x => x.id === test) ? test : "room";
  const st = MDS.caseStats(id), T0 = MDS.TESTS.find(x => x.id === t), P0 = MDS.PHASES.findIndex(p => p.id === T0.phase);
  MDS.hud(sc.name, `${MDS.PHASES[P0].label} · ${T0.label}`);
  view.innerHTML = `
    <header class="case">
      <div class="row" style="gap:16px;align-items:center">${MDS.ring(st.avg != null ? st.avg : 0, st.avg != null ? st.avg : "–")}
        <div><h1>${MDS.esc(sc.name)}</h1><div class="meta">${MDS.pips(MDS.LEVELS[sc.difficulty.toLowerCase()] || 2)}<span>${MDS.esc(sc.difficulty)}</span><span>${MDS.esc(sc.focus)}</span></div><div class="dim small">${MDS.esc(sc.tagline)} ${st.done}/${st.total} tasks attempted.</div></div></div>
      <div class="row"><button class="btn sm ${MDS.settings.briefOpen ? "" : "ghost"}" id="briefBtn" type="button" aria-expanded="${!!MDS.settings.briefOpen}" aria-controls="brief">Brief &amp; notes</button></div>
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
  const chev = `<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>`;
  const row = (title, sub, meta, score, href) => `<a class="frow" href="${href}"><span><span class="ft">${MDS.esc(title)}</span><span class="fs">${sub}</span></span><span class="fm">${meta}</span>${MDS.ring(score || 0, score != null ? score : "–")}${chev}</a>`;
  const E = MDS.content.engagements || [], es = MDS.state.engage || {};
  /* what to do next: the first unscored task in the first posting you've started, else the first posting */
  const started = MDS.order.find(id => { const st = MDS.caseStats(id); return st.done && st.done < st.total; }) || MDS.order.find(id => !MDS.caseStats(id).done) || MDS.order[0];
  const nsc = MDS.scenarios[started], nst = MDS.caseStats(started), nt = nst.done ? (MDS.TESTS.find(t => t.scored && MDS.getScore(started, t.id) == null) || MDS.TESTS[0]) : MDS.TESTS[0];
  view.innerHTML = `
    <div class="stack" style="gap:18px">
      <section class="hello">
        <div><h1>Run the business before you run the interview.</h1>
          <p>You're posted into newly acquired software companies. Work the records, build the model, set up the programme and live through twelve months of delivery. Then take it into the interview.</p></div>
        <a class="gauge" href="#readiness" style="text-decoration:none;color:inherit" aria-label="Readiness ${all.length ? readiness : "not yet scored"}">${MDS.ring(readiness, all.length ? readiness : "–", "lg", "var(--acc)")}<span class="small faint">Readiness · ${all.length} score${all.length === 1 ? "" : "s"}</span></a>
      </section>
      <a class="next" href="#${started}-${nt.id}" style="text-decoration:none;color:inherit"><span><span class="nl">${nst.done ? "Pick up where you left off" : "Start here"}</span><span class="nn" style="display:block">${MDS.esc(nsc.name)} · ${MDS.esc(nt.label)}</span></span><span class="btn">${nst.done ? "Continue" : "Open the brief"}</span></a>
      <div>
        <div class="lh">Postings <span>Three acquired companies. Diagnose, plan, deliver.</span></div>
        <div class="lst">${MDS.order.map(id => { const sc = MDS.scenarios[id], st = MDS.caseStats(id);
          const seg = MDS.PHASES.map(p => { const ts = MDS.TESTS.filter(t => t.scored && t.phase === p.id), d = ts.filter(t => MDS.getScore(id, t.id) != null).length; return `<i title="${p.label} ${d}/${ts.length}"><b style="width:${d / ts.length * 100}%"></b></i>`; }).join("");
          const next = st.done ? (MDS.TESTS.find(t => t.scored && MDS.getScore(id, t.id) == null) || { id: "room" }).id : "room";
          return row(sc.name, MDS.esc(sc.tagline), `<span>${MDS.pips(MDS.LEVELS[sc.difficulty.toLowerCase()] || 2)}${MDS.esc(sc.difficulty)} · ${st.done}/${st.total} tasks</span><span class="segbar">${seg}</span>`, st.avg, `#${id}-${next}`); }).join("")}</div>
        <div class="lh">Field work <span>A brief and a few days. Nothing is handed to you.</span></div>
        <div class="lst">${E.map(C => row(C.name, MDS.esc(C.sector), `<span>${MDS.pips(MDS.LEVELS[C.level] || 2)}${MDS.esc(C.level[0].toUpperCase() + C.level.slice(1))} · ${C.budget} days${es[C.id] ? (es[C.id].done ? " · done" : " · in progress") : ""}</span>`, MDS.getScore("engage", C.id), "#engage")).join("")}</div>
        <div class="lh">Desk study <span>Real accounts, real cases and the models behind the work.</span></div>
        <div class="lst">
          ${row("Real company accounts", `${(MDS.content.studies || []).length} UK software companies from their Companies House filings, unnamed until you've made the call.`, `<span>Easy to hard</span>`, G("studies"), "#studies")}
          ${row("Case library", `${MDS.content.cases.length} sourced cases, each paused at the decision that mattered.`, `<span>Read and decide</span>`, G("library"), "#library")}
          ${row("Frameworks and lessons", `${MDS.content.lessons.length} lessons with hands-on exercises, then a quiz that explains every option.`, `<span>${Object.keys(MDS.state.lessons || {}).length}/${MDS.content.lessons.length} practised</span>`, fw, "#frameworks")}</div>
        <div class="lh">Interview <span>Turn the work into answers.</span></div>
        <div class="lst">
          ${row("Mock interviews", "Three rounds and a timed case on real accounts. Add your CV and the job spec to make it about you.", `<span>Live rounds need AI</span>`, iv, "#interview")}
          ${row("Readiness", "Every score mapped to the five things the interview tests, weakest first.", `<span>${all.length} score${all.length === 1 ? "" : "s"}</span>`, all.length ? readiness : null, "#readiness")}</div>
      </div>
      <p class="small faint" style="margin:0">Scores are marked against each case's own evidence and kept in this browser only. The three postings run on teaching models with invented sensitivities: they show cause and effect, not a forecast of any real company.</p>
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
