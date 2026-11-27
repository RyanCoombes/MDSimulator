/* Check the data: real data rooms don't reconcile. Find the problems and decide which figure to trust before you model. */
MDS.cleanData = sc => {
  const r = MDS.rng(sc.id.length * 4721 + 17), B = sc.base, pick = a => a[Math.floor(r() * a.length)];
  const suffix = { harbour: "Housing", nordline: "Kommun", quill: "LLP" }[sc.id] || "Ltd";
  const names = MDS.shuffle(["Northgate", "Riverside", "Ashdown", "Castle Vale", "Meridian", "Oakfield", "Stonebridge", "Westmoor", "Harrow Lane", "Kingsway", "Larkfield", "Penrose", "Thornbury", "Eastfield"], r);
  const avg = B.recurring / B.customers;
  /* A. customer extract with two duplicates */
  const cust = names.slice(0, 10).map((n, i) => ({ ref: "C" + (1040 + Math.floor(r() * 900)), name: `${n} ${suffix}`, arr: Math.round(avg * (0.5 + r() * 1.6)), renew: MDS.MONTHS[Math.floor(r() * 12)] }));
  const d1 = cust[2], d2 = cust[6];
  const dupes = [{ ref: d1.ref, name: d1.name.replace(suffix, suffix === "LLP" ? "L.L.P." : suffix + " Ltd"), arr: d1.arr, renew: d1.renew, dup: true }, { ref: "C" + (2000 + Math.floor(r() * 900)), name: d2.name.toUpperCase(), arr: d2.arr, renew: d2.renew, dup: true }];
  const rowsA = MDS.shuffle(cust.concat(dupes), r);
  const cleanArr = cust.reduce((a, c) => a + c.arr, 0);
  /* B. monthly recurring revenue with an annual invoice booked in one month */
  const mBase = B.recurring / 12, spikeM = 2 + Math.floor(r() * 8), annual = Math.round(avg * (2.2 + r() * 1.5));
  const months = MDS.MONTHS.map((m, i) => ({ m, v: Math.round(mBase * (0.985 + r() * 0.03) + (i === spikeM ? annual : 0)) }));
  const fixed = months[spikeM].v - annual + annual / 12;
  /* C. headcount: HR list vs payroll */
  const hr = Math.round(B.ps.fte + B.support.fte + B.rnd.fte + B.otherFte), fn = MDS.shuffle(MDS.FIRST, r), ln = MDS.shuffle(MDS.LAST, r); let pi = 0; const person = () => `${fn[pi]} ${ln[pi++]}`;
  const diffs = [[person(), "Left on 30 September. Still on the HR list.", -1], [person(), "Left on 14 October. Still on the HR list.", -1], [person(), "Contractor. Invoices monthly, not on payroll.", -1], [person(), "Offer accepted. Starts next month.", -1], [person(), "On maternity leave. On payroll at statutory pay.", 0]];
  /* D. the founder's churn figure vs the cancellations ledger */
  const gm = sc.stake.find(s => s.id === sc.exec.gm).name.split(",")[0], claim = Math.round(B.churn * 100) - 4;
  const lostTotal = Math.round(B.recurring * B.churn), parts = [0.34, 0.27, 0.22, 0.17].map(x => Math.round(lostTotal * x));
  parts[3] = lostTotal - parts[0] - parts[1] - parts[2];
  const lost = parts.map((v, i) => ({ name: `${names[10 + (i % 4)] || names[i]} ${suffix}`, arr: v, why: ["Went to a competitor on price", "Merged with another customer", "Brought it in-house", "Stopped responding at renewal"][i] }));
  const churn = lostTotal / B.recurring * 100;
  return { rowsA, cleanArr, months, spikeM, annual, fixed, hr, diffs, employed: hr - 4, gm, claim, lost, churn, opening: B.recurring,
    qs: [
      { id: "dup", sec: "A", q: "How many rows in the customer extract are duplicates of another row?", a: 2, tol: 0, unit: "rows", work: `${d1.name} appears twice under the same reference with a different legal suffix. ${d2.name} appears again in capitals under a new reference, with the same value and renewal month.` },
      { id: "arr", sec: "A", q: "What is the recurring revenue in this extract once duplicates are removed?", a: cleanArr, tol: 1, unit: "£k", work: `Total as listed £${cleanArr + d1.arr + d2.arr}k, less £${d1.arr}k and £${d2.arr}k.` },
      { id: "mon", sec: "B", q: "Which month's recurring revenue is misstated?", a: spikeM, choice: MDS.MONTHS, work: `${MDS.MONTHS[spikeM]} is about £${annual}k above every other month: a whole year's invoice was booked in one month.` },
      { id: "fix", sec: "B", q: "What should that month show if the annual invoice were spread evenly over twelve months?", a: fixed, tol: Math.max(2, fixed * 0.02), unit: "£k", work: `£${months[spikeM].v}k − £${annual}k + (£${annual}k ÷ 12) = £${fixed.toFixed(0)}k. The note under the table gives the invoice value.` },
      { id: "hc", sec: "C", q: "How many people does the business employ today, for your model?", a: hr - 4, tol: 0, unit: "people", work: `HR list ${hr}, less two leavers, one contractor and one person who hasn't started. The person on maternity leave is still an employee.` },
      { id: "ch", sec: "D", q: "What was gross churn last year, from the cancellations ledger?", a: churn, tol: 0.3, unit: "%", work: `£${lostTotal}k lost ÷ £${B.recurring}k opening recurring revenue = ${churn.toFixed(1)}%.` }
    ],
    judge: { q: `${gm} says churn is "about ${claim}%". The ledger says otherwise. What goes in your model, and what do you do about it?`, o: [
      [`The ledger figure. Walk ${gm} through the four cancellations before the Portfolio Manager sees the model.`, 25, "Use the evidence, and don't let the founder be surprised in front of the owner. That keeps both the number and the relationship."],
      ["The ledger figure. There's no need to raise it, because the numbers speak for themselves.", 12, "Right number. But the founder finds out in the review meeting that you contradicted them, and you've made an opponent."],
      [`${gm}'s figure. They've run the business for years and know the customers.`, 0, "The ledger lists four named cancellations. A founder's recollection usually leaves out the ones that hurt."],
      ["Halfway between the two, to be safe.", 0, "An average of a fact and an impression is neither. You can't defend it when someone asks where it came from."]] }
  };
};

