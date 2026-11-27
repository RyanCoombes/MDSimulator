/* Lessons you practise on real filed accounts (the Real company studies, unnamed), plus real-accounts exercises for existing lessons.
   Each generator takes the years a study shows before its decision and returns { note, rows, asks } or null if the data isn't there.
   asks: [label, answer, unit, tolerance, working]. */
MDS.content.lessons.push(
  { id: "adjusted", family: "Reading real accounts", name: "Adjusted profit vs cash profit", origin: "Standard analyst practice; UK accounts under IAS 38 and FRS 102 allow development costs to be capitalised",
    one: "Adjusted EBITDA is management's own number. Take off the development spend they capitalised and see what's left.",
    what: "Statutory operating profit follows accounting rules. Adjusted EBITDA is defined by the company: it adds back depreciation, amortisation and whatever the directors call exceptional. Development spend that has been capitalised never touches adjusted EBITDA at all, because it goes to the balance sheet and comes back later as amortisation, which is added back. A business can therefore report healthy adjusted EBITDA while spending most of it on engineers. The quick test is adjusted EBITDA less capitalised development, compared with the cash the business actually generated.",
    parts: [["Statutory operating profit", "After all costs, including amortisation of past development and acquired intangibles. Set by accounting standards."],
      ["Adjusted EBITDA", "Operating profit plus depreciation, amortisation and the items management excludes. Not a defined measure, so read the reconciliation."],
      ["Capitalised development", "Engineering cost put on the balance sheet as an asset. Real cash out this year, absent from adjusted EBITDA."],
      ["Cash EBITDA", "Adjusted EBITDA less capitalised development. A rough view of profit after paying for the product."],
      ["Cash conversion", "Cash generated from operations as a share of adjusted EBITDA. A falling ratio means the adjusted number is drifting from reality."]],
    use: "Comparing two software companies, testing a seller's headline profit, or deciding how much room there really is to invest or repay debt.",
    avoid: "Treating all capitalisation as a trick. Capitalising a real new product is correct accounting. The question is the size and the trend.",
    example: "A group reports adjusted EBITDA of £9m and capitalises £7m of development. Cash EBITDA is about £2m. If it also carries debt and pays earn-outs, the 'profitable' business is consuming cash, and a plan built on the £9m will fail.",
    mistakes: ["Quoting adjusted EBITDA margin without saying what was excluded.", "Ignoring a rising share of development being capitalised year after year.", "Comparing one company's adjusted EBITDA with another's statutory profit."],
    say: "I start from adjusted EBITDA but I always take off capitalised development and check cash conversion, because that tells me what the business really earns after paying for its product.",
    related: ["rule40", "opleverage", "csu"] },
  { id: "revhead", family: "Reading real accounts", name: "Revenue per head and staff cost ratio", origin: "Common operating benchmarks; both come straight from the staff note in UK filed accounts",
    one: "Two numbers from the staff note tell you how hard the cost base is working: revenue per employee and staff cost as a share of revenue.",
    what: "UK accounts must disclose average headcount and total staff costs. Divide revenue by average headcount to see output per person, and staff costs by revenue to see how much of every pound goes on people. In software, people are most of the cost, so these two ratios explain most of the margin. Read the trend over three years, and read them together: revenue per head rising with a flat staff cost ratio means pay is rising as fast as output.",
    parts: [["Revenue per head", "Revenue divided by average headcount. Mature UK vertical software often sits around £100k to £180k."],
      ["Staff cost per head", "Total staff costs (wages, social security, pensions) divided by average headcount. Shows the mix of roles and locations."],
      ["Staff cost ratio", "Staff costs divided by revenue. Above about 60% leaves little room for hosting, overheads and profit."],
      ["The trend", "Headcount growing faster than revenue pushes the ratio up. It's the earliest sign of margin pressure."]],
    use: "A first read of any P&L, sizing a cost programme, or testing whether planned hiring is affordable.",
    avoid: "Comparing businesses with very different models. A services-heavy firm and a pure licence firm will never match. Contractors and offshore centres can also sit outside the staff note.",
    example: "A business grows revenue 5% while average headcount rises 10% and staff costs 28%. Staff cost ratio jumps from 45% to 59%. Whatever the strategy says, the business hired ahead of demand, and the plan has to say which roles pay back.",
    mistakes: ["Using year-end headcount when the accounts give the average.", "Reading a single year without the trend.", "Forgetting capitalised development: some of the staff cost may be on the balance sheet."],
    say: "Before I look at anything else I take revenue per head and the staff cost ratio from the staff note, over three years. If people costs are growing faster than revenue, that's where the margin story is.",
    related: ["opleverage", "utilreal", "adjusted"] },
  { id: "opleverage", family: "Reading real accounts", name: "Incremental margin (operating leverage)", origin: "Standard financial analysis",
    one: "Of each extra pound of revenue, how much reached operating profit? That's the incremental margin.",
    what: "Incremental margin is the change in operating profit divided by the change in revenue between two periods. Software has high gross margins and largely fixed costs, so growth from price and existing customers should drop through at 60% or more. When the incremental margin is far below the existing margin, the growth was bought with new cost. When it is above 100%, profit rose by more than revenue, which means costs were cut as well. It's a quick way to see what kind of growth a business is having.",
    parts: [["Change in revenue", "This period's revenue less the earlier period's."],
      ["Change in operating profit", "Use the same profit measure in both periods, and strip out one-offs such as impairments."],
      ["Incremental margin", "Change in profit divided by change in revenue. Compare it with the existing margin."],
      ["What it tells you", "High: price or installed-base growth. Low: growth needed new people. Over 100%: costs fell too. Negative: profit fell while revenue rose."]],
    use: "Judging the quality of growth, testing a forecast (does the plan assume a drop-through the business has never achieved?), and explaining a margin change.",
    avoid: "Periods where revenue barely moved: a tiny denominator gives a meaningless ratio. Also avoid mixing in acquisitions or one-off items.",
    example: "Revenue rises by £2.0m and operating profit by £1.7m: an incremental margin of 85%. Headcount was flat, so the growth came from price reviews and cross-selling. The right plan protects that engine. It doesn't add fifteen salespeople.",
    mistakes: ["Calculating it on statutory profit that includes an impairment in one year.", "Assuming a high incremental margin will continue once the price rises run out.", "Presenting a forecast with 80% drop-through when history shows 30%."],
    say: "I look at incremental margin to see what kind of growth it is. If 85p of every new pound reaches profit, the growth is coming from price and the base, and my job is to protect that before I add cost.",
    related: ["revhead", "rule40", "adjusted"] }
);

