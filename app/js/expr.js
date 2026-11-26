/* A small, safe formula language (no eval).
   Numbers (5, 2.5, 12%), names, + - * / ^, comparisons, parentheses and functions:
   prev(x) min() max() sum() avg() if(c,a,b) round(x,n) abs(x) pow(a,b) and() or() not().
   `t` is the year index (0 = last actual year). */
MDS.expr = (() => {
  const FN = {
    min: a => Math.min(...a), max: a => Math.max(...a), sum: a => a.reduce((x, y) => x + y, 0),
    avg: a => a.reduce((x, y) => x + y, 0) / a.length, abs: a => Math.abs(a[0]), pow: a => Math.pow(a[0], a[1]),
    round: a => { const n = a[1] || 0, f = Math.pow(10, n); return Math.round(a[0] * f) / f; },
    and: a => a.every(Boolean) ? 1 : 0, or: a => a.some(Boolean) ? 1 : 0, not: a => a[0] ? 0 : 1
  };
  function tokenize(s) {
    const out = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++;
        let v = parseFloat(s.slice(i, j)); if (isNaN(v)) throw Error("Bad number");
        if (s[j] === "%") { v /= 100; j++; }
        out.push({ k: "num", v }); i = j; continue;
      }
      if (/[A-Za-z_]/.test(c)) { let j = i; while (j < s.length && /[A-Za-z0-9_]/.test(s[j])) j++; out.push({ k: "id", v: s.slice(i, j) }); i = j; continue; }
      const two = s.slice(i, i + 2);
      if (["<=", ">=", "==", "!="].includes(two)) { out.push({ k: "op", v: two }); i += 2; continue; }
      if ("+-*/^(),<>".includes(c)) { out.push({ k: "op", v: c }); i++; continue; }
      throw Error(`Unexpected "${c}"`);
    }
    return out;
  }
  function parse(src) {
    const s = String(src).trim().replace(/^=/, "");
    if (s === "") return { k: "num", v: 0 };
    const tk = tokenize(s); let p = 0;
    const peek = () => tk[p], eat = v => { const t = tk[p]; if (!t || (v && t.v !== v)) throw Error(v ? `Expected "${v}"` : "Unexpected end"); p++; return t; };
    const PREC = { "<": 1, ">": 1, "<=": 1, ">=": 1, "==": 1, "!=": 1, "+": 2, "-": 2, "*": 3, "/": 3, "^": 4 };
    function primary() {
      const t = peek(); if (!t) throw Error("Unexpected end");
      if (t.k === "num") { p++; return t; }
      if (t.v === "-") { p++; return { k: "neg", a: unary() }; }
      if (t.v === "+") { p++; return unary(); }
      if (t.v === "(") { p++; const e = expr(0); eat(")"); return e; }
      if (t.k === "id") {
        p++;
        if (peek() && peek().v === "(") {
          p++; const args = [];
          if (peek() && peek().v !== ")") { do { args.push(expr(0)); } while (peek() && peek().v === "," && eat(",")); }
          eat(")");
          const name = t.v.toLowerCase();
          if (name !== "prev" && name !== "if" && !FN[name]) throw Error(`Unknown function ${t.v}()`);
          if (name === "prev" && (args.length !== 1 || args[0].k !== "id")) throw Error("prev() takes one row name");
          if (name === "if" && args.length !== 3) throw Error("if() takes 3 arguments");
          return { k: "call", f: name, args };
        }
        return { k: "id", v: t.v };
      }
      throw Error(`Unexpected "${t.v}"`);
    }
    function unary() { return primary(); }
    function expr(minP) {
      let left = unary();
      for (;;) {
        const t = peek();
        if (!t || t.k !== "op" || PREC[t.v] === undefined || PREC[t.v] < minP) break;
        p++;
        const pr = PREC[t.v];
        const right = expr(t.v === "^" ? pr : pr + 1);
        left = { k: "bin", op: t.v, a: left, b: right };
      }
      return left;
    }
    const e = expr(0);
    if (p < tk.length) throw Error(`Unexpected "${tk[p].v}"`);
    return e;
  }
  function evaluate(n, ctx) {
    switch (n.k) {
      case "num": return n.v;
      case "neg": return -evaluate(n.a, ctx);
      case "id": return ctx.get(n.v);
      case "call":
        if (n.f === "prev") return ctx.prev(n.args[0].v);
        if (n.f === "if") return evaluate(n.args[0], ctx) ? evaluate(n.args[1], ctx) : evaluate(n.args[2], ctx);
        return FN[n.f](n.args.map(a => evaluate(a, ctx)));
      case "bin": {
        const a = evaluate(n.a, ctx), b = evaluate(n.b, ctx);
        switch (n.op) {
          case "+": return a + b; case "-": return a - b; case "*": return a * b;
          case "/": if (b === 0) throw Error("Division by zero"); return a / b;
          case "^": return Math.pow(a, b);
          case "<": return a < b ? 1 : 0; case ">": return a > b ? 1 : 0; case "<=": return a <= b ? 1 : 0;
          case ">=": return a >= b ? 1 : 0; case "==": return a === b ? 1 : 0; case "!=": return a !== b ? 1 : 0;
        }
      }
    }
    throw Error("Bad expression");
  }
  const cache = new Map();
  const compile = src => { const key = String(src); if (!cache.has(key)) { try { cache.set(key, { ast: parse(key) }); } catch (e) { cache.set(key, { err: e.message }); } } return cache.get(key); };
  const ids = (n, out = new Set()) => { if (!n) return out; if (n.k === "id") out.add(n.v); if (n.a) ids(n.a, out); if (n.b) ids(n.b, out); (n.args || []).forEach(x => ids(x, out)); return out; };
  return { parse, evaluate, compile, ids, isNumber: s => /^\s*-?[0-9.]+%?\s*$/.test(String(s)) };
})();
