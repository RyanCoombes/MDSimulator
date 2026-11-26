/* Frameworks and operating models: Learn (lessons with hands-on exercises) and Test yourself (quiz that teaches). */
MDS.SEQUENCE_LESSONS = ["adkar", "kotter", "bridges", "lewin", "tuckman", "dmaic", "toc", "doublediamond", "premortem", "hundred"];
MDS.content.exercises = {
  cynefin: { type: "classify", prompt: "Which Cynefin domain is each situation in?", cats: ["Clear", "Complicated", "Complex", "Chaotic"], items: [
    ["Launching an AI drafting tier when nobody knows what lawyers will pay for it", "Complex"],
    ["Moving legacy customers to list price, using contract and renewal data", "Complicated"],
    ["Resetting a customer's password using the documented procedure", "Clear"],
    ["Production is down for every customer and data may be leaking", "Chaotic"],
    ["Choosing which of two cloud architectures will cut hosting costs most", "Complicated"],
    ["Changing a founder-led culture so teams own outcomes", "Complex"]] },
  mendelow: { type: "classify", prompt: "How should you engage each stakeholder?", cats: ["Manage closely", "Keep satisfied", "Keep informed", "Monitor"], items: [
    ["Founder-CEO who decides on pricing and cares deeply about it", "Manage closely"],
    ["A top-three customer, unaffected unless their price or service changes", "Keep satisfied"],
    ["Support agents affected by the AI rollout, with little formal power", "Keep informed"],
    ["The office cleaning contractor", "Monitor"],
    ["A flight-risk lead engineer who alone understands the core engine", "Manage closely"],
    ["The data protection officer, who could veto the AI launch but isn't involved day to day", "Keep satisfied"]] },
  sevens: { type: "classify", prompt: "Is each element of 7S 'hard' or 'soft'?", cats: ["Hard", "Soft"], items: [
    ["Strategy", "Hard"], ["Structure", "Hard"], ["Systems", "Hard"], ["Shared values", "Soft"], ["Style", "Soft"], ["Staff", "Soft"], ["Skills", "Soft"]] },
  omc: { type: "classify", prompt: "Which part of the Operating Model Canvas does each finding belong to?", cats: ["Processes", "Organisation", "Locations", "Information", "Suppliers", "Management system"], items: [
    ["Implementations are bespoke every time, with no standard steps", "Processes"],
    ["Nobody is clearly accountable for discount approvals", "Organisation"],
    ["Half the team is remote and support runs on UK hours only", "Locations"],
    ["There's no forecasting system: the bookkeeper works from spreadsheets", "Information"],
    ["£190k a year depends on one embedded reporting vendor", "Suppliers"],
    ["No monthly KPI pack or budget review exists", "Management system"]] },
  raci: { type: "classify", prompt: "Discount approvals: which RACI role is each?", cats: ["Responsible", "Accountable", "Consulted", "Informed"], items: [
    ["Account executives who prepare the discount request", "Responsible"],
    ["The Sales Director, who owns discount outcomes", "Accountable"],
    ["The GM, asked for a view on anything above 20%", "Consulted"],
    ["Finance, told about approved discounts each month", "Informed"]] },
  rapid: { type: "classify", prompt: "A pricing change: which RAPID role is each?", cats: ["Recommend", "Agree", "Perform", "Input", "Decide"], items: [
    ["You, proposing the uplift with the evidence", "Recommend"],
    ["Legal, who must confirm contract terms allow it (a veto)", "Agree"],
    ["Sales, who send the letters and handle the calls", "Perform"],
    ["Support, whose view on customer reaction is gathered", "Input"],
    ["The founder-CEO, who makes the call", "Decide"]] },
  okr: { type: "classify", prompt: "Objective, key result, KPI, or just an activity?", cats: ["Objective", "Key result", "KPI", "Activity (not a key result)"], items: [
    ["Make professional services profitable", "Objective"],
    ["Free-of-charge days from 18% to 10% by Q2", "Key result"],
    ["Gross revenue retention, reviewed every month", "KPI"],
    ["Run a pricing workshop with the leadership team", "Activity (not a key result)"],
    ["Every fixed-price deal scoped by PS before signature", "Key result"]] },
  nrrgrr: { type: "calc", prompt: "Work out GRR and NRR for this cohort.", gen: r => { const S = 1000 + Math.round(r() * 30) * 100, ch = Math.round(S * (0.05 + r() * 0.08)), con = Math.round(S * (0.01 + r() * 0.03)), ex = Math.round(S * (0.03 + r() * 0.12)), nw = Math.round(S * 0.1);
    return { text: `Opening recurring revenue £${S}k. Churn £${ch}k, contraction £${con}k, expansion £${ex}k, new customers £${nw}k.`, asks: [["Gross revenue retention", (S - ch - con) / S * 100, "%", 0.3, `(${S} − ${ch} − ${con}) ÷ ${S}`], ["Net revenue retention", (S - ch - con + ex) / S * 100, "%", 0.3, `(${S} − ${ch} − ${con} + ${ex}) ÷ ${S}. New customers (£${nw}k) are excluded.`]] }; } },
  rule40: { type: "calc", prompt: "Score this business on the Rule of 40.", gen: r => { const g = Math.round(2 + r() * 25), m = Math.round(5 + r() * 30);
    return { text: `Revenue grew ${g}% and the EBITDA margin is ${m}%.`, asks: [["Rule of 40 score", g + m, "", 0.5, `${g} + ${m} = ${g + m}${g + m >= 40 ? " (passes)" : " (below 40)"}`]] }; } },
  utilreal: { type: "calc", prompt: "Diagnose this PS team.", gen: r => { const fte = 8 + Math.round(r() * 10), days = 210, del = Math.round(fte * days * (0.6 + r() * 0.2)), foc = Math.round(del * (0.1 + r() * 0.15));
    return { text: `${fte} consultants with ${days} available days each delivered ${del} days in the year. ${foc} of those days were free of charge.`, asks: [["Utilisation (delivered ÷ available)", del / (fte * days) * 100, "%", 0.5, `${del} ÷ (${fte} × ${days})`], ["Realisation (billed ÷ delivered)", (del - foc) / del * 100, "%", 0.5, `(${del} − ${foc}) ÷ ${del}`]] }; } },
  waterfall: { type: "calc", prompt: "Walk the price waterfall to the pocket price.", gen: r => { const L = 20 + Math.round(r() * 20), d = Math.round(15 + r() * 15), f = Math.round(2 + r() * 4), x = Math.round(1 + r() * 3);
    const inv = L * (1 - d / 100), pocket = inv - f - x;
    return { text: `List price £${L}k a year. Average negotiated discount ${d}%. Free implementation days worth £${f}k, and extended payment terms costing £${x}k.`, asks: [["Pocket price", pocket, "£k", 0.2, `£${L}k × (1 − ${d}%) − £${f}k − £${x}k`], ["Pocket price as % of list", pocket / L * 100, "%", 0.5, `${pocket.toFixed(1)} ÷ ${L}`]] }; } }
};

