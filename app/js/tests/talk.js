/* Conversations: role-play with AI characters, scored by an AI coach afterwards. Also powers the Interview room. */
MDS.talkRules = T => T.interview ? `You are playing an interviewer in a realistic practice interview for a candidate. British English.
ROLE: ${T.who}, ${T.role}.
CONTEXT: ${T.setting}
HOW YOU BEHAVE: ${T.persona}
WHAT YOU'RE QUIETLY ASSESSING: ${T.concerns}
STRONG SIGNALS: ${T.wins}
WEAK SIGNALS: ${T.hardens}
Rules: stay in role; never coach, praise lavishly or reveal your assessment; ask ONE question at a time (or one follow-up); keep each turn to 1–3 spoken sentences; probe vague answers for specifics, numbers and personal ownership. Speech only: no stage directions, no lists, no markdown.
After your spoken reply, on a final line, write exactly [[q: N]] where N is the number of the main question you're now on (follow-ups keep the same number). When the interview is complete (about 8 main questions, then the candidate's own questions), thank them, close naturally, and end with [[end]].`
  : `You are role-playing a character in a professional training simulation. The trainee is practising leading transformation in a newly acquired software business. British English.
CHARACTER: ${T.who}, ${T.role}.
PERSONA: ${T.persona}
PRIVATE CONCERNS (reveal only gradually, if the trainee earns it with good questions and trust): ${T.concerns}
WHAT MOVES YOU: ${T.wins}
WHAT HARDENS YOU: ${T.hardens}
SCENE: ${T.setting}
THE TRAINEE IS TRYING TO: ${T.goal}
Your stance towards the trainee's goal starts at ${T.start} on a scale from −100 (hostile, opposed) to +100 (fully on board). React like a real person: move it up for things that move you and down for things that harden you, usually 5–20 points per turn. Don't concede quickly. Raise realistic objections, and never agree to more than the trainee has actually earned.
Rules: stay in character always; never mention AI, simulations or training; never coach the trainee. Reply as natural spoken dialogue only, 1–4 sentences, with no stage directions, lists or markdown.
After your spoken reply, on a final line, write exactly [[stance: N]] with your current stance as an integer. If the conversation has reached a natural end (an agreement or a walk-out), add [[end]].`;

MDS.talkEval = (T, transcript) => `You are an experienced executive coach assessing a trainee's performance in a ${T.interview ? "practice interview" : "role-play conversation"}. Be honest, specific and calibrated: most competent people score 55–75, and only an excellent performance scores above 85. Don't inflate.
SCENE: ${T.setting}
${T.interview ? "WHAT THE INTERVIEW TESTS" : "THE TRAINEE'S GOAL"}: ${T.goal}
${T.interview ? "INTERVIEWER'S CRITERIA" : "CHARACTER'S HIDDEN BRIEF"}: Persona: ${T.persona} Concerns: ${T.concerns} Moved by: ${T.wins} Hardened by: ${T.hardens}
TRANSCRIPT:
${transcript}

Reply with only a JSON object:
${T.interview
    ? '{"score": integer 0-100, "verdict": "one sentence", "competencies": [{"name": "e.g. Commercial and financial acumen", "rating": 1-5, "evidence": "short, quoting or pointing to what they said"}] (4-6 items), "strengths": ["up to 3 specific points"], "improve": ["up to 3 specific, actionable points"], "better_answer": {"question": "the question they answered weakest", "answer": "a stronger 3-5 sentence answer in a natural first-person voice, using placeholders like [your number] where only the candidate knows the facts"}}'
    : '{"score": integer 0-100, "verdict": "one sentence", "outcome": "what was actually agreed, if anything", "strengths": ["up to 3 specific points"], "improve": ["up to 3 specific, actionable points"], "hidden": "what the character privately cared about, and whether the trainee uncovered it", "better_line": "one thing the trainee could have said at a key moment, in a natural first-person voice"}'}`;

