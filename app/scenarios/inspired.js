/* Fictional challenge events inspired by real cases in the Case library. `inspired` = case id. */
(() => {
  const add = (id, evs) => { MDS.scenarios[id].events.push(...evs); };
  add("harbour", [
    { inspired: "dye-durham", title: "The customers organise", text: "After the first legacy price letters, twelve housing associations form a 'fair pricing group' and write jointly to Dave. One mentions a 2023 email from Dave promising 'no big changes for loyal customers'.", options: [
      { t: "Find and check the 2023 email with legal. Meet the group with Dave, listen, and offer a transparent phased path with a value review. Honour any genuine commitment.", fx: { founder: 4, team: 0, cust: 8, delivery: 2 }, s: 3, fb: "Organised customers in a professional market can escalate to lawsuits and regulators. Engaging openly, checking commitments and offering a fair path takes the heat out." },
      { t: "Ignore the group. Deal with customers one by one.", fx: { founder: -2, team: 0, cust: -12, delivery: 0 }, s: 0, fb: "Refusing to engage gives the group a story to tell. In professional markets, organised customers turn grievances into legal and regulatory action." },
      { t: "Cancel the legacy price programme.", fx: { founder: 6, team: 0, cust: 6, delivery: -12 }, s: 1, fb: "It ends the conflict, and most of the value with it. A fair, phased path usually keeps both." },
      { t: "Ask the Portfolio Manager to write to the group.", fx: { founder: -8, team: 0, cust: -2, delivery: 0 }, s: 0, fb: "Customers want to hear from the business they buy from, not its owner." }] },
    { inspired: "klarna-ai", title: "The deflection numbers look too good", text: "Three months into AI ticket deflection, the dashboard says 52% of how-to tickets are 'resolved'. Tom mentions that repeat contacts from the same customers have gone up.", options: [
      { t: "Sample the 'resolved' conversations, add a repeat-contact measure, and hold off reporting savings until quality is confirmed.", fx: { founder: 2, team: 4, cust: 6, delivery: 2 }, s: 3, fb: "Volume-based AI metrics can hide quality problems, as Klarna found. Measure resolution quality before you bank the savings." },
      { t: "Report the 52% to the PM as a win, and reduce support headcount.", fx: { founder: 0, team: -10, cust: -10, delivery: 2 }, s: 0, fb: "If 'resolved' isn't really resolved, you've cut capacity just as demand comes back, and you've made a public claim you may need to walk back." },
      { t: "Switch the AI off.", fx: { founder: -3, team: 2, cust: 0, delivery: -8 }, s: 1, fb: "An overreaction. Fix the measurement and the hand-off to humans instead." }] }
  ]);
  add("nordline", [
    { inspired: "quickbooks-uk", title: "The cloud product can't do what desktop does", text: "Wave two of the migration stalls: 18 logistics customers say the cloud product lacks multi-depot parts tracking, which desktop has. Two have started talking to a competitor.", options: [
      { t: "Prioritise multi-depot tracking for that segment, give them a dedicated migration manager and a bridge period on desktop, and agree dates in writing.", fx: { founder: 4, team: 2, cust: 10, delivery: 2 }, s: 3, fb: "Forced migrations make customers compare you with competitors. Closing the segment's gaps first turns a churn risk into a retention moment." },
      { t: "Hold the sunset date. They'll adapt.", fx: { founder: -2, team: 0, cust: -14, delivery: 3 }, s: 0, fb: "They won't adapt. They'll re-tender." },
      { t: "Delay the sunset for everyone by a year.", fx: { founder: 2, team: -4, cust: 4, delivery: -10 }, s: 1, fb: "This penalises every other customer and keeps double running costs going to fix one segment's gap." }] },
    { inspired: "sap-2024", title: "Too many volunteers", text: "To reduce desktop-maintenance roles, you offered voluntary exits. Nine people applied for five places, including your two best cloud engineers.", options: [
      { t: "Use the right to decline: accept the five that fit the plan, talk honestly with the two engineers about their future, and agree retention steps.", fx: { founder: 2, team: 4, cust: 0, delivery: 4 }, s: 3, fb: "Voluntary schemes attract your most marketable people. A company veto, used transparently, protects the capabilities you need." },
      { t: "Accept all nine: they volunteered.", fx: { founder: -4, team: -6, cust: -4, delivery: -10 }, s: 0, fb: "You've just lost the people the migration depends on." },
      { t: "Cancel the scheme and start again.", fx: { founder: 0, team: -6, cust: 0, delivery: -4 }, s: 1, fb: "Trust takes a hit when people have already applied." }] }
  ]);
  add("quill", [
    { inspired: "ai-fake-citations", title: "A citation that doesn't exist", text: "A pilot firm's partner calls: an associate nearly filed a witness statement drafted with Quill's AI that cited a case nobody can find.", options: [
      { t: "Thank them. Pause citation suggestions, add grounding to verified sources plus a 'check before filing' step, and tell every pilot firm what changed.", fx: { founder: 4, team: 2, cust: 10, delivery: 0 }, s: 3, fb: "Courts are holding firms responsible for supervising AI output, so your product must make verification easy. Being open with pilots builds trust you'll need to sell the tier." },
      { t: "Point to the terms: users must check outputs.", fx: { founder: 0, team: 0, cust: -12, delivery: 0 }, s: 0, fb: "Legally defensible, commercially fatal. Lawyers buy from vendors who help them stay safe." },
      { t: "Quietly fix it and say nothing.", fx: { founder: 0, team: 0, cust: -6, delivery: 2 }, s: 1, fb: "The pilot firms will talk to each other, and silence looks like hiding." }] },
    { inspired: "auris-earnout", title: "The earn-out milestone", text: "Graham's earn-out depends on Quill hitting a revenue milestone next year. Your plan shifts two engineers from Quill's client portal to the joint e-billing product.", options: [
      { t: "Take legal advice on the earn-out terms, discuss the trade-off openly with Graham, and document the business rationale.", fx: { founder: 8, team: 0, cust: 0, delivery: 2 }, s: 3, fb: "Earn-outs turn roadmap decisions into contractual questions. Openness and a documented rationale protect everyone." },
      { t: "Make the change. It's the right business call.", fx: { founder: -12, team: 0, cust: 0, delivery: 4 }, s: 1, fb: "Possibly right, but undocumented changes that affect an earn-out invite disputes, and Graham will feel ambushed." },
      { t: "Wait until the earn-out period ends.", fx: { founder: 4, team: 0, cust: 0, delivery: -8 }, s: 1, fb: "A year of drift isn't a plan. Address it openly now." }] }
  ]);
})();