MDS.tests.frameworks = el => {
  const L = MDS.content.lessons, done = (MDS.state.lessons = MDS.state.lessons || {});
  let view = { mode: "learn", fam: "All", lesson: null };
  const fams = ["All", ...new Set(L.map(l => l.family))];
  const qsFor = id => MDS.content.frameworks.filter(q => q.lesson === id);
  const lessonCard = l => `<button type="button" class="lcard" data-l="${l.id}"><span class="eyebrow">${MDS.esc(l.family)}</span><strong>${MDS.esc(l.name)}</strong><span class="small dim">${MDS.esc(l.one)}</span>${done[l.id] ? `<span class="pill ok" style="align-self:flex-start">Practised</span>` : ""}</button>`;
  const head = () => `<div class="row" style="justify-content:space-between"><div><div class="eyebrow">Frameworks and operating models</div><h1 style="margin-top:4px">Learn it, try it, then test it</h1></div><a class="btn ghost sm" href="#">All cases</a></div>
    <div class="seg" role="tablist" style="margin:12px 0"><button type="button" data-mode="learn" aria-pressed="${view.mode === "learn"}">Learn (${L.length} lessons)</button><button type="button" data-mode="test" aria-pressed="${view.mode === "test"}">Test yourself</button></div>`;

  const renderLearn = () => {
    const list = L.filter(l => view.fam === "All" || l.family === view.fam);
    const n = L.filter(l => done[l.id]).length;
    el.innerHTML = head() + `<div class="panel"><p style="margin-top:0">Each lesson explains what the model is, its parts, when to use it (and when not to), how it applies in our cases, the common mistakes and how to talk about it in an interview. Then you <strong>try it</strong> with a short hands-on exercise.</p>
      <div class="row">${fams.map(f => `<button type="button" class="btn sm ${f === view.fam ? "" : "ghost"}" data-fam="${MDS.esc(f)}">${MDS.esc(f)}</button>`).join("")}<span class="small faint" style="margin-left:auto">${n}/${L.length} practised</span></div></div>
      <div class="lgrid" style="margin-top:14px">${list.map(lessonCard).join("")}</div>`;
  };

  const renderLesson = id => {
    const l = L.find(x => x.id === id), seq = MDS.SEQUENCE_LESSONS.includes(id);
    el.innerHTML = head() + `<div class="stack">
      <div class="row"><button class="btn ghost sm" type="button" data-back="1">← All lessons</button></div>
      <article class="panel lesson">
        <div class="eyebrow">${MDS.esc(l.family)}</div><h2 style="font-size:26px;margin:4px 0 2px">${MDS.esc(l.name)}</h2><div class="small faint">${MDS.esc(l.origin)}</div>
        <p class="lone">${MDS.esc(l.one)}</p><p>${MDS.esc(l.what)}</p>
        <h3>${seq ? "The steps, in order" : "The parts"}</h3>
        <div class="${seq ? "steps-flow" : "parts-grid"}">${l.parts.map(([n, d], i) => `<div class="pt">${seq ? `<span class="pn num">${i + 1}</span>` : ""}<div><strong>${MDS.esc(n)}</strong><div class="small dim">${MDS.esc(d)}</div></div></div>`).join("")}</div>
        <div class="g2" style="margin-top:14px"><div class="fb good"><strong class="small">Use it when</strong><div class="small">${MDS.esc(l.use)}</div></div><div class="fb bad"><strong class="small">Don't use it for</strong><div class="small">${MDS.esc(l.avoid)}</div></div></div>
        <h3>In practice</h3><blockquote>${MDS.esc(l.example)}</blockquote>
        <h3>Common mistakes</h3><ul class="small">${l.mistakes.map(m => `<li>${MDS.esc(m)}</li>`).join("")}</ul>
        <h3>Say it in an interview</h3><div class="say small">"${MDS.esc(l.say)}"</div>
      </article>
      <section class="panel" id="ex"></section>
      ${qsFor(id).length ? `<div class="panel row" style="justify-content:space-between"><span class="small">${qsFor(id).length} test question${qsFor(id).length > 1 ? "s" : ""} use this lesson.</span><button class="btn sm" type="button" data-testl="${id}">Test yourself on ${MDS.esc(l.name)}</button></div>` : ""}
      ${l.related && l.related.length ? `<div class="small">Related: ${l.related.map(r => { const x = L.find(y => y.id === r); return x ? `<button type="button" class="linkbtn" data-l="${r}">${MDS.esc(x.name)}</button>` : ""; }).join(" · ")}</div>` : ""}
    </div>`;
    exercise(MDS.$("#ex", el), l);
    window.scrollTo(0, 0);
  };

  /* ---------- hands-on exercises ---------- */
  const exercise = (box, l) => {
    const spec = MDS.content.exercises[l.id] || (MDS.SEQUENCE_LESSONS.includes(l.id) ? { type: "order" } : { type: "match" });
    const r = MDS.rng(Math.floor(Math.random() * 1e9));
    const finish = (ok, total) => { if (ok === total) { done[l.id] = true; MDS.save(); } };
    const header = (t, p) => `<div class="eyebrow">Try it</div><h3 style="margin:4px 0">${t}</h3><p class="small dim" style="margin-top:0">${p}</p>`;
    if (spec.type === "order") {
      let order = MDS.shuffle(l.parts.map((_, i) => i), r);
      if (order.every((v, i) => v === i)) order.reverse();
      const draw = (checked) => {
        box.innerHTML = header("Put the steps in order", "Use the arrows to arrange the steps, then check.") + `<div class="agenda" id="ord">${order.map((pi, k) => {
          const st = checked ? (pi === k ? "ok" : "bad") : "";
          return `<div class="ag ${st ? "ag-" + st : ""}"><span class="t">${k + 1}</span><div><strong>${MDS.esc(l.parts[pi][0])}</strong>${checked ? `<div class="small dim">${MDS.esc(l.parts[pi][1])}</div>` : ""}</div><div class="ctrls">${checked ? (st === "ok" ? `<span class="pos">✓</span>` : `<span class="neg small">should be ${pi + 1}</span>`) : `<button class="icon" type="button" data-u="${k}" aria-label="Move up">↑</button><button class="icon" type="button" data-d="${k}" aria-label="Move down">↓</button>`}</div></div>`; }).join("")}</div>
          <div class="row" style="margin-top:10px">${checked ? `<button class="btn ghost sm" type="button" data-again="1">Try again</button>` : `<button class="btn sm" type="button" data-check="1">Check my order</button>`}</div><div id="exr" class="small" style="margin-top:8px"></div>`;
        if (checked) { const ok = order.filter((pi, k) => pi === k).length; MDS.$("#exr", box).innerHTML = ok === order.length ? `<span class="pos">All ${ok} in the right order. Lesson practised.</span>` : `${ok}/${order.length} in the right place. Look at why the order matters, then try again.`; finish(ok, order.length); }
      };
      box.onclick = e => { const b = e.target.closest("button"); if (!b) return;
        if (b.dataset.u) { const k = +b.dataset.u; if (k > 0) [order[k - 1], order[k]] = [order[k], order[k - 1]]; draw(false); }
        else if (b.dataset.d) { const k = +b.dataset.d; if (k < order.length - 1) [order[k + 1], order[k]] = [order[k], order[k + 1]]; draw(false); }
        else if (b.dataset.check) draw(true); else if (b.dataset.again) { order = MDS.shuffle(order, r); draw(false); } };
      draw(false);
    } else if (spec.type === "classify" || spec.type === "match") {
      const items = spec.type === "classify" ? MDS.shuffle(spec.items, r) : MDS.shuffle(l.parts.map(([n, d]) => [d, n]), r);
      const cats = spec.type === "classify" ? spec.cats : l.parts.map(p => p[0]);
      const sel = "font:inherit;padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink);max-width:100%";
      box.innerHTML = header(spec.type === "classify" ? "Classify each one" : "Match each description to its part", spec.prompt || `Which part of ${l.name} does each description belong to?`) +
        `<div class="stack" style="gap:8px">${items.map(([t], i) => `<div class="exrow"><span class="small">${MDS.esc(t)}</span><select id="cx${i}" style="${sel}" aria-label="Answer for: ${MDS.esc(t)}"><option value="">Choose…</option>${cats.map(c => `<option>${MDS.esc(c)}</option>`).join("")}</select><span class="small" id="cr${i}"></span></div>`).join("")}</div>
        <div class="row" style="margin-top:10px"><button class="btn sm" type="button" id="cchk">Check</button></div><div id="exr" class="small" style="margin-top:8px"></div>`;
      MDS.$("#cchk", box).onclick = () => {
        let ok = 0;
        items.forEach(([, a], i) => { const v = MDS.$("#cx" + i, box).value, good = v === a; if (good) ok++; MDS.$("#cr" + i, box).innerHTML = good ? `<span class="pos">✓</span>` : `<span class="neg">${MDS.esc(a)}</span>`; });
        MDS.$("#exr", box).innerHTML = ok === items.length ? `<span class="pos">All ${ok} right. Lesson practised.</span>` : `${ok}/${items.length} right. The corrections are shown above.`;
        finish(ok, items.length);
      };
    } else if (spec.type === "calc") {
      const draw = () => {
        const g = spec.gen(r);
        box.innerHTML = header("Work it out", spec.prompt) + `<p>${MDS.esc(g.text)}</p><div class="stack" style="gap:8px">${g.asks.map(([lab, , unit], i) => `<div class="exrow"><label class="small" for="ca${i}">${MDS.esc(lab)}${unit ? ` (${unit})` : ""}</label><input id="ca${i}" inputmode="decimal" autocomplete="off" style="font:15px var(--mono);padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink);width:140px"><span class="small" id="cr${i}"></span></div>`).join("")}</div>
          <div class="row" style="margin-top:10px"><button class="btn sm" type="button" id="cchk">Check</button><button class="btn ghost sm" type="button" id="cnew">New numbers</button></div><div id="exr" class="small" style="margin-top:8px"></div>`;
        MDS.$("#cchk", box).onclick = () => { let ok = 0;
          g.asks.forEach(([, ans, unit, tol, work], i) => { const v = parseFloat(MDS.$("#ca" + i, box).value.replace(/[£,%k\s]/gi, "")); const good = isFinite(v) && Math.abs(v - ans) <= tol; if (good) ok++;
            MDS.$("#cr" + i, box).innerHTML = `${good ? `<span class="pos">✓</span>` : `<span class="neg">${ans.toFixed(1)}${unit === "%" ? "%" : ""}</span>`} <span class="faint">${MDS.esc(work)}</span>`; });
          MDS.$("#exr", box).innerHTML = ok === g.asks.length ? `<span class="pos">Correct. Lesson practised.</span>` : "Check the working shown, then try new numbers.";
          finish(ok, g.asks.length); };
        MDS.$("#cnew", box).onclick = draw;
      };
      draw();
    }
  };

  /* ---------- quiz that teaches ---------- */
  const renderTest = (onlyLesson) => {
    const bank = MDS.content.frameworks.filter(q => !onlyLesson || q.lesson === onlyLesson);
    const r = MDS.rng(Math.floor(Math.random() * 1e9));
    const qs = MDS.shuffle(bank, r).slice(0, 10).map(q => {
      const order = MDS.shuffle(q.o.map((_, j) => j), r);
      return { ...q, o: order.map(j => q.o[j]), why: q.why ? order.map(j => q.why[j]) : null, a: order.indexOf(q.a) };
    });
    let i = 0, right = 0;
    const show = () => {
      const q = qs[i], les = L.find(x => x.id === q.lesson);
      el.innerHTML = head() + `<div class="stack">
        <div class="row" style="justify-content:space-between"><h2 style="margin:0">Question ${i + 1} of ${qs.length}${onlyLesson ? ` · ${MDS.esc(les ? les.name : "")}` : ""}</h2><span class="small faint">Score so far: ${right}/${i}</span></div>
        <div class="panel"><div class="eyebrow">${MDS.esc(q.topic)}</div><p style="font-size:16px">${MDS.esc(q.q)}</p>
          <div class="stack teach" id="opts">${q.o.map((o, j) => `<button type="button" class="opt" data-j="${j}" style="text-align:left;font:inherit;color:inherit">${MDS.esc(o)}</button>`).join("")}</div>
          <div id="fb" style="margin-top:12px"></div></div></div>`;
      MDS.$$("#opts .opt", el).forEach(b => b.onclick = () => {
        const j = +b.dataset.j, ok = j === q.a;
        if (ok) right++;
        MDS.$$("#opts .opt", el).forEach(x => { x.disabled = true; const k = +x.dataset.j; if (k === q.a) x.classList.add("right"); else if (x === b) x.classList.add("wrong");
          if (q.why) { const d = document.createElement("div"); d.className = "small why"; d.textContent = q.why[k]; x.appendChild(d); } });
        MDS.$("#fb", el).innerHTML = `<div class="fb ${ok ? "good" : "bad"}"><strong>${ok ? "Correct." : "Not quite."}</strong> ${MDS.esc(q.e)}</div>
          ${les ? `<details class="lessonpeek" ${ok ? "" : "open"}><summary><strong>Lesson: ${MDS.esc(les.name)}</strong> <span class="small dim">${MDS.esc(les.one)}</span></summary>
            <p class="small">${MDS.esc(les.what)}</p><div class="small"><strong>${MDS.SEQUENCE_LESSONS.includes(les.id) ? "Steps" : "Parts"}:</strong> ${les.parts.map(p => MDS.esc(p[0])).join(MDS.SEQUENCE_LESSONS.includes(les.id) ? " → " : " · ")}</div>
            <p class="small"><strong>Use it when:</strong> ${MDS.esc(les.use)}</p><p class="small"><strong>In practice:</strong> ${MDS.esc(les.example)}</p>
            <button class="btn ghost sm" type="button" data-open="${les.id}">Open the full lesson and try it</button></details>` : ""}
          <div style="margin-top:12px"><button class="btn" id="next" type="button">${i + 1 < qs.length ? "Next question →" : "See results"}</button></div>`;
        MDS.$("#next", el).onclick = () => { i++; i < qs.length ? show() : finish(); };
      });
    };
    const finish = () => {
      const score = right / qs.length * 100;
      if (!onlyLesson) MDS.setScore("global", "frameworks", score);
      const [g, cls] = MDS.grade(score);
      el.innerHTML = head() + `<div class="panel"><div class="row" style="gap:16px"><div class="bigscore">${right}/${qs.length}</div><span class="pill ${cls === "pos" ? "ok" : "no"}">${g}</span></div>
        <p class="dim">Interviewers don't want definitions. They want you to pick the right tool for a situation and say why. Revisit the lessons for the ones you missed, and try their exercises.</p>
        <div class="row"><button class="btn" type="button" data-again="1">Another set</button><button class="btn ghost" type="button" data-mode="learn">Back to lessons</button></div></div>`;
    };
    show();
  };

  el.onclick = e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.mode) { view.mode = b.dataset.mode; view.lesson = null; b.dataset.mode === "learn" ? renderLearn() : renderTest(); }
    else if (b.dataset.fam) { view.fam = b.dataset.fam; renderLearn(); }
    else if (b.dataset.l) { view.mode = "learn"; view.lesson = b.dataset.l; renderLesson(b.dataset.l); }
    else if (b.dataset.open) { view.mode = "learn"; renderLesson(b.dataset.open); }
    else if (b.dataset.back) { view.lesson = null; renderLearn(); }
    else if (b.dataset.testl) { view.mode = "test"; renderTest(b.dataset.testl); }
    else if (b.dataset.again && !b.closest("#ex")) renderTest();
  };
  renderLearn();
};
