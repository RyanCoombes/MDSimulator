#!/usr/bin/env node
/* Content quality check: flags multiple-choice items where the best answer is guessable by length.
   Usage: node tools/check_content.js [--strict]   (exit 1 in --strict mode if any group fails) */
const fs = require("fs"), vm = require("vm"), path = require("path");
const A = path.join(__dirname, "..", "app") + "/";
const ctx = { localStorage: { getItem: () => null, setItem: () => {} }, console, Math, JSON };
ctx.window = ctx; vm.createContext(ctx);
const files = ["js/core.js", "js/engine.js", "scenarios/harbour.js", "scenarios/nordline.js", "scenarios/quill.js", "scenarios/data-configs.js", "scenarios/task-configs.js", "scenarios/inspired.js", "scenarios/days.js", "content/frameworks.js", "content/cases.js"];
for (const f of files) vm.runInContext(fs.readFileSync(A + f, "utf8"), ctx);
const M = ctx.MDS;
const groups = {};
const add = (group, label, opts, bestIdx) => {
  const lens = opts.map(o => o.length), best = lens[bestIdx], max = Math.max(...lens);
  const longest = best === max, ratio = best / (lens.filter((_, i) => i !== bestIdx).reduce((a, b) => a + b, 0) / (lens.length - 1));
  (groups[group] = groups[group] || []).push({ label, longest, ratio });
};
for (const id of M.order) {
  const sc = M.scenarios[id];
  sc.events.forEach(e => { const b = e.options.findIndex(o => o.s === 3); add("challenges", `${id}: ${e.title}`, e.options.map(o => o.t), b); });
  (sc.days || []).forEach(d => d.items.forEach(it => {
    const sets = it.steps ? it.steps.map(s => s.options) : [it.options];
    sets.forEach((os, k) => { if (os.length < 2) return; const mx = Math.max(...os.map(o => o.s)); const b = os.findIndex(o => o.s === mx); add("day", `${id}: ${it.subject || it.title}${it.steps ? " #" + (k + 1) : ""}`, os.map(o => o.t), b); });
  }));
}
M.content.frameworks.forEach(q => add("frameworks", q.q.slice(0, 60), q.o, q.a));
M.content.cases.forEach(c => add("library", c.id, c.decision.o, c.decision.a));
let fail = false;
for (const [g, items] of Object.entries(groups)) {
  const share = items.filter(x => x.longest).length / items.length, avgRatio = items.reduce((a, x) => a + x.ratio, 0) / items.length;
  const ok = share <= 0.45 && avgRatio <= 1.3;
  if (!ok) fail = true;
  console.log(`${ok ? "PASS" : "FAIL"}  ${g.padEnd(11)} best is longest in ${items.filter(x => x.longest).length}/${items.length} (${Math.round(share * 100)}%, target ≤45%) · best/other length ratio ${avgRatio.toFixed(2)} (target ≤1.30)`);
  if (process.argv.includes("--list")) items.filter(x => x.longest && x.ratio > 1.15).forEach(x => console.log(`      longest: ${x.label} (ratio ${x.ratio.toFixed(2)})`));
}
if (process.argv.includes("--strict") && fail) process.exit(1);
