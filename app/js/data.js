/* Data room generator. Builds raw datasets for a scenario that reconcile to its P&L,
   with root causes planted for the candidate to find. Deterministic per scenario. */
MDS.FIRST = ["Alex", "Sam", "Jo", "Chris", "Priya", "Tom", "Leah", "Ben", "Nadia", "Owen", "Grace", "Raj", "Ella", "Dan", "Maya", "Luke", "Zoe", "Amir", "Kate", "Ryan", "Hana", "Josh", "Ruth", "Ivan", "Ines", "Marco", "Sara", "Erik", "Lina", "Pablo", "Anna", "Jonas"];
MDS.LAST = ["Shaw", "Patel", "Evans", "Clarke", "Hughes", "Khan", "Ward", "Price", "Bell", "Reid", "Fox", "Lowe", "Walsh", "Hart", "Ross", "Dunn", "Kerr", "Lane", "Moss", "Pope", "Berg", "Lund", "García", "Ruiz", "Moreno", "Vidal", "Holm", "Ek", "Sousa", "Byrne"];
MDS.MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

MDS.data = sc => {
  if (sc._data) return sc._data;
  const D = sc.data, B = sc.base, r = MDS.rng(D.seed);
  const g = () => (r() + r() + r() + r() - 2) / 0.577;
  const pick = arr => arr[Math.floor(r() * arr.length)];
  const wpick = (arr, key = "w") => { const t = arr.reduce((a, x) => a + x[key], 0); let u = r() * t; for (const x of arr) { u -= x[key]; if (u <= 0) return x; } return arr[arr.length - 1]; };
  const cl = (x, a, b) => Math.max(a, Math.min(b, x));
  const r1 = x => Math.round(x * 10) / 10;
  const people = new Set();
  const person = () => { let n, k = 0; do { n = `${pick(MDS.FIRST)} ${pick(MDS.LAST)}`; } while (people.has(n) && ++k < 50); people.add(n); return n; };

  /* ---------- customers ---------- */
  const used = new Set();
  const cust = [];
  for (let i = 0; i < B.customers; i++) {
    let name; do { name = D.custName(r); } while (used.has(name)); used.add(name);
    const seg = wpick(D.segments, "p");
    const legacy = r() < B.legacyShare;
    const rep = legacy ? "Legacy (pre-2019)" : wpick(D.reps, "share");
    const disc = legacy ? cl(B.legacyGap + g() * 0.04, 0.12, 0.45) : cl(rep.disc + g() * rep.sd, 0, 0.5);
    const list = seg.w * (0.8 + 0.4 * r());
    const start = legacy ? 2010 + Math.floor(r() * 9) : 2019 + Math.floor(r() * 8);
    const onA = r() < D.onboard.pA;
    const base = seg.w * (0.6 + 0.8 * r());
    cust.push({ name, segment: seg.name, region: pick(D.regions), rep: legacy ? rep : rep.name, list, arr: list * (1 - disc), legacy: legacy ? "Yes" : "No",
      since: Math.min(start, 2026), last_rise: legacy ? (r() < 0.4 ? 2016 : 2019) : Math.max(2022, Math.min(start, 2026)),
      renewal: r() < D.peakShare ? D.peakMonth : 1 + Math.floor(r() * 12), onboarding: onA ? D.onboard.a : D.onboard.b,
      howto: base * (onA ? D.onboard.mult : 1) * (0.6 + 0.8 * r()), other: base * (0.6 + 0.8 * r()), nps: Math.round(cl(28 - (onA ? 16 : 0) + g() * 18, -80, 90)) });
  }
  // reconcile: legacy share of ARR, top-3 concentration, total recurring
  const sum = (a, f) => a.reduce((x, y) => x + f(y), 0);
  const scaleGroup = (grp, rest, share, total) => { const a = share * total / sum(grp, c => c.arr), b = (1 - share) * total / sum(rest, c => c.arr); grp.forEach(c => { c.arr *= a; c.list *= a; }); rest.forEach(c => { c.arr *= b; c.list *= b; }); };
  for (let it = 0; it < 6; it++) {
    const byArr = cust.slice().sort((a, b) => b.arr - a.arr);
    scaleGroup(byArr.slice(0, 3), byArr.slice(3), D.top3, B.recurring);
    scaleGroup(cust.filter(c => c.legacy === "Yes"), cust.filter(c => c.legacy === "No"), B.legacyShare, B.recurring);
  }
  const T = D.tickets, hT = sum(cust, c => c.howto), oT = sum(cust, c => c.other);
  cust.forEach((c, i) => {
    c.id = "C" + String(i + 1).padStart(3, "0");
    c.howto = Math.round(c.howto * T * B.support.howto / hT); c.other = Math.round(c.other * T * (1 - B.support.howto) / oT);
    c.tickets = c.howto + c.other; c.discount = 1 - c.arr / c.list; c.arr = r1(c.arr); c.list = r1(c.list);
    c.renewal = MDS.MONTHS[c.renewal - 1];
    c.risk = c.nps < 0 && c.tickets > T / B.customers * 1.3 ? "High" : c.nps < 15 ? "Medium" : "Low";
  });

  /* ---------- churned last year ---------- */
  const churned = [];
  const lost = B.churn * B.recurring;
  const W = D.churnReasons.reduce((a, x) => a + x.w, 0);
  const reasonList = D.churnReasons.flatMap(x => Array(Math.max(1, Math.round(x.w / W * D.churnedN))).fill(x));
  for (let i = 0; i < reasonList.length; i++) {
    const reason = reasonList[i];
    let cn; do { cn = D.custName(r); } while (used.has(cn)); used.add(cn);
    churned.push({ name: cn, segment: r() < 0.7 ? "Small" : "Medium", arr_lost: 0.8 + 0.4 * r(), reason: reason.r,
      onboarding: r() < reason.pA ? D.onboard.a : D.onboard.b, years: 1 + Math.floor(r() * 9), month: pick(MDS.MONTHS), last_contact_days: Math.round(reason.contact * (0.6 + 0.8 * r())) });
  }
  const cs = lost / sum(churned, c => c.arr_lost); churned.forEach(c => { c.arr_lost = r1(c.arr_lost * cs); });

  /* ---------- PS projects ---------- */
  const consultants = [];
  const psKey = (D.keyPeople || []).filter(k => k.dept === "Professional services");
  for (let i = 0; i < B.ps.fte; i++) consultants.push({ name: psKey[i] ? psKey[i].name : person(), grade: i < D.seniorLow ? "Senior" : i < D.seniorLow + 3 ? "Principal" : "Consultant" });
  const projects = [];
  for (let i = 0; i < D.projectsN; i++) {
    const ty = wpick(D.projectTypes);
    const scoped = ty.pricing === "Fixed" ? (r() < D.salesScoped ? "Sales" : "PS") : "PS";
    const over = ty.pricing === "Fixed" ? (scoped === "Sales" ? cl(D.overSales + g() * 0.15, 0.05, 1.2) : cl(D.overPS + g() * 0.07, -0.1, 0.5)) : cl(0.04 + g() * 0.05, -0.1, 0.2);
    const sold = ty.days[0] + r() * (ty.days[1] - ty.days[0]);
    const actual = sold * (1 + over);
    const unbilled = ty.unbilled && r() < ty.unbilled;
    const billed = unbilled ? 0 : ty.pricing === "Fixed" ? sold : actual;
    projects.push({ id: "P" + String(i + 1).padStart(3, "0"), customer: pick(cust).name, type: ty.type, pricing: ty.pricing, scoped_by: scoped, sold, billed, foc: actual - billed, lead: pick(consultants).name, status: r() < 0.8 ? "Complete" : "In progress" });
  }
  const billable0 = B.ps.fte * B.ps.days * B.ps.util * (1 - B.ps.foc);
  const kf = B.ps.foc * sum(projects, p => p.billed) / ((1 - B.ps.foc) * sum(projects, p => p.foc));
  projects.forEach(p => { p.foc *= kf; });
  const ks = billable0 / sum(projects, p => p.billed);
  projects.forEach(p => {
    p.sold = r1(p.sold * ks); p.billed = r1(p.billed * ks); p.foc = r1(p.foc * ks); p.actual = r1(p.billed + p.foc);
    p.overrun = p.sold > 0 ? p.actual / p.sold - 1 : 0; p.value = r1(p.billed * B.ps.rate);
  });

  /* ---------- consultants ---------- */
  const delivered = B.ps.fte * B.ps.days * B.ps.util, focTot = sum(projects, p => p.foc);
  consultants.forEach((c, i) => { c.available = B.ps.days; c.w = i < D.seniorLow ? 0.33 + r() * 0.06 : 0.62 + g() * 0.08; });
  const seniorD = sum(consultants.slice(0, D.seniorLow), c => c.w * c.available);
  const restW = sum(consultants.slice(D.seniorLow), c => c.w * c.available);
  consultants.forEach((c, i) => {
    const d = i < D.seniorLow ? c.w * c.available : c.w * c.available * (delivered - seniorD) / restW;
    c.delivered = Math.round(d); c.foc_days = Math.round(focTot * d / delivered); c.billable = c.delivered - c.foc_days;
    c.presales = i < D.seniorLow ? 45 + Math.round(r() * 25) : Math.round(4 + r() * 8);
    c.internal = Math.max(0, c.available - c.delivered - c.presales);
    c.utilisation = c.delivered / c.available; c.cost = B.ps.cost; delete c.w;
  });

  /* ---------- tickets by month ---------- */
  const tickets = [];
  const totals = { "How-to question": sum(cust, c => c.howto) };
  const otherTot = sum(cust, c => c.other);
  D.ticketMix.forEach(([cat, w]) => { totals[cat] = otherTot * w; });
  MDS.MONTHS.forEach((m, i) => Object.keys(totals).forEach(cat => tickets.push({ month: m, category: cat, tickets: Math.round(totals[cat] / 12 * (1 + 0.15 * Math.sin(i / 2) + g() * 0.06)),
    avg_hours: r1((cat === "How-to question" ? 0.6 : cat.startsWith("Bug") ? 3.2 : 1.4) * (0.85 + 0.3 * r())) })));

  /* ---------- headcount ---------- */
  const heads = [];
  const depts = [["Professional services", B.ps.fte, B.ps.cost], ["Support", B.support.fte, B.support.cost], ["R&D", B.rnd.fte, B.rnd.cost], ["Sales and marketing", D.smFte, D.smCost], ["G&A", D.gaFte, D.gaCost]];
  depts.forEach(([dept, n, cost]) => {
    const key = (D.keyPeople || []).filter(k => k.dept === dept);
    for (let i = 0; i < n; i++) {
      const k = key[i];
      const loaded = cost * (0.8 + 0.4 * r());
      heads.push({ name: k ? k.name : (dept === "Professional services" ? consultants[i].name : person()), dept, role: k ? k.role : D.roles[dept] || "Staff",
        loaded_cost: loaded, tenure_yrs: Math.max(0, Math.round((k ? k.tenure : 1 + r() * 9) * 10) / 10), location: k && k.location ? k.location : pick(D.locations),
        key_person: k ? "Yes" : "No", flight_risk: k ? k.risk : (r() < 0.12 ? "High" : r() < 0.4 ? "Medium" : "Low") });
    }
    const grp = heads.filter(h => h.dept === dept), f = cost * n / sum(grp, h => h.loaded_cost);
    grp.forEach(h => { h.loaded_cost = r1(h.loaded_cost * f); });
  });

  const tables = {
    customers: { label: "Customers", desc: "Every live customer: recurring revenue (ARR), list price, discount, renewal month, onboarding route, tickets, NPS.", rows: cust,
      cols: [["id", "ID", "text"], ["name", "Customer", "text"], ["segment", "Segment", "text"], ["region", "Region", "text"], ["arr", "ARR £k", "num"], ["list", "List price £k", "num"], ["discount", "Discount vs list", "pct"], ["legacy", "Legacy pricing", "text"], ["rep", "Sold by", "text"], ["since", "Customer since", "int"], ["last_rise", "Last price rise", "int"], ["renewal", "Renewal month", "text"], ["onboarding", "Onboarding", "text"], ["howto", "How-to tickets", "int"], ["tickets", "All tickets", "int"], ["nps", "NPS", "int"], ["risk", "Health risk", "text"]] },
    churned: { label: "Churned last year", desc: "Customers lost in the last 12 months, with the reason recorded at exit.", rows: churned,
      cols: [["name", "Customer", "text"], ["segment", "Segment", "text"], ["arr_lost", "ARR lost £k", "num"], ["reason", "Exit reason", "text"], ["onboarding", "Onboarding", "text"], ["years", "Years as customer", "int"], ["month", "Month lost", "text"], ["last_contact_days", "Days since last contact", "int"]] },
    projects: { label: "PS projects", desc: "Last year's professional services projects: days sold, delivered, billed and given away.", rows: projects,
      cols: [["id", "ID", "text"], ["customer", "Customer", "text"], ["type", "Type", "text"], ["pricing", "Pricing", "text"], ["scoped_by", "Scoped by", "text"], ["sold", "Days sold", "num"], ["actual", "Days delivered", "num"], ["billed", "Days billed", "num"], ["foc", "Free days", "num"], ["overrun", "Overrun vs sold", "pct"], ["value", "Billed £k", "num"], ["lead", "Lead consultant", "text"], ["status", "Status", "text"]] },
    consultants: { label: "Consultants", desc: "Time recorded per consultant last year (days).", rows: consultants,
      cols: [["name", "Consultant", "text"], ["grade", "Grade", "text"], ["available", "Available days", "int"], ["delivered", "Delivered days", "int"], ["billable", "Billed days", "int"], ["foc_days", "Free days", "int"], ["presales", "Presales days", "int"], ["internal", "Internal / other", "int"], ["utilisation", "Utilisation", "pct"], ["cost", "Loaded cost £k", "num"]] },
    tickets: { label: "Support tickets", desc: "Tickets by month and category, with average handling time.", rows: tickets,
      cols: [["month", "Month", "text"], ["category", "Category", "text"], ["tickets", "Tickets", "int"], ["avg_hours", "Avg hours to handle", "num"]] },
    suppliers: { label: "Supplier contracts", desc: "Non-payroll spend: hosting, royalties, software, premises, services.", rows: D.suppliers.map(s => ({ ...s })),
      cols: [["supplier", "Supplier", "text"], ["category", "P&L line", "text"], ["annual", "Annual £k", "num"], ["contract_end", "Contract end", "text"], ["auto_renew", "Auto-renews", "text"], ["notice_days", "Notice (days)", "int"], ["uplift", "Renewal uplift", "text"], ["usage", "Usage", "text"], ["owner", "Owner", "text"]] },
    headcount: { label: "Headcount", desc: "Everyone on payroll, fully loaded cost, tenure and retention risk.", rows: heads,
      cols: [["name", "Name", "text"], ["dept", "Department", "text"], ["role", "Role", "text"], ["loaded_cost", "Loaded cost £k", "num"], ["tenure_yrs", "Tenure (yrs)", "num"], ["location", "Location", "text"], ["key_person", "Key person", "text"], ["flight_risk", "Flight risk", "text"]] },
    rnd: { label: "R&D portfolio", desc: "Where engineering time goes, and what customers are asking for.", rows: D.epics.map(e => ({ ...e })),
      cols: [["epic", "Workstream", "text"], ["type", "Type", "text"], ["fte", "FTE", "num"], ["months", "Months running", "int"], ["requests", "Customer requests", "int"], ["contracted", "Contracted revenue £k", "num"], ["status", "Status", "text"]] }
  };
  const y0 = MDS.model(sc, MDS.defaults(sc)).yrs[0];
  const actuals = {
    act_revenue: y0.rev, act_ebitda: y0.ebitda, act_recurring: B.recurring, act_customers: B.customers, act_arpa: B.recurring / B.customers,
    act_churn: B.churn, act_newbiz: B.newBizList * (1 - B.discount), act_discount: B.discount, act_legacy_share: B.legacyShare, act_legacy_gap: B.legacyGap,
    act_ps_fte: B.ps.fte, act_ps_days: B.ps.days, act_util: B.ps.util, act_foc: B.ps.foc, act_day_rate: B.ps.rate, act_ps_cost_fte: B.ps.cost, act_ps_revenue: y0.ps,
    act_sup_fte: B.support.fte, act_sup_cost_fte: B.support.cost, act_howto_share: B.support.howto, act_tickets: T,
    act_rnd_fte: B.rnd.fte, act_rnd_cost_fte: B.rnd.cost, act_pet_fte: B.rnd.petFte || 0,
    act_sm: B.sm, act_ga: B.ga, act_hosting: B.hosting, act_royalties: B.royalties, act_other: B.other, act_infl: B.infl
  };
  sc._data = { tables, actuals };
  return sc._data;
};

MDS.fmtCell = (v, type) => {
  if (v == null || v === "") return "";
  if (type === "pct") return (v * 100).toFixed(1) + "%";
  if (type === "num") return typeof v === "number" ? v.toLocaleString("en-GB", { maximumFractionDigits: 1 }) : v;
  if (type === "int") return typeof v === "number" ? Math.round(v).toLocaleString("en-GB", { useGrouping: v >= 10000 }) : v;
  return MDS.esc(v);
};
