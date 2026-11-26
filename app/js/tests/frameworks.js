/* Cross-case test: frameworks and operating models. Ten questions drawn from the bank each attempt. */
MDS.tests.frameworks = el => {
  const bank = MDS.content.frameworks;
  const r = MDS.rng(Math.floor(Math.random() * 1e9));
  const qs = MDS.shuffle(bank, r).slice(0, 10).map(q => {
    const order = MDS.shuffle(q.o.map((_, j) => j), r);
    return { ...q, o: order.map(j => q.o[j]), a: order.indexOf(q.a) };
  });
  let i = 0, right = 0;
  const show = () => {
    const q = qs[i];
    el.innerHTML = `<div class="stack">
      <div class="row" style="justify-content:space-between"><div><div class="eyebrow">Frameworks and operating models</div><h1 style="margin-top:4px">Question ${i + 1} of ${qs.length}</h1></div><a class="btn ghost sm" href="#">All cases</a></div>
      <div class="panel"><div class="eyebrow">${MDS.esc(q.topic)}</div><p style="font-size:16px">${MDS.esc(q.q)}</p>
        <div class="stack" id="opts">${q.o.map((o, j) => `<button type="button" class="opt" data-j="${j}" style="text-align:left;font:inherit;color:inherit">${MDS.esc(o)}</button>`).join("")}</div>
        <div id="fb" style="margin-top:12px"></div></div>
      <div class="small dim">Score so far: ${right}/${i}</div></div>`;
    MDS.$$("#opts .opt", el).forEach(b => b.onclick = () => {
      const j = +b.dataset.j, ok = j === q.a;
      if (ok) right++;
      MDS.$$("#opts .opt", el).forEach(x => { x.disabled = true; if (+x.dataset.j === q.a) x.classList.add("right"); else if (x === b) x.classList.add("wrong"); });
      MDS.$("#fb", el).innerHTML = `<div class="fb ${ok ? "good" : "bad"}"><strong>${ok ? "Correct." : "Not quite."}</strong> ${MDS.esc(q.e)}</div>
        <div style="margin-top:12px"><button class="btn" id="next" type="button">${i + 1 < qs.length ? "Next question →" : "See results"}</button></div>`;
      MDS.$("#next", el).onclick = () => { i++; i < qs.length ? show() : finish(); };
    });
  };
  const finish = () => {
    const score = right / qs.length * 100;
    MDS.setScore("global", "frameworks", score);
    const [g, cls] = MDS.grade(score);
    el.innerHTML = `<div class="stack"><div class="panel"><div class="eyebrow">Frameworks and operating models</div>
      <div class="row" style="gap:16px;margin-top:8px"><div class="bigscore">${right}/${qs.length}</div><span class="pill ${cls === "pos" ? "ok" : "no"}">${g}</span></div>
      <p class="dim">Each attempt draws 10 of ${bank.length} questions. Knowing the names isn't the point. Interviewers want to hear you pick the right tool for a situation and say why.</p>
      <div class="row"><button class="btn" id="again" type="button">Try another set</button><a class="btn ghost" href="#">All cases</a></div></div></div>`;
    MDS.$("#again", el).onclick = () => MDS.tests.frameworks(el);
  };
  show();
};
