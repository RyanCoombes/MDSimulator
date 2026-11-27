/* AI layer. One `sample(input, opts)` interface, three possible providers, tried in order:
   1. Claude in the claude.ai viewer (window.claude) — no key needed.
   2. This app's own server (server.py) with an Anthropic API key held server-side.
   3. Off — AI features hide themselves.
   Speech: claude.ai dictation/tts when available, else the browser's own speech APIs. */
MDS.settings = (() => { try { return JSON.parse(localStorage.getItem("mdsim.settings") || "{}"); } catch (e) { return {}; } })();
/* Theme: "light" (default), "dark", or "auto" to follow the device. */
MDS.applyTheme = () => { const t = MDS.settings.theme || "light", el = document.documentElement; if (t === "auto") el.removeAttribute("data-theme"); else el.setAttribute("data-theme", t);
  const b = document.getElementById("themeBtn"); if (b) b.textContent = t === "dark" ? "Dark" : t === "auto" ? "Auto" : "Light"; };
MDS.setTheme = t => { MDS.settings.theme = t; MDS.saveSettings(); MDS.applyTheme(); };
document.addEventListener("DOMContentLoaded", () => MDS.applyTheme());
document.addEventListener("click", e => { if (e.target.closest("#themeBtn")) MDS.setTheme({ light: "dark", dark: "auto", auto: "light" }[MDS.settings.theme || "light"]); });
MDS.saveSettings = () => { try { localStorage.setItem("mdsim.settings", JSON.stringify(MDS.settings)); } catch (e) {} };

