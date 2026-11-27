/* Open engagements: four new companies. You get a brief and a number of days. Nothing else is handed to you.
   n = customers. segs = [name, weight, churn in the last 12 months]. perSeat = list price per seat by plan (£ a year).
   mess switches say what is wrong with the files at this level. issues = the three findings that matter most. */
MDS.content.engagements = [
  { id: "kestrel", level: "easy", name: "Kestrel Practice Systems", sector: "Veterinary practice software, UK", budget: 10, n: 80, ie: 0,
    brief: "We completed on Kestrel three weeks ago. Forty staff, vets love the product, and nobody has looked at the commercials in years. You have two weeks. Tell me where the value is and how sure you are.",
    segs: [["Independent practice", 0.6, 0.15], ["Small group", 0.3, 0.05], ["Referral hospital", 0.1, 0.03]], perSeat: { Standard: 620, Plus: 890 },
    legacyShare: 0.4, outlier: false, foc: 0.2, reps: ["Hannah Price", "Owen Kerr", "Ines Ward"],
    mess: { dups: 6, eur: false, stale: 3, dates: false, junk: false, text: false, credit: false, variants: false, noRef: false, crmStale: false, cancelFile: true, psFile: true },
    issues: ["legacy", "ps", "churn"], founder: "Dr Alan Reeve", people: { sales: "Hannah Price, Sales Lead", ps: "Tom Lowe, Head of Onboarding", fin: "Ruth Bell, Bookkeeper" } },
  { id: "sitewise", level: "medium", name: "Sitewise", sector: "Construction site-safety software, UK and Ireland", budget: 8, n: 140, ie: 0.25,
    brief: "Sitewise is ours as of last month. UK and Irish contractors, founder still running it. The sales team says pricing is fine. I'm not convinced. Two weeks: where's the value, and what would you do first?",
    segs: [["Main contractor", 0.35, 0.05], ["Subcontractor", 0.5, 0.16], ["Housebuilder", 0.15, 0.06]], perSeat: { Standard: 410, Plus: 560 },
    legacyShare: 0.28, outlier: true, foc: 0.14, reps: ["Declan Moss", "Grace Hart", "Amir Khan", "Leah Dunn"],
    mess: { dups: 7, eur: true, stale: 5, dates: false, junk: false, text: false, credit: false, variants: false, noRef: false, crmStale: false, cancelFile: true, psFile: true },
    issues: ["legacy", "rep", "churn"], founder: "Niamh Walsh", people: { sales: "Declan Moss, Sales Director", ps: "Ben Ross, Head of Delivery", fin: "Kate Fox, Finance Assistant" } },
  { id: "marlowe", level: "hard", name: "Marlowe Rota", sector: "Staff rostering software for care homes, UK and Ireland", budget: 7, n: 220, ie: 0.15,
    brief: "Marlowe Rota. Care-home rostering. The founder says they hardly lose a customer and I don't believe it, but nobody there tracks churn. Two weeks. I want numbers I can defend to the board, and I want to know what they rest on.",
    segs: [["Single home", 0.55, 0.19], ["Regional group", 0.33, 0.06], ["National operator", 0.12, 0.03]], perSeat: { Standard: 340, Plus: 480 },
    legacyShare: 0.22, outlier: false, foc: 0.24, reps: ["Sam Pope", "Maya Lane", "Josh Reid", "Zoe Clarke"],
    mess: { dups: 10, eur: true, stale: 8, dates: true, junk: true, text: true, credit: true, variants: true, noRef: false, crmStale: false, cancelFile: false, psFile: true },
    issues: ["churn", "ps", "legacy"], founder: "Margaret Hughes", people: { sales: "Sam Pope, Head of Sales", ps: "Raj Patel, Implementation Lead", fin: "Dan Shaw, Part-time Accountant" } },
  { id: "orchard", level: "very hard", name: "Orchard Ledger", sector: "Accounting software for agricultural co-operatives, UK and Ireland", budget: 6, n: 300, ie: 0.3,
    brief: "Orchard Ledger. Bought from the family. Records are a mess, the sales director is the founder's son, and I'm told the CRM 'isn't the source of truth'. You have two weeks and not enough of anyone's time. Tell me what's real.",
    segs: [["Small co-op", 0.5, 0.24], ["Regional co-op", 0.38, 0.05], ["Federation", 0.12, 0.02]], perSeat: { Standard: 290, Plus: 430 },
    legacyShare: 0.06, outlier: true, foc: 0.27, reps: ["Callum Ferris", "Nadia Evans", "Luke Berg", "Ella Lund"],
    mess: { dups: 14, eur: true, stale: 10, dates: true, junk: true, text: true, credit: true, variants: true, noRef: true, crmStale: true, cancelFile: false, psFile: false },
    issues: ["rep", "churn", "ps"], founder: "George Ferris", people: { sales: "Callum Ferris, Sales Director (the founder's son)", ps: "Hana Moreno, Services Manager", fin: "Ivan Ruiz, Finance Controller" } }
];
