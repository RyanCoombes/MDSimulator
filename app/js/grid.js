/* Data explorer: search, sort by any column, filter by a value, and group with counts and totals.
   MDS.grid(el, head, rows) where head is an array of labels and rows an array of arrays. It never changes the data. */
MDS.grid = (el, head, rows, opts = {}) => {
  const num = v => { const s = String(v == null ? "" : v).replace(/[£€$,\s%]/g, ""); return s !== "" && isFinite(+s) ? +s : NaN; };
  const data = rows.map(r => head.map((_, i) => r[i] == null ? "" : r[i]));
  const isNum = head.map((_, i) => { const v = data.map(r => r[i]).filter(x => String(x).trim() !== ""); return v.length > 0 && v.filter(x => isFinite(num(x))).length / v.length >= 0.8; });
  const distinct = i => [...new Set(data.map(r => String(r[i])))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const S = { q: "", sort: -1, dir: 1, fc: -1, fv: "", g: -1 }, id = "g" + Math.floor(Math.random() * 1e6);
  const sel = "font:inherit;font-size:13px;padding:5px 7px;border:1px solid var(--line);border-radius:7px;background:var(--panel);color:var(--ink);max-width:100%";
  const fmt = v => Math.abs(v) >= 100 ? Math.round(v).toLocaleString("en-GB") : (+v.toFixed(2)).toLocaleString("en-GB");
  const view = () => {
    let out = data;
    if (S.q) { const q = S.q.toLowerCase(); out = out.filter(r => r.some(c => String(c).toLowerCase().includes(q))); }
    if (S.fc >= 0 && S.fv !== "") out = out.filter(r => String(r[S.fc]) === S.fv);
    if (S.sort >= 0) { const i = S.sort, n = isNum[i]; out = out.slice().sort((a, b) => (n ? (num(a[i]) || 0) - (num(b[i]) || 0) : String(a[i]).localeCompare(String(b[i]), undefined, { numeric: true, sensitivity: "base" })) * S.dir); }
    return out;
  };
  const body = () => {
    const out = view(), box = el.querySelector(".gbody");
    el.querySelector(".gcount").textContent = `${out.length} of ${data.length} rows`;
    if (S.g >= 0) {
      const m = new Map(); out.forEach(r => { const k = String(r[S.g]); if (!m.has(k)) m.set(k, []); m.get(k).push(r); });
      const nc = head.map((_, i) => i).filter(i => isNum[i] && i !== S.g), groups = [...m].sort((a, b) => b[1].length - a[1].length);
      box.innerHTML = `<table><thead><tr><th style="text-align:left">${MDS.esc(head[S.g])}</th><th>Rows</th>${nc.map(i => `<th>Sum of ${MDS.esc(head[i])}</th>`).join("")}</tr></thead><tbody>${groups.map(([k, rs]) => `<tr><td style="text-align:left">${MDS.esc(k) || "<span class='faint'>(blank)</span>"}</td><td>${rs.length}</td>${nc.map(i => `<td>${fmt(rs.reduce((a, r) => a + (num(r[i]) || 0), 0))}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
      return;
    }
    const sums = head.map((_, i) => isNum[i] ? out.reduce((a, r) => a + (num(r[i]) || 0), 0) : null);
    box.innerHTML = `<table><thead><tr>${head.map((h, i) => `<th style="text-align:${isNum[i] ? "right" : "left"};cursor:pointer;white-space:nowrap" data-sort="${i}" aria-sort="${S.sort === i ? (S.dir > 0 ? "ascending" : "descending") : "none"}" title="Sort by ${MDS.esc(h)}">${MDS.esc(h)} <span class="faint">${S.sort === i ? (S.dir > 0 ? "↑" : "↓") : "↕"}</span></th>`).join("")}</tr></thead>
      <tbody>${out.slice(0, 500).map(r => `<tr>${r.map((c, i) => `<td style="text-align:${isNum[i] ? "right" : "left"};white-space:nowrap">${MDS.esc(c)}</td>`).join("")}</tr>`).join("") || `<tr><td colspan="${head.length}" style="text-align:left" class="faint">No rows match.</td></tr>`}</tbody>
      ${out.length ? `<tfoot><tr>${head.map((_, i) => `<td style="text-align:${isNum[i] ? "right" : "left"};font-weight:600;border-top:1px solid var(--ink);white-space:nowrap">${i === 0 && sums[0] == null ? `Total of ${out.length} shown` : sums[i] != null ? fmt(sums[i]) : ""}</td>`).join("")}</tr></tfoot>` : ""}</table>${out.length > 500 ? `<p class="small faint">Showing the first 500 rows. Filter to narrow it down.</p>` : ""}`;
  };
  el.innerHTML = `<div class="gridbar"><input type="search" class="gq" placeholder="Search these rows" aria-label="Search rows" style="${sel};flex:1;min-width:140px">
      <select class="gfc" aria-label="Filter by column" style="${sel}"><option value="-1">Filter by…</option>${head.map((h, i) => distinct(i).length <= 40 ? `<option value="${i}">${MDS.esc(h)}</option>` : "").join("")}</select>
      <select class="gfv" aria-label="Filter value" style="${sel}" hidden></select>
      <select class="gg" aria-label="Group by" style="${sel}"><option value="-1">Group by…</option>${head.map((h, i) => distinct(i).length <= 60 ? `<option value="${i}">${MDS.esc(h)}</option>` : "").join("")}</select>
      <button type="button" class="btn ghost sm gclr">Clear</button><span class="small faint gcount" aria-live="polite"></span></div>
    <div class="gbody tblwrap" style="max-height:${opts.height || 340}px;overflow:auto;margin-top:8px"></div>`;
  const $ = s => el.querySelector(s);
  $(".gq").oninput = e => { S.q = e.target.value; body(); };
  $(".gfc").onchange = e => { S.fc = +e.target.value; S.fv = ""; const v = $(".gfv"); v.hidden = S.fc < 0; if (S.fc >= 0) v.innerHTML = `<option value="">Any value</option>` + distinct(S.fc).map(x => `<option value="${MDS.esc(x)}">${MDS.esc(x) || "(blank)"}</option>`).join(""); body(); };
  $(".gfv").onchange = e => { S.fv = e.target.value; body(); };
  $(".gg").onchange = e => { S.g = +e.target.value; body(); };
  $(".gclr").onclick = () => { Object.assign(S, { q: "", sort: -1, dir: 1, fc: -1, fv: "", g: -1 }); $(".gq").value = ""; $(".gfc").value = "-1"; $(".gfv").hidden = true; $(".gg").value = "-1"; body(); };
  $(".gbody").onclick = e => { const th = e.target.closest("[data-sort]"); if (!th) return; const i = +th.dataset.sort; if (S.sort === i) S.dir = -S.dir; else { S.sort = i; S.dir = 1; } body(); };
  void id; body();
};