MDS.runTalk = (el, T, scoreKey, back) => {
  let turns = [{ role: "assistant", content: T.opening }], stance = T.start, q = 1, ended = false, busy = false, ctl = null, speakOn = false;
  const rules = MDS.talkRules(T);
  const strip = t => t.replace(/\[\[[\s\S]*$/, "").trim();
  const userTurns = () => turns.filter(t => t.role === "user").length;
  el.innerHTML = `<div class="stack">
    <div class="row" style="justify-content:space-between"><button class="btn ghost sm" id="tBack" type="button">← All conversations</button><span class="small faint" id="aiNote"></span></div>
    <div class="talkg">
      <div class="panel chat">
        <div class="chathead"><div class="av big" aria-hidden="true">${MDS.esc(T.who.split(" ").map(x => x[0]).join("").slice(0, 2))}</div><div><strong>${MDS.esc(T.who)}</strong><div class="small faint">${MDS.esc(T.role)}</div></div>
          <label class="tog small" style="margin-left:auto" id="voiceWrap" hidden><input type="checkbox" id="voice"> Hear them</label></div>
        <div class="msgs" id="msgs" aria-live="polite"></div>
        <div class="composer"><label for="say" class="small faint">Your words</label><textarea id="say" rows="3" placeholder="Type, or press Speak and talk"></textarea>
          <div class="row" style="justify-content:space-between"><div class="row"><button class="btn ghost sm" id="mic" type="button" hidden>🎙 Speak</button><span class="small faint" id="cnt"></span></div>
          <div class="row"><button class="btn ghost sm" id="stop" type="button" hidden>Stop</button><button class="btn ghost sm" id="end" type="button">End and get feedback</button><button class="btn sm" id="send" type="button">Send</button></div></div></div>
      </div>
      <div class="stack">
        <div class="panel"><div class="eyebrow">${T.interview ? "The interview" : "The situation"}</div><p class="small">${MDS.esc(T.setting)}</p><div class="eyebrow" style="margin-top:8px">${T.interview ? "What they're testing" : "Your goal"}</div><p class="small" style="margin-bottom:0">${MDS.esc(T.goal)}</p></div>
        <div class="panel" id="gauge"></div>
        <div class="panel small dim">${T.interview ? "Answer as you would in the room: specific examples, real numbers, what you personally did. Practise out loud with Speak." : "They have private concerns you can only discover by asking. Their stance moves with what you say."}</div>
      </div>
    </div>
    <div id="fb"></div></div>`;
  const msgs = MDS.$("#msgs", el), say = MDS.$("#say", el);
  const bubble = (role, text) => { const d = document.createElement("div"); d.className = "msg " + (role === "user" ? "me" : "them"); d.textContent = text; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d; };
  const gauge = () => {
    MDS.$("#gauge", el).innerHTML = T.interview
      ? `<div class="eyebrow">Progress</div><div class="xm-v num">Question ${q}</div><div class="small faint">About 8 main questions</div>`
      : `<div class="eyebrow">${MDS.esc(T.who.split(" ")[0])}'s stance</div><div class="stance"><span class="mid"></span><i style="left:${(Math.min(stance, 0) + 100) / 2}%;width:${Math.abs(stance) / 2}%;background:${stance >= 30 ? "var(--good)" : stance >= 0 ? "var(--acc)" : stance >= -30 ? "var(--warn)" : "var(--bad)"}"></i></div>
         <div class="row small faint" style="justify-content:space-between"><span>Opposed</span><span class="num" style="color:var(--ink);font-weight:600">${stance > 0 ? "+" : ""}${stance}</span><span>On board</span></div>`;
  };
  bubble("assistant", T.opening); gauge();
  MDS.$("#tBack", el).onclick = () => { if (ctl) ctl.abort(); back(); };
  (async () => {
    if (!(await MDS.ai.available())) { MDS.$("#aiNote", el).textContent = MDS.ai.unavailableNote; ["send", "end", "say"].forEach(id => { MDS.$("#" + id, el).disabled = true; }); return; }
    MDS.micButton(MDS.$("#mic", el), say);
    const t = await MDS.ai.tts;
    if (t) { MDS.$("#voiceWrap", el).hidden = false; MDS.$("#voice", el).onchange = e => { speakOn = e.target.checked; if (!speakOn) t.stop().catch(() => {}); }; }
  })();
  const speak = async text => { if (!speakOn) return; const t = await MDS.ai.tts; if (t) t.speak(text, { voice: T.voice || "buttery" }).catch(() => {}); };
  say.addEventListener("keydown", e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) MDS.$("#send", el).click(); });
  MDS.$("#stop", el).onclick = () => { if (ctl) ctl.abort(); };
  MDS.$("#send", el).onclick = async () => {
    const text = say.value.trim(); if (!text || busy || ended) return;
    const sample = await MDS.ai.sample; if (!sample) return;
    busy = true; say.value = ""; bubble("user", text); turns.push({ role: "user", content: text });
    const b = bubble("assistant", "…"); b.classList.add("typing");
    MDS.$("#send", el).disabled = true; MDS.$("#stop", el).hidden = false;
    ctl = new AbortController();
    try {
      const recent = turns.slice(-24);
      const input = [{ role: "user", content: rules + "\n\nThe conversation follows. Your first line has already been said." }].concat(recent);
      const { text: reply } = await sample(input, { cache: false, modelTier: "quick", signal: ctl.signal, onText: ({ text: t }) => { b.classList.remove("typing"); b.textContent = strip(t) || "…"; msgs.scrollTop = msgs.scrollHeight; } });
      const m = reply.match(/\[\[stance:\s*(-?\d+)\s*\]\]/i), mq = reply.match(/\[\[q:\s*(\d+)\s*\]\]/i);
      if (m) stance = MDS.clamp(parseInt(m[1], 10), -100, 100);
      if (mq) q = parseInt(mq[1], 10);
      const clean = strip(reply) || "…";
      b.textContent = clean; turns.push({ role: "assistant", content: clean + (m ? `\n[[stance: ${stance}]]` : "") });
      gauge(); speak(clean);
      if (/\[\[end\]\]/i.test(reply) || userTurns() >= (T.interview ? 16 : 12)) { ended = true; MDS.$("#cnt", el).textContent = "The conversation has ended. Get your feedback."; }
    } catch (e) {
      b.remove(); turns.pop(); say.value = text; MDS.ai.disable(e);
      if (e.code !== "cancelled") MDS.$("#aiNote", el).textContent = MDS.ai.msg(e);
    } finally { busy = false; MDS.$("#send", el).disabled = ended; MDS.$("#stop", el).hidden = true; if (!ended) MDS.$("#cnt", el).textContent = `${userTurns()} message${userTurns() === 1 ? "" : "s"}`; }
  };
  MDS.$("#end", el).onclick = async () => {
    if (userTurns() < 2) { MDS.$("#cnt", el).textContent = "Have at least two exchanges first."; return; }
    const sample = await MDS.ai.sample; if (!sample || busy) return;
    busy = true; ended = true; MDS.$("#send", el).disabled = true;
    const fb = MDS.$("#fb", el);
    fb.innerHTML = `<div class="panel"><div class="eyebrow">Coach's assessment</div><p class="dim">Reviewing the conversation… this can take up to a minute.</p></div>`;
    fb.scrollIntoView({ behavior: "smooth", block: "start" });
    const transcript = turns.map(t => `${t.role === "user" ? "TRAINEE" : T.who.toUpperCase()}: ${t.content.replace(/\n?\[\[.*?\]\]/g, "")}`).join("\n");
    try {
      const r = await sample.json(MDS.talkEval(T, transcript), { cache: false });
      const score = MDS.clamp(Math.round(Number(r.score) || 0), 0, 100);
      MDS.setScore(scoreKey[0], scoreKey[1], score); MDS.setScore(scoreKey[0], scoreKey[1] + "_" + T.id, score);
      const [g, cls] = MDS.grade(score);
      const li = a => (Array.isArray(a) ? a : []).map(x => `<li>${MDS.esc(String(x))}</li>`).join("");
      fb.innerHTML = `<div class="panel"><div class="eyebrow">Coach's assessment</div>
        <div class="row" style="gap:16px;margin-top:8px"><div class="bigscore">${score}</div><span class="pill ${cls === "pos" ? "ok" : "no"}">${g}</span>${T.interview ? "" : `<span class="small dim">Final stance ${stance > 0 ? "+" : ""}${stance}</span>`}</div>
        <p style="font-size:16px">${MDS.esc(String(r.verdict || ""))}</p>
        ${r.outcome ? `<p class="small"><strong>Outcome:</strong> ${MDS.esc(String(r.outcome))}</p>` : ""}
        ${Array.isArray(r.competencies) ? `<div class="tblwrap"><table><thead><tr><th>Competency</th><th>Rating</th><th style="text-align:left">Evidence</th></tr></thead><tbody>${r.competencies.map(c => `<tr><td>${MDS.esc(String(c.name))}</td><td>${"●".repeat(MDS.clamp(+c.rating || 0, 0, 5))}${"○".repeat(5 - MDS.clamp(+c.rating || 0, 0, 5))}</td><td style="text-align:left;white-space:normal;font-family:var(--body)">${MDS.esc(String(c.evidence || ""))}</td></tr>`).join("")}</tbody></table></div>` : ""}
        <div class="g2" style="margin-top:10px"><div class="fb good"><strong>What worked</strong><ul>${li(r.strengths)}</ul></div><div class="fb bad"><strong>Do differently</strong><ul>${li(r.improve)}</ul></div></div>
        ${r.hidden ? `<div class="fb mid" style="margin-top:10px"><strong>What they were really thinking:</strong> ${MDS.esc(String(r.hidden))}</div>` : ""}
        ${r.better_line ? `<blockquote style="margin-top:10px">${MDS.esc(String(r.better_line))}<footer>A stronger line at the key moment</footer></blockquote>` : ""}
        ${r.better_answer ? `<blockquote style="margin-top:10px"><strong>${MDS.esc(String(r.better_answer.question || ""))}</strong><br>${MDS.esc(String(r.better_answer.answer || ""))}<footer>A stronger answer: fill the brackets with your real facts</footer></blockquote>` : ""}
        <div class="row" style="margin-top:12px"><button class="btn" id="again" type="button">Try again</button><button class="btn ghost" id="back2" type="button">All conversations</button></div></div>`;
      MDS.$("#again", el).onclick = () => MDS.runTalk(el, T, scoreKey, back);
      MDS.$("#back2", el).onclick = back;
    } catch (e) {
      MDS.ai.disable(e); ended = false; MDS.$("#send", el).disabled = false;
      fb.innerHTML = `<div class="panel"><p class="neg">${MDS.esc(MDS.ai.msg(e))}</p></div>`;
    } finally { busy = false; }
  };
};

