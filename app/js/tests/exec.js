/* Run the transformation: 12 monthly turns. Spend your days, win people over, keep workstreams moving, report honestly. */
MDS.EXEC = { CAP: 16, MONTHS: 12 };

MDS.execGenericEvents = [
  { id: "g_bau", repeat: 4, prob: 0.3, cond: g => g.month >= 2, title: "A Sev-1 outage hits a major customer",
    text: g => `Production is down for ${g.sc.exec.customers === "top3" ? "one of your three largest customers" : "a key customer"}. The GM's diary is full and everyone is looking at you.`,
    options: [
      { t: "Back the GM to lead the response. You support from the side and protect your transformation time.", days: 2, fx: g => { g.sup(g.sc.exec.gm, 6); g.sup(g.sc.exec.customers, 4); }, fb: "Right instinct: the business owns its customers. You add structure, not heroics." },
      { t: "Lead the response yourself for the month.", days: 7, fx: g => { g.sup(g.sc.exec.customers, 10); g.pmAdj(2); }, fb: "Customers are grateful, but your workstreams lose a week and the GM learns you'll step in." },
      { t: "Stay focused on the transformation. It isn't your job.", days: 0, fx: g => { g.sup(g.sc.exec.customers, -15); g.sup(g.sc.exec.gm, -8); }, fb: "Technically true and politically disastrous. Transformation credibility comes from being useful when it matters." }
    ] },
  { id: "g_owner", repeat: 3, cond: g => g.activeWs().some(w => g.support[w.owner] < -5 && w.owner !== "pm"), title: g => `An owner goes quiet`,
    text: g => { const w = g.activeWs().find(x => g.support[x.owner] < -5); g.ctx = w; return `${g.name(w.owner)} has missed two check-ins on "${w.name}" and hasn't updated the tracker.`; },
    options: [
      { t: "Take them for a coffee. Ask what's getting in the way before you mention the plan.", days: 2, fx: g => { g.sup(g.ctx.owner, 14); }, fb: "Disengagement is usually a symptom: workload, fear or disagreement. Find out which." },
      { t: "Reassign ownership to the GM.", days: 1, fx: g => { g.sup(g.ctx.owner, -10); g.ctx.owner = g.sc.exec.gm; }, fb: "Sometimes right, but the original owner now has a grievance and the GM has more load." },
      { t: "Escalate to the Portfolio Manager.", days: 1, fx: g => { g.escalate(g.ctx.owner); }, fb: "Escalation works once or twice. Used early, it burns your credibility as someone who influences without authority." },
      { t: "Let it drift. They'll come round.", days: 0, fx: g => { g.wsPts(g.ctx.id, -12); }, fb: "Drift compounds. The workstream slips." }
    ] },
  { id: "g_founder", once: true, cond: g => g.support[g.sc.exec.gm] < -15 && g.activeWs().some(w => w.needs.includes(g.sc.exec.gm)), title: "The founder goes around you",
    text: g => { const w = g.activeWs().find(x => x.needs.includes(g.sc.exec.gm)); g.ctx = w; return `${g.name(g.sc.exec.gm)} tells the team that "${w.name}" is on hold "until things settle down". Nobody told you.`; },
    options: [
      { t: "Ask for an hour today. Listen first, then walk through the evidence and agree what they'll say to the team.", days: 2, fx: g => { g.sup(g.sc.exec.gm, g.support[g.sc.exec.gm] > -45 ? 14 : 6); }, fb: "Founders resist changes they didn't author. Give them authorship of the message." },
      { t: "Escalate to the Portfolio Manager.", days: 1, fx: g => { g.escalate(g.sc.exec.gm); }, fb: "It may unblock this, but the founder now sees you as the owner's spy." },
      { t: "Accept the pause.", days: 0, fx: g => { g.pause(g.ctx.id, 2); g.sup(g.sc.exec.gm, 4); }, fb: "Peace now, but you've taught the founder how to stop things." }
    ] },
  { id: "g_resign", once: true, cond: g => g.fatigue > 60 || g.sc.exec.team.some(t => g.support[t] < -35), title: "A key person resigns",
    text: g => { const t = g.sc.exec.team.slice().sort((a, b) => g.support[a] - g.support[b])[0]; g.ctx = t; return `${g.name(t)} hands in their notice. In the exit chat they say: "It's change after change and nobody asks us."`; },
    options: [
      { t: "Hold a stay conversation: listen, then fix one concrete thing they raise. Make no counter-offer on pay.", days: 2, fx: g => { if (g.support[g.ctx] > -40) { g.sup(g.ctx, 20); g.log("They stay. The concrete fix mattered more than money.", "g"); } else { g.loseKey(g.ctx); } }, fb: "Retention is about voice and workload more than pay. It works only if the relationship isn't already broken." },
      { t: "Accept it and backfill.", days: 1, fx: g => { g.loseKey(g.ctx); }, fb: "Backfilling takes 3–6 months. Workstreams that depended on them slip." },
      { t: "Make a counter-offer.", days: 1, fx: g => { g.sup(g.ctx, 8); g.fatigue += 5; g.log("They stay for now, and others notice that resigning gets a raise.", "w"); }, fb: "Treats the symptom. The reason they resigned is still there." }
    ] },
  { id: "g_accel", once: true, cond: g => g.month === 6, title: "The group wants value faster",
    text: "The Portfolio Manager: \"Group's reviewing all portfolio plans. Can you start everything now and pull value into this year?\"",
    options: [
      { t: "Show the evidence: current run-rate, change fatigue, capacity. Propose accelerating the one highest-value workstream.", days: 1, fx: g => { g.pmAdj(3); const w = g.wsList().filter(w => w.started && w.progress < 100).sort((a, b) => b.value - a.value)[0]; if (w) g.wsPts(w.id, 15); }, fb: "Pushing back with data and a constructive alternative is what a senior operator does." },
      { t: "Agree. Start every remaining workstream this month.", days: 0, fx: g => { g.wsList().filter(w => !w.started && !w.stopped).forEach(w => { g.ws[w.id].started = true; g.ws[w.id].status = "On track"; }); g.fatigue += 18; g.pmAdj(4); }, fb: "The PM's happy this month. Your capacity and the team's fatigue won't be." },
      { t: "Say no. The plan is the plan.", days: 0, fx: g => { g.pmAdj(-8); }, fb: "A flat no to your sponsor, with no alternative, costs trust." }
    ] },
  { id: "g_data", once: true, cond: g => g.month === 3 && g.wsList().some(w => w.started && w.value > 0), title: "Your baseline was wrong",
    text: g => { const w = g.wsList().filter(w => w.started && w.value > 0).sort((a, b) => b.value - a.value)[0]; g.ctx = w; return `Cleaning the data, you find the value of "${w.name}" was overstated: about 20% of it was double-counted. The PM's pack still shows the old number.`; },
    options: [
      { t: "Tell the PM now. Revise the number and show how you'll close the gap.", days: 1, fx: g => { g.valueAdj(g.ctx.id, -0.2); g.pmAdj(4); }, fb: "Early, honest correction builds trust you'll need later." },
      { t: "Keep quiet and hope other workstreams make up the difference.", days: 0, fx: g => { g.valueAdj(g.ctx.id, -0.2); g.hidden.push("baseline"); }, fb: "It will come out in a later review. These things always do." }
    ] },
  { id: "g_fatigue", repeat: 4, cond: g => g.fatigue > 65, title: "Change fatigue",
    text: "The engagement pulse drops 15 points. The most common comment: \"too much change at once, and nobody asks us\".",
    options: [
      { t: "Pause the least valuable active workstream and say why.", days: 1, fx: g => { const w = g.activeWs().sort((a, b) => a.value - b.value)[0]; if (w) g.pause(w.id, 2); g.fatigue -= 15; }, fb: "Sequencing is a leadership decision. Saying what you won't do is as important as what you will." },
      { t: "Run an all-hands with the GM: what's done, what's next, what's stopping.", days: 2, fx: g => { g.fatigue -= 9; g.sc.exec.team.forEach(t => g.sup(t, 4)); }, fb: "Visible progress and honesty reduce fatigue." },
      { t: "Push through. It'll settle.", days: 0, fx: g => { g.sc.exec.team.forEach(t => g.sup(t, -8)); g.fatigue += 5; }, fb: "It won't. Resistance hardens." }
    ] },
  { id: "g_cust", once: true, cond: g => g.wsList().some(w => ["uplift", "legacy", "pricing"].includes(w.id) && w.progress > 40 && w.progress < 100), title: "A large customer pushes back on price",
    text: g => `Your largest customer's head of IT calls ${g.name(g.sc.exec.gm)} directly and threatens to go to tender over the price change.`,
    options: [
      { t: "Meet them with the GM. Phase the increase over 3 years and tie it to a roadmap item they want.", days: 3, fx: g => { g.sup(g.sc.exec.customers, 15); g.sup(g.sc.exec.gm, 5); }, fb: "Phasing plus visible value keeps the account and the principle." },
      { t: "Exempt them.", days: 0, fx: g => { ["uplift", "legacy", "pricing"].forEach(id => g.ws[id] && g.valueAdj(id, -0.15)); g.sup(g.sc.exec.customers, 10); }, fb: "Calm today. Every other customer now has a reason to call the founder." },
      { t: "Hold firm.", days: 0, fx: g => { g.sup(g.sc.exec.customers, -20); if (g.support[g.sc.exec.customers] < -30) { g.runRateAdj(-80); g.log("They go to tender, and you lose them at renewal.", "r"); } }, fb: "Consistent, but you're betting a large account on a letter." }
    ] }
];

