/* Case library: real, sourced cases with a decision at the fork. */
MDS.tests.library = el => {
  const C = MDS.content.cases;
  const areas = [...new Set(C.flatMap(c => c.areas))].sort();
  const st = (MDS.state.library = MDS.state.library || {});
  let filter = "All";
  const r = MDS.rng(Math.floor(Math.random() * 1e9));
  const orders = Object.fromEntries(C.map(c => [c.id, MDS.shuffle(c.decision.o.map((_, i) => i), r)]));
  const draw = () => {
    const list = C.filter(c => filter === "All" || c.areas.includes(filter));
    const done = C.filter(c => st[c.id] != null), right = done.filter(c => st[c.id] === c.decision.a).length;
    el.innerHTML = `<div class="stack">
      <div class="row" style="justify-content:space-between"><div><div class="eyebrow">Case library</div><h1 style="margin-top:4px">Real cases, real decisions</h1></div><a class="btn ghost sm" href="#">All cases</a></div>
      <div class="panel"><p style="margin-top:0">These are <strong>real events</strong>, summarised from public sources (linked on each card). Each one pauses at the key decision: choose what you'd do, then see what happened and the lesson for running transformation in a small acquired software business. The simulator's three companies are <strong>fictional</strong>. Several of their scenarios are inspired by these cases, and each card links to where you can practise.</p>
        <p class="small faint" style="margin-bottom:0">Facts are kept to what sources confirm, with a confidence note on each card. Check the sources before quoting figures in an interview.</p>
        <div class="row" style="margin-top:10px">${["All", ...areas].map(a => `<button type="button" class="btn sm ${a === filter ? "" : "ghost"}" data-f="${MDS.esc(a)}">${MDS.esc(a)}</button>`).join("")}<span class="small faint" style="margin-left:auto">${done.length}/${C.length} decided · ${right} matched the lesson</span></div></div>
      <div class="libgrid">${list.map(c => {
        const pick = st[c.id];
        return `<article class="panel lcase" id="c-${c.id}">
          <div class="row" style="justify-content:space-between;align-items:flex-start;gap:8px"><div><div class="eyebrow">${MDS.esc(c.years)} · ${MDS.esc(c.areas.join(" · "))}</div><h3 style="margin:4px 0 2px;font-size:17px">${MDS.esc(c.title)}</h3><div class="small faint">${MDS.esc(c.org)}</div></div><span class="pill ok" title="A real case">Real</span></div>
          <p class="small">${MDS.esc(c.what)}</p>
          <div class="fb blue" style="box-shadow:inset 3px 0 0 var(--acc)"><strong class="small">What would you have done?</strong><p class="small" style="margin:4px 0 8px">${MDS.esc(c.decision.q)}</p>
            <div class="stack" style="gap:6px">${orders[c.id].map(i => `<button type="button" class="opt small ${pick != null ? (i === c.decision.a ? "right" : i === pick ? "wrong" : "") : ""}" data-c="${c.id}" data-i="${i}" ${pick != null ? "disabled" : ""} style="text-align:left;font:inherit;font-size:13.5px;color:inherit">${MDS.esc(c.decision.o[i])}</button>`).join("")}</div></div>
          ${pick != null ? `<div class="fb ${pick === c.decision.a ? "good" : "mid"}" style="margin-top:8px"><span class="small">${MDS.esc(c.decision.e)}</span></div>
            <p class="small" style="margin-bottom:4px"><strong>What happened:</strong> ${MDS.esc(c.outcome)}</p>
            <p class="small" style="margin-top:4px"><strong>Lesson:</strong> ${MDS.esc(c.lesson)}</p>
            <div class="small">${c.practise.map(([s, t, l]) => `<a href="#${s}-${t}" class="chip" style="display:inline-block;margin:2px 4px 2px 0;text-decoration:none">Practise: ${MDS.esc(MDS.scenarios[s].name)} · ${MDS.esc(l)}</a>`).join("")}</div>` : ""}
          <div class="small faint" style="margin-top:auto;padding-top:8px">Sources: ${c.sources.map(([l, u]) => `<a href="${MDS.esc(u)}" target="_blank" rel="noopener">${MDS.esc(l)}</a>`).join(" · ")}<br>Confidence: ${MDS.esc(c.confidence)}</div>
        </article>`;
      }).join("")}</div></div>`;
  };
  el.addEventListener("click", e => {
    const f = e.target.closest("[data-f]"); if (f) { filter = f.dataset.f; draw(); return; }
    const b = e.target.closest("[data-c]"); if (!b || b.disabled) return;
    st[b.dataset.c] = +b.dataset.i;
    const done = C.filter(c => st[c.id] != null);
    MDS.setScore("global", "library", done.filter(c => st[c.id] === c.decision.a).length / C.length * 100);
    MDS.save();
    const y = window.scrollY; draw(); window.scrollTo(0, y);
  });
  draw();
};