MDS.talkList = (el, list, scoreKey, title, intro) => {
  const show = () => {
    el.innerHTML = `<div class="stack"><div class="panel"><h2>${title}</h2><p class="dim small" style="margin:0">${intro}</p><p class="small faint" id="aiNote" style="margin:6px 0 0"></p></div>
      <div class="cases">${list.map(T => { const s = MDS.getScore(scoreKey[0], scoreKey[1] + "_" + T.id); return `<div class="panel casecard"><div class="cc-top"><div><div class="eyebrow">${MDS.esc(T.role)}</div><h3 style="margin-top:4px;font-size:17px">${MDS.esc(T.who)}</h3></div>${MDS.ring(s || 0, s != null ? s : "–")}</div>
        <p class="small dim">${MDS.esc(T.goal)}</p><div><button class="btn" type="button" data-t="${T.id}">${T.interview ? "Start the interview" : "Start the conversation"}</button></div></div>`; }).join("")}</div></div>`;
    MDS.ai.available().then(ok => { if (!ok) MDS.$("#aiNote", el).textContent = MDS.ai.unavailableNote; });
    MDS.$$("[data-t]", el).forEach(b => b.onclick = () => MDS.runTalk(el, list.find(t => t.id === b.dataset.t), scoreKey, show));
  };
  show();
};

MDS.tests.talk = (sc, el) => MDS.talkList(el, sc.talks || [], [sc.id, "talk"], "Conversations",
  "Talk it through in your own words with the people in this case. Each character has private concerns and things that win them over or harden them. A coach scores you at the end.");
MDS.tests.interview = el => {
  el.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:12px"><div><div class="eyebrow">Interview room</div><h1 style="margin-top:4px">Practise the real interview</h1></div><a class="btn ghost sm" href="#">All cases</a></div><div id="ir"></div>`;
  MDS.talkList(MDS.$("#ir", el), MDS.content.interviews, ["global", "interview"], "Mock interviews",
    "A Portfolio Manager round and an HR round for a Business Transformation Leader at a buy-and-hold vertical software group. The interviewer follows up on vague answers. Use real examples and numbers, and practise out loud.");
};
