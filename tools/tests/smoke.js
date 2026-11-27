#!/usr/bin/env node
/* Browser smoke test. Build first (python3 tools/build.py), then: node tools/tests/smoke.js
   Needs Playwright with Chromium. Exits 1 if any check fails. */
const { chromium } = require("playwright"), path = require("path");
const U = "file://" + path.join(__dirname, "..", "..", "dist", "index.html");
let fails = 0;
const check = (name, ok, extra = "") => { console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`); if (!ok) fails++; };
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1360, height: 950 } }), errs = [];
  p.on("pageerror", e => errs.push(e.message));
  const go = async h => { await p.goto(U + "#home"); await p.goto(U + "#" + h); await p.reload(); await p.waitForTimeout(150); };
  await go("home");
  const info = await p.evaluate(() => ({ cases: MDS.order, tests: MDS.TESTS.map(t => t.id), studies: MDS.content.studies.map(s => ({ id: s.id, d: s.difficulty, first: s.company.split(/[ ,]/)[0] })) }));

  /* 1. every route renders */
  const routes = ["", "frameworks", "library", "studies", "interview", "readiness"].concat(info.cases.flatMap(c => info.tests.map(t => `${c}-${t}`)));
  const blank = [];
  for (const r of routes) { await go(r); if ((await p.locator("#view").innerText()).trim().length < 40) blank.push(r); }
  check(`all ${routes.length} routes render`, !blank.length, blank.join(","));

  /* 2. every real company study: name hidden, reasoning required, scored */
  for (const s of info.studies) {
    await go("studies"); await p.click(`[data-d="${s.d}"]`); await p.click(`[data-s="${s.id}"]`); await p.waitForTimeout(80);
    const hidden = !(await p.locator("body").innerText()).toLowerCase().includes(s.first.toLowerCase());
    const st = await p.evaluate(id => MDS.content.studies.find(x => x.id === id), s.id);
    for (let i = 0; i < st.analysis.length; i++) await p.fill("#aa" + i, String(st.analysis[i].answer));
    await p.click("#achk"); await p.click(`#dopts [data-o="${st.decision.best}"]`); await p.waitForTimeout(60);
    const blocked = await p.evaluate(id => MDS.getScore("studies", id), s.id) == null;
    const y = st.years.find(q => q.fy === st.decision.as_of);
    await p.fill("#just", `Revenue of ${y.revenue} and the operating profit trend drive this call; the main risk is ${st.decision.why[st.decision.best].split(" ").slice(0, 12).join(" ")}`);
    await p.click(`#dopts [data-o="${st.decision.best}"]`); await p.waitForTimeout(120);
    const score = await p.evaluate(id => MDS.getScore("studies", id), s.id), revealed = (await p.locator("#rev").innerText()).includes(st.company);
    check(`study ${s.id}`, hidden && blocked && revealed && score >= 85, `hidden=${hidden} reasoningRequired=${blocked} score=${score}`);
  }
  await go("studies");
  check("studies carry the Open Government Licence line", (await p.locator("#view").innerText()).includes("Open Government Licence"));

  /* 3. portfolio scoring: a sound portfolio beats a careless one */
  for (const c of info.cases) {
    const r = await p.evaluate(id => {
      const sc = MDS.scenarios[id], pool = MDS.pfPool(sc), good = {}, bad = {}, starts = {}, dur = MDS.pfDur, load = Array(40).fill(0);
      pool.filter(w => w.real).sort((a, b) => ((a.deps || []).length - (b.deps || []).length) || (a.deadline || 9) - (b.deadline || 9) || b.value - a.value).forEach(w => {
        let s = (w.deps || []).reduce((mx, d) => Math.max(mx, starts[d] + dur(pool.find(x => x.id === d))), 1);
        if (w.deadline && w.deadline <= 2) s = 1;
        while (Array.from({ length: dur(w) }, (_, i) => load[s + i]).some(x => x >= 3)) s++;
        starts[w.id] = s; for (let i = 0; i < dur(w); i++) load[s + i]++;
        good[w.id] = { on: true, owner: w.owner, kpi: 0, start: s, review: dur(w) <= 2 ? 1 : 3 };
      });
      pool.forEach(w => { bad[w.id] = { on: true, owner: "you", kpi: 1, start: 1, review: 0 }; });
      return { good: MDS.pfScore(sc, good).total, bad: MDS.pfScore(sc, bad).total };
    }, c);
    check(`portfolio scoring ${c}`, r.good >= 80 && r.bad <= 35, `sound=${r.good} careless=${r.bad}`);
  }

  /* 4. the portfolio feeds Run the transformation, which plays through twelve months */
  const c0 = info.cases[0];
  await go(`${c0}-portfolio`);
  const pick = await p.evaluate(id => MDS.pfPool(MDS.scenarios[id]).filter(w => w.real).slice(0, 4).map(w => ({ id: w.id, owner: w.owner })), c0);
  for (const [i, w] of pick.entries()) {
    await p.check(`#pf-${w.id}`);
    await p.selectOption(`select[data-f="owner"][data-id="${w.id}"]`, w.owner);
    await p.selectOption(`select[data-f="kpi"][data-id="${w.id}"]`, "0");
    await p.selectOption(`select[data-f="start"][data-id="${w.id}"]`, String(1 + i));
    await p.selectOption(`select[data-f="review"][data-id="${w.id}"]`, "3");
  }
  await p.click("#pfSubmit"); await p.waitForTimeout(100);
  check("portfolio submits and scores", await p.evaluate(id => MDS.getScore(id, "portfolio"), c0) > 0);
  await go(`${c0}-exec`);
  const txt = await p.locator("#test").innerText();
  check("exec runs your portfolio", txt.includes("Chartered for") && txt.includes("Not in your portfolio"));
  await p.click(`[data-a="start"][data-w="${pick[0].id}"]`);
  let sawAccounts = false, varAsked = 0, steers = 0;
  for (let m = 0; m < 40; m++) {
    const phase = await p.evaluate(id => MDS.state.exec[id].phase, c0);
    if (phase === "end") break;
    if (phase === "act") { await p.click("#endMonth"); await p.waitForTimeout(60); }
    if (await p.locator("#send").count()) {
      for (const r of await p.$$('.modal [data-v="A"]')) await r.click();
      if (await p.locator(".modal table").count()) sawAccounts = true;
      if (await p.locator('.modal [data-var]').count()) { varAsked++; await p.click(`.modal [data-var="${await p.evaluate(id => MDS.state.exec[id].mgmt.truth, c0)}"]`); }
      await p.click("#send"); await p.waitForTimeout(60);
    }
    if (await p.locator("#stx").count()) {
      steers++;
      const g = await p.evaluate(id => ({ run: Math.round(MDS.state.exec[id].runRate) }), c0);
      await p.fill("#stx", `We are at ${g.run} of run-rate against plan. Two workstreams are behind and at risk because owners are not yet bought in. I need a decision from you on sequencing next quarter, nothing else.`);
      await p.click("#stsend"); await p.waitForTimeout(80); await p.click("#stok"); await p.waitForTimeout(60);
    }
    if (await p.locator(".modal [data-o]").count()) {
      for (const o of await p.$$(".modal [data-o]")) { await o.click(); await p.waitForTimeout(30); if (await p.locator("#evok").count()) break; }
      await p.click("#evok"); await p.waitForTimeout(60);
    }
  }
  const endTxt = await p.locator("#test").innerText();
  check("exec reaches the twelve-month result", /twelve months later/i.test(endTxt),await p.evaluate(id => { const g = MDS.state.exec[id]; return `month=${g.month} phase=${g.phase} days=${g.days} event=${g.event && g.event.id}`; }, c0));
  check("carry-forward notes appear", endTxt.includes("Carried in"));
  check("monthly accounts, variance questions and four steering updates", sawAccounts && varAsked >= 3 && steers === 4, `accounts=${sawAccounts} variance=${varAsked} steering=${steers}`);
  check("explaining the variance correctly is logged", (await p.evaluate(id => MDS.state.exec[id].varOk || 0, c0)) === varAsked);
  const delayed = await p.evaluate(() => {
    const sc = MDS.scenarios.harbour, g = MDS.newExec(sc); MDS.state.exec.harbour = g;
    g.ws.uplift.started = true; g.ws.uplift.status = "On track"; g.ws.uplift.progress = 99; g.support.top3 = -60; MDS.save(); return true;
  });
  await go("harbour-exec");
  for (let m = 0; m < 40; m++) {
    const st = await p.evaluate(() => MDS.state.exec.harbour); if (st.month >= 8 || st.phase === "end") break;
    if (st.phase === "act") { await p.click("#endMonth"); await p.waitForTimeout(50); }
    if (await p.locator("#send").count()) { for (const r of await p.$$('.modal [data-v="A"]')) await r.click(); if (await p.locator('.modal [data-var]').count()) await p.click('.modal [data-var="delivery"]'); await p.click("#send"); await p.waitForTimeout(50); }
    if (await p.locator("#stx").count()) { await p.fill("#stx", "We are behind plan and at risk on two workstreams. I need a decision on sequencing from you this week please, thanks."); await p.click("#stsend"); await p.waitForTimeout(60); await p.click("#stok"); await p.waitForTimeout(50); }
    if (await p.locator(".modal [data-o]").count()) { for (const o of await p.$$(".modal [data-o]")) { await o.click(); await p.waitForTimeout(30); if (await p.locator("#evok").count()) break; } await p.click("#evok"); await p.waitForTimeout(50); }
  }
  check("a price rise without customers on side unwinds months later", delayed && (await p.evaluate(() => MDS.state.exec.harbour.log.some(l => /gone with customers who left/.test(l.t)))));

  /* 4b. check the data, write it, scripted meeting, spreadsheet round trip, lever lab reality check */
  for (const c of info.cases) {
    await go(`${c}-clean`);
    const D = await p.evaluate(id => { const d = MDS.cleanData(MDS.scenarios[id]); return { qs: d.qs.map(q => ({ id: q.id, a: q.a, choice: !!q.choice })), best: d.judge.o.findIndex(o => o[1] === 25) }; }, c);
    for (const q of D.qs) { if (q.choice) await p.selectOption(`#cq-${q.id}`, String(q.a)); else await p.fill(`#cq-${q.id}`, String(Math.round(q.a * 10) / 10)); }
    await p.click(`[data-j="${D.best}"]`); await p.click("#cmark"); await p.waitForTimeout(60);
    check(`check the data: ${c}`, (await p.evaluate(id => MDS.getScore(id, "clean"), c)) === 100);
    await go(`${c}-talk`); await p.click("[data-scene]"); await p.waitForTimeout(60);
    const best = await p.evaluate(id => MDS.scenarios[id].meeting.scene.map(b => b.o.findIndex(o => o[1] === 3)), c);
    for (const bi of best) { await p.click(`[data-m="${bi}"]`); await p.waitForTimeout(40); }
    check(`scripted meeting: ${c}`, (await p.evaluate(id => MDS.getScore(id, "meeting"), c)) === 100);
  }
  await go(`${c0}-write`); await p.click('[data-b="day1"]');
  const good = "Hello everyone. My name is Sam and I've joined to work alongside Dave and the team. For the first few weeks I will mostly listen: I'd like to meet each of you and understand how things work and what gets in your way. The way you serve customers is not changing, and Dave still runs the company. I don't know yet what we'll change, and I can't promise there will be none, but I will be honest with you as soon as I do know. You can email me or just drop by my desk at any time. I'll share what I've heard at the all-hands in a month.";
  await p.fill("#wText", good); await p.click("#wMark"); await p.waitForTimeout(150);
  const wGood = await p.evaluate(id => MDS.state.writes[id].day1.best, c0);
  await p.fill("#wText", "We are excited to announce a value creation programme that will leverage synergies going forward. There will be no job losses, I guarantee it. Best practice will be rolled out across all teams and nothing will change for anyone here at all in the business."); await p.click("#wMark"); await p.waitForTimeout(150);
  const wBad = await p.evaluate(id => MDS.state.writes[id].day1.last, c0);
  check("write it: a sound note beats a jargon-filled one", wGood >= 85 && wBad <= 40, `sound=${wGood} jargon=${wBad}`);
  await go(`${c0}-model`); await p.click("#xl summary");
  const want = await p.evaluate(id => { const sc = MDS.scenarios[id], v = MDS.evalModel(MDS.modelTemplate(), MDS.data(sc).actuals).vals; return `Revenue\t${v.revenue.slice(1, 4).map(x => x.toFixed(0)).join("\t")}\nEBITDA\t${v.ebitda.slice(1, 4).map(x => x.toFixed(0)).join("\t")}`; }, c0);
  await p.fill("#xlIn", want); await p.click("#xlChk");
  check("spreadsheet round trip accepts the right forecast", (await p.evaluate(id => MDS.getScore(id, "xl"), c0)) === 100);
  await p.fill("#xlIn", "Revenue\t1\t2\t3\nEBITDA\t1\t2\t3"); await p.click("#xlChk");
  check("spreadsheet round trip rejects a wrong one", (await p.locator("#xlRes").innerText()).includes("0/6"));
  await go(`${c0}-lab`);
  check("lever lab shows the real-company reality check", (await p.locator("#bench").innerText()).includes("real companies"));

  /* 5. lessons on real accounts */
  for (const l of ["adjusted", "revhead", "opleverage", "rule40"]) {
    await go("frameworks"); await p.click(`[data-l="${l}"]`); await p.waitForTimeout(80);
    const n = await p.locator("#exreal input").count(), anon = await p.locator("#exreal h3").innerText();
    const ans = await p.evaluate(({ l, anon }) => { const s = MDS.content.studies.find(x => x.anon === anon), i = s.years.findIndex(y => y.fy === s.decision.as_of); return MDS.content.realEx[l](s.years.slice(0, i + 1)).asks.map(a => a[1]); }, { l, anon });
    for (let i = 0; i < n; i++) await p.fill("#ra" + i, ans[i].toFixed(1));
    await p.click("#rchk");
    check(`real-accounts exercise: ${l}`, n > 0 && (await p.locator("#rres").innerText()).includes("All correct"));
  }

  /* 6. interview room and readiness */
  await go("interview");
  await p.fill("#pcv", "Head of Operations, 2019 to 2024. Ran a 40-person team."); await p.click("#psave");
  check("CV is saved and reaches the interviewer's brief", await p.evaluate(() => MDS.talkRules(MDS.content.interviews[0]).includes("Head of Operations")));
  check("three interview rounds", await p.locator("[data-t]").count() === 3);
  await p.click("#caseW"); await p.waitForTimeout(80);
  const cs = await p.evaluate(() => { const anon = document.querySelector("#ir .small.dim").textContent, s = MDS.content.studies.find(x => x.anon === anon), y = s.years.find(q => q.fy === s.decision.as_of), y0 = s.years[0]; return { rev: y.revenue, op: y.operating_profit, staff: y.staff_costs, rev0: y0.revenue, why: s.decision.why[s.decision.best], opt: s.decision.options[s.decision.best] }; });
  await p.fill("#wc1", `Revenue is ${cs.rev} against ${cs.rev0} earlier, operating profit ${cs.op} and staff costs ${cs.staff}. ${cs.why}`);
  await p.fill("#wc2", `1. ${cs.opt}\n2. Protect the recurring base.\n3. Build a monthly cash forecast.`);
  await p.fill("#wc3", "The main risk is customer concentration, and the accounts don't show churn or contract length, which I would want to see.");
  await p.click("#wcMark"); await p.waitForTimeout(80);
  check("written case round marks a sound answer highly", (await p.evaluate(() => MDS.getScore("global", "interview_case"))) >= 80);
  await go("readiness");
  check("readiness shows five competencies", await p.locator("#view .ring").count() === 5);

  /* 7. phone width */
  await p.setViewportSize({ width: 390, height: 844 });
  for (const r of [`${c0}-portfolio`, "readiness", "studies", "interview"]) { await go(r); const w = await p.evaluate(() => document.documentElement.scrollWidth); check(`no sideways scroll at phone width: ${r}`, w <= 392, `width=${w}`); }

  check("no page errors", !errs.length, errs.slice(0, 3).join(" | "));
  await b.close(); process.exit(fails ? 1 : 0);
})();
