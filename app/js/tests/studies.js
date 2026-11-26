/* Real company studies from UK Companies House filings. Identity hidden until the reveal; work the numbers, then decide. */
MDS.tests.studies = el => {
  const S = MDS.content.studies || [];
  const st = (MDS.state.studies = MDS.state.studies || {});
  let diff = "easy";
  const DIFFS = [["easy", "Easy"], ["medium", "Medium"], ["hard", "Hard"]];
  const k = v => v == null ? "–" : (v < 0 ? "−" : "") + "£" + Math.abs(Math.round(v)).toLocaleString("en-GB") + "k";
  const FIELDS = [["revenue", "Revenue", k], ["gross_profit", "Gross profit", k], ["adj_ebitda", "Adjusted EBITDA", k], ["operating_profit", "Operating profit", k], ["pbt", "Profit before tax", k],
    ["staff_costs", "Staff costs", k], ["headcount", "Average headcount", v => v == null ? "–" : Math.round(v).toLocaleString("en-GB")], ["cash", "Cash at year end", k],
    ["deferred_income", "Deferred income", k], ["capitalised_dev", "Development costs capitalised", k], ["recurring_share", "Recurring revenue share", v => v == null ? "–" : MDS.pc(v, 0)]];

  const list = () => {
    const items = S.filter(s => s.difficulty === diff);
    el.innerHTML = `<div class="stack">
      <div class="row" style="justify-content:space-between"><div><div class="eyebrow">Real company studies</div><h1 style="margin-top:4px">Read the accounts. Make the call.</h1></div><a class="btn ghost sm" href="#">All cases</a></div>
      <div class="panel"><p style="margin-top:0">Each study is a <strong>real UK company</strong>, built from its full accounts and strategic reports filed at Companies House. You won't be told who it is until the end. Work through the filed numbers, read the signals as they were known at the time, decide what you'd do, then see what actually happened.</p>
        <p class="small faint" style="margin-bottom:0">Figures are as filed (in £ thousands). Narrative is paraphrased from the directors' reports. Your first attempt is scored.</p>
        <div class="seg" style="margin-top:10px">${DIFFS.map(([d, l]) => `<button type="button" data-d="${d}" aria-pressed="${d === diff}">${l} (${S.filter(s => s.difficulty === d).length})</button>`).join("")}</div></div>
      ${items.length ? `<div class="lgrid">${items.map(s => { const sc = MDS.getScore("studies", s.id); return `<button type="button" class="lcard" data-s="${s.id}"><span class="eyebrow">${MDS.esc(diff)} · ${MDS.esc(s.years.length)} years of accounts</span><strong>${MDS.esc(s.anon)}</strong><span class="small dim">${MDS.esc(s.decision.question)}</span>${sc != null ? `<span class="pill ok" style="align-self:flex-start">Scored ${sc}</span>` : ""}</button>`; }).join("")}</div>`
        : `<div class="panel small dim">No studies at this level yet.</div>`}
    </div>`;
    el.onclick = e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.d) { diff = b.dataset.d; list(); }
      else if (b.dataset.s) open(b.dataset.s);
    };
  };

  const chart = (s, key, label) => {
    const vals = s.years.map(y => y[key]).filter(v => v != null);
    if (vals.length < 2) return "";
    const W = 260, H = 90, mx = Math.max(...vals, 0), mn = Math.min(...vals, 0), sy = v => 8 + (H - 26) * (1 - (v - mn) / ((mx - mn) || 1)), bw = (W - 20) / s.years.length - 8;
    return `<figure class="mini"><figcaption class="small dim">${label}</figcaption><svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${label} by year">
      <line x1="0" x2="${W}" y1="${sy(0)}" y2="${sy(0)}" stroke="var(--line)"/>
      ${s.years.map((y, i) => y[key] == null ? "" : `<rect x="${10 + i * (bw + 8)}" y="${Math.min(sy(0), sy(y[key]))}" width="${bw}" height="${Math.max(1, Math.abs(sy(y[key]) - sy(0)))}" rx="2" fill="${y[key] < 0 ? "var(--bad)" : "var(--acc)"}"/><text x="${10 + i * (bw + 8) + bw / 2}" y="${H - 4}" text-anchor="middle">${MDS.esc(y.fy)}</text>`).join("")}</svg></figure>`;
  };

  const open = id => {
    const s = S.find(x => x.id === id), A = (st[id] = st[id] || { a: {}, step: 1 });
    const fields = FIELDS.filter(([f]) => s.years.some(y => y[f] != null));
    const r = MDS.rng(id.length * 7919);
    const order = MDS.shuffle(s.decision.options.map((_, i) => i), r);
    const asOfIdx = s.years.findIndex(y => y.fy === s.decision.as_of);
    const shownYears = asOfIdx >= 0 ? s.years.slice(0, asOfIdx + 1) : s.years;
    const sv = Object.assign({}, s, { years: shownYears });
    el.innerHTML = `<div class="stack">
      <div class="row" style="justify-content:space-between"><button class="btn ghost sm" type="button" data-back="1">← All studies</button><span class="pill">${MDS.esc(s.difficulty)}</span></div>
      <div class="panel"><div class="eyebrow">Study · identity hidden until the end</div><h2 style="margin:4px 0">${MDS.esc(s.anon)}</h2><p>${MDS.esc(s.context)}</p>
        <p class="small faint" style="margin-bottom:0">You're joining as transformation lead at the end of ${MDS.esc(s.decision.as_of)}. You can see the accounts up to then.</p></div>
      <div class="panel"><div class="eyebrow">Step 1 · The filed numbers</div>
        <div class="tblwrap"><table><thead><tr><th>£k</th>${shownYears.map(y => `<th>${MDS.esc(y.fy)}</th>`).join("")}</tr></thead><tbody>${fields.map(([f, l, fmt]) => `<tr><td>${l}</td>${shownYears.map(y => `<td>${fmt(y[f])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
        <div class="minis">${chart(sv, "revenue", "Revenue")}${chart(sv, "operating_profit", "Operating profit")}${chart(sv, "cash", "Cash")}</div></div>
      <div class="panel"><div class="eyebrow">Step 2 · Work it out</div><p class="small dim" style="margin-top:0">Use the table. Rounding within the tolerance shown is fine.</p>
        <div id="an">${s.analysis.map((q, i) => `<div class="q"><div><div class="small faint num">Q${i + 1}</div>${MDS.esc(q.q)}<div class="working" id="aw${i}" hidden></div></div>
          <div><label class="unit" for="aa${i}">Answer (${MDS.esc(q.unit)}, ±${q.tol})</label><input id="aa${i}" inputmode="decimal" autocomplete="off" value="${MDS.esc(A.a[i] || "")}"></div></div>`).join("")}</div>
        <div class="row" style="margin-top:10px"><button class="btn" type="button" id="achk" ${A.marked ? "disabled" : ""}>Check my workings</button></div><div id="ares"></div></div>
      <div class="panel" id="sig" ${A.step < 2 ? "hidden" : ""}><div class="eyebrow">Step 3 · Read the signals</div>
        <p class="small"><strong>Principal risks the directors reported:</strong></p><ul class="small">${s.risks.map(x => `<li>${MDS.esc(x)}</li>`).join("")}</ul>
        <p><strong>${MDS.esc(s.decision.situation)}</strong></p></div>
      <div class="panel" id="dec" ${A.step < 2 ? "hidden" : ""}><div class="eyebrow">Step 4 · Your call</div><p style="font-size:16px">${MDS.esc(s.decision.question)}</p>
        <div class="stack teach" id="dopts">${order.map(i => `<button type="button" class="opt" data-o="${i}" ${A.pick != null ? "disabled" : ""} style="text-align:left;font:inherit;color:inherit">${MDS.esc(s.decision.options[i])}${A.pick != null ? `<span class="small why">${MDS.esc(s.decision.why[i])}</span>` : ""}</button>`).join("")}</div>
        <label class="small" for="just" style="display:block;margin-top:10px">Your reasoning in one or two sentences (what in the numbers drove it?)</label><textarea id="just" rows="2" style="width:100%;font:inherit;padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink)" ${A.pick != null ? "readonly" : ""}>${MDS.esc(A.just || "")}</textarea></div>
      <div id="rev"></div></div>`;
    const reveal = () => {
      if (A.pick == null) return;
      MDS.$$("#dopts .opt", el).forEach(b => { const i = +b.dataset.o; if (i === s.decision.best) b.classList.add("right"); else if (i === A.pick) b.classList.add("wrong"); });
      const later = s.years.slice(asOfIdx + 1);
      MDS.$("#rev", el).innerHTML = `<div class="panel"><div class="eyebrow">The reveal</div><h2 style="margin:4px 0">${MDS.esc(s.company)}</h2><div class="small faint">Company number ${MDS.esc(s.number)} · ${MDS.esc(s.sector)} · ${MDS.esc(s.owner)}</div>
        <div class="fb ${A.pick === s.decision.best ? "good" : "mid"}" style="margin-top:10px"><strong>${A.pick === s.decision.best ? "Your call matched what the evidence best supports." : "A defensible call, but not the strongest."}</strong> ${MDS.esc(s.decision.why[s.decision.best])}</div>
        <p><strong>What happened:</strong> ${MDS.esc(s.decision.what_happened)}</p>
        ${later.length ? `<div class="tblwrap"><table><thead><tr><th>Afterwards, £k</th>${later.map(y => `<th>${MDS.esc(y.fy)}</th>`).join("")}</tr></thead><tbody>${fields.slice(0, 6).map(([f, l, fmt]) => `<tr><td>${l}</td>${later.map(y => `<td>${fmt(y[f])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : ""}
        <div class="g2" style="margin-top:10px"><div class="fb mid"><strong class="small">Challenges they reported</strong><ul class="small">${s.challenges.map(x => `<li>${MDS.esc(x)}</li>`).join("")}</ul></div><div class="fb good"><strong class="small">Wins they reported</strong><ul class="small">${s.wins.map(x => `<li>${MDS.esc(x)}</li>`).join("")}</ul></div></div>
        <p class="small faint">Sources: ${s.sources.map(x => `<a href="${MDS.esc(x.url)}" target="_blank" rel="noopener">${MDS.esc(x.label)}</a>`).join(" · ")}<br>Confidence: ${MDS.esc(s.confidence)}${s.caveats ? `. ${MDS.esc(s.caveats)}` : ""}</p></div>`;
    };
    el.onclick = e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.back) { list(); return; }
      if (b.id === "achk" && !A.marked) {
        let ok = 0;
        s.analysis.forEach((q, i) => {
          const v = parseFloat(String(MDS.$("#aa" + i, el).value).replace(/[£,%x\sk]/gi, "")); A.a[i] = MDS.$("#aa" + i, el).value;
          const good = isFinite(v) && Math.abs(v - q.answer) <= q.tol; if (good) ok++;
          const w = MDS.$("#aw" + i, el); w.hidden = false; w.className = "working fb " + (good ? "good" : "bad");
          w.innerHTML = `<strong>${good ? "Correct." : `Answer: ${q.answer}${q.unit === "%" ? "%" : " " + MDS.esc(q.unit)}.`}</strong> ${MDS.esc(q.working)}`;
        });
        A.marked = true; A.analysis = ok / s.analysis.length; A.step = 2; MDS.save();
        b.disabled = true; MDS.$("#ares", el).innerHTML = `<p class="small">${ok}/${s.analysis.length} correct. Now read the signals and make your call below.</p>`;
        MDS.$("#sig", el).hidden = false; MDS.$("#dec", el).hidden = false; return;
      }
      if (b.dataset.o != null && A.pick == null && A.step >= 2) {
        A.pick = +b.dataset.o; A.just = MDS.$("#just", el).value; MDS.save();
        const score = A.analysis * 50 + (A.pick === s.decision.best ? 50 : 15);
        MDS.setScore("studies", id, score, "first");
        const all = S.map(x => MDS.getScore("studies", x.id)).filter(x => x != null);
        MDS.state.scores.global = MDS.state.scores.global || {}; MDS.state.scores.global.studies = Math.round(all.reduce((a, x) => a + x, 0) / all.length); MDS.save();
        open(id); return;
      }
    };
    if (A.marked) { s.analysis.forEach((q, i) => { const v = parseFloat(String(A.a[i] || "").replace(/[£,%x\sk]/gi, "")), good = isFinite(v) && Math.abs(v - q.answer) <= q.tol; const w = MDS.$("#aw" + i, el); w.hidden = false; w.className = "working fb " + (good ? "good" : "bad"); w.innerHTML = `<strong>${good ? "Correct." : `Answer: ${q.answer}${q.unit === "%" ? "%" : " " + MDS.esc(q.unit)}.`}</strong> ${MDS.esc(q.working)}`; }); }
    reveal();
    window.scrollTo(0, 0);
  };

  list();
};
