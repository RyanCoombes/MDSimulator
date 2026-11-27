/* Initiative portfolio content per case.
   kpis[wsId] = [best measure, weaker measure, weaker measure, why the first is best]. The first is an outcome you can read monthly.
   extra = tempting initiatives that don't belong in the portfolio (they become real workstreams if you charter them). */
(() => {
  const H = MDS.scenarios.harbour, N = MDS.scenarios.nordline, Q = MDS.scenarios.quill;
  H.portfolio = {
    kpis: {
      notice: ["Notice served before the deadline and new terms signed", "Number of supplier meetings held", "Supplier satisfaction score", "It's a dated legal step: either the notice is in on time or the contract renews."],
      uplift: ["Share of April renewals invoiced at the new price", "Letters drafted and approved internally", "Customer newsletter open rate", "Invoiced renewals are where the money shows up. Drafted letters are activity."],
      deal: ["Average discount on new deals, by rep, each month", "Deal desk meetings held per month", "Total pipeline value", "The leak is discount depth. Read it monthly, per rep, to see whether behaviour changed."],
      ps: ["Billable utilisation and free-of-charge days as a share of delivered days", "Number of projects started", "Consultant headcount", "Utilisation and giveaways are the two leaks the data room shows."],
      legacy: ["Legacy price gap closed, with gross retention of migrated customers", "Number of customers contacted", "Average list price", "You need the gain and the damage in one measure: price closed and customers kept."],
      support: ["How-to tickets per customer per month", "Help articles published", "Chatbot conversations started", "Deflection only counts if the tickets actually fall."],
      rnd: ["Engineer days on roadmap and AI work, with paid AI-tier customers", "Story points completed", "Number of AI features shipped", "The point is where effort goes and whether anyone pays. Output counts don't show that."]
    },
    extra: [
      { id: "x_brand", claim: "Not sized", name: "Rebrand and relaunch the website", owner: "leanne", needs: ["leanne"], value: 0, effort: 60, hint: "The brand looks dated next to competitors.", bad: "Nothing in the data room links the brand to churn, price or margin. It uses capacity and moves no target." },
      { id: "x_erp", claim: "Not sized", name: "Replace the CRM and finance systems this year", owner: "dave", needs: ["dave", "book"], value: 0, effort: 140, hint: "Reporting is manual and the bookkeeper works from spreadsheets.", bad: "A big-bang systems change in year one adds fatigue and no run-rate. A light reporting pack gives you the numbers you need." },
      { id: "x_rise", claim: "On paper: £540k a year (15% of recurring revenue)", name: "15% across-the-board price rise from April", owner: "dave", needs: ["dave", "leanne", "top3"], value: -120, effort: 50, hint: "No price rise since 2022. Catch up in one go.", bad: "Customers tolerate rises up to about inflation (5%). At 15% the churn outweighs the gain, and it burns the founder's trust." }
    ]
  };
  N.portfolio = {
    kpis: {
      cs: ["Gross revenue retention in the top 40 accounts", "Customer calls made per week", "Net promoter score once a year", "Retention is the outcome. Call volumes are activity and an annual survey arrives too late."],
      plan: ["Sunset dates signed off by both co-founders and told to customers", "Planning workshops held", "Pages in the migration plan", "An enabler is done when the decision is made and communicated."],
      cloud: ["Share of customers live on cloud, with monthly hosting cost", "Servers provisioned", "Migration tickets closed", "Customers moved and the hosting bill are what change the P&L."],
      hosting: ["Monthly hosting and monitoring spend against baseline", "Number of AWS services reviewed", "Uptime percentage", "It's a cost initiative. Measure the cost."],
      devc: ["Roles moved with negotiation concluded, and delivery velocity held", "Job adverts posted at the dev centre", "Total R&D headcount", "It only works if the legal process is completed and output doesn't drop."],
      ai: ["Pilot customers using predictions weekly, and how many convert to paid", "Model accuracy on test data", "Demos given", "Usage and conversion show value. Accuracy in the lab doesn't."]
    },
    extra: [
      { id: "x_desktop", claim: "Protects at-risk accounts (not sized)", name: "One more major desktop release to keep municipalities happy", owner: "erik", needs: ["erik"], value: -40, effort: 100, hint: "Some customers say they aren't ready for cloud.", bad: "It invests in the product you're switching off and delays the hosting saving." },
      { id: "x_agile", claim: "Not sized", name: "Company-wide agile training programme", owner: "anna", needs: ["anna", "erik"], value: 0, effort: 70, hint: "Delivery feels slow and teams work in different ways.", bad: "A training programme with no outcome attached. The churn and hosting problems don't wait for it." },
      { id: "x_cut", claim: "On paper: £130k a year", name: "Cut the support team by a third now", owner: "anna", needs: ["anna", "sofia"], value: -100, effort: 40, hint: "Support is the largest cost line after R&D.", bad: "Churn is the main problem. Cutting support before cloud removes the ticket drivers makes it worse." }
    ]
  };
  Q.portfolio = {
    kpis: {
      packs: ["PS gross margin, with overrun days per project", "Number of packages defined", "Projects started this quarter", "PS loses money through overruns. Margin and overrun days show whether that stopped."],
      pricing: ["Average discount and share of customers still on legacy price", "Price list published", "Number of quotes issued", "Publishing a list changes nothing until discounts and legacy prices move."],
      shared: ["Back-office cost run-rate against baseline, with month-end close days", "Systems integrated", "Finance team headcount", "The saving and the service level together. Headcount alone hides whether the work is getting done."],
      dpo: ["Data processing statement signed off and issued to customers", "Meetings with the DPO", "Policy pages drafted", "A gate is binary: signed and issued, or not."],
      ai: ["Paying customers on the AI tier and its monthly recurring revenue", "AI drafts generated", "Pilot sign-ups", "Free usage is interest. Paid recurring revenue is the target."],
      support: ["Cost per ticket, with UK response times against service level", "Tickets handled in Madrid", "Number of UK roles removed", "Cost and service in one measure, so you can't hit one by wrecking the other."]
    },
    extra: [
      { id: "x_madrid", claim: "Carmen's estimate: £150k a year", name: "Move all UK support and PS to Madrid next month", owner: "carmen", needs: ["uksup", "graham", "headps"], value: -80, effort: 50, hint: "Carmen's numbers show Madrid is cheaper per ticket.", bad: "No UK consultation, no staged design and the founder isn't on board. Expect resignations and customer churn." },
      { id: "x_ailaunch", claim: "Sales estimate: £200k a year, sooner", name: "Launch AI drafting to every customer now", owner: "graham", needs: ["graham", "lawfirms", "dpo"], value: -60, effort: 60, hint: "Competitors already charge for it.", bad: "Law firms need the data terms in writing first. Launching without them damages trust in the whole product." },
      { id: "x_portal", claim: "Not sized", name: "New partner portal and brand refresh", owner: "graham", needs: ["graham"], value: 0, effort: 60, hint: "Graham has wanted this for two years.", bad: "A founder favourite with no link to the targets. It uses his time, which is your scarcest input." }
    ]
  };
})();