(() => {
  const pct = (a, b) => a / b * 100, f = v => Math.round(v).toLocaleString("en-GB");
  const last = ys => ys[ys.length - 1], prev = ys => ys[ys.length - 2];
  const rows = (ys, keys) => keys.map(([k, l]) => [l, ys.map(y => y[k])]);
  MDS.content.realEx = {
    rule40: ys => {
      if (ys.length < 2) return null; const a = prev(ys), b = last(ys), adj = b.adj_ebitda != null, p = adj ? b.adj_ebitda : b.operating_profit;
      if (!a.revenue || p == null) return null; const g = pct(b.revenue - a.revenue, a.revenue), m = pct(p, b.revenue);
      return { note: adj ? "Use the adjusted EBITDA margin." : "No EBITDA is disclosed, so use the operating margin as the nearest measure.", rows: rows(ys.slice(-2), [["revenue", "Revenue"], [adj ? "adj_ebitda" : "operating_profit", adj ? "Adjusted EBITDA" : "Operating profit"]]), years: ys.slice(-2),
        asks: [[`Revenue growth, ${a.fy} to ${b.fy}`, g, "%", 0.3, `(${f(b.revenue)} − ${f(a.revenue)}) ÷ ${f(a.revenue)}`], [`${adj ? "Adjusted EBITDA" : "Operating"} margin, ${b.fy}`, m, "%", 0.3, `${f(p)} ÷ ${f(b.revenue)}`], ["Rule of 40 score", g + m, "", 0.6, `${g.toFixed(1)} + ${m.toFixed(1)} = ${(g + m).toFixed(1)}${g + m >= 40 ? " (passes)" : " (below 40, as most mature vertical software is)"}`]] };
    },
    adjusted: ys => {
      const b = last(ys); if (b.adj_ebitda == null || !b.capitalised_dev || b.operating_profit == null) return null;
      return { note: "All three figures are for the latest year shown.", rows: rows(ys, [["adj_ebitda", "Adjusted EBITDA"], ["capitalised_dev", "Development capitalised"], ["operating_profit", "Statutory operating profit"]]), years: ys,
        asks: [[`Capitalised development as a share of adjusted EBITDA, ${b.fy}`, pct(b.capitalised_dev, b.adj_ebitda), "%", 0.5, `${f(b.capitalised_dev)} ÷ ${f(b.adj_ebitda)}`], [`Cash EBITDA (adjusted EBITDA less capitalised development), ${b.fy}`, b.adj_ebitda - b.capitalised_dev, "£k", 2, `${f(b.adj_ebitda)} − ${f(b.capitalised_dev)}`], [`Gap between adjusted EBITDA and statutory operating profit, ${b.fy}`, b.adj_ebitda - b.operating_profit, "£k", 2, `${f(b.adj_ebitda)} − ${b.operating_profit < 0 ? "(" + f(b.operating_profit) + ")" : f(b.operating_profit)}`]] };
    },
    revhead: ys => {
      const a = ys[0], b = last(ys); if (!b.headcount || !b.staff_costs || !b.revenue || !a.headcount || !a.staff_costs || ys.length < 2) return null;
      return { note: "Headcount is the average for each year, as filed.", rows: rows(ys, [["revenue", "Revenue"], ["staff_costs", "Staff costs"], ["headcount", "Average headcount"]]), years: ys,
        asks: [[`Revenue per head, ${b.fy}`, b.revenue / b.headcount, "£k", 0.6, `${f(b.revenue)} ÷ ${f(b.headcount)}`], [`Staff cost ratio, ${b.fy}`, pct(b.staff_costs, b.revenue), "%", 0.3, `${f(b.staff_costs)} ÷ ${f(b.revenue)}`], [`Change in staff cost ratio, ${a.fy} to ${b.fy} (percentage points)`, pct(b.staff_costs, b.revenue) - pct(a.staff_costs, a.revenue), "pp", 0.4, `${pct(b.staff_costs, b.revenue).toFixed(1)}% − ${pct(a.staff_costs, a.revenue).toFixed(1)}%`]] };
    },
    opleverage: ys => {
      if (ys.length < 2) return null; const a = ys[0], b = last(ys);
      if (a.operating_profit == null || b.operating_profit == null || Math.abs(b.revenue - a.revenue) < a.revenue * 0.03) return null;
      const dr = b.revenue - a.revenue, dp = b.operating_profit - a.operating_profit, im = pct(dp, dr);
      return { note: `Compare ${a.fy} with ${b.fy}, using statutory operating profit.`, rows: rows(ys, [["revenue", "Revenue"], ["operating_profit", "Operating profit"]]), years: ys,
        asks: [["Change in revenue", dr, "£k", 2, `${f(b.revenue)} − ${f(a.revenue)}`], ["Change in operating profit", dp, "£k", 2, `${f(b.operating_profit)} − ${f(a.operating_profit)}`], ["Incremental margin", im, "%", 0.6, `${f(dp)} ÷ ${f(dr)}. ${dr < 0 ? "Revenue fell, so read this as how much of each lost pound came off profit." : im > 100 ? "Over 100%: costs fell as well." : im < 0 ? "Negative: profit fell while revenue rose." : im >= 60 ? "High: growth from price and the existing base." : "Low: the growth needed new cost."}`]] };
    }
  };
})();
