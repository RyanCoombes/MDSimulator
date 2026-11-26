/* Core helpers, storage and registry. Classic script: everything hangs off window.MDS. */
window.MDS = { scenarios: {}, order: [], tests: {}, content: {} };

MDS.$ = (s, el) => (el || document).querySelector(s);
MDS.$$ = (s, el) => [...(el || document).querySelectorAll(s)];
MDS.esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
MDS.k = x => (x < -0.5 ? "−" : "") + "£" + Math.abs(Math.round(x)).toLocaleString("en-GB") + "k";
MDS.pc = (x, d = 1) => (x * 100).toFixed(d) + "%";
MDS.clamp = (x, a, b) => Math.max(a, Math.min(b, x));

MDS.registerScenario = sc => { MDS.scenarios[sc.id] = sc; MDS.order.push(sc.id); };

/* Seeded random so a drill attempt is reproducible. */
MDS.rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
MDS.shuffle = (arr, r) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* Persistence: per-viewer only, and the app works without it. */
const STORE_KEY = "mdsim.v2";
MDS.state = (() => { try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {}; } catch (e) { return {}; } })();
MDS.state.scores = MDS.state.scores || {};
MDS.state.lab = MDS.state.lab || {};
MDS.save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(MDS.state)); } catch (e) {} };
MDS.setScore = (key, test, score) => {
  const s = MDS.state.scores[key] = MDS.state.scores[key] || {};
  s[test] = Math.max(s[test] || 0, Math.round(score));
  s[test + "_last"] = Math.round(score);
  MDS.save();
};
MDS.getScore = (key, test) => (MDS.state.scores[key] || {})[test];

MDS.grade = s => s >= 85 ? ["Hire", "pos"] : s >= 70 ? ["Strong", "pos"] : s >= 55 ? ["Borderline", ""] : ["Not yet", "neg"];

MDS.meterColour = v => v >= 60 ? "var(--good)" : v >= 45 ? "var(--warn)" : "var(--bad)";
MDS.meterHTML = (name, v) => `<div class="meter"><div style="display:flex;justify-content:space-between" class="small"><span>${name}</span><span class="num">${Math.round(v)}</span></div><div class="bar"><i style="width:${MDS.clamp(v, 0, 100)}%;background:${MDS.meterColour(v)}"></i></div></div>`;
