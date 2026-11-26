/* A day in the life, one per case. Times are 24h. imp = importance (0 = noise). s = quality of a response (0–3).
   fx keys: founder, pm, team, cust, energy, focus, flags[], resolves[], spawn{itemId: minutesFromNow}. */
(() => {
  const H = MDS.scenarios.harbour, N = MDS.scenarios.nordline, Q = MDS.scenarios.quill;

  H.days = [{
    id: "d12", when: "Tuesday 16 December 2026 · day 12", title: "The day the deadlines collide",
    labels: { founder: "Dave (founder)" },
    intro: "08:00. Coffee in hand, laptop open at the Leeds office. Twelve days in.",
    brief: "Your Portfolio Manager needs a one-page first view by 4pm for tomorrow's group review. You have a 1:1 with Dave at 11. The rest of the day is whatever lands.",
    deliverable: { title: "One-page first view for the Portfolio Manager", short: "PM one-pager", due: "16:00", need: 90, desc: "Baseline, the top five levers with rough sizes, and the top risks." },
    debrief: "Strong operators protect the hard deadlines (the ReportCo notice, the PM's 4pm) and keep the founder authoring decisions. They hold confidences, push customer comms to the incident owner instead of doing it themselves, and warn early when a deadline has to move.",
    items: [
      { id: "h1", at: "08:00", ch: "email", from: "Portfolio Manager", subject: "First view by 4pm?", imp: 2, deadline: "10:00",
        body: "Morning. Group review tomorrow, and I'd like your first read on Harbour in the pack. One page is fine: baseline, where the value is, what worries you. By 4pm please.",
        options: [
          { t: "Reply: \"Yes, by 4pm. One page: baseline, top five levers, top risks.\"", mins: 2, s: 3, fx: { pm: 3 }, fb: "Fast, specific and confirms scope. Now protect the time to do it." },
          { t: "Reply: \"Could we make it Friday? I'd rather give you something solid than a rushed read you have to walk back.\"", mins: 2, s: 1, fx: { pm: -6 }, fb: "The review is tomorrow. Right on Friday is no use to him. Give him your best view today, with caveats." },
          { t: "Reply with a detailed email now covering everything found so far, so he has the full picture before the review.", mins: 35, s: 1, fx: { pm: 1 }, fb: "He asked for one page by 4. You've spent 35 minutes and still owe it." }
        ], miss: { x: "The PM chased you at 10:00: \"Did you see my note?\"", fx: { pm: -5 } } },
      { id: "h2", at: "08:00", ch: "email", from: "ReportCo account manager", subject: "Your contract renewal: 15 April 2027", imp: 3, deadline: "17:00",
        body: "Hi, a courtesy note: your ReportCo agreement auto-renews on 15 April 2027 for three years at the new list price (+12%). The notice period is 120 days, so any changes need to reach us by close of business today.",
        options: [
          { t: "Send a protective notice of non-renewal now to beat the deadline, then brief Dave at 11 on why it couldn't wait.", mins: 15, s: 2, fx: { founder: -6, flags: ["noticeSent"] }, fb: "Deadline met, but Dave hears second-hand that you've served notice on a supplier in his company. A two-line message first would have cost nothing." },
          { t: "Teams Dave: \"ReportCo notice is due today. OK to send a protective notice under your name? It keeps our options open.\"", mins: 5, s: 3, fx: { founder: 2, flags: ["noticeAsk"], spawn: { h2b: 50 } }, fb: "Right call: the founder decides and you protect the deadline. Now make sure it actually goes." },
          { t: "Email the bookkeeper: \"Can you send ReportCo our notice today? Copy me in. It's just paperwork to protect us.\"", mins: 3, s: 0, fx: { pm: -8 }, fb: "She has no authority to serve notice and doesn't know the context. It doesn't go, and the contract auto-renews at £213k a year for three years." }
        ], miss: { x: "ReportCo auto-renewed: about £213k a year, locked in for three years. You owned the notice.", fx: { pm: -12, founder: -4 } },
        lesson: "Contract notice periods are hard deadlines. They beat almost everything else in the inbox." },
      { id: "h2b", at: "08:00", req: "sp_h2b", ch: "chat", from: "Dave Pryce", subject: "Re: ReportCo: yes, send it", imp: 3, deadline: "17:00",
        body: "Yeah go for it, never liked them. Cheers for flagging.",
        options: [
          { t: "Send the notice now under Dave's name and tell him when it's gone.", mins: 10, s: 3, fx: { founder: 2, flags: ["noticeSent"] }, fb: "Done, owned by the founder, and deadline met." },
          { t: "Reply: \"Great, I'll get it out this afternoon once I've checked the wording with the bookkeeper.\"", mins: 1, s: 1, fx: {}, fb: "Fine if it happens. You've put a contract deadline into a busy afternoon and added a step it doesn't need." }
        ], miss: { x: "You had Dave's OK, but the notice never went. ReportCo auto-renewed for three years.", fx: { pm: -12, founder: -6 } } },
      { id: "h3", at: "08:00", ch: "chat", from: "Leanne Ford", subject: "Need your OK on 35% for Riverside Homes 🙏", imp: 2, deadline: "12:00",
        body: "They sign today if we can do 35%. Competitor is at 30% off. It's £40k ARR. Can you OK it?",
        options: [
          { t: "\"Approve if they give us something back: a three-year term or a case study. Then let's design a deal desk together.\"", mins: 5, s: 3, fx: { team: 3 }, fb: "Trade, don't concede. You keep the deal, get value back, and start governance with Leanne as co-owner." },
          { t: "Reply: \"Approved, it's £40k and they're ready today. But this is the last one: from January anything over 20% comes to me.\"", mins: 1, s: 1, fx: { team: 2 }, fb: "Easy today, and \"the last one\" never is. The cap is now negotiable." },
          { t: "Reply: \"Policy is 20%, no exceptions. If we bend on day one, every rep will ask for the same next week.\"", mins: 1, s: 1, fx: { team: -8 }, fb: "A policy that only says no gets worked around, and Leanne is someone you need on side." }
        ], miss: { x: "Leanne approved the 35% herself at noon. The discount cap is now optional.", fx: { team: -2, pm: -2 } } },
      { id: "h4", at: "08:05", ch: "email", from: "Bookkeeper", subject: "Debtors report + quick question", imp: 2,
        body: "Debtors report attached as requested.\nAlso, the November payroll file has two new starters (both engineers) that Dave added last week. Just checking you know, as you said to flag anything unusual?",
        options: [
          { t: "Thank her. Add \"new hires\" to your 11:00 1:1 with Dave.", mins: 2, s: 3, fx: { flags: ["hires"] }, fb: "Good. Raise it in person, without accusation. You need to understand before you react." },
          { t: "Email Dave: \"Bookkeeper flagged two new engineers on payroll. Can you walk me through these? I'd expected to be told.\"", mins: 3, s: 0, fx: { founder: -10 }, fb: "However politely worded, it reads as an accusation, on day 12, to the founder of his own company. You'll be managed around from now on." },
          { t: "Forward it to the Portfolio Manager: \"FYI, unbudgeted hires. Raising so you're not surprised at group review.\"", mins: 2, s: 0, fx: { founder: -8, pm: 1 }, fb: "Going over the founder's head before you've even asked him. He'll find out." }
        ], miss: { x: "You never followed up. Two more engineers went onto Mobile 2 without anyone questioning it.", fx: { pm: -3 } } },
      { id: "h5", at: "08:10", ch: "chat", from: "Tom Reid (Support Lead)", subject: "Heads up: Northshore login issues", imp: 2, deadline: "11:00",
        body: "Northshore Homes have had login problems since 7am. Dev are looking. Just so you know.",
        options: [
          { t: "\"Thanks Tom. Who's the incident lead, and who's updating Northshore every hour?\"", mins: 3, s: 3, fx: { cust: 4, team: 2, flags: ["incident"] }, fb: "You don't fix it. You make sure someone owns it and the customer hears from you regularly." },
          { t: "Join the incident bridge and run it yourself until logins are back. Northshore is your biggest customer.", mins: 60, s: 1, fx: { cust: 5, energy: -5 }, fb: "Customers feel cared for, but you've lost an hour from a deadline day and taught the team you'll step in." },
          { t: "Reply \"Thanks Tom, keep me posted 👍\" and get back to the one-pager.", mins: 1, s: 1, fx: {}, fb: "Acknowledged, but nobody owns customer comms, and \"keep me posted\" isn't a plan." }
        ], miss: { x: "Northshore's CEO emailed Dave at 11:00: \"Nobody has updated us all morning.\"", fx: { cust: -10, founder: -4 } } },
      { id: "h6", at: "08:30", ch: "email", from: "Office manager (all staff)", subject: "Car park resurfacing on Thursday", imp: 0,
        body: "Please park on Kirkstall Road on Thursday. Thanks!",
        options: [{ t: "Reply-all \"Thanks!\"", mins: 1, s: 1, fx: {}, fb: "Please don't reply-all to all-staff emails." }] },
      { id: "m1", at: "09:00", ch: "meeting", title: "Leadership stand-up", dur: 30, from: "Dave (chair), Leanne, Priya, Tom", who: "founder", imp: 2,
        body: "Round the table: Northshore incident, Q4 bookings, a hiring update. Dave closes: \"And I've told Kieran Mobile 2 launches in March. We're all behind that.\" Everyone looks at you.",
        options: [
          { t: "Challenge it in the room: \"Before we commit to Kieran, can we check the data supports March? I'd hate us to miss a promised date.\"", s: 0, fx: { founder: -12, team: -2 }, fb: "Right question, wrong room. Contradicting a founder in front of his team on day 12 makes you an opponent." },
          { t: "Nod, and ask to go through the Mobile 2 plan with him in your 1:1.", s: 3, fx: { founder: 2, flags: ["mob"] }, fb: "You signal interest without confrontation, and move the real conversation somewhere private." },
          { t: "Say nothing, and plan to raise March with Dave privately next week once you have the numbers.", s: 1, fx: {}, fb: "Safe, but silence in the room reads as agreement, and Kieran now has a date." }
        ] },
      { id: "w1", at: "10:15", ch: "walkup", from: "Kieran Doyle, lead engineer", subject: "\"Got a minute? Off the record.\"", imp: 3,
        body: "He closes the door. \"I've had an offer from a competitor. I don't want to leave, but I'm sick of building an app nobody asked for while scheduling falls apart.\"",
        options: [
          { t: "Sit down now. Ask what would make him stay, and raise the roadmap with Dave without naming him.", mins: 20, s: 3, fx: { team: 8, flags: ["kieran"] }, fb: "Key-person retention beats almost anything else this morning. You listened, kept his confidence and gave him a reason to wait." },
          { t: "\"I want to hear this properly. Can we grab 30 minutes at 5, once the one-pager's off my plate?\"", mins: 2, s: 1, fx: { team: -4 }, fb: "He's told you he has an offer. By 5 he may have decided." },
          { t: "\"Thanks for being open. I'll need to let Dave know, but I'll make the case for scheduling.\"", mins: 5, s: 0, fx: { team: -15, founder: 2 }, fb: "You've broken a confidence. Nobody will tell you anything off the record again." }
        ] },
      { id: "m2", at: "11:00", ch: "meeting", title: "1:1 with Dave", dur: 45, from: "Dave Pryce", who: "founder", imp: 3,
        body: "Dave's office. He looks tired.",
        steps: [
          { q: "How do you open?", options: [
            { t: "Ask what's keeping him up at night.", s: 3, fx: { founder: 6 }, fb: "Listening first earns you the right to be heard." },
            { t: "Walk through your six-point agenda so he knows exactly what you'll cover and nothing feels hidden.", s: 1, fx: { founder: -2 }, fb: "Efficient, but it feels like an audit." },
            { t: "Lead with the numbers: \"Margin is 13% and falling. I want to be straight with you about where we are.\"", s: 1, fx: { founder: -4 }, fb: "True, but it puts him on the defensive in his own office." }] },
          { q: "\"Honestly? Cash. And whether you lot will kill Mobile 2.\"", options: [
            { t: "Propose a joint Mobile 2 review in January on requests, revenue and cost. His call at the end.", s: 3, fx: { founder: 6, flags: ["mobReview"] }, fb: "Evidence plus founder authorship: the only way a pet project gets reconsidered without a fight." },
            { t: "Tell him plainly: \"I think Mobile 2 should stop. Better you hear it from me now than from the group later.\"", s: 0, fx: { founder: -15 }, fb: "Maybe right. On day 12, without evidence he's seen, it's a fight you'll lose." },
            { t: "Reassure him: \"Nobody's killing Mobile 2. My job is to help you build, not to cut what you care about.\"", s: 0, fx: { founder: 4 }, fb: "Comfort now, betrayal later." }] },
          { q: "Ten minutes left. What do you use them for?", options: [
            { t: "Ask what the two new engineers are for, and agree a quick joint check before future hires.", req: "hires", s: 3, fx: { founder: 2 }, fb: "Raised as a question, not an accusation, with a light-touch control agreed." },
            { t: "Get his sign-off on the ReportCo notice, then send it under his name straight after the meeting.", req: "noticeAsk", s: 3, fx: { flags: ["noticeSent"], resolves: ["h2b"] }, fb: "Deadline protected, founder decided." },
            { t: "Agree a standing 30-minute weekly slot, so issues like these come up routinely rather than by surprise.", s: 2, fx: { founder: 3 }, fb: "Good habit. Was there anything more urgent?" },
            { t: "Wrap up early: \"I'll let you get on. I need to finish the one-pager for the group review.\"", s: 1, fx: { founder: -2 }, fb: "Leaving early on your first proper 1:1 sends the wrong signal." }] }
        ] },
      { id: "h7", at: "11:50", ch: "email", from: "Mark Collins → Leanne (cc you)", subject: "RE: this new discount nonsense", imp: 1,
        body: "With respect, whoever thinks we can win councils at 20% off has never sold to one. If this goes ahead I'll be talking to recruiters.",
        options: [
          { t: "Don't reply-all. Ask Leanne for 10 minutes to hear the sales team's view first-hand.", mins: 3, s: 3, fx: { team: 2 }, fb: "Take it offline, listen, and work through the line manager." },
          { t: "Reply-all calmly explaining the policy and why it exists, so the whole team sees the reasoning rather than the rumour.", mins: 15, s: 0, fx: { team: -6 }, fb: "Email arguments with an angry salesperson never end well." },
          { t: "Forward it to Dave: \"Worth knowing. Mark is threatening to leave over the discount cap.\"", mins: 2, s: 1, fx: { team: -3 }, fb: "Escalating noise. Leanne is his manager." }
        ], miss: { x: "Mark's email went unanswered. The sales team read your silence as dismissal.", fx: { team: -3 } } },
      { id: "h8", at: "13:10", ch: "chat", from: "Portfolio Manager", subject: "Quick one: Harbour AI plans?", imp: 2, deadline: "14:00",
        body: "Group CFO is asking about Harbour's AI plans specifically. I'm in with him at 2. Anything?",
        options: [
          { t: "\"No AI revenue yet. Five engineers could pivot to it, and I'll have a pilot proposal by end of January.\"", mins: 4, s: 3, fx: { pm: 5 }, fb: "Honest, specific, gives him something to say, and commits only to what you control." },
          { t: "\"Tell him a Q1 launch of an AI tier is realistic. We've got the engineers, and it shows Harbour is moving.\"", mins: 2, s: 0, fx: { pm: 3 }, fb: "You've committed the business to something the founder hasn't agreed and R&D hasn't scoped. It'll come back." },
          { t: "\"To be honest, I'd rather not give him half a view. It's all in the one-pager at 4.\"", mins: 1, s: 1, fx: { pm: -3 }, fb: "He's in with the CFO at 2. That doesn't help him." }
        ], miss: { x: "The PM went into the CFO meeting with nothing on AI.", fx: { pm: -6 } } },
      { id: "h9", at: "13:30", ch: "email", from: "Recruiter (LinkedIn)", subject: "Exciting Transformation Director opportunity!", imp: 0,
        body: "Hi! Saw your profile. Would love a quick chat about an exciting opportunity...",
        options: [{ t: "Reply politely to keep the door open.", mins: 5, s: 1, fx: {}, fb: "Not today." }] },
      { id: "m3", at: "14:00", ch: "meeting", title: "PS weekly with Priya", dur: 30, from: "Priya Shah", who: "team", optional: true, imp: 2, declineFx: { team: -5 }, declineX: "Priya notices you've bailed on her first proper weekly.",
        body: "Priya: \"Westbury Living's implementation is 40% over budget. They're refusing to pay for the extra days. Can I give them six free days to keep the peace?\"",
        options: [
          { t: "Check the change log. Absorb overruns on agreed scope, fixed-price the real changes, and make this the change-control template.", s: 3, fx: { team: 4, cust: 2 }, fb: "Fair to the customer, and it turns a one-off fight into the process fix PS needs." },
          { t: "\"Yes, give them the six days. Westbury renews next year, and a row over a few days isn't worth the relationship.\"", s: 1, fx: { cust: 3 }, fb: "Keeps the peace and confirms the pattern behind the 18% free days." },
          { t: "\"No. They signed the SOW, so they pay for every extra day. If we cave now, every customer will try it.\"", s: 1, fx: { cust: -6 }, fb: "Some of the overrun was probably our scoping. Hold the line on what's fair, not on everything." }
        ] },
      { id: "h11", at: "15:30", ch: "chat", from: "Dave Pryce", subject: "Can you join the Northshore call at 4?", imp: 3, deadline: "15:55",
        body: "Northshore's CEO wants a call about this morning. 4pm. Can you join? Would help to have you there.",
        options: [
          { t: "Join, and message the PM first: \"Customer escalation at 4. One-pager with you by 5.30.\"", mins: 3, s: 3, fx: { founder: 4, flags: ["warnedPM", "joinCall"] }, fb: "Choose the customer and the founder, and reset the deadline before you miss it, not after." },
          { t: "Decline: \"I'd love to, but I owe the PM a one-pager at 4. You know Northshore far better than I do anyway.\"", mins: 2, s: 1, fx: { founder: -8 }, fb: "The founder asked for help with his biggest customer. That's hard to come back from." },
          { t: "Join, and plan to finish the one-pager straight after. The PM only needs it for tomorrow morning anyway.", mins: 2, s: 2, fx: { founder: 4, flags: ["joinCall"] }, fb: "Right priority, but you're about to miss a deadline without warning anyone." }
        ], miss: { x: "Dave took the Northshore call alone. He felt you weren't there when it mattered.", fx: { founder: -8 } } },
      { id: "m4", at: "16:00", req: "joinCall", ch: "meeting", title: "Northshore escalation call", dur: 40, from: "Northshore CEO, Dave", who: "cust", imp: 3,
        body: "Northshore's CEO: \"Five hours this morning without a single update. We're reviewing our options.\"",
        options: [
          { t: "Let Dave lead. Add the fix: a named incident lead, hourly updates, and a written review within 48 hours.", s: 3, fx: { cust: 10, founder: 5 }, fb: "The founder owns the relationship and you add the operating discipline. The customer hears a plan, not an apology." },
          { t: "Apologise properly and offer a month free: \"We let you down this morning, and we want to make that right.\"", s: 1, fx: { cust: 4, founder: -3 }, fb: "You've given away money without fixing why it happened." },
          { t: "Walk them through the technical root cause in detail, so they can see exactly what failed and that it's understood.", s: 1, fx: { cust: -2 }, fb: "They want to know it won't happen again, not how it happened." }
        ] },
      { id: "w2", at: "17:30", ch: "walkup", from: "Dave Pryce", subject: "\"Fancy a pint? Want to talk Mobile 2 properly.\"", imp: 2,
        body: "Dave leans on your desk, coat on.",
        options: [
          { t: "Yes, one drink and a proper conversation.", mins: 60, s: 3, fx: { founder: 10, energy: -8 }, fb: "Founders decide who to trust over a drink as often as in a meeting." },
          { t: "Not tonight. Suggest breakfast on Thursday instead, when you're both fresher and can do it properly.", mins: 2, s: 2, fx: { founder: 2 }, fb: "Reasonable and keeps it on the table." },
          { t: "\"I'd love to, but I've got the one-pager to finish. Another night?\"", mins: 2, s: 1, fx: { founder: -4 }, fb: "True, but he offered an olive branch." }
        ] }
    ]
  }];

  N.days = [{
    id: "m3", when: "Monday 18 January 2027 · month 3", title: "Everyone wants a piece of you",
    labels: { founder: "Co-founders" },
    intro: "08:00, Gothenburg. Snow outside. A full calendar and a proposal due tonight.",
    brief: "Thursday's co-founder session decides the desktop sunset. Anna needs your proposal by 5pm today so she and Erik can read it before Thursday. Everything else today is either noise or a fire.",
    deliverable: { title: "Desktop sunset proposal for Anna and Erik", short: "Sunset proposal", due: "17:00", need: 110, desc: "Customer-by-customer renewal dates, migration waves, exceptions policy, and the cost of delay." },
    debrief: "Today tested whether you protect the work that unlocks everything (the sunset proposal), keep the law and the union on side, look after a burnt-out single point of failure, and refuse distractions that would quietly derail the migration.",
    items: [
      { id: "n1", at: "08:00", ch: "email", from: "Union representative", subject: "Request: MBL information meeting", imp: 3, deadline: "12:00",
        body: "Under the Co-determination Act we request information on any plans to move development work to the Valsoft dev centre before decisions are taken. Please propose a time this week.",
        options: [
          { t: "Reply, cc Anna and HR: no decision has been taken, and propose an information meeting on Wednesday.", mins: 8, s: 3, fx: { team: 6, founder: 2 }, fb: "Correct under MBL and builds trust. No decision is made before consultation." },
          { t: "Reply to reassure: \"There are no plans to move jobs. We'll keep you informed if anything changes.\"", mins: 3, s: 0, fx: { team: 3, pm: -4 }, fb: "If the dev-centre option goes ahead, you've misled the union in writing." },
          { t: "Forward to HR: \"Can you handle this? Union processes are your area and I don't want to get the wording wrong.\"", mins: 2, s: 1, fx: { team: -3 }, fb: "HR should be involved, but the union wants to hear from whoever's driving the change." }
        ], miss: { x: "The union rep escalated to Anna: \"Your new transformation lead ignores formal requests.\"", fx: { team: -8, founder: -5 } } },
      { id: "n2", at: "08:00", ch: "chat", from: "DevOps lead", subject: "AWS bill +30%. Also, can we talk today?", imp: 2,
        body: "December AWS came in 30% higher. Double-running plus a forgotten test cluster. I've killed the cluster. Also, can we talk at some point today? It's not about AWS.",
        options: [
          { t: "\"Thanks for killing it. Yes, come and find me late morning.\"", mins: 2, s: 3, fx: { team: 4, flags: ["devopsTalk"] }, fb: "Thank the fix and make time for the person." },
          { t: "\"Thanks. How did a test cluster get forgotten? Let's get a tagging rule in so it can't happen again.\"", mins: 3, s: 0, fx: { team: -8 }, fb: "He fixed it and told you. Leading with blame teaches people to stop telling you, and you missed his second question." },
          { t: "\"Good catch, thanks. Can you send me a breakdown of the rest of the bill by Friday?\"", mins: 1, s: 1, fx: {}, fb: "Efficient, but you missed the second, more important message." }
        ], miss: { x: "You never replied to the DevOps lead's request to talk.", fx: { team: -5 } } },
      { id: "n3", at: "08:20", ch: "email", from: "Göteborg Region (procurement)", subject: "Migration to cloud: our position", imp: 2,
        body: "Our procurement rules do not permit moving to a new hosting model until our framework is re-tendered in 2028. Please confirm the desktop product will remain supported until then.",
        options: [
          { t: "Acknowledge it, promise an extension option by month end, and add them as an exception case in today's proposal.", mins: 6, s: 3, fx: { cust: 4, focus: 10 }, fb: "Don't commit on the spot, and use it to sharpen the proposal." },
          { t: "Reply: \"Understood. We'll keep desktop supported for you until your re-tender in 2028.\" They're 7% of ARR.", mins: 2, s: 0, fx: { cust: 5, founder: -6 }, fb: "You've just set the sunset date for everyone, without the co-founders." },
          { t: "Reply: \"The sunset date applies to all customers, but we'll help you through procurement.\"", mins: 3, s: 0, fx: { cust: -12 }, fb: "7% of ARR now has a reason to tender." }
        ], miss: { x: "Göteborg Region heard nothing back and called Anna directly.", fx: { cust: -6, founder: -3 } } },
      { id: "m1", at: "09:00", ch: "meeting", title: "Co-founder weekly", dur: 45, from: "Anna Lind, Erik Holm", who: "founder", imp: 3,
        body: "Ten minutes in, Erik and Anna are arguing again about desktop. Erik: \"Switch it off in June.\" Anna: \"We'll lose the municipalities.\"",
        steps: [
          { q: "What do you do?", options: [
            { t: "Name the disagreement neutrally: Thursday decides it, on customer-by-customer data you'll send today.", s: 3, fx: { founder: 6 }, fb: "You turn opinion into evidence and give the decision a date." },
            { t: "Side with Erik: \"June is achievable if we commit. Every month of double-running costs us money.\"", s: 0, fx: { founder: -10 }, fb: "Now Anna sees you as Erik's ally." },
            { t: "Stay quiet and let them argue it out. It's their company, and you'll learn where each of them really stands.", s: 1, fx: { founder: -2 }, fb: "They've been working it out for a year." }] },
          { q: "Erik: \"Fine. But I need the DevOps lead for the Route Optimiser demo on Wednesday.\"", options: [
            { t: "Ask what the demo needs, and agree a half-day with a backup person, protecting migration time.", s: 3, fx: { founder: 4 }, fb: "Trade, don't block. Both priorities get a fair hearing." },
            { t: "Refuse: \"The migration comes first. If DevOps goes to demos, we'll be double-running into summer.\"", s: 1, fx: { founder: -6 }, fb: "Maybe right, but a flat no to a co-founder costs you." },
            { t: "Agree: \"Of course, the demo matters. Take him for Wednesday and we'll catch up on migration later.\"", s: 1, fx: { founder: 3 }, fb: "And the migration slips again." }] }
        ] },
      { id: "w1", at: "11:15", req: "devopsTalk", ch: "walkup", from: "DevOps lead", subject: "\"About that chat...\"", imp: 3,
        body: "\"I'm the only one on call. I've been woken up eleven times this month. I'm not sure I can do this migration on my own.\"",
        options: [
          { t: "Agree a second on-call engineer this week, and ask what else would make the migration doable.", mins: 25, s: 3, fx: { team: 10, energy: -3 }, fb: "Your single point of failure was about to burn out. This was the most important 25 minutes of the day." },
          { t: "Reassure him: \"I hear you. It'll calm down after the migration, and we'll look at on-call then.\"", mins: 5, s: 0, fx: { team: -12 }, fb: "He's telling you he might not make it to the end of the migration." },
          { t: "Offer a retention bonus for seeing the migration through, and promise to listen to whatever else he needs.", mins: 10, s: 1, fx: { team: 4 }, fb: "Money and promises don't fix being woken eleven times a month." }
        ] },
      { id: "n4", at: "11:40", ch: "chat", from: "Sofia Berg (Support Manager)", subject: "3 customers didn't renew on 1 Jan", imp: 2, deadline: "15:00",
        body: "Three small fleets didn't renew. All on desktop, none contacted since go-live. I'd like to start calling the 40 biggest accounts this week. OK?",
        options: [
          { t: "\"Yes. Start with renewals due before June. Log why people stay or go, and let's review on Friday.\"", mins: 4, s: 3, fx: { cust: 6, team: 4 }, fb: "Empower the owner, focus on the revenue at risk, and set a check-in." },
          { t: "\"Good idea, but let's wait until the CS business case is approved so we do it properly, with a script.\"", mins: 2, s: 0, fx: { team: -6, cust: -4 }, fb: "Calling your own customers doesn't need a business case." },
          { t: "\"Leave the top ten to me. I'll make those calls myself, so the customers hear it from leadership.\"", mins: 3, s: 1, fx: { energy: -5 }, fb: "And who does it after you leave?" }
        ], miss: { x: "Sofia waited for an answer that never came.", fx: { team: -5, cust: -3 } } },
      { id: "n5", at: "13:00", ch: "email", from: "Portfolio Manager", subject: "AI story for Friday", imp: 1,
        body: "Group wants every portfolio company's AI story by Friday. Short paragraph is fine.",
        options: [
          { t: "Reply that you'll send it by Thursday. Note it for tomorrow.", mins: 2, s: 3, fx: { pm: 2 }, fb: "Acknowledge and schedule. It isn't today's work." },
          { t: "Write it now while it's fresh. It's only a paragraph and it'll keep the PM happy.", mins: 40, s: 1, fx: { pm: 3 }, fb: "Not due until Friday, and it's eating your proposal time." }
        ] },
      { id: "n6", at: "13:30", ch: "email", from: "Monitoring tool vendor", subject: "Upgrade to Enterprise and save 10%!", imp: 0,
        body: "Limited-time offer...", options: [{ t: "Book a demo.", mins: 30, s: 0, fx: {}, fb: "You're paying for two monitoring tools already." }] },
      { id: "n7", at: "15:45", ch: "chat", from: "Anna Lind", subject: "Push Thursday?", imp: 2, deadline: "16:30",
        body: "Board pack is due Friday. Can we push the sunset session to next week?",
        options: [
          { t: "\"Each week of delay costs about £30k in double hosting. Could we do 60 minutes on Thursday instead?\"", mins: 3, s: 3, fx: { founder: 3, pm: 2 }, fb: "Make the cost of delay visible, and offer a smaller ask." },
          { t: "\"Of course. The board pack matters more this week, and I'd rather you came to it with a clear head.\"", mins: 1, s: 1, fx: { founder: 2 }, fb: "And the decision slips another week." },
          { t: "Message the PM: \"Anna wants to push the sunset decision again. Can you help hold Thursday?\"", mins: 3, s: 0, fx: { founder: -10 }, fb: "Over a diary clash?" }
        ], miss: { x: "No answer, so Anna moved the session to next week.", fx: { pm: -3 } } },
      { id: "w2", at: "16:30", ch: "walkup", from: "Nils Åberg (Route Optimiser lead)", subject: "\"Is Route Optimiser being killed?\"", imp: 2,
        body: "\"The team's asking. People are updating their LinkedIn.\"",
        options: [
          { t: "\"No decision yet. Erik and I will review it on evidence, and the team will hear first.\"", mins: 10, s: 3, fx: { team: 6 }, fb: "Honesty about the process, even without the answer, stops rumours spreading." },
          { t: "\"Off the record, it's safe. Tell the team to stop worrying and put their energy into Wednesday's demo.\"", mins: 2, s: 0, fx: { team: 3 }, fb: "You don't know that." },
          { t: "\"That's really one for Erik. I'd rather you heard it from him than second-hand from me.\"", mins: 1, s: 1, fx: { team: -3 }, fb: "He's asking you because he thinks you know." }
        ] }
    ]
  }];

  Q.days = [{
    id: "m6", when: "Thursday 13 May 2027 · month 6", title: "Two companies, one of you",
    labels: { founder: "Graham (founder)" },
    intro: "08:00, Manchester. You were in Madrid until late last night.",
    brief: "The PM wants a go/no-go paper on the AI drafting pilot by 3pm. Paid launch or stop. Meanwhile, the integration is live, and so is the founder.",
    deliverable: { title: "AI pilot go/no-go paper for the PM", short: "Go/no-go paper", due: "15:00", need: 90, desc: "Pilot conversion, willingness to pay, the data protection position, cost to launch, and your recommendation." },
    debrief: "Today was about governance under pressure: not launching AI before the data position is signed, stopping unilateral integration moves without humiliating the person who made them, handling a grievance properly, and keeping a founder who's halfway out the door.",
    items: [
      { id: "q1", at: "08:00", ch: "email", from: "Data protection officer", subject: "AI data statement: two decisions needed", imp: 3, deadline: "12:00",
        body: "To finalise the data processing statement for the pilot firms I need two decisions: (1) EU-only data residency? (2) Confirm the model provider won't train on customer data (their enterprise terms allow this). Pilot firms are waiting.",
        options: [
          { t: "Confirm both: EU-only residency and no training. Ask her to send the statement to the pilot firms today.", mins: 6, s: 3, fx: { cust: 6, flags: ["dpoDone"], focus: 10 }, fb: "Decisive on the gate that unlocks the whole AI line. It also strengthens your paper." },
          { t: "Reply: \"Let's settle both once the go/no-go paper is done at 3, so the data position matches the decision.\"", mins: 2, s: 0, fx: { cust: -4 }, fb: "The data position is an input to go/no-go, not a consequence of it." },
          { t: "Forward to Graham: \"These are owner decisions. Can you confirm both when you're in at 10?\"", mins: 2, s: 1, fx: {}, fb: "He's the owner, but he's not at his desk until 10." }
        ], miss: { x: "The DPO's noon deadline passed. Two pilot firms paused their trial.", fx: { cust: -8 } } },
      { id: "q2", at: "08:00", ch: "chat", from: "Carmen Vidal (Lexia MD)", subject: "Moved 2 UK queues to Madrid overnight 🙂", imp: 3,
        body: "Quick win! We moved the UK billing and templates ticket queues to Madrid overnight to test. Our team is great. Let's discuss later!",
        options: [
          { t: "Call her. Thank her, ask for a rollback today until UK-hours service levels are signed, and offer to fast-track them.", mins: 15, s: 3, fx: { team: 4, founder: 4 }, fb: "You stop a unilateral move without humiliating an ally, and keep the speed she wants." },
          { t: "Reply \"Great initiative! Let's review the numbers at Friday's catch-up.\" Momentum with Lexia matters.", mins: 1, s: 0, fx: { team: -10, founder: -10 }, fb: "UK staff and Graham find out from a customer that their queues moved overnight." },
          { t: "Email the Portfolio Manager: \"Lexia moved UK queues without approval. Flagging before customers notice.\"", mins: 4, s: 1, fx: { team: -2 }, fb: "Escalating before talking to her damages your best integration ally." }
        ], miss: { x: "Nobody responded. UK customers got Spanish-hours replies all morning, and Graham heard from a client.", fx: { cust: -6, founder: -8 } } },
      { id: "q3", at: "08:15", ch: "email", from: "Margaret Byrne (UK support, 12 years)", subject: "Formal concern", imp: 2,
        body: "I'm writing formally because I've heard our jobs are moving to Madrid, and nobody has told us anything. I've been here 12 years. I'd like a meeting.",
        options: [
          { t: "Reply personally today: offer a meeting with HR this week, and say plainly what is and isn't decided.", mins: 8, s: 3, fx: { team: 8 }, fb: "Fast, human, and honest. A formal concern needs a proper process, and it starts with respect." },
          { t: "Forward to HR: \"Formal concern from Margaret. Can you acknowledge it and follow the grievance process?\"", mins: 2, s: 1, fx: { team: -4 }, fb: "Procedurally fine, but it feels like being processed." },
          { t: "Reply: \"Thanks Margaret. I can't comment until the consultation starts, but I'll be honest with you then.\"", mins: 1, s: 0, fx: { team: -8 }, fb: "A holding reply that says nothing confirms the rumour." }
        ], miss: { x: "Margaret's email sat unanswered. She told the team you'd ignored her.", fx: { team: -8 } } },
      { id: "m1", at: "09:30", ch: "meeting", title: "Quill leadership", dur: 45, from: "Graham Holt, Head of PS, Sales lead", who: "founder", imp: 3,
        body: "Graham, energised: \"Law Society conference next week. We announce the AI drafting tier and take orders on the stand.\"",
        steps: [
          { q: "Your response?", options: [
            { t: "Back his energy: announce pilot results and a waitlist at the conference, and launch paid once the DPO statement is final.", s: 3, fx: { founder: 6 }, fb: "You keep his story and his moment, without selling something the data position doesn't support yet." },
            { t: "\"We can't. There's no signed data statement, and lawyers will ask. Let's aim for the autumn conference.\"", s: 1, fx: { founder: -8 }, fb: "Correct but deflating, with no alternative offered." },
            { t: "Agree, and take orders on the stand. \"Subject to contract\" protects us while the DPO finishes the statement.", s: 0, fx: { founder: 6, cust: -6 }, fb: "Lawyers will ask where their client data goes before they sign, \"subject to contract\" or not. You don't have the answer in writing." }] }
        ] },
      { id: "w1", at: "10:45", ch: "walkup", from: "Head of PS", subject: "\"We've got a problem with Kendall Marsh LLP\"", imp: 2,
        body: "\"Their migration is 60% over. The managing partner says he'll post about us on the Law Society forum unless we finish it free.\"",
        options: [
          { t: "Go through the change log with him now. Absorb what was in scope, cap the price on the rest, and call the partner together.", mins: 25, s: 3, fx: { cust: 5, team: 4 }, fb: "Fair, documented, and it builds the change-control muscle." },
          { t: "\"Finish it free and get it closed. One angry post on the Law Society forum would cost far more than the days.\"", mins: 2, s: 1, fx: { cust: 3, team: -2 }, fb: "And the next one will threaten the forum too." },
          { t: "\"Tell him we'll see him in court if he posts. We're not a charity, and the contract is clear.\"", mins: 2, s: 0, fx: { cust: -10 }, fb: "Small, connected market. Reputation travels." }
        ] },
      { id: "q4", at: "11:30", ch: "email", from: "Portfolio Manager", subject: "Cash: should we pause the AI pilot?", imp: 2, deadline: "14:00",
        body: "Quill is still burning cash. Before your paper, a straight question: should we pause AI spend until the cost-out lands?",
        options: [
          { t: "\"Not pause: stage-gate it. Pilot cost is small, conversion is the gate, and the cost-out funds it. Numbers at 3.\"", mins: 4, s: 3, fx: { pm: 5 }, fb: "Answer a cash question with numbers and a decision gate." },
          { t: "\"No. AI is the strategic bet the group bought Quill for. Pausing now would hand our lead to competitors.\"", mins: 2, s: 0, fx: { pm: -6 }, fb: "\"Strategic\" without numbers loses to cash every time." },
          { t: "\"Yes, pause it until the cost-out lands. Cash first, and we can restart the pilot in the autumn.\"", mins: 1, s: 1, fx: { pm: 2, founder: -6 }, fb: "You've just killed the founder's project in an email." }
        ], miss: { x: "No reply before the PM's 2pm cash call.", fx: { pm: -5 } } },
      { id: "q5", at: "12:15", ch: "email", from: "Partner, Ferris Hale LLP (pilot firm)", subject: "Loved the drafting. Price?", imp: 2,
        body: "Our associates loved the drafting pilot. What will it cost per user? We'd like to budget for June.",
        options: [
          { t: "Thank her, ask for 15 minutes on the value they saw, and say pricing will follow within two weeks.", mins: 5, s: 3, fx: { cust: 5, focus: 10 }, fb: "Willingness-to-pay evidence for your paper, and you don't quote a price on the hoof." },
          { t: "Reply: \"Delighted! It'll be £50 a user a month. Happy to send an order form so you can budget for June.\"", mins: 3, s: 0, fx: { cust: 3 }, fb: "Competitors charge about £150. You've anchored low with your best reference customer." }
        ] },
      { id: "q6", at: "13:00", ch: "chat", from: "Lexia Finance Manager", subject: "Payroll shared service: sign-off?", imp: 2,
        body: "UK payroll goes live on our Madrid system next week. Can you sign off the UK employee data transfer?",
        options: [
          { t: "Not yet. Ask HR and the DPO to confirm the transfer basis and that staff have been told, aiming for this week.", mins: 5, s: 3, fx: { team: 3 }, fb: "Moving employee personal data across entities needs a documented basis, and employees need telling." },
          { t: "Sign it: \"Approved. Same group, so it's an internal transfer. Please make sure HR has a copy on file.\"", mins: 1, s: 0, fx: { team: -4 }, fb: "Same group doesn't mean no checks. You're not the right person to approve a personal data transfer without them." }
        ] },
      { id: "q7", at: "14:20", ch: "email", from: "Legal tech newsletter", subject: "10 AI trends every law firm must know", imp: 0,
        body: "...", options: [{ t: "Read it now.", mins: 15, s: 0, fx: {}, fb: "Forty minutes to your deadline." }] },
      { id: "w2", at: "16:00", ch: "walkup", from: "Graham Holt", subject: "\"Have you got ten minutes?\"", imp: 3,
        body: "He shuts the door. \"I'll be honest. I'm thinking of going. It doesn't feel like my company any more.\"",
        options: [
          { t: "Hear him out, then offer something real: lead the UK AI product, with a clear target and a say in integration.", mins: 30, s: 3, fx: { founder: 15 }, fb: "Status plus purpose. You can't buy a founder's commitment, but you can give him something worth staying for." },
          { t: "Remind him gently of the earn-out: \"You've built so much here. It'd be a shame to walk away before it pays out.\"", mins: 5, s: 0, fx: { founder: -10 }, fb: "Contractual leverage keeps his body, not his heart." },
          { t: "Tell the PM straight after: \"Graham's wobbling. Wanted you to know early so we can plan.\"", mins: 5, s: 1, fx: { founder: -4, pm: 2 }, fb: "The PM should know, but not before you've tried and he's agreed what you'll share." }
        ] }
    ]
  }];
})();