MDS.ai = (() => {
  const use = name => (window.claude && typeof window.claude.use === "function" ? window.claude.use(name).catch(() => null) : Promise.resolve(null));
  const ERR = {
    not_granted: "AI isn't allowed here. Check the passcode in Settings, or allow Claude for this page.",
    sampling_disabled: "AI isn't available: the server has no working API key.",
    rate_limited: "AI usage limit reached. Try again later.",
    session_expired: "Please sign in to Claude again.",
    refused: "Claude declined that one. Try rephrasing.",
    upstream_error: "Connection hiccup. Try again.",
    invalid_json: "The assessment came back garbled. Try again.",
    prompt_too_large: "That was too long for the AI.",
    cancelled: ""
  };
  const parseJSON = text => {
    try { return JSON.parse(text); } catch (e) {}
    const f = text.match(/```(?:json)?\s*([\s\S]*?)```/); if (f) { try { return JSON.parse(f[1]); } catch (e) {} }
    const a = text.search(/[\[{]/), b = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
    if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch (e) {} }
    throw { code: "invalid_json", message: "No JSON in reply", text };
  };

  /* Provider 2: the self-hosted server. */
  const serverSample = () => {
    const fn = async (input, opts = {}) => {
      let res;
      try {
        res = await fetch("api/ai/sample", { method: "POST", signal: opts.signal, headers: { "Content-Type": "application/json", "X-MDSim-Passcode": MDS.settings.passcode || "" }, body: JSON.stringify({ input, modelTier: opts.modelTier || "default" }) });
      } catch (e) { throw { code: e && e.name === "AbortError" ? "cancelled" : "upstream_error", message: String(e) }; }
      if (!res.ok) { let j = {}; try { j = await res.json(); } catch (e) {} throw { code: j.error || "upstream_error", message: j.message || res.statusText }; }
      const reader = res.body.getReader(), dec = new TextDecoder();
      let buf = "", text = "", done = null;
      try {
        for (;;) {
          const { value, done: end } = await reader.read();
          if (end) break;
          buf += dec.decode(value, { stream: true });
          let nl;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
            if (!line) continue;
            const ev = JSON.parse(line);
            if (ev.delta) { text += ev.delta; if (opts.onText) { try { opts.onText({ text, delta: ev.delta }); } catch (e) {} } }
            else if (ev.error) throw { code: ev.error, message: ev.message, text: ev.error === "refused" ? undefined : text };
            else if (ev.done) done = ev;
          }
        }
      } catch (e) { if (e && e.code) throw e; throw { code: opts.signal && opts.signal.aborted ? "cancelled" : "upstream_error", message: String(e), text }; }
      if (!done) throw { code: "upstream_error", message: "The answer was cut off.", text };
      if (!text.trim()) throw { code: "empty_completion", message: "No text" };
      return { text, truncated: !!(done && done.truncated), modelTierApplied: opts.modelTier || "default" };
    };
    fn.json = async (input, opts = {}) => parseJSON((await fn(input, opts)).text);
    return fn;
  };

  let provider = null; // { kind, sample, note }
  const resolve = async () => {
    if (MDS.settings.ai === "off") return { kind: "off", sample: null, note: "AI features are switched off in Settings." };
    const viewer = await use("sample");
    if (viewer) return { kind: "claude", sample: viewer, note: "Using Claude through claude.ai." };
    try {
      if (location.protocol === "file:") throw 0;
      const r = await fetch("api/ai/status", { headers: { "X-MDSim-Passcode": MDS.settings.passcode || "" }, cache: "no-store" });
      if (r.ok) {
        const s = await r.json();
        if (s.available && s.authorised) return { kind: "server", sample: serverSample(), note: `Using this server's AI (${s.model}).`, status: s };
        if (s.available && !s.authorised) return { kind: "locked", sample: null, note: "This server's AI needs a passcode. Add it in Settings.", status: s };
        return { kind: "none", sample: null, note: `AI is off on this server: ${s.reason || "no API key configured"}`, status: s };
      }
    } catch (e) {}
    return { kind: "none", sample: null, note: "AI features need claude.ai, or the included server.py with an Anthropic API key." };
  };
  let pending = null;
  const get = () => (provider ? Promise.resolve(provider) : (pending = pending || resolve().then(p => { provider = p; pending = null; return p; })));
  let off = false;

  /* Speech fallbacks using the browser's own APIs. */
  const browserTTS = () => {
    if (!("speechSynthesis" in window)) return null;
    const voiceFor = v => { const vs = speechSynthesis.getVoices().filter(x => /en[-_]GB/i.test(x.lang)); return vs.length ? vs[["buttery", "airy", "glassy", "rounded"].indexOf(v) % vs.length] || vs[0] : null; };
    return { speak: (text, o = {}) => new Promise(res => { const u = new SpeechSynthesisUtterance(text); const v = voiceFor(o.voice); if (v) u.voice = v; u.lang = "en-GB"; u.onend = res; u.onerror = res; speechSynthesis.cancel(); speechSynthesis.speak(u); }), stop: async () => speechSynthesis.cancel(), onState: () => () => {} };
  };
  const browserDictation = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return null;
    let rec = null; const h = { p: new Set(), f: new Set(), s: new Set() };
    const emit = (set, x) => set.forEach(fn => { try { fn(x); } catch (e) {} });
    const sub = set => fn => { set.add(fn); return () => set.delete(fn); };
    return {
      start: async () => { rec = new SR(); rec.lang = "en-GB"; rec.continuous = true; rec.interimResults = true;
        rec.onresult = e => { let interim = ""; for (let i = e.resultIndex; i < e.results.length; i++) { const t = e.results[i][0].transcript; if (e.results[i].isFinal) emit(h.f, { text: t.trim() }); else interim += t; } if (interim) emit(h.p, { text: interim.trim() }); };
        rec.onend = () => emit(h.s, { state: "idle", reason: "stopped" }); rec.onerror = () => emit(h.s, { state: "idle", reason: "error" });
        rec.start(); emit(h.s, { state: "listening" }); },
      stop: async () => { if (rec) rec.stop(); }, onPartial: sub(h.p), onFinal: sub(h.f), onState: sub(h.s)
    };
  };

  return {
    get,
    reset: () => { provider = null; off = false; },
    get sample() { return get().then(p => p.sample); },
    dictation: use("dictation").then(d => d || browserDictation()),
    tts: use("tts").then(t => t || browserTTS()),
    available: async () => !off && !!(await get()).sample,
    note: async () => (await get()).note,
    msg: e => (e && ERR[e.code] != null ? ERR[e.code] : (e && e.message) || "Something went wrong talking to the AI. Try again."),
    disable: e => { if (e && ["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(e.code)) off = true; },
    get unavailableNote() { return provider ? provider.note : "AI features need claude.ai, or the included server.py with an Anthropic API key."; }
  };
})();

/* Settings modal (topbar gear). */
MDS.openSettings = async () => {
  const p = await MDS.ai.get();
  const m = document.createElement("div"); m.className = "modal";
  m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="setT"><div class="eyebrow">Settings</div><h2 style="margin:6px 0 8px;font-size:18px">Appearance</h2>
    <div class="seg" role="group" aria-label="Theme" style="margin:0 0 16px">${[["light", "Light"], ["dark", "Dark"], ["auto", "Match my device"]].map(([v, l]) => `<button type="button" data-theme-pick="${v}" aria-pressed="${(MDS.settings.theme || "light") === v}">${l}</button>`).join("")}</div>
    <h2 id="setT" style="margin:6px 0 10px;font-size:18px">AI features</h2>
    <p class="small dim">Conversations, the Interview room and write-your-own replies use AI. Everything else works without it.</p>
    <div class="seg" role="group" aria-label="AI features" style="margin:6px 0 12px"><button type="button" data-ai="auto" aria-pressed="${MDS.settings.ai !== "off"}">On</button><button type="button" data-ai="off" aria-pressed="${MDS.settings.ai === "off"}">Off</button></div>
    <div class="fb ${p.sample ? "good" : "mid"}" id="setStatus">${MDS.esc(p.note)}</div>
    <div style="margin-top:12px" id="passRow" ${p.status && p.status.passcode ? "" : "hidden"}><label class="small" for="pass">Server passcode</label>
      <div class="row" style="margin-top:4px"><input id="pass" type="password" value="${MDS.esc(MDS.settings.passcode || "")}" autocomplete="off" style="font:inherit;padding:7px 9px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink)"><button class="btn sm" id="passSave" type="button">Save</button></div></div>
    <details style="margin-top:14px"><summary class="small" style="cursor:pointer;color:var(--acc)">Self-hosting: how to turn AI on</summary>
      <ol class="small dim"><li>On the server: <code>pip install anthropic</code></li><li>Set <code>ANTHROPIC_API_KEY</code> and a <code>MDSIM_PASSCODE</code></li><li>Run <code>python3 server.py --port 8080</code></li><li>Enter the passcode here.</li></ol>
      <p class="small dim">Your API key stays on the server. Usage is billed to your Anthropic account, and the server caps requests per day (MDSIM_DAILY_LIMIT).</p></details>
    <h2 style="margin:18px 0 6px;font-size:18px">Progress</h2><p class="small dim">Tasks with fixed answers count your first attempt; later runs are practice. Reset to start fresh (this browser only).</p>
    <button class="btn ghost sm" id="resetAll" type="button">Reset all progress</button>
    <div class="row" style="margin-top:16px;justify-content:flex-end"><button class="btn" id="setClose" type="button">Done</button></div></div>`;
  document.body.appendChild(m); requestAnimationFrame(() => m.classList.add("on"));
  const refresh = async () => { MDS.ai.reset(); const q = await MDS.ai.get(); const st = m.querySelector("#setStatus"); st.textContent = q.note; st.className = "fb " + (q.sample ? "good" : "mid"); m.querySelector("#passRow").hidden = !(q.status && q.status.passcode); };
  m.querySelectorAll("[data-theme-pick]").forEach(x => x.onclick = () => { MDS.setTheme(x.dataset.themePick); m.querySelectorAll("[data-theme-pick]").forEach(y => y.setAttribute("aria-pressed", y === x)); });
  m.querySelectorAll("[data-ai]").forEach(b => b.onclick = () => { MDS.settings.ai = b.dataset.ai; MDS.saveSettings(); m.querySelectorAll("[data-ai]").forEach(x => x.setAttribute("aria-pressed", x === b)); refresh(); });
  m.querySelector("#passSave").onclick = () => { MDS.settings.passcode = m.querySelector("#pass").value; MDS.saveSettings(); refresh(); };
  m.querySelector("#resetAll").onclick = e => { const b = e.target; if (b.dataset.c !== "1") { b.dataset.c = "1"; b.textContent = "Click again to erase all scores and work"; return; } MDS.resetProgress(); b.textContent = "Progress reset"; };
  const close = () => { m.remove(); MDS.route(); };
  m.querySelector("#setClose").onclick = close;
  m.addEventListener("click", e => { if (e.target === m) close(); });
};

/* Mic button wiring shared by conversations and write-your-own replies. */
MDS.micButton = async (btn, textarea, onState) => {
  const d = await MDS.ai.dictation;
  if (!d) { btn.hidden = true; return; }
  btn.hidden = false;
  let base = "", live = false;
  (MDS._micUnsub || []).forEach(u => { try { u(); } catch (e) {} });
  MDS._micUnsub = [];
  const keep = u => MDS._micUnsub.push(u);
  keep(d.onPartial(({ text }) => { if (live) textarea.value = (base + " " + text).trim(); }));
  keep(d.onFinal(({ text }) => { if (live) { base = (base + " " + text).trim(); textarea.value = base; } }));
  keep(d.onState(({ state }) => { live = state === "listening"; btn.setAttribute("aria-pressed", live); btn.textContent = live ? "■ Stop" : "🎙 Speak"; onState && onState(live); }));
  btn.onclick = () => {
    if (live) { d.stop().catch(() => {}); return; }
    base = textarea.value.trim();
    d.start().catch(e => { if (e && e.code === "not_granted") btn.hidden = true; });
  };
};
