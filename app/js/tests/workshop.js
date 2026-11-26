/* Test 6: workshop planner. Build an agenda and invite list, then assess it against facilitation practice. */
MDS.tests.workshop = (sc, el) => {
  const W = sc.workshop, lib = MDS.content.blocks;
  let agenda = [], invited = new Set();
  el.innerHTML = `<div class="stack">
    <div class="panel"><div class="eyebrow">Workshop brief</div><h2 style="margin-top:4px">${MDS.esc(W.title)}</h2>
      <p><strong>Outcome needed:</strong> ${MDS.esc(W.objective)}</p>
      <p class="small dim">Slot: ${W.slot} minutes, starting 09:30. Build the agenda from the blocks, choose who attends, then assess it. You're the facilitator and always attend.</p></div>
    <div class="ws">
      <div class="stack">
        <div class="panel"><h3>Building blocks</h3><div class="lib">${lib.map(b => `<div class="libitem"><div><div>${MDS.esc(b.name)}</div><div class="typ">${b.type} · ${b.mins} min</div></div><button class="btn sm ghost" type="button" data-add="${b.id}" aria-label="Add ${MDS.esc(b.name)}">Add</button></div>`).join("")}</div></div>
        <div class="panel"><h3>Invite</h3><div class="people">${W.people.map(p => `<label class="tog" for="inv-${p.id}"><input type="checkbox" id="inv-${p.id}" data-p="${p.id}"><span>${MDS.esc(p.name)} <span class="faint">· ${MDS.esc(p.role)}</span></span></label>`).join("")}</div></div>
      </div>
      <div class="stack">
        <div class="panel"><div class="row" style="justify-content:space-between"><h3>Your agenda</h3><span class="num small" id="tot"></span></div>
          <div class="agenda" id="agenda"></div>
          <div class="row" style="margin-top:12px"><button class="btn" id="assess" type="button">Assess my plan</button><button class="btn ghost" id="clear" type="button">Clear</button></div></div>
        <div class="panel" id="res" hidden></div>
      </div></div></div>`;

  const hhmm = m => { const t = 9 * 60 + 30 + m; return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`; };
  const draw = () => {
    let t = 0;
    MDS.$("#agenda", el).innerHTML = agenda.length ? agenda.map((id, i) => {
      const b = lib.find(x => x.id === id), row = `<div class="ag"><span class="t">${b.mins ? hhmm(t) : "before"}</span><div><div>${MDS.esc(b.name)}</div><div class="typ">${b.type} · ${b.mins} min</div></div>
        <div class="ctrls"><button class="icon" type="button" data-up="${i}" aria-label="Move up">↑</button><button class="icon" type="button" data-down="${i}" aria-label="Move down">↓</button><button class="icon" type="button" data-del="${i}" aria-label="Remove">×</button></div></div>`;
      t += b.mins; return row;
    }).join("") : `<div class="small dim">Add blocks from the left. Order matters.</div>`;
    const total = agenda.reduce((a, id) => a + lib.find(x => x.id === id).mins, 0);
    MDS.$("#tot", el).textContent = `${total} / ${W.slot} min`;
  };
  el.addEventListener("click", e => {
    const t = e.target.closest("button"); if (!t) return;
    if (t.dataset.add) { const b = lib.find(x => x.id === t.dataset.add); if (b.type === "pre" && agenda.includes("pre")) return; agenda.push(b.id); if (b.type === "pre") agenda = ["pre", ...agenda.filter(x => x !== "pre")]; draw(); }
    else if (t.dataset.up) { const i = +t.dataset.up; if (i > 0) [agenda[i - 1], agenda[i]] = [agenda[i], agenda[i - 1]]; draw(); }
    else if (t.dataset.down) { const i = +t.dataset.down; if (i < agenda.length - 1) [agenda[i + 1], agenda[i]] = [agenda[i], agenda[i + 1]]; draw(); }
    else if (t.dataset.del) { agenda.splice(+t.dataset.del, 1); draw(); }
  });
  el.addEventListener("change", e => { const p = e.target.dataset && e.target.dataset.p; if (p) e.target.checked ? invited.add(p) : invited.delete(p); });
  MDS.$("#clear", el).onclick = () => { agenda = []; draw(); MDS.$("#res", el).hidden = true; };
  MDS.$("#assess", el).onclick = () => {
    const blocks = agenda.map(id => lib.find(x => x.id === id));
    const allTimed = blocks.filter(b => b.mins > 0);
    let clock = 0; const timed = allTimed.filter(b => { const ok = clock < W.slot; clock += b.mins; return ok; });
    const cut = allTimed.length - timed.length;
    const total = allTimed.reduce((a, b) => a + b.mins, 0);
    const idx = type => timed.findIndex(b => b.type === type);
    const people = W.people.filter(p => invited.has(p.id));
    const headcount = 1 + people.reduce((a, p) => a + (p.count || 1), 0);
    const R = [];
    const rule = (pts, ok, good, bad) => R.push({ pts, ok, msg: ok ? good : bad });
    // 1 objectives up front
    const objAt = timed.findIndex(b => b.id === "obj");
    const before = objAt < 0 ? Infinity : timed.slice(0, objAt).reduce((a, b) => a + b.mins, 0);
    rule(10, before <= 15, "Objectives and decisions are stated in the first 15 minutes.", "State the objective and the decisions needed at the start. People can't contribute to an outcome they don't know.");
    // 2 pre-read
    rule(10, !W.preread || agenda.includes("pre"), "A pre-read goes out in advance, so the session is spent deciding, not reading.", "This is a data-heavy decision. Send a pre-read so you don't spend the first hour presenting numbers.");
    // 3 diverge then converge
    const dv = timed.findIndex(b => b.type === "diverge"), cv = timed.findIndex(b => b.type === "converge");
    rule(15, dv >= 0 && cv > dv, "Options are generated before they're narrowed down.", dv < 0 ? "There's no idea-generation step. You're asking people to approve your answer rather than shape it." : cv < 0 ? "Ideas are generated but never prioritised, so the session ends without a shortlist." : "You prioritise before generating options. Narrowing too early anchors on the loudest idea.");
    // 4 decision with decider present
    const deciders = W.people.filter(p => p.decider);
    const deciderIn = deciders.every(p => invited.has(p.id));
    rule(15, idx("decide") >= 0 && deciderIn && (W.kind !== "decide" || idx("decide") > cv), "A real decision step, with the decision-maker in the room.", idx("decide") < 0 ? "There's no explicit decision step. Workshops without one produce 'great discussion' and no outcome." : !deciderIn ? `The decider (${deciders.map(p => p.name).join(" and ")}) isn't invited. Nothing decided in the room will hold.` : "The decision comes before the options are prioritised.");
    // 5 actions at the end
    const lastTwo = timed.slice(-3).map(b => b.type);
    rule(10, lastTwo.includes("actions"), "It ends with actions, owners and dates.", "Finish with actions, owners and dates. Without them, the agreement fades by Monday.");
    // 6 breaks
    let run = 0, maxRun = 0; timed.forEach(b => { if (b.type === "break") run = 0; else { run += b.mins; maxRun = Math.max(maxRun, run); } });
    rule(10, maxRun <= 90, "No stretch runs longer than 90 minutes without a break.", `There's a ${maxRun}-minute stretch without a break. Attention drops sharply after about 90 minutes.`);
    // 7 timing
    rule(10, total >= W.slot * 0.9 && total <= W.slot * 1.05, `It fits the slot (${total} of ${W.slot} minutes).`, total > W.slot * 1.05 ? `It overruns: ${total} minutes in a ${W.slot}-minute slot. Something important will get squeezed, usually the decision.` : `It's only ${total} of ${W.slot} minutes. Either shorten the booking or use the time for the parts that need it.`);
    // 8 presenting share
    const pres = timed.filter(b => b.type === "present").reduce((a, b) => a + b.mins, 0);
    rule(10, total > 0 && pres / total <= 0.3, "Presenting takes up less than 30% of the time.", `Presenting takes ${total ? Math.round(pres / total * 100) : 0}% of the time. A workshop where you talk most of the time is a meeting with sticky notes.`);
    // 9 right people, right size
    const mustMissing = W.people.filter(p => p.must && !invited.has(p.id));
    const intimidating = people.some(p => p.intimidating);
    rule(10, mustMissing.length === 0 && headcount <= 10 && headcount >= 4, `The right people are in the room, and ${headcount} is a workable group.`, mustMissing.length ? `Missing people who must own the outcome: ${mustMissing.map(p => p.name).join(", ")}.` : headcount > 10 ? `${headcount} people is too many for a decision. Keep it to around 5–8 and consult the wider team separately.` : "Too few people to represent the parts of the business affected.");
    let score = R.reduce((a, r) => a + (r.ok ? r.pts : 0), 0);
    const extras = [];
    if (cut) extras.unshift(["bad", `${cut} block${cut > 1 ? "s" : ""} would never happen: the time runs out first. Anything scheduled after the slot ends, typically the decision and the actions, doesn't count.`]);
    if (agenda.includes("premortem")) { score += 5; extras.push(["good", "The pre-mortem surfaces objections safely before you commit. Bonus +5."]); }
    if (agenda.includes("silent") && !agenda.includes("brain")) extras.push(["good", "Silent idea generation before discussion stops the most senior voice from anchoring the group."]);
    if (agenda.includes("deck")) extras.push(["mid", "A 45-minute deck in a workshop usually means the analysis should have been in the pre-read."]);
    if (agenda.includes("ice") && W.slot <= 180) extras.push(["mid", "A 15-minute icebreaker is a lot in a short decision session with people who already know each other."]);
    if (intimidating) extras.push(["mid", "Inviting your Portfolio Manager can make the founder perform rather than decide. Brief them before and after instead."]);
    score = Math.min(100, score);
    MDS.setScore(sc.id, "workshop", score, "first");
    const [g, cls] = MDS.grade(score);
    const res = MDS.$("#res", el); res.hidden = false;
    res.innerHTML = `<div class="row" style="gap:16px"><div class="bigscore">${score}</div><span class="pill ${cls === "pos" ? "ok" : "no"}">${g}</span></div>
      <div class="stack" style="margin-top:10px">${R.map(r => `<div class="fb ${r.ok ? "good" : "bad"}">${MDS.esc(r.msg)} <span class="faint num">(${r.ok ? r.pts : 0}/${r.pts})</span></div>`).join("")}
      ${extras.map(([c, t]) => `<div class="fb ${c}">${MDS.esc(t)}</div>`).join("")}</div>`;
  };
  draw();
};
