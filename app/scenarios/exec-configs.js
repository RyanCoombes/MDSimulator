/* "Run the transformation" content per case: workstreams, owners, who must support them, and case-specific events.
   Stakeholder ids come from sc.stake. value = £k/yr run-rate once done. effort = progress points needed. deadline = month by which it must be done. */
(() => {
  const H = MDS.scenarios.harbour, N = MDS.scenarios.nordline, Q = MDS.scenarios.quill;
  H.exec = {
    gm: "dave", team: ["priya", "support", "kieran"], customers: "top3", target: 900,
    support: { dave: -20, leanne: -15, priya: 35, kieran: 30, mark: -45, pm: 50, top3: 10, support: -20, book: 5 },
    ws: [
      { id: "notice", name: "Serve notice on the ReportCo contract and renegotiate", owner: "dave", needs: ["dave"], value: 60, effort: 25, deadline: 1, late: 0, hint: "120-day notice before the April auto-renewal. It's due now." },
      { id: "uplift", name: "5% maintenance uplift for April renewals", owner: "dave", needs: ["dave", "leanne"], value: 180, effort: 55, deadline: 2, late: 0.25, hint: "Letters must land by the end of January or you lose most of this year's April cycle." },
      { id: "deal", name: "Discount approval and deal desk", owner: "leanne", needs: ["leanne", "mark"], value: 90, effort: 60, hint: "One rep averages 37% discount." },
      { id: "ps", name: "PS scoping rule, time recording and utilisation", owner: "priya", needs: ["priya"], value: 340, effort: 130, hint: "Sales-scoped fixed-price work overruns by about 30%." },
      { id: "legacy", name: "Phased legacy price migration", owner: "leanne", needs: ["dave", "leanne", "top3"], value: 260, effort: 110, deps: ["uplift"], hint: "Biggest commercial prize, biggest customer risk." },
      { id: "support", name: "Onboarding redesign and AI ticket deflection", owner: "priya", needs: ["support", "priya"], value: 120, effort: 100, hint: "E-learning customers raise 2.6× the how-to tickets." },
      { id: "rnd", name: "Refocus R&D: Mobile 2 team to the AI tier", owner: "dave", needs: ["dave", "kieran"], value: 220, effort: 150, hint: "Five engineers on work no customer has asked for." }
    ],
    events: [
      { id: "h_mark", once: true, cond: g => g.ws.deal.started && g.ws.deal.progress > 20, title: "Mark Collins threatens to walk",
        text: "Mark tells Leanne he'll leave if he can't discount \"like the competition\". He brought in 30% of last year's new logos.",
        options: [
          { t: "Meet him with Leanne. Show his deals' churn and margin, and agree a higher approval limit for genuinely competitive deals.", days: 2, fx: g => { g.sup("mark", 25); g.sup("leanne", 8); }, fb: "Data plus a fair exception route. He keeps face, you keep governance." },
          { t: "Let him go. The policy stands.", days: 0, fx: g => { g.sup("leanne", -12); g.wsPts("deal", 10); g.addRisk("New business dips this quarter."); g.runRateAdj(-25); }, fb: "Policy intact, but you've made Leanne's quarter harder and lost pipeline." },
          { t: "Exempt Mark from the deal desk.", days: 0, fx: g => { g.sup("mark", 20); g.sup("leanne", -5); g.valueAdj("deal", -0.5); }, fb: "Half the leakage stays. Others will ask for exemptions too." }
        ] }
    ]
  };
  N.exec = {
    gm: "anna", team: ["sofia", "devops", "nils"], customers: "gr", target: 760,
    support: { anna: 10, erik: -15, union: -20, sofia: 45, devops: 5, nils: -45, gr: 0, pm: 50 },
    ws: [
      { id: "cs", name: "Customer success for the top 40 accounts", owner: "sofia", needs: ["sofia", "anna"], value: 230, effort: 80, hint: "Churn is the main problem. Start where the revenue is." },
      { id: "plan", name: "Agree the desktop sunset plan with both co-founders", owner: "anna", needs: ["anna", "erik"], value: 0, effort: 40, hint: "No value on its own, but the cloud move depends on it." },
      { id: "cloud", name: "Finish the cloud migration and switch off desktop", owner: "erik", needs: ["erik", "devops", "gr"], value: 330, effort: 170, deps: ["plan"], hint: "Halves hosting and removes the main churn driver." },
      { id: "hosting", name: "AWS savings plan and remove duplicate monitoring", owner: "devops", needs: ["devops"], value: 70, effort: 30, hint: "Quick win." },
      { id: "devc", name: "Move 5 R&D roles to the Valsoft dev centre", owner: "anna", needs: ["union", "erik"], value: 150, effort: 120, hint: "MBL negotiation required before deciding." },
      { id: "ai", name: "AI inspection-prediction pilot", owner: "erik", needs: ["erik", "nils"], value: 90, effort: 90, deps: ["plan"], hint: "Best built on the cloud platform." }
    ],
    events: [
      { id: "n_mbl", once: true, cond: g => g.ws.devc.started && g.support.union < 10, title: "The union demands MBL negotiations",
        text: "The union rep writes formally: under the Co-determination Act, they require negotiations before any decision to move roles.",
        options: [
          { t: "Open negotiations properly with Anna and HR. Pause the decision until they conclude.", days: 3, fx: g => { g.sup("union", 30); g.pause("devc", 1); g.pmAdj(3); }, fb: "Legally right, and it builds trust. A month's delay is cheap." },
          { t: "Proceed. It's only five roles.", days: 0, fx: g => { g.sup("union", -40); g.pmAdj(-25); g.sup("erik", -10); g.addRisk("Potential MBL breach: legal exposure and damages."); }, fb: "A breach of Swedish co-determination law. The Portfolio Manager is not impressed." },
          { t: "Drop the dev-centre move.", days: 0, fx: g => { g.stop("devc"); g.sup("union", 15); }, fb: "Calm, but £150k a year goes with it." }
        ] },
      { id: "n_outage", once: true, cond: g => g.ws.cloud.started && g.ws.cloud.progress > 30, title: "Cloud outage after the first wave",
        text: "Five hours of downtime on a Monday. Two municipalities call Anna.",
        options: [
          { t: "Incident report within 48 hours. Call the customers with Anna, and set a go criterion for the next wave.", days: 3, fx: g => { g.sup("gr", 5); g.sup("anna", 6); g.pmAdj(2); }, fb: "Incidents happen. Handling them well builds trust." },
          { t: "Pause the migration until it's perfect.", days: 0, fx: g => { g.pause("cloud", 2); g.sup("devops", -6); }, fb: "Two months of double-running hosting costs." },
          { t: "Leave it to DevOps.", days: 0, fx: g => { g.sup("gr", -15); g.sup("anna", -8); }, fb: "Customers judge the change by how it's led." }
        ] }
    ]
  };
  Q.exec = {
    gm: "graham", team: ["headps", "uksup"], customers: "lawfirms", target: 600,
    support: { graham: -30, carmen: 45, headps: 40, uksup: -45, dpo: 0, lawfirms: -20, lexfin: 5, pm: 45 },
    ws: [
      { id: "packs", name: "Packaged implementations with change control", owner: "headps", needs: ["headps"], value: 180, effort: 90, hint: "PS is 40% of revenue and loses money." },
      { id: "pricing", name: "Legacy pricing and discount governance", owner: "graham", needs: ["graham"], value: 110, effort: 70, hint: "Owner: the founder, who already feels sidelined." },
      { id: "shared", name: "Shared finance and back office with Lexia", owner: "carmen", needs: ["carmen", "lexfin"], value: 110, effort: 70, hint: "A clean synergy." },
      { id: "dpo", name: "Data processing statement for AI drafting", owner: "graham", needs: ["dpo"], value: 0, effort: 30, hint: "The gate for the AI line." },
      { id: "ai", name: "AI drafting tier: pilot, then paid launch", owner: "graham", needs: ["graham", "lawfirms"], value: 200, effort: 140, deps: ["dpo"], hint: "Customers are asking for it, and competitors charge for it." },
      { id: "support", name: "Merge UK support into the Lexia desk", owner: "carmen", needs: ["uksup", "graham"], value: 100, effort: 100, hint: "UK consultation needed. Redeploy first." }
    ],
    events: [
      { id: "q_dpo", once: true, cond: g => g.ws.ai.started && g.ws.dpo.progress < 100, title: "A compliance partner asks where client data goes",
        text: "A large customer's compliance partner asks for your AI data processing terms in writing. You don't have them yet.",
        options: [
          { t: "Pause AI sales and finish the data processing statement with the DPO first.", days: 2, fx: g => { g.pause("ai", 1); g.wsPts("dpo", 15); g.sup("lawfirms", 15); }, fb: "In legal software, trust is the product." },
          { t: "Tell them it's all secure.", days: 0, fx: g => { g.sup("lawfirms", -30); g.pmAdj(-8); }, fb: "Lawyers want it in writing. You've damaged credibility." }
        ] },
      { id: "q_carmen", once: true, cond: g => g.month >= 3, title: "Carmen wants to run it all from Madrid",
        text: "Carmen proposes moving all support and PS to Madrid next month. Graham hears about it second-hand.",
        options: [
          { t: "Bring both MDs together to agree a staged design with UK-hours service levels.", days: 3, fx: g => { g.sup("graham", 10); g.sup("carmen", 3); g.wsPts("support", 10); }, fb: "Both leaders own the design. No big-bang cutover." },
          { t: "Back Carmen. Her numbers are better.", days: 0, fx: g => { g.sup("graham", -25); g.sup("uksup", -15); g.wsPts("support", 20); }, fb: "Faster, but the founder and the UK team turn against the change." },
          { t: "Tell Carmen no.", days: 0, fx: g => { g.sup("carmen", -20); g.sup("graham", 5); }, fb: "The integration stalls, and your ally becomes a critic." }
        ] }
    ]
  };
})();
