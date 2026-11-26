/* Test 2: pick the top three value levers out of ten. */
MDS.tests.find = (sc, el) => {
  const opts = MDS.shuffle(sc.finder, MDS.rng(sc.id.length * 97));
  el.innerHTML = `<div class="stack">
    <div class="panel"><h2>Where's the value?</h2>
      <p class="dim">Pick exactly three levers you'd lead with, the "here's a P&amp;L, where's the value?" question. Some options are real but secondary, and some would damage the business. Re-read the data room if you need to.</p>
      <div class="stack" id="opts" style="margin-top:10px">${opts.map(o => `<label class="opt" for="p-${o.id}"><input type="checkbox" id="p-${o.id}" value="${o.id}"><span>${MDS.esc(o.text)}</span></label>`).join("")}</div>
      <div class="row" style="margin-top:14px"><button class="btn" id="checkBtn" type="button" disabled>Check my three</button><span class="small dim" id="pickCount">0 of 3 chosen</span></div>
    </div>
    <div class="panel" id="res" hidden></div></div>`;
  const inputs = MDS.$$("#opts input", el);
  const upd = () => {
    const n = inputs.filter(i => i.checked).length;
    inputs.forEach(i => { i.disabled = !i.checked && n >= 3; });
    MDS.$("#pickCount", el).textContent = `${n} of 3 chosen`;
    MDS.$("#checkBtn", el).disabled = n !== 3;
  };
  MDS.$("#opts", el).addEventListener("change", upd);
  MDS.$("#checkBtn", el).onclick = () => {
    const picks = inputs.filter(i => i.checked).map(i => i.value);
    const pts = { good: 100 / 3, mid: 12, bad: 0 };
    const score = picks.reduce((a, id) => a + pts[sc.finder.find(o => o.id === id).v], 0);
    MDS.setScore(sc.id, "find", score, "first");
    inputs.forEach(i => { i.disabled = true; const o = sc.finder.find(x => x.id === i.value); i.closest(".opt").classList.add(o.v === "good" ? "right" : o.v === "bad" ? "wrong" : "opt"); });
    const [g, cls] = MDS.grade(score);
    const res = MDS.$("#res", el); res.hidden = false;
    res.innerHTML = `<div class="row" style="justify-content:space-between"><h2>Score: <span class="num">${Math.round(score)}</span>/100</h2><span class="pill ${cls === "pos" ? "ok" : "no"}">${g}</span></div>
      <p class="dim">Green border: a top-tier lever. Red: a lever that would hurt. Reasoning for every option:</p>
      <div class="stack">${opts.map(o => `<div class="fb ${o.v}"><strong>${picks.includes(o.id) ? "✓ " : ""}${MDS.esc(o.text)}.</strong> ${MDS.esc(o.fb)}</div>`).join("")}</div>
      <p style="margin-top:14px" class="row"><a class="btn" href="#${sc.id}-lab">Next: build the plan →</a><button class="btn ghost" type="button" id="again">Try again</button></p>`;
    MDS.$("#again", el).onclick = () => MDS.route();
  };
};
