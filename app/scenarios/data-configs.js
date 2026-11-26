/* Data-room configuration per case. Root causes are planted here deliberately. */
(() => {
  const H = MDS.scenarios.harbour, N = MDS.scenarios.nordline, Q = MDS.scenarios.quill;
  const ukPlaces = ["Aire", "Calder", "Wharfe", "Pennine", "Tyne", "Mersey", "Severn", "Trent", "Avon", "Ouse", "Tees", "Wear", "Dove", "Derwent", "Medway", "Thames", "Solent", "Fenland", "Chiltern", "Cotswold", "Mendip", "Peak", "Moor", "Vale", "Riverside", "Harbour", "Northgate", "Southway", "Eastfield", "Westbury", "Ashford", "Brook", "Kings", "Queens", "Abbey", "Castle", "Bridge", "Meadow", "Forest", "Coastal"];
  const haSuffix = ["Homes", "Housing", "Housing Trust", "Living", "Housing Group", "Community Homes", "Housing Association"];
  H.data = {
    seed: 4101, custName: r => `${ukPlaces[Math.floor(r() * ukPlaces.length)]} ${haSuffix[Math.floor(r() * haSuffix.length)]}`,
    segments: [{ name: "Large", p: 0.1, w: 4 }, { name: "Medium", p: 0.35, w: 1.6 }, { name: "Small", p: 0.55, w: 0.7 }],
    regions: ["North", "Midlands", "London", "South", "Wales"],
    reps: [{ name: "Leanne Ford", disc: 0.18, sd: 0.05, share: 3 }, { name: "Mark Collins", disc: 0.36, sd: 0.06, share: 3 }, { name: "Sam Patel", disc: 0.19, sd: 0.05, share: 2 }, { name: "Jo Evans", disc: 0.15, sd: 0.04, share: 2 }],
    onboard: { a: "E-learning", b: "On-site", pA: 0.55, mult: 2.4 }, peakMonth: 4, peakShare: 0.42, top3: 0.14, tickets: 9600,
    churnedN: 17, churnReasons: [{ r: "Low adoption after go-live", w: 7, pA: 0.85, contact: 240 }, { r: "Missing scheduling features", w: 4, pA: 0.5, contact: 90 }, { r: "Merged with another association", w: 3, pA: 0.5, contact: 60 }, { r: "Price", w: 2, pA: 0.5, contact: 120 }, { r: "Moved to competitor", w: 1, pA: 0.6, contact: 150 }],
    projectsN: 72, salesScoped: 0.55, overSales: 0.52, overPS: 0.12, seniorLow: 3,
    projectTypes: [{ type: "Implementation", pricing: "Fixed", w: 0.42, days: [15, 55] }, { type: "Data migration", pricing: "Fixed", w: 0.18, days: [8, 25] }, { type: "Training", pricing: "T&M", w: 0.22, days: [2, 8] }, { type: "Change request", pricing: "T&M", w: 0.18, days: [3, 12], unbilled: 0.6 }],
    ticketMix: [["Bug / defect", 0.38], ["Report request", 0.22], ["Data fix", 0.18], ["Configuration", 0.15], ["Outage", 0.07]],
    smFte: 6, smCost: 60, gaFte: 8, gaCost: 50, locations: ["Leeds", "Leeds", "Leeds", "Remote (UK)"],
    roles: { "Professional services": "Consultant", "Support": "Support analyst", "R&D": "Engineer", "Sales and marketing": "Account executive", "G&A": "Operations" },
    keyPeople: [{ dept: "Professional services", name: "Priya Shah", role: "Head of PS", tenure: 9, risk: "Medium" }, { dept: "Support", name: "Tom Reid", role: "Support Lead", tenure: 7, risk: "Low" },
      { dept: "R&D", name: "Kieran Doyle", role: "Lead engineer, scheduling engine", tenure: 12, risk: "High" }, { dept: "R&D", name: "Fatima Noor", role: "Architect", tenure: 8, risk: "Medium" },
      { dept: "Sales and marketing", name: "Leanne Ford", role: "Sales Director", tenure: 6, risk: "Low" }, { dept: "Sales and marketing", name: "Mark Collins", role: "Account executive", tenure: 2, risk: "Low" }, { dept: "G&A", name: "Dave Pryce", role: "Founder and CEO", tenure: 17, risk: "Medium" }],
    suppliers: [
      { supplier: "AWS (production)", category: "Hosting", annual: 310, contract_end: "2027-09", auto_renew: "No", notice_days: 0, uplift: "On demand, 30% of reserved capacity idle", usage: "Medium", owner: "DevOps" },
      { supplier: "Azure (backup / DR)", category: "Hosting", annual: 60, contract_end: "2027-03", auto_renew: "Yes", notice_days: 30, uplift: "List", usage: "Medium", owner: "DevOps" },
      { supplier: "Datadog", category: "Hosting", annual: 38, contract_end: "2027-06", auto_renew: "Yes", notice_days: 60, uplift: "7%", usage: "High", owner: "DevOps" },
      { supplier: "Cloudflare", category: "Hosting", annual: 12, contract_end: "2027-01", auto_renew: "Yes", notice_days: 30, uplift: "None", usage: "High", owner: "DevOps" },
      { supplier: "Colocation (legacy servers)", category: "Hosting", annual: 40, contract_end: "2027-02", auto_renew: "Yes", notice_days: 90, uplift: "5%", usage: "Low", owner: "DevOps" },
      { supplier: "ReportCo embedded reporting", category: "Royalties", annual: 190, contract_end: "2027-04", auto_renew: "Yes (3 yrs)", notice_days: 120, uplift: "12%", usage: "High", owner: "CTO (vacant)" },
      { supplier: "Office lease, Leeds", category: "G&A", annual: 180, contract_end: "2029-12", auto_renew: "No", notice_days: 180, uplift: "RPI", usage: "Medium", owner: "CEO" },
      { supplier: "Salesforce", category: "G&A", annual: 46, contract_end: "2027-05", auto_renew: "Yes", notice_days: 30, uplift: "9%", usage: "Medium", owner: "Sales" },
      { supplier: "HubSpot", category: "G&A", annual: 22, contract_end: "2027-02", auto_renew: "Yes", notice_days: 30, uplift: "5%", usage: "Low", owner: "Marketing" },
      { supplier: "Zendesk", category: "G&A", annual: 28, contract_end: "2027-08", auto_renew: "Yes", notice_days: 30, uplift: "5%", usage: "High", owner: "Support" },
      { supplier: "Freshdesk (old helpdesk)", category: "G&A", annual: 9, contract_end: "2027-01", auto_renew: "Yes", notice_days: 30, uplift: "None", usage: "Low", owner: "Support" },
      { supplier: "Microsoft 365", category: "G&A", annual: 31, contract_end: "2027-07", auto_renew: "Yes", notice_days: 30, uplift: "List", usage: "High", owner: "Ops" },
      { supplier: "Insurance", category: "G&A", annual: 38, contract_end: "2027-10", auto_renew: "No", notice_days: 0, uplift: "Market", usage: "High", owner: "CEO" },
      { supplier: "Audit and legal", category: "G&A", annual: 42, contract_end: "n/a", auto_renew: "No", notice_days: 0, uplift: "n/a", usage: "High", owner: "CEO" },
      { supplier: "Recruitment agency", category: "G&A", annual: 55, contract_end: "n/a", auto_renew: "No", notice_days: 0, uplift: "20% of salary", usage: "Medium", owner: "CEO" },
      { supplier: "Travel", category: "G&A", annual: 48, contract_end: "n/a", auto_renew: "No", notice_days: 0, uplift: "n/a", usage: "Medium", owner: "All" },
      { supplier: "Events and trade shows", category: "Sales and marketing", annual: 120, contract_end: "n/a", auto_renew: "No", notice_days: 0, uplift: "n/a", usage: "Medium", owner: "Sales" },
      { supplier: "Paid search", category: "Sales and marketing", annual: 80, contract_end: "n/a", auto_renew: "No", notice_days: 0, uplift: "n/a", usage: "Low", owner: "Marketing" }
    ],
    epics: [
      { epic: "Harbour Mobile 2", type: "Founder project", fte: 5, months: 18, requests: 0, contracted: 0, status: "\"3 months away\"" },
      { epic: "Bug fixing and maintenance", type: "Legacy", fte: 6, months: 0, requests: 0, contracted: 0, status: "Ongoing" },
      { epic: "Security and compliance", type: "Legacy", fte: 2, months: 0, requests: 4, contracted: 0, status: "Ongoing" },
      { epic: ".NET upgrade / tech debt", type: "Legacy", fte: 1, months: 14, requests: 0, contracted: 0, status: "Slipping" },
      { epic: "Scheduling engine rewrite", type: "Roadmap", fte: 1, months: 9, requests: 46, contracted: 85, status: "Under-resourced" },
      { epic: "Damp and mould module", type: "Roadmap", fte: 2, months: 6, requests: 31, contracted: 40, status: "On track" },
      { epic: "Self-serve report builder", type: "Roadmap", fte: 1, months: 5, requests: 22, contracted: 0, status: "On track" },
      { epic: "Integrations API", type: "Roadmap", fte: 1, months: 7, requests: 18, contracted: 25, status: "On track" },
      { epic: "Performance", type: "Roadmap", fte: 1, months: 3, requests: 9, contracted: 0, status: "On track" }
    ]
  };

  const sePlaces = ["Göteborg", "Borås", "Alingsås", "Kungälv", "Uddevalla", "Trollhättan", "Halmstad", "Varberg", "Jönköping", "Skövde", "Lidköping", "Karlstad", "Örebro", "Västerås", "Linköping", "Norrköping", "Växjö", "Kalmar", "Malmö", "Lund", "Helsingborg", "Kristianstad", "Bergen", "Stavanger", "Aarhus", "Odense", "Tampere", "Turku"];
  const seSuffix = ["kommun fleet", "Logistik AB", "Transport AB", "Åkeri AB", "kommun", "Renhållning AB", "Bus AB"];
  N.data = {
    seed: 5202, custName: r => `${sePlaces[Math.floor(r() * sePlaces.length)]} ${seSuffix[Math.floor(r() * seSuffix.length)]}`,
    segments: [{ name: "Large", p: 0.12, w: 3.2 }, { name: "Medium", p: 0.4, w: 1.3 }, { name: "Small", p: 0.48, w: 0.6 }],
    regions: ["West Sweden", "East Sweden", "South Sweden", "Norway", "Denmark", "Finland"],
    reps: [{ name: "Johan Ek", disc: 0.17, sd: 0.05, share: 3 }, { name: "Lina Berg", disc: 0.2, sd: 0.06, share: 2 }, { name: "Partner channel", disc: 0.28, sd: 0.05, share: 2 }],
    onboard: { a: "Desktop", b: "Cloud", pA: 0.45, mult: 2.1 }, peakMonth: 1, peakShare: 0.35, top3: 0.17, tickets: 7800,
    churnedN: 19, churnReasons: [{ r: "Desktop instability", w: 6, pA: 0.95, contact: 200 }, { r: "No one checked in after go-live", w: 5, pA: 0.6, contact: 300 }, { r: "Slow support response", w: 4, pA: 0.8, contact: 140 }, { r: "Price", w: 2, pA: 0.5, contact: 100 }, { r: "Fleet sold / merged", w: 2, pA: 0.5, contact: 60 }],
    projectsN: 34, salesScoped: 0.5, overSales: 0.35, overPS: 0.08, seniorLow: 1,
    projectTypes: [{ type: "Implementation", pricing: "Fixed", w: 0.4, days: [10, 35] }, { type: "Cloud migration", pricing: "Fixed", w: 0.3, days: [5, 20] }, { type: "Training", pricing: "T&M", w: 0.3, days: [2, 6] }],
    ticketMix: [["Bug / defect (desktop)", 0.42], ["Bug / defect (cloud)", 0.12], ["Data fix", 0.2], ["Configuration", 0.16], ["Outage", 0.1]],
    smFte: 5, smCost: 64, gaFte: 7, gaCost: 41, locations: ["Gothenburg", "Gothenburg", "Remote (SE)"],
    roles: { "Professional services": "Consultant", "Support": "Support engineer", "R&D": "Engineer", "Sales and marketing": "Account executive", "G&A": "Operations" },
    keyPeople: [{ dept: "R&D", name: "Erik Holm", role: "Co-founder and CTO", tenure: 15, risk: "Medium" }, { dept: "R&D", name: "Nils Åberg", role: "Lead engineer, Route Optimiser", tenure: 6, risk: "High" }, { dept: "R&D", name: "DevOps lead", role: "DevOps lead", tenure: 4, risk: "High" },
      { dept: "Support", name: "Sofia Berg", role: "Support Manager", tenure: 8, risk: "Medium" }, { dept: "G&A", name: "Anna Lind", role: "Co-founder and CEO", tenure: 15, risk: "Low" }],
    suppliers: [
      { supplier: "On-prem data centre (Gothenburg)", category: "Hosting", annual: 290, contract_end: "2027-12", auto_renew: "Yes (2 yrs)", notice_days: 180, uplift: "6%", usage: "Medium", owner: "DevOps" },
      { supplier: "AWS (cloud product)", category: "Hosting", annual: 250, contract_end: "2027-06", auto_renew: "No", notice_days: 0, uplift: "On demand, no savings plan", usage: "Medium", owner: "DevOps" },
      { supplier: "Monitoring tools (two overlapping)", category: "Hosting", annual: 60, contract_end: "2027-03", auto_renew: "Yes", notice_days: 30, uplift: "5%", usage: "Low", owner: "DevOps" },
      { supplier: "Mapping API", category: "Royalties", annual: 60, contract_end: "2027-09", auto_renew: "Yes", notice_days: 60, uplift: "8%", usage: "High", owner: "CTO" },
      { supplier: "Office lease, Gothenburg", category: "G&A", annual: 160, contract_end: "2028-06", auto_renew: "No", notice_days: 270, uplift: "KPI-indexed", usage: "Medium", owner: "CEO" },
      { supplier: "CRM", category: "G&A", annual: 30, contract_end: "2027-04", auto_renew: "Yes", notice_days: 30, uplift: "7%", usage: "Low", owner: "Sales" },
      { supplier: "Accounting outsourcing", category: "G&A", annual: 70, contract_end: "2027-12", auto_renew: "Yes", notice_days: 90, uplift: "4%", usage: "High", owner: "CEO" },
      { supplier: "Other G&A", category: "G&A", annual: 73, contract_end: "n/a", auto_renew: "No", notice_days: 0, uplift: "n/a", usage: "Medium", owner: "CEO" },
      { supplier: "Trade shows (Nordic)", category: "Sales and marketing", annual: 100, contract_end: "n/a", auto_renew: "No", notice_days: 0, uplift: "n/a", usage: "Medium", owner: "Sales" }
    ],
    epics: [
      { epic: "Route Optimiser", type: "Founder project", fte: 4, months: 22, requests: 3, contracted: 0, status: "Beta with 2 customers" },
      { epic: "Desktop maintenance", type: "Legacy", fte: 5, months: 0, requests: 0, contracted: 0, status: "Ongoing" },
      { epic: "Desktop to cloud migration tooling", type: "Legacy", fte: 2, months: 16, requests: 12, contracted: 0, status: "Stalled (2 leavers)" },
      { epic: "Cloud: inspections and defects", type: "Roadmap", fte: 3, months: 8, requests: 38, contracted: 60, status: "On track" },
      { epic: "Cloud: parts and inventory", type: "Roadmap", fte: 2, months: 6, requests: 21, contracted: 0, status: "On track" },
      { epic: "Telematics integrations", type: "Roadmap", fte: 2, months: 4, requests: 27, contracted: 30, status: "Early" }
    ]
  };

  const surnames = ["Holt", "Marsh", "Kendall", "Pryor", "Ashby", "Gale", "Rowe", "Tate", "Quinn", "Lyle", "Barker", "Ferris", "Doyle", "Hale", "Mercer", "Slade", "Warren", "Cobb", "Vance", "Royle", "Drake", "Penn", "Frost", "Hurst"];
  const lawSuffix = ["LLP", "Solicitors", "& Co", "Law", "Legal"];
  Q.data = {
    seed: 6303, custName: r => { const a = surnames[Math.floor(r() * surnames.length)], b = surnames[Math.floor(r() * surnames.length)]; return `${a}${a === b ? "" : " " + b} ${lawSuffix[Math.floor(r() * lawSuffix.length)]}`; },
    segments: [{ name: "Large", p: 0.08, w: 3 }, { name: "Medium", p: 0.32, w: 1.3 }, { name: "Small", p: 0.6, w: 0.65 }],
    regions: ["London", "South East", "Midlands", "North", "Scotland"],
    reps: [{ name: "Grace Lowe", disc: 0.22, sd: 0.06, share: 3 }, { name: "Owen Hart", disc: 0.33, sd: 0.07, share: 2 }, { name: "Web sign-up", disc: 0.1, sd: 0.03, share: 1 }],
    onboard: { a: "Bespoke migration", b: "Standard template", pA: 0.6, mult: 2.0 }, peakMonth: 10, peakShare: 0.3, top3: 0.08, tickets: 6900,
    churnedN: 28, churnReasons: [{ r: "Implementation went badly", w: 7, pA: 0.9, contact: 160 }, { r: "Price", w: 3, pA: 0.5, contact: 90 }, { r: "Moved to competitor with AI drafting", w: 5, pA: 0.5, contact: 120 }, { r: "Firm merged / closed", w: 3, pA: 0.5, contact: 60 }, { r: "Missing features", w: 2, pA: 0.5, contact: 100 }],
    projectsN: 96, salesScoped: 0.65, overSales: 0.45, overPS: 0.15, seniorLow: 2,
    projectTypes: [{ type: "Implementation", pricing: "Fixed", w: 0.45, days: [6, 22] }, { type: "Data migration", pricing: "Fixed", w: 0.3, days: [4, 18] }, { type: "Training", pricing: "T&M", w: 0.15, days: [1, 4] }, { type: "Change request", pricing: "T&M", w: 0.1, days: [2, 6], unbilled: 0.7 }],
    ticketMix: [["Bug / defect", 0.3], ["Document template issue", 0.3], ["Data fix", 0.2], ["Configuration", 0.15], ["Outage", 0.05]],
    smFte: 4, smCost: 55, gaFte: 4, gaCost: 60, locations: ["Manchester", "Manchester", "Remote (UK)"],
    roles: { "Professional services": "Implementation consultant", "Support": "Support analyst", "R&D": "Developer", "Sales and marketing": "Account manager", "G&A": "Operations" },
    keyPeople: [{ dept: "G&A", name: "Graham Holt", role: "Founder and CEO", tenure: 14, risk: "High" }, { dept: "Professional services", name: "Dan Kerr", role: "Head of PS", tenure: 5, risk: "Medium" },
      { dept: "R&D", name: "Lead developer", role: "Lead developer, document engine", tenure: 9, risk: "Medium" }, { dept: "Support", name: "Margaret Byrne", role: "Senior support (12 yrs)", tenure: 12, risk: "Low" }],
    suppliers: [
      { supplier: "Azure hosting", category: "Hosting", annual: 150, contract_end: "2027-11", auto_renew: "Yes", notice_days: 30, uplift: "List", usage: "Medium", owner: "Lead developer" },
      { supplier: "Backup service", category: "Hosting", annual: 30, contract_end: "2027-02", auto_renew: "Yes", notice_days: 30, uplift: "5%", usage: "High", owner: "Lead developer" },
      { supplier: "DocAssemble Pro (document engine)", category: "Royalties", annual: 120, contract_end: "2027-06", auto_renew: "Yes (2 yrs)", notice_days: 90, uplift: "10%", usage: "High", owner: "Lead developer" },
      { supplier: "Office lease, Manchester", category: "G&A", annual: 95, contract_end: "2028-03", auto_renew: "No", notice_days: 180, uplift: "RPI", usage: "Low", owner: "CEO" },
      { supplier: "Finance bureau", category: "G&A", annual: 48, contract_end: "2027-03", auto_renew: "Yes", notice_days: 60, uplift: "5%", usage: "High", owner: "CEO" },
      { supplier: "HR outsourcing", category: "G&A", annual: 22, contract_end: "2027-05", auto_renew: "Yes", notice_days: 30, uplift: "5%", usage: "Medium", owner: "CEO" },
      { supplier: "Other G&A", category: "G&A", annual: 115, contract_end: "n/a", auto_renew: "No", notice_days: 0, uplift: "n/a", usage: "Medium", owner: "CEO" },
      { supplier: "Law Society events and listings", category: "Sales and marketing", annual: 80, contract_end: "n/a", auto_renew: "No", notice_days: 0, uplift: "n/a", usage: "Medium", owner: "Sales" }
    ],
    epics: [
      { epic: "Client portal", type: "Founder project", fte: 3, months: 15, requests: 4, contracted: 0, status: "Behind" },
      { epic: "Maintenance and bug fixing", type: "Legacy", fte: 4, months: 0, requests: 0, contracted: 0, status: "Ongoing" },
      { epic: "Document template fixes", type: "Legacy", fte: 1, months: 0, requests: 0, contracted: 0, status: "Ongoing" },
      { epic: "AI drafting (prototype)", type: "Roadmap", fte: 1, months: 3, requests: 64, contracted: 0, status: "Prototype, no data policy" },
      { epic: "Migration tooling", type: "Roadmap", fte: 1, months: 4, requests: 0, contracted: 0, status: "Early" },
      { epic: "E-billing (UK)", type: "Roadmap", fte: 2, months: 5, requests: 19, contracted: 0, status: "On track" }
    ]
  };
})();