MDS.tests.clean = (sc, el) => {
  const D = MDS.cleanData(sc), st = (MDS.state.clean = MDS.state.clean || {}), A = st[sc.id] = st[sc.id] || { a: {} };
  const order = MDS.shuffle([0, 1, 2, 3], MDS.rng(sc.id.length * 911));
  const inp = "font:15px var(--mono);padding:7px 9px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink);width:100%";
  const q = x => `<div class="q"><div>${MDS.esc(x.q)}<div class="working" id="cw-${x.id}" hidden></div></div><div>${x.choice
    ? `<label class="unit" for="cq-${x.id}">Month</label><select id="cq-${x.id}" style="${inp}" ${A.marked ? "disabled" : ""}><option value="">Choose…</option>${x.choice.map((c, i) => `<option value="${i}" ${String(A.a[x.id]) === String(i) ? "selected" : ""}>${c}</option>`).join("")}</select>`
    : `<label class="unit" for="cq-${x.id}">Answer (${x.unit})</label><input id="cq-${x.id}" inputmode="decimal" autocomplete="off" value="${MDS.esc(A.a[x.id] != null ? A.a[x.id] : "")}" ${A.marked ? "readonly" : ""}>`}</div></div>`;
  const sec = s => D.qs.filter(x => x.sec === s).map(q).join("");
  el.innerHTML = `<div class="stack">
    <div class="panel"><h2>Check the data</h2><p class="dim" style="margin:0">Nobody has ever reconciled these records. Before you build anything on them, find what's wrong and decide which figure to trust. Four extracts, six questions and one judgement call. Your first attempt is scored.</p></div>
    <div class="panel"><div class="eyebrow">A · Customer extract from the CRM</div>
      <div class="tblwrap"><table><thead><tr><th>Ref</th><th style="text-align:left">Customer</th><th>Recurring £k</th><th>Renews</th></tr></thead><tbody>${D.rowsA.map(c => `<tr><td>${c.ref}</td><td style="text-align:left">${MDS.esc(c.name)}</td><td>${c.arr}</td><td>${c.renew}</td></tr>`).join("")}</tbody></table></div>${sec("A")}</div>
    <div class="panel"><div class="eyebrow">B · Recurring revenue by month, from the ledger (£k)</div>
      <div class="tblwrap"><table><thead><tr>${D.months.map(m => `<th>${m.m}</th>`).join("")}</tr></thead><tbody><tr>${D.months.map(m => `<td>${m.v}</td>`).join("")}</tr></tbody></table></div>
      <p class="small faint">Bookkeeper's note: "One customer pays annually in advance (£${D.annual}k). I book it when the cash arrives."</p>${sec("B")}</div>
    <div class="panel"><div class="eyebrow">C · Headcount: HR list ${D.hr}, payroll ${D.hr - 4}</div>
      <div class="tblwrap"><table><thead><tr><th style="text-align:left">Name</th><th style="text-align:left">Why the two lists differ</th></tr></thead><tbody>${D.diffs.map(([n, w]) => `<tr><td style="text-align:left">${MDS.esc(n)}</td><td style="text-align:left;white-space:normal;font-family:var(--body)">${MDS.esc(w)}</td></tr>`).join("")}</tbody></table></div>${sec("C")}</div>
    <div class="panel"><div class="eyebrow">D · Cancellations last year (opening recurring revenue ${MDS.k(D.opening)})</div>
      <div class="tblwrap"><table><thead><tr><th style="text-align:left">Customer</th><th>Recurring lost £k</th><th style="text-align:left">Reason logged</th></tr></thead><tbody>${D.lost.map(l => `<tr><td style="text-align:left">${MDS.esc(l.name)}</td><td>${l.arr}</td><td style="text-align:left;white-space:normal;font-family:var(--body)">${MDS.esc(l.why)}</td></tr>`).join("")}</tbody></table></div>${sec("D")}
      <p style="margin-top:14px"><strong>${MDS.esc(D.judge.q)}</strong></p>
      <div class="stack teach" id="cj">${order.map(i => `<button type="button" class="opt" data-j="${i}" ${A.marked ? "disabled" : ""} aria-pressed="${A.j === i}" style="text-align:left;font:inherit;color:inherit">${MDS.esc(D.judge.o[i][0])}<span class="small why" hidden>${MDS.esc(D.judge.o[i][2])}</span></button>`).join("")}</div></div>
    <div class="panel"><div class="row" style="justify-content:space-between"><div class="small dim">Six questions at 12.5 points each, and 25 for the judgement call.</div><button class="btn" type="button" id="cmark" ${A.marked ? "disabled" : ""}>Mark my answers</button></div><div id="cres"></div></div></div>`;
  const val = x => { const e = MDS.$("#cq-" + x.id, el); return e.value; };
  const show = () => {
    let ok = 0;
    D.qs.forEach(x => {
      const raw = A.a[x.id], v = parseFloat(String(raw == null ? "" : raw).replace(/[£,%k\s]/gi, "")), good = isFinite(v) && Math.abs(v - x.a) <= (x.tol || 0) + 1e-9; if (good) ok++;
      const w = MDS.$("#cw-" + x.id, el); w.hidden = false; w.className = "working fb " + (good ? "good" : "bad");
      w.innerHTML = `<strong>${good ? "Correct." : `Answer: ${x.choice ? x.choice[x.a] : x.unit === "£k" ? Math.round(x.a) : x.unit === "%" ? x.a.toFixed(1) + "%" : x.a}.`}</strong> ${MDS.esc(x.work)}`;
    });
    MDS.$$("#cj .opt", el).forEach(b => { const i = +b.dataset.j; b.querySelector(".why").hidden = false; if (D.judge.o[i][1] === 25) b.classList.add("right"); else if (i === A.j) b.classList.add("wrong"); });
    const jp = A.j != null ? D.judge.o[A.j][1] : 0, score = Math.round(ok * 12.5 + jp), [g, cls] = MDS.grade(score);
    MDS.$("#cres", el).innerHTML = `<div class="row" style="margin-top:12px;gap:16px"><div class="bigscore">${MDS.getScore(sc.id, "clean")}</div><span class="pill ${cls === "pos" ? "ok" : "no"}">${g}</span><span class="small dim">${ok}/6 on the numbers, ${jp}/25 on the judgement call.</span></div>
      <p class="small dim">In a real first fortnight, write each of these up as a one-line data issue with an owner. They're the first things a Portfolio Manager asks about.</p>`;
    return score;
  };
  el.onclick = e => {
    const j = e.target.closest("[data-j]");
    if (j && !A.marked) { A.j = +j.dataset.j; MDS.$$("#cj .opt", el).forEach(b => b.setAttribute("aria-pressed", b === j)); MDS.save(); return; }
    if (e.target.closest("#cmark") && !A.marked) {
      D.qs.forEach(x => { A.a[x.id] = val(x); });
      if (A.j == null) { MDS.toast("Make the judgement call at the bottom first."); return; }
      A.marked = true;
      let ok = 0; D.qs.forEach(x => { const v = parseFloat(String(A.a[x.id]).replace(/[£,%k\s]/gi, "")); if (isFinite(v) && Math.abs(v - x.a) <= (x.tol || 0) + 1e-9) ok++; });
      MDS.setScore(sc.id, "clean", ok * 12.5 + D.judge.o[A.j][1], "first"); MDS.save();
      MDS.$("#cmark", el).disabled = true; MDS.$$("#cj .opt, .q input, .q select", el).forEach(x => { x.disabled = true; });
      show();
    }
  };
  if (A.marked) show();
};
