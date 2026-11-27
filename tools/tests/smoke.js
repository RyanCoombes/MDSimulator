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
  for (let m = 0; m < 16; m++) {
    const phase = await p.evaluate(id => MDS.state.exec[id].phase, c0);
    if (phase === "end") break;
    if (phase === "act") { await p.click("#endMonth"); await p.waitForTimeout(60); }
    if (await p.locator("#send").count()) {
      for (const r of await p.$$('.modal [data-v="A"]')) await r.click();
      await p.click("#send"); await p.waitForTimeout(60);
    }
    if (await p.locator(".modal [data-o]").count()) {
      for (const o of await p.$$(".modal [data-o]")) { await o.click(); await p.waitForTimeout(30); if (await p.locator("#evok").count()) break; }
      await p.click("#evok"); await p.waitForTimeout(60);
    }
  }
  const endTxt = await p.locator("#test").innerText();
  check("exec reaches the twelve-month result", /twelve months later/i.test(endTxt),await p.evaluate(id => { const g = MDS.state.exec[id]; return `month=${g.month} phase=${g.phase} days=${g.days} event=${g.event && g.event.id}`; }, c0));
  check("carry-forward notes appear", endTxt.includes("Carried in"));

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
  await go("readiness");
  check("readiness shows five competencies", await p.locator("#view .ring").count() === 5);

  /* 7. phone width */
  await p.setViewportSize({ width: 390, height: 844 });
  for (const r of [`${c0}-portfolio`, "readiness", "studies", "interview"]) { await go(r); const w = await p.evaluate(() => document.documentElement.scrollWidth); check(`no sideways scroll at phone width: ${r}`, w <= 392, `width=${w}`); }

  check("no page errors", !errs.length, errs.slice(0, 3).join(" | "));
  await b.close(); process.exit(fails ? 1 : 0);
})();