MDS.newExec = sc => {
  const E = sc.exec;
  const g = { v: 2, month: 1, days: MDS.EXEC.CAP, energy: 80, fatigue: 20, pm: 55, support: {}, ws: {}, runRate: 0, realised: 0, log: [], fired: {}, phase: "act", event: null, escalations: 0, hidden: [], history: [], celebrate: 0, diy: 0, surprises: 0, misses: [], peakFatigue: 20 };
  sc.stake.forEach(s => { g.support[s.id] = E.support[s.id] != null ? E.support[s.id] : ({ Champion: 45, Neutral: 5, Sceptic: -25, Blocker: -50 })[s.stance]; });
  E.ws.forEach(w => { g.ws[w.id] = { id: w.id, started: false, progress: 0, status: "Not started", pauseUntil: 0, coach: false, diyFlag: false, bonus: 0, green: false, owner: w.owner, valueMult: 1, done: 0, missed: false }; });
  g.log.push({ m: 1, c: "i", t: `Day one. You have ${MDS.EXEC.CAP} days a month for the transformation after reporting and BAU. Target: ${MDS.k(E.target)} a year of extra EBITDA run-rate within 12 months.` });
  return g;
};

MDS.tests.exec = (sc, el) => {
  const E = sc.exec, store = MDS.state.exec = MDS.state.exec || {};
  let g = store[sc.id] && store[sc.id].v === 2 ? store[sc.id] : (store[sc.id] = MDS.newExec(sc));
  const def = id => E.ws.find(w => w.id === id);
  const stake = id => sc.stake.find(s => s.id === id) || { name: id, power: "Low" };
  const FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const startIdx = Math.max(0, FULL.findIndex(m => sc.plan.start.includes(m))), startYear = +((sc.plan.start.match(/\d{4}/) || [2026])[0]);
  const monthName = m => `${FULL[(startIdx + m - 1) % 12]} ${startYear + Math.floor((startIdx + m - 1) / 12)}`;
  const cap = () => g.energy < 30 ? 12 : MDS.EXEC.CAP;

  /* ---------- helpers bound to state (used by events) ---------- */
  const H = {
    sc, get month() { return g.month; },
    name: id => stake(id).name.split(",")[0],
    sup: (id, d) => { if (g.support[id] == null) return; const before = g.support[id]; g.support[id] = MDS.clamp(before + d, -100, 100); },
    wsList: () => E.ws.map(w => Object.assign({}, w, g.ws[w.id], { owner: g.ws[w.id].owner })),
    activeWs: () => H.wsList().filter(w => w.started && w.progress < 100 && w.pauseUntil <= g.month),
    wsPts: (id, p) => { const w = g.ws[id]; if (w) { w.progress = MDS.clamp(w.progress + p / def(id).effort * 100, 0, 100); } },
    pause: (id, n) => { if (g.ws[id]) g.ws[id].pauseUntil = g.month + n; },
    stop: id => { if (g.ws[id]) { g.ws[id].started = false; g.ws[id].progress = 0; g.ws[id].status = "Stopped"; g.ws[id].stopped = true; } },
    pmAdj: d => { g.pm = MDS.clamp(g.pm + d, 0, 100); },
    runRateAdj: d => { g.runRate += d; },
    valueAdj: (id, f) => { if (g.ws[id]) g.ws[id].valueMult *= (1 + f); },
    addRisk: t => H.log("Risk: " + t, "w"),
    log: (t, c = "i") => g.log.push({ m: g.month, c, t }),
    escalate: id => { g.escalations++; g.support[id] = Math.max(g.support[id], 0); H.sup(E.gm, id === E.gm ? -12 : -6); H.pmAdj(g.escalations > 2 ? -10 : -3); H.log(`You escalated ${H.name(id)} to the Portfolio Manager (${g.escalations} so far).`, g.escalations > 2 ? "r" : "w"); },
    loseKey: id => { H.log(`${H.name(id)} leaves. Workstreams that relied on them lose ground.`, "r"); E.ws.forEach(w => { if (w.needs.includes(id) || g.ws[w.id].owner === id) H.wsPts(w.id, -30); }); g.fatigue += 6; g.support[id] = 0; }
  };
  Object.defineProperty(H, "support", { get: () => g.support });
  Object.defineProperty(H, "fatigue", { get: () => g.fatigue, set: v => { g.fatigue = MDS.clamp(v, 0, 100); } });
  Object.defineProperty(H, "ws", { get: () => g.ws });
  Object.defineProperty(H, "hidden", { get: () => g.hidden });

  const save = () => { MDS.save(); };
  const stanceOf = v => v >= 30 ? ["Champion", "pos"] : v >= 0 ? ["Neutral", ""] : v >= -30 ? ["Sceptic", "warn"] : ["Blocker", "neg"];
  const statusCls = s => ({ "On track": "ok", "Done": "ok", "At risk": "amber", "Blocked": "no", "Waiting": "amber", "Paused": "", "Not started": "", "Stopped": "" }[s] || "");

  const spend = (d, why) => { if (g.days < d) { toast(`Not enough days left this month (${g.days}).`); return false; } g.days -= d; if (why) H.log(why); return true; };
  const toast = t => { const x = document.createElement("div"); x.className = "toast"; x.textContent = t; document.body.appendChild(x); setTimeout(() => x.classList.add("on"), 10); setTimeout(() => { x.classList.remove("on"); setTimeout(() => x.remove(), 300); }, 2400); };

  /* ---------- simulate a month ---------- */
  const simulate = () => {
    const r = MDS.rng(g.month * 7919 + sc.id.length);
    const active = H.activeWs();
    const overload = active.length > 4 ? 0.7 : active.length > 3 ? 0.85 : 1;
    E.ws.forEach(d => {
      const w = g.ws[d.id];
      if (!w.started || w.progress >= 100) { if (!w.started && d.deadline && g.month >= d.deadline && !w.missed) { w.missed = true; g.misses.push(d.name); H.log(`Missed: "${d.name}" wasn't even started by its deadline.`, "r"); } return; }
      if (w.pauseUntil > g.month) { w.status = "Paused"; w.bonus = 0; return; }
      const depsWaiting = (d.deps || []).filter(x => g.ws[x].progress < 100);
      const blockers = d.needs.filter(s => g.support[s] < -30);
      let pts = 0;
      if (depsWaiting.length) { w.status = "Waiting"; w.why = `Waiting on: ${depsWaiting.map(x => def(x).name).join(", ")}`; pts = w.bonus * 0.3; }
      else if (blockers.length) { w.status = "Blocked"; w.why = `Blocked by ${blockers.map(H.name).join(", ")}`; pts = w.bonus * 0.3; H.sup(w.owner, -2); }
      else {
        const own = g.support[w.owner] != null ? g.support[w.owner] : 50;
        const ownF = own < -30 ? 0.15 : own < 0 ? 0.45 : own < 30 ? 0.75 : 1;
        pts = 11 * ownF * (1 - g.fatigue / 200) * overload * (w.coach ? 1.25 : 1) * (0.75 + 0.5 * r()) + w.bonus;
        w.why = ownF < 0.75 ? `${H.name(w.owner)} isn't fully bought in` : "";
        const perMonth = 11 * ownF * overload, need = (100 - w.progress - pts / d.effort * 100) / (perMonth / d.effort * 100 || 1);
        w.status = pts < 11 * 0.55 ? "At risk" : d.deadline && g.month + need > d.deadline + 0.01 && g.month < d.deadline ? "At risk" : "On track";
      }
      w.bonus = 0;
      w.progress = MDS.clamp(w.progress + pts / d.effort * 100, 0, 100);
      if (w.progress >= 100) {
        const late = d.deadline && g.month > d.deadline;
        const val = d.value * w.valueMult * (late ? d.late : 1);
        w.status = "Done"; w.done = g.month; g.runRate += val; g.celebrate++; H.pmAdj(4);
        H.log(`Delivered: "${d.name}"${val ? `, adding ${MDS.k(val)} a year${late ? " (late: most of this cycle's value is lost)" : ""}` : ""}.`, "g");
        if (w.diyFlag) H.log(`You did much of "${d.name}" yourself. Will the business keep it going when you move on?`, "w");
      } else if (d.deadline && g.month === d.deadline) { w.missed = true; g.misses.push(d.name); H.log(`Deadline missed: "${d.name}".`, "r"); if (w.green) { surprise(d); } }
      if (w.green && (w.status === "Blocked" || w.status === "At risk")) surprise(d);
    });
    g.fatigue = MDS.clamp(g.fatigue + 4 * H.activeWs().length - 7, 0, 100);
    g.peakFatigue = Math.max(g.peakFatigue, g.fatigue);
    if (g.fatigue > 60) E.team.forEach(t => H.sup(t, -3));
    const used = 1 - g.days / cap();
    g.energy = MDS.clamp(g.energy + (used > 0.9 ? -9 : used < 0.6 ? 6 : -1), 0, 100);
    g.realised += g.runRate / 12;
    if (g.hidden.includes("baseline") && g.month === 7) { H.pmAdj(-15); g.surprises++; H.log("The Portfolio Manager finds the overstated baseline in the half-year review. \"Why am I hearing this from finance?\"", "r"); g.hidden = g.hidden.filter(x => x !== "baseline"); }
    g.history.push({ m: g.month, run: g.runRate, pm: g.pm, fat: g.fatigue, energy: g.energy });
  };
  const surprise = d => { const w = g.ws[d.id]; w.green = false; g.surprises++; H.pmAdj(-12); H.log(`The Portfolio Manager is surprised: you reported "${d.name}" as green.`, "r"); };

  const pickEvent = () => {
    const r = MDS.rng(g.month * 104729 + sc.id.length * 13);
    H.ctx = null;
    const pool = (E.events || []).concat(MDS.execGenericEvents).filter(e => {
      const f = g.fired[e.id];
      if (e.once && f) return false;
      if (e.repeat && f && g.month - f < e.repeat) return false;
      try { return e.cond(H); } catch (err) { return false; }
    });
    const caseFirst = pool.filter(e => (E.events || []).includes(e));
    const cand = caseFirst.length ? caseFirst : pool.filter(e => !e.prob || r() < e.prob);
    if (!cand.length || (!caseFirst.length && r() < 0.25)) return null;
    const e = cand[Math.floor(r() * cand.length)];
    H.ctx = null;
    g.fired[e.id] = g.month;
    return { id: e.id, title: typeof e.title === "function" ? e.title(H) : e.title, text: typeof e.text === "function" ? e.text(H) : e.text, ctx: H.ctx && H.ctx.id ? { ws: H.ctx.id } : H.ctx ? { person: H.ctx } : null };
  };
  const eventDef = id => (E.events || []).concat(MDS.execGenericEvents).find(e => e.id === id);

  /* ---------- rendering ---------- */
  const meter = (label, v, max, cls, sub) => `<div class="xm"><div class="xm-l">${label}</div><div class="xm-v num">${v}</div><div class="bar"><i class="${cls}" style="width:${MDS.clamp(max ? (parseFloat(String(v).replace(/[^0-9.-]/g, "")) / max) * 100 : 0, 0, 100)}%"></i></div>${sub ? `<div class="xm-s">${sub}</div>` : ""}</div>`;
  const render = () => {
    if (g.phase === "end") return renderEnd();
    const list = H.wsList();
    const pct = Math.min(100, g.runRate / E.target * 100);
    el.innerHTML = `<div class="stack">
      <div class="panel exhead">
        <div class="row" style="justify-content:space-between;align-items:flex-end">
          <div><div class="eyebrow">Run the transformation</div><h2 style="margin:4px 0 0">Month ${g.month} of ${MDS.EXEC.MONTHS} · ${monthName(g.month)}</h2></div>
          <div class="row"><button class="btn ghost sm" id="restart" type="button">Restart</button><button class="btn" id="endMonth" type="button">End month →</button></div>
        </div>
        <div class="months">${Array.from({ length: MDS.EXEC.MONTHS }, (_, i) => `<span class="${i + 1 < g.month ? "past" : i + 1 === g.month ? "now" : ""}"></span>`).join("")}</div>
        <div class="xms">
          ${meter("Your days this month", `${g.days}/${cap()}`, cap(), g.days < 3 ? "bad" : "", g.energy < 30 ? "Exhausted: capacity cut" : "Spend them on what moves the plan")}
          ${meter("EBITDA run-rate added", MDS.k(g.runRate), E.target, "good", `Target ${MDS.k(E.target)} · ${Math.round(pct)}%`)}
          ${meter("PM confidence", Math.round(g.pm), 100, g.pm < 40 ? "bad" : g.pm < 60 ? "warn" : "good", g.surprises ? `${g.surprises} surprise${g.surprises > 1 ? "s" : ""}` : "Honest reporting builds it")}
          ${meter("Change fatigue", Math.round(g.fatigue), 100, g.fatigue > 60 ? "bad" : g.fatigue > 40 ? "warn" : "good", `${H.activeWs().length} workstreams live`)}
          ${meter("Your energy", Math.round(g.energy), 100, g.energy < 30 ? "bad" : g.energy < 50 ? "warn" : "good", "Running at 100% every month burns you out")}
        </div>
      </div>
      <div class="exgrid">
        <div class="stack">
          <h3 class="sect">Workstreams</h3>
          ${list.map(w => {
            const d = def(w.id), st = w.pauseUntil > g.month ? "Paused" : w.status, done = w.progress >= 100;
            return `<article class="ws ${done ? "done" : ""}">
              <div class="row" style="justify-content:space-between;gap:8px"><strong>${MDS.esc(d.name)}</strong><span class="pill ${statusCls(st)}">${st}</span></div>
              <div class="small dim">${MDS.esc(d.hint)}</div>
              <div class="wsmeta small"><span>Owner: <b>${MDS.esc(H.name(w.owner))}</b></span><span>Value: <b class="num">${d.value ? MDS.k(d.value * w.valueMult) + "/yr" : "enabler"}</b></span>${d.deadline ? `<span class="${g.month > d.deadline && !done ? "neg" : ""}">Deadline: <b>${monthName(d.deadline).split(" ")[0]}</b></span>` : ""}${w.coach ? `<span class="pos">Coached</span>` : ""}${w.diyFlag ? `<span style="color:var(--warn)">You're doing it</span>` : ""}</div>
              <div class="prog"><i style="width:${w.progress}%"></i></div>
              <div class="needs">${d.needs.map(s => { const v = g.support[s], [lab, c] = stanceOf(v); return `<span class="need ${c}" title="${lab} (${Math.round(v)})">${MDS.esc(H.name(s))}</span>`; }).join("")}${w.why && !done ? `<span class="small faint">${MDS.esc(w.why)}</span>` : ""}</div>
              ${done ? "" : `<div class="acts">${!w.started ? `<button class="btn sm" data-a="start" data-w="${w.id}" type="button">Start · 1d</button>` : w.pauseUntil > g.month ? `<button class="btn sm ghost" data-a="resume" data-w="${w.id}" type="button">Resume</button>` : `
                <button class="btn sm" data-a="focus" data-w="${w.id}" type="button" title="Hands-on push with the owner">Push · 4d</button>
                <button class="btn sm ghost" data-a="workshop" data-w="${w.id}" type="button" title="Co-design with the people it needs">Co-design · 3d</button>
                ${w.coach ? "" : `<button class="btn sm ghost" data-a="coach" data-w="${w.id}" type="button" title="Build the owner's capability">Coach owner · 2d</button>`}
                <button class="btn sm ghost" data-a="diy" data-w="${w.id}" type="button" title="Fast, but the business doesn't own it">Do it yourself · 6d</button>
                <button class="btn sm ghost" data-a="pause" data-w="${w.id}" type="button">Pause · 1d</button>`}</div>`}
            </article>`;
          }).join("")}
        </div>
        <div class="stack">
          <h3 class="sect">People</h3>
          <div class="panel" style="padding:10px 12px">${sc.stake.map(s => { const v = g.support[s.id], [lab, c] = stanceOf(v); return `<div class="person">
              <div class="av" aria-hidden="true">${MDS.esc(s.name.split(/[ ,]/).filter(Boolean).slice(0, 2).map(x => x[0]).join(""))}</div>
              <div style="min-width:0"><div class="small" style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${MDS.esc(s.name)}</div>
                <div class="sbar"><span class="mid"></span><i class="${c}" style="${v >= 0 ? `left:50%;width:${v / 2}%` : `left:${50 + v / 2}%;width:${-v / 2}%`}"></i></div>
                <div class="small faint">${lab} · ${s.power} power</div></div>
              <div class="pacts">${s.id === "pm" ? "" : `<button class="btn sm ghost" data-a="one" data-p="${s.id}" type="button" title="Listen, understand, build trust">1:1 · 1d</button><button class="icon" data-a="esc" data-p="${s.id}" type="button" title="Escalate to the Portfolio Manager (1 day)" aria-label="Escalate ${MDS.esc(s.name)}">⇧</button>`}</div></div>`; }).join("")}</div>
          <div class="panel" style="padding:10px 12px"><div class="small" style="font-weight:600;margin-bottom:6px">Whole-team moves</div>
            <div class="row"><button class="btn sm ghost" data-a="allhands" type="button">All-hands with the GM · 2d</button>${g.celebrate > 0 ? `<button class="btn sm" data-a="celebrate" type="button">Celebrate a win · 1d</button>` : ""}</div></div>
          <h3 class="sect">Log</h3>
          <div class="panel log">${g.log.slice().reverse().slice(0, 40).map(l => `<div class="li ${l.c}"><span class="num faint">M${l.m}</span> ${MDS.esc(l.t)}</div>`).join("")}</div>
        </div>
      </div></div>`;
    if (g.phase === "event") renderEvent();
    if (g.phase === "report") renderReport();
  };

  const modal = (html) => {
    const m = document.createElement("div"); m.className = "modal"; m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
    Array.from(el.children).forEach(c => { c.inert = true; });
    el.appendChild(m); requestAnimationFrame(() => { m.classList.add("on"); const f = m.querySelector("button"); if (f) f.focus(); }); return m;
  };
  const renderEvent = () => {
    const ev = g.event, d = eventDef(ev.id);
    if (ev.ctx) H.ctx = ev.ctx.ws ? Object.assign({}, def(ev.ctx.ws), g.ws[ev.ctx.ws]) : ev.ctx.person;
    if (ev.ctx && ev.ctx.ws) H.ctx = g.ws[ev.ctx.ws] && Object.assign(g.ws[ev.ctx.ws], { name: def(ev.ctx.ws).name });
    const m = modal(`<div class="eyebrow">Something happens · ${monthName(g.month)}</div><h2 style="margin:6px 0">${MDS.esc(ev.title)}</h2><p>${MDS.esc(ev.text)}</p>
      <div class="stack" style="gap:8px">${d.options.map((o, i) => `<button class="opt" type="button" data-o="${i}" style="text-align:left;font:inherit;color:inherit">${MDS.esc(o.t)}${o.days ? ` <span class="faint num">· ${o.days}d</span>` : ""}</button>`).join("")}</div><div id="evfb"></div>`);
    m.querySelectorAll("[data-o]").forEach(b => b.onclick = () => {
      const o = d.options[+b.dataset.o];
      if (o.days > g.days) { toast("You don't have enough days left for that."); return; }
      g.days -= o.days; o.fx(H); H.log(`${ev.title}: ${o.t}`, "i");
      m.querySelectorAll("[data-o]").forEach(x => { x.disabled = true; });
      b.classList.add("right");
      m.querySelector("#evfb").innerHTML = `<div class="fb mid" style="margin-top:10px">${MDS.esc(o.fb)}</div><div style="margin-top:12px"><button class="btn" type="button" id="evok">Continue</button></div>`;
      m.querySelector("#evok").onclick = () => { g.event = null; g.phase = "act"; save(); render(); };
    });
  };
  const renderReport = () => {
    const act = E.ws.filter(d => g.ws[d.id].started && (g.ws[d.id].progress < 100 || g.ws[d.id].done === g.month));
    const m = modal(`<div class="eyebrow">Monthly report to the Portfolio Manager</div><h2 style="margin:6px 0">How is each workstream doing?</h2>
      <p class="small dim">Rate each one Green, Amber or Red. You can see the real status. The PM can't, until it shows up in the numbers.</p>
      <div class="stack" style="gap:8px">${act.length ? act.map(d => { const w = g.ws[d.id]; return `<div class="rag"><div style="min-width:0"><div class="small" style="font-weight:600">${MDS.esc(d.name)}</div><div class="small faint">Actual: ${w.status}${w.why ? " · " + MDS.esc(w.why) : ""}</div></div>
        <div class="seg" role="group" aria-label="RAG for ${MDS.esc(d.name)}">${["G", "A", "R"].map(x => `<button type="button" data-r="${d.id}" data-v="${x}" aria-pressed="false" class="rag-${x}">${x}</button>`).join("")}</div></div>`; }).join("") : `<div class="small dim">Nothing live to report yet.</div>`}</div>
      <div class="row" style="margin-top:14px"><button class="btn" id="send" type="button">Send report</button></div>`);
    const picks = {};
    m.querySelectorAll("[data-r]").forEach(b => b.onclick = () => { picks[b.dataset.r] = b.dataset.v; m.querySelectorAll(`[data-r="${b.dataset.r}"]`).forEach(x => x.setAttribute("aria-pressed", x === b)); });
    m.querySelector("#send").onclick = () => {
      if (act.some(d => !picks[d.id])) { toast("Rate every workstream."); return; }
      let honest = 0;
      act.forEach(d => {
        const w = g.ws[d.id], truth = w.status === "Done" || w.status === "On track" ? "G" : w.status === "At risk" || w.status === "Paused" ? "A" : "R", p = picks[d.id];
        const rank = { G: 0, A: 1, R: 2 };
        if (rank[p] < rank[truth]) { w.green = true; } else { w.green = false; if (p === truth && truth !== "G") honest++; if (rank[p] > rank[truth]) H.pmAdj(-1); }
      });
      if (honest) { H.pmAdj(Math.min(3, honest * 1.5)); H.log(`Honest reporting: you flagged ${honest} issue${honest > 1 ? "s" : ""} early.`, "g"); }
      if (g.month >= MDS.EXEC.MONTHS) { g.phase = "end"; save(); render(); return; }
      g.month++; g.days = cap();
      const ev = pickEvent();
      if (ev) { g.event = ev; g.phase = "event"; } else g.phase = "act";
      save(); render();
    };
  };
  const renderEnd = () => {
    const S = (() => {
      const value = Math.min(1, g.runRate / E.target) * 40, pm = g.pm / 100 * 20;
      const key = sc.stake.filter(s => s.power === "High" && s.id !== "pm").map(s => g.support[s.id]);
      const ppl = key.reduce((a, v) => a + (v + 100) / 200, 0) / key.length * 20;
      const sus = MDS.clamp(20 - g.diy * 4 - (g.fatigue > 60 ? 6 : 0) - (g.energy < 30 ? 8 : 0), 0, 20);
      return { value, pm, ppl, sus, total: Math.round(value + pm + ppl + sus) };
    })();
    if (!g.scored) { g.scored = true; MDS.setScore(sc.id, "exec", S.total, "first"); MDS.save(); }
    const [gr, cls] = MDS.grade(S.total);
    const W = 520, Hh = 150, hist = g.history, maxR = Math.max(E.target, ...hist.map(h => h.run), 1);
    const sx = i => 30 + i * (W - 40) / Math.max(1, MDS.EXEC.MONTHS - 1), sy = v => 10 + (Hh - 30) * (1 - v / maxR), sy2 = v => 10 + (Hh - 30) * (1 - v / 100);
    const lessons = [];
    if (g.misses.length) lessons.push(["r", `Missed deadlines: ${g.misses.join("; ")}. Deadlines set by contracts and renewal cycles don't move. Sequence for them first.`]);
    if (g.surprises) lessons.push(["r", `${g.surprises} green-to-red surprise${g.surprises > 1 ? "s" : ""}. Reporting amber early costs nothing. A surprise costs your credibility.`]);
    if (g.escalations > 2) lessons.push(["w", `You escalated ${g.escalations} times. Escalation is a last resort in a decentralised model.`]);
    if (g.diy) lessons.push(["w", `You did ${g.diy} workstream push${g.diy > 1 ? "es" : ""} yourself. Fast, but it doesn't build the business's capability.`]);
    if (g.peakFatigue > 65) lessons.push(["w", `Change fatigue peaked at ${Math.round(g.peakFatigue)}. Too much at once slows everything down.`]);
    const blocked = E.ws.filter(d => g.ws[d.id].status === "Blocked");
    if (blocked.length) lessons.push(["r", `Still blocked at the end: ${blocked.map(d => d.name).join("; ")}. Who did you not win over?`]);
    if (!lessons.length) lessons.push(["g", "Clean run: deadlines met, honest reporting, and people still with you."]);
    el.innerHTML = `<div class="stack"><div class="panel">
      <div class="eyebrow">Twelve months later</div><div class="row" style="gap:16px;margin-top:8px"><div class="bigscore">${S.total}</div><span class="pill ${cls === "pos" ? "ok" : "no"}">${gr}</span></div>
      <div class="kpis" style="margin-top:12px">
        <div class="kpi"><div class="l">Value: ${MDS.k(g.runRate)} vs ${MDS.k(E.target)}</div><div class="v">${Math.round(S.value)}<span class="faint" style="font-size:13px">/40</span></div></div>
        <div class="kpi"><div class="l">PM confidence ${Math.round(g.pm)}</div><div class="v">${Math.round(S.pm)}<span class="faint" style="font-size:13px">/20</span></div></div>
        <div class="kpi"><div class="l">Key people still with you</div><div class="v">${Math.round(S.ppl)}<span class="faint" style="font-size:13px">/20</span></div></div>
        <div class="kpi"><div class="l">Sustainable and owned</div><div class="v">${Math.round(S.sus)}<span class="faint" style="font-size:13px">/20</span></div></div>
      </div>
      <p class="small dim">EBITDA realised in-year: ${MDS.k(g.realised)}. The run-rate is what the business carries into next year.</p>
      <svg viewBox="0 0 ${W} ${Hh}" width="100%" role="img" aria-label="Run-rate and PM confidence by month" style="max-width:640px">
        <line x1="30" x2="${W - 10}" y1="${sy(E.target)}" y2="${sy(E.target)}" stroke="var(--good)" stroke-dasharray="4 4"/><text x="${W - 12}" y="${sy(E.target) - 4}" text-anchor="end">target</text>
        <polyline fill="none" stroke="var(--acc)" stroke-width="2.5" points="${hist.map((h, i) => `${sx(i)},${sy(h.run)}`).join(" ")}"/>
        <polyline fill="none" stroke="var(--warn)" stroke-width="1.5" stroke-dasharray="3 3" points="${hist.map((h, i) => `${sx(i)},${sy2(h.pm)}`).join(" ")}"/>
        ${hist.map((h, i) => `<text x="${sx(i)}" y="${Hh - 6}" text-anchor="middle">${h.m}</text>`).join("")}
      </svg>
      <div class="legend"><span><i style="background:var(--acc)"></i>Run-rate added</span><span><i style="background:var(--warn)"></i>PM confidence</span></div>
      <h3 style="margin-top:16px">What this run teaches</h3><ul class="warns">${lessons.map(([c, t]) => `<li class="${c}">${MDS.esc(t)}</li>`).join("")}</ul>
      <p class="small dim">Turn this into an interview story: "In month X, Y blocked Z. I did A, because B, and the result was C."</p>
      <div class="row"><button class="btn" id="again" type="button">Run it again</button></div></div>
      <div class="panel"><h3>Full log</h3><div class="log">${g.log.map(l => `<div class="li ${l.c}"><span class="num faint">M${l.m}</span> ${MDS.esc(l.t)}</div>`).join("")}</div></div></div>`;
    MDS.$("#again", el).onclick = () => { g = store[sc.id] = MDS.newExec(sc); save(); render(); };
  };

  el.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b || !el.contains(b) || b.closest(".modal")) return;
    const a = b.dataset.a, wid = b.dataset.w, pid = b.dataset.p, w = wid && g.ws[wid], d = wid && def(wid);
    if (b.id === "restart") { if (b.dataset.c !== "1") { b.dataset.c = "1"; b.textContent = "Click again to restart"; return; } g = store[sc.id] = MDS.newExec(sc); save(); render(); return; }
    if (b.id === "endMonth") { if (g.phase !== "act") return; simulate(); g.phase = "report"; save(); render(); return; }
    if (!a) return;
    if (a === "start" && spend(1, `Started "${d.name}".`)) { w.started = true; w.status = "On track"; g.fatigue += 3; if (g.support[w.owner] < 0) H.log(`${H.name(w.owner)} owns "${d.name}" but isn't on board yet.`, "w"); }
    else if (a === "resume") { w.pauseUntil = 0; H.log(`Resumed "${d.name}".`); }
    else if (a === "pause" && spend(1)) { w.pauseUntil = g.month + 1; H.log(`Paused "${d.name}" for a month. Fatigue eases at month end if it stays paused.`); }
    else if (a === "focus" && spend(4)) { w.bonus += 16; H.sup(w.owner, 2); H.log(`You pushed "${d.name}" with ${H.name(w.owner)}.`); }
    else if (a === "workshop" && spend(3)) { d.needs.forEach(s => H.sup(s, 9)); H.sup(w.owner, 5); w.bonus += 5; H.log(`Co-design session on "${d.name}" with ${d.needs.map(H.name).join(", ")}.`, "g"); }
    else if (a === "coach" && spend(2)) { w.coach = true; H.sup(w.owner, 5); H.log(`You coached ${H.name(w.owner)} on running "${d.name}".`); }
    else if (a === "diy" && spend(6)) { w.bonus += 38; H.sup(w.owner, -10); if (!w.diyFlag) g.diy++; w.diyFlag = true; H.log(`You did a chunk of "${d.name}" yourself. ${H.name(w.owner)} feels sidelined.`, "w"); }
    else if (a === "one" && spend(1)) { const k = "v" + g.month + pid; const n = (g[k] = (g[k] || 0) + 1); const s = stake(pid); const base = s.stance === "Blocker" ? 7 : 10; H.sup(pid, Math.round(base / n)); H.log(`1:1 with ${H.name(pid)}${n > 1 ? " (again this month: diminishing returns)" : ""}.`); }
    else if (a === "esc" && spend(1)) { H.escalate(pid); }
    else if (a === "allhands" && spend(2)) { g.fatigue = Math.max(0, g.fatigue - 7); E.team.forEach(t => H.sup(t, 3)); H.sup(E.gm, 2); H.log("All-hands with the GM: what's done, what's next, what's stopping.", "g"); }
    else if (a === "celebrate" && spend(1)) { g.celebrate--; g.fatigue = Math.max(0, g.fatigue - 10); E.team.forEach(t => H.sup(t, 5)); H.log("You celebrated a delivered win, crediting the owner by name.", "g"); }
    save(); render();
  });
  render();
};
