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
          { t: "Reply: \"Could it be Friday? I'd like to get it right.\"", mins: 2, s: 1, fx: { pm: -6 }, fb: "The review is tomorrow. Right on Friday is no use to him. Give him your best view today, with caveats." },
          { t: "Reply with a long email covering everything you've found so far.", mins: 35, s: 1, fx: { pm: 1 }, fb: "He asked for one page by 4. You've spent 35 minutes and still owe it." }
        ], miss: { x: "The PM chased you at 10:00: \"Did you see my note?\"", fx: { pm: -5 } } },
      { id: "h2", at: "08:00", ch: "email", from: "ReportCo account manager", subject: "Your contract renewal: 1 April 2027", imp: 3, deadline: "17:00",
        body: "Hi, a courtesy note: your ReportCo agreement auto-renews on 1 April 2027 for three years at the new list price (+12%). The notice period is 120 days, so any changes need to reach us by close of business today.",
        options: [
          { t: "Send a protective notice of non-renewal now, then tell Dave.", mins: 15, s: 2, fx: { founder: -6, flags: ["noticeSent"] }, fb: "Deadline met, but Dave hears second-hand that you've served notice on a supplier in his company. A two-line message first would have cost nothing." },
          { t: "Teams Dave: \"ReportCo notice is due today. A protective notice keeps our options open. OK to send under your name? Happy to explain at 11.\"", mins: 5, s: 3, fx: { founder: 2, flags: ["noticeAsk"], spawn: { h2b: 50 } }, fb: "Right call: the founder decides and you protect the deadline. Now make sure it actually goes." },
          { t: "Ask the bookkeeper to sort it.", mins: 3, s: 0, fx: { pm: -8 }, fb: "She has no authority to serve notice and doesn't know the context. It doesn't go, and the contract auto-renews at £213k a year for three years." }
        ], miss: { x: "ReportCo auto-renewed: about £213k a year, locked in for three years. You owned the notice.", fx: { pm: -12, founder: -4 } },
        lesson: "Contract notice periods are hard deadlines. They beat almost everything else in the inbox." },
      { id: "h2b", at: "08:00", req: "sp_h2b", ch: "chat", from: "Dave Pryce", subject: "Re: ReportCo: yes, send it", imp: 3, deadline: "17:00",
        body: "Yeah go for it, never liked them. Cheers for flagging.",
        options: [
          { t: "Send the protective notice now, under Dave's name, and confirm to him when it's gone.", mins: 10, s: 3, fx: { founder: 2, flags: ["noticeSent"] }, fb: "Done, owned by the founder, and deadline met." },
          { t: "Note it to send this afternoon.", mins: 1, s: 1, fx: {}, fb: "Fine if you remember. You've put a contract deadline into a busy afternoon." }
        ], miss: { x: "You had Dave's OK, but the notice never went. ReportCo auto-renewed for three years.", fx: { pm: -12, founder: -6 } } },
      { id: "h3", at: "08:00", ch: "chat", from: "Leanne Ford", subject: "Need your OK on 35% for Riverside Homes 🙏", imp: 2, deadline: "12:00",
        body: "They sign today if we can do 35%. Competitor is at 30% off. It's £40k ARR. Can you OK it?",
        options: [
          { t: "\"What do we get in return? If they'll sign 3 years or do a case study, approve this one. Can we set up a quick deal desk together from January?\"", mins: 5, s: 3, fx: { team: 3 }, fb: "Trade, don't concede. You keep the deal, get value back, and start governance with Leanne as co-owner." },
          { t: "Approve it.", mins: 1, s: 1, fx: { team: 2 }, fb: "Easy today. The cap is now negotiable." },
          { t: "Decline: \"The cap is 20%, no exceptions.\"", mins: 1, s: 1, fx: { team: -8 }, fb: "A policy that only says no gets worked around, and Leanne is someone you need on side." }
        ], miss: { x: "Leanne approved the 35% herself at noon. The discount cap is now optional.", fx: { team: -2, pm: -2 } } },
      { id: "h4", at: "08:05", ch: "email", from: "Bookkeeper", subject: "Debtors report + quick question", imp: 2,
        body: "Debtors report attached as requested.\nAlso, the November payroll file has two new starters (both engineers) that Dave added last week. Just checking you know, as you said to flag anything unusual?",
        options: [
          { t: "Thank her. Add \"new hires\" to your 11:00 1:1 with Dave.", mins: 2, s: 3, fx: { flags: ["hires"] }, fb: "Good. Raise it in person, without accusation. You need to understand before you react." },
          { t: "Email Dave: \"Why wasn't I told about two new hires?\"", mins: 3, s: 0, fx: { founder: -10 }, fb: "An accusatory email on day 12 to the founder of his own company. You'll be managed around from now on." },
          { t: "Forward it to the Portfolio Manager.", mins: 2, s: 0, fx: { founder: -8, pm: 1 }, fb: "Going over the founder's head before you've even asked him. He'll find out." }
        ], miss: { x: "You never followed up. Two more engineers went onto Mobile 2 without anyone questioning it.", fx: { pm: -3 } } },
      { id: "h5", at: "08:10", ch: "chat", from: "Tom Reid (Support Lead)", subject: "Heads up: Northshore login issues", imp: 2, deadline: "11:00",
        body: "Northshore Homes have had login problems since 7am. Dev are looking. Just so you know.",
        options: [
          { t: "\"Thanks Tom. Who's the incident lead, and who's updating Northshore every hour?\"", mins: 3, s: 3, fx: { cust: 4, team: 2, flags: ["incident"] }, fb: "You don't fix it. You make sure someone owns it and the customer hears from you regularly." },
          { t: "Join the incident bridge and run it yourself.", mins: 60, s: 1, fx: { cust: 5, energy: -5 }, fb: "Customers feel cared for, but you've lost an hour from a deadline day and taught the team you'll step in." },
          { t: "React with 👍", mins: 1, s: 1, fx: {}, fb: "Acknowledged, but nobody owns customer comms." }
        ], miss: { x: "Northshore's CEO emailed Dave at 11:00: \"Nobody has updated us all morning.\"", fx: { cust: -10, founder: -4 } } },
      { id: "h6", at: "08:30", ch: "email", from: "Office manager (all staff)", subject: "Car park resurfacing on Thursday", imp: 0,
        body: "Please park on Kirkstall Road on Thursday. Thanks!",
        options: [{ t: "Reply-all \"Thanks!\"", mins: 1, s: 1, fx: {}, fb: "Please don't reply-all to all-staff emails." }] },
      { id: "m1", at: "09:00", ch: "meeting", title: "Leadership stand-up", dur: 30, from: "Dave (chair), Leanne, Priya, Tom", who: "founder", imp: 2,
        body: "Round the table: Northshore incident, Q4 bookings, a hiring update. Dave closes: \"And I've told Kieran Mobile 2 launches in March. We're all behind that.\" Everyone looks at you.",
        options: [
          { t: "Challenge it in the room: \"I'm not sure the data supports March.\"", s: 0, fx: { founder: -12, team: -2 }, fb: "Right question, wrong room. Contradicting a founder in front of his team on day 12 makes you an opponent." },
          { t: "Nod, and say you'd value understanding the Mobile 2 plan in your 1:1 later.", s: 3, fx: { founder: 2, flags: ["mob"] }, fb: "You signal interest without confrontation, and move the real conversation somewhere private." },
          { t: "Say nothing.", s: 1, fx: {}, fb: "Safe, but silence reads as agreement." }
        ] },
      { id: "w1", at: "10:15", ch: "walkup", from: "Kieran Doyle, lead engineer", subject: "\"Got a minute? Off the record.\"", imp: 3,
        body: "He closes the door. \"I've had an offer from a competitor. I don't want to leave, but I'm sick of building an app nobody asked for while scheduling falls apart.\"",
        options: [
          { t: "Sit down now. Listen, ask what would make him stay, and promise to raise the roadmap question without naming him.", mins: 20, s: 3, fx: { team: 8, flags: ["kieran"] }, fb: "Key-person retention beats almost anything else this morning. You listened, kept his confidence and gave him a reason to wait." },
          { t: "\"Can it wait until 5?\"", mins: 2, s: 1, fx: { team: -4 }, fb: "He's told you he has an offer. By 5 he may have decided." },
          { t: "\"I'll need to let Dave know.\"", mins: 5, s: 0, fx: { team: -15, founder: 2 }, fb: "You've broken a confidence. Nobody will tell you anything off the record again." }
        ] },
      { id: "m2", at: "11:00", ch: "meeting", title: "1:1 with Dave", dur: 45, from: "Dave Pryce", who: "founder", imp: 3,
        body: "Dave's office. He looks tired.",
        steps: [
          { q: "How do you open?", options: [
            { t: "Ask what's keeping him up at night, and listen.", s: 3, fx: { founder: 6 }, fb: "Listening first earns you the right to be heard." },
            { t: "Walk through your six-point agenda.", s: 1, fx: { founder: -2 }, fb: "Efficient, but it feels like an audit." },
            { t: "Lead with the numbers: margin is 13% and falling.", s: 1, fx: { founder: -4 }, fb: "True, but it puts him on the defensive in his own office." }] },
          { q: "\"Honestly? Cash. And whether you lot will kill Mobile 2.\"", options: [
            { t: "Propose reviewing Mobile 2 together in January: customer requests, revenue, cost. His call at the end.", s: 3, fx: { founder: 6, flags: ["mobReview"] }, fb: "Evidence plus founder authorship: the only way a pet project gets reconsidered without a fight." },
            { t: "Tell him plainly Mobile 2 should stop.", s: 0, fx: { founder: -15 }, fb: "Maybe right. On day 12, without evidence he's seen, it's a fight you'll lose." },
            { t: "Reassure him nothing will change.", s: 0, fx: { founder: 4 }, fb: "Comfort now, betrayal later." }] },
          { q: "Ten minutes left. What do you use them for?", options: [
            { t: "Ask about the two new engineers: what they're for, and agree a quick joint check before future hires.", req: "hires", s: 3, fx: { founder: 2 }, fb: "Raised as a question, not an accusation, with a light-touch control agreed." },
            { t: "Get his sign-off on the ReportCo notice, then send it straight after.", req: "noticeAsk", s: 3, fx: { flags: ["noticeSent"], resolves: ["h2b"] }, fb: "Deadline protected, founder decided." },
            { t: "Agree a standing 30-minute weekly slot.", s: 2, fx: { founder: 3 }, fb: "Good habit. Was there anything more urgent?" },
            { t: "Wrap up early to get back to the one-pager.", s: 1, fx: { founder: -2 }, fb: "Leaving early on your first proper 1:1 sends the wrong signal." }] }
        ] },
      { id: "h7", at: "11:50", ch: "email", from: "Mark Collins → Leanne (cc you)", subject: "RE: this new discount nonsense", imp: 1,
        body: "With respect, whoever thinks we can win councils at 20% off has never sold to one. If this goes ahead I'll be talking to recruiters.",
        options: [
          { t: "Don't reply-all. Ask Leanne for 10 minutes this week to hear the sales team's view first-hand.", mins: 3, s: 3, fx: { team: 2 }, fb: "Take it offline, listen, and work through the line manager." },
          { t: "Reply-all and explain the policy.", mins: 15, s: 0, fx: { team: -6 }, fb: "Email arguments with an angry salesperson never end well." },
          { t: "Forward it to Dave.", mins: 2, s: 1, fx: { team: -3 }, fb: "Escalating noise. Leanne is his manager." }
        ], miss: { x: "Mark's email went unanswered. The sales team read your silence as dismissal.", fx: { team: -3 } } },
      { id: "h8", at: "13:10", ch: "chat", from: "Portfolio Manager", subject: "Quick one: Harbour AI plans?", imp: 2, deadline: "14:00",
        body: "Group CFO is asking about Harbour's AI plans specifically. I'm in with him at 2. Anything?",
        options: [
          { t: "\"Honest answer: no AI revenue yet. Five engineers could pivot to it. I'll have a pilot proposal by end of January. More in the one-pager at 4.\"", mins: 4, s: 3, fx: { pm: 5 }, fb: "Honest, specific, gives him something to say, and commits only to what you control." },
          { t: "\"A Q1 launch of an AI tier is realistic.\"", mins: 2, s: 0, fx: { pm: 3 }, fb: "You've committed the business to something the founder hasn't agreed and R&D hasn't scoped. It'll come back." },
          { t: "\"It'll be in the one-pager at 4.\"", mins: 1, s: 1, fx: { pm: -3 }, fb: "He's in with the CFO at 2. That doesn't help him." }
        ], miss: { x: "The PM went into the CFO meeting with nothing on AI.", fx: { pm: -6 } } },
      { id: "h9", at: "13:30", ch: "email", from: "Recruiter (LinkedIn)", subject: "Exciting Transformation Director opportunity!", imp: 0,
        body: "Hi! Saw your profile. Would love a quick chat about an exciting opportunity...",
        options: [{ t: "Reply politely to keep the door open.", mins: 5, s: 1, fx: {}, fb: "Not today." }] },
      { id: "m3", at: "14:00", ch: "meeting", title: "PS weekly with Priya", dur: 30, from: "Priya Shah", who: "team", optional: true, imp: 2, declineFx: { team: -5 }, declineX: "Priya notices you've bailed on her first proper weekly.",
        body: "Priya: \"Westbury Living's implementation is 40% over budget. They're refusing to pay for the extra days. Can I give them six free days to keep the peace?\"",
        options: [
          { t: "Ask to see the change log. Charge for what was in scope, offer a fixed price for the rest, and use it as the template for change control.", s: 3, fx: { team: 4, cust: 2 }, fb: "Fair to the customer, and it turns a one-off fight into the process fix PS needs." },
          { t: "Approve the free days.", s: 1, fx: { cust: 3 }, fb: "Keeps the peace and confirms the pattern behind the 18% free days." },
          { t: "Say no: they pay for everything.", s: 1, fx: { cust: -6 }, fb: "Some of the overrun was probably our scoping. Hold the line on what's fair, not on everything." }
        ] },
      { id: "h11", at: "15:30", ch: "chat", from: "Dave Pryce", subject: "Can you join the Northshore call at 4?", imp: 3, deadline: "15:55",
        body: "Northshore's CEO wants a call about this morning. 4pm. Can you join? Would help to have you there.",
        options: [
          { t: "Join. First, message the PM: \"Customer escalation at 4. Your one-pager will be with you by 5.30.\"", mins: 3, s: 3, fx: { founder: 4, flags: ["warnedPM", "joinCall"] }, fb: "Choose the customer and the founder, and reset the deadline before you miss it, not after." },
          { t: "Decline: you've got the PM deadline.", mins: 2, s: 1, fx: { founder: -8 }, fb: "The founder asked for help with his biggest customer. That's hard to come back from." },
          { t: "Join, and hope to finish the one-pager in time.", mins: 2, s: 2, fx: { founder: 4, flags: ["joinCall"] }, fb: "Right priority, but you're about to miss a deadline without warning anyone." }
        ], miss: { x: "Dave took the Northshore call alone. He felt you weren't there when it mattered.", fx: { founder: -8 } } },
      { id: "m4", at: "16:00", req: "joinCall", ch: "meeting", title: "Northshore escalation call", dur: 40, from: "Northshore CEO, Dave", who: "cust", imp: 3,
        body: "Northshore's CEO: \"Five hours this morning without a single update. We're reviewing our options.\"",
        options: [
          { t: "Let Dave lead the relationship. Add the concrete fix: named incident lead, hourly updates, written review within 48 hours.", s: 3, fx: { cust: 10, founder: 5 }, fb: "The founder owns the relationship and you add the operating discipline. The customer hears a plan, not an apology." },
          { t: "Apologise at length and offer a month free.", s: 1, fx: { cust: 4, founder: -3 }, fb: "You've given away money without fixing why it happened." },
          { t: "Explain the technical root cause in detail.", s: 1, fx: { cust: -2 }, fb: "They want to know it won't happen again, not how it happened." }
        ] },
      { id: "w2", at: "17:30", ch: "walkup", from: "Dave Pryce", subject: "\"Fancy a pint? Want to talk Mobile 2 properly.\"", imp: 2,
        body: "Dave leans on your desk, coat on.",
        options: [
          { t: "Yes, one drink and a proper conversation.", mins: 60, s: 3, fx: { founder: 10, energy: -8 }, fb: "Founders decide who to trust over a drink as often as in a meeting." },
          { t: "Not tonight. Suggest breakfast on Thursday instead.", mins: 2, s: 2, fx: { founder: 2 }, fb: "Reasonable and keeps it on the table." },
          { t: "\"I've got work to finish.\"", mins: 2, s: 1, fx: { founder: -4 }, fb: "True, but he offered an olive branch." }
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
          { t: "Reply, copying Anna and HR: confirm no decision has been made, and propose Wednesday for an information meeting.", mins: 8, s: 3, fx: { team: 6, founder: 2 }, fb: "Correct under MBL and builds trust. No decision is made before consultation." },
          { t: "Reply: \"There are no plans to move jobs.\"", mins: 3, s: 0, fx: { team: 3, pm: -4 }, fb: "If the dev-centre option goes ahead, you've misled the union in writing." },
          { t: "Forward to HR to handle.", mins: 2, s: 1, fx: { team: -3 }, fb: "HR should be involved, but the union wants to hear from whoever's driving the change." }
        ], miss: { x: "The union rep escalated to Anna: \"Your new transformation lead ignores formal requests.\"", fx: { team: -8, founder: -5 } } },
      { id: "n2", at: "08:00", ch: "chat", from: "DevOps lead", subject: "AWS bill +30%. Also, can we talk today?", imp: 2,
        body: "December AWS came in 30% higher. Double-running plus a forgotten test cluster. I've killed the cluster. Also, can we talk at some point today? It's not about AWS.",
        options: [
          { t: "\"Thanks for killing it. Yes, come and find me late morning.\"", mins: 2, s: 3, fx: { team: 4, flags: ["devopsTalk"] }, fb: "Thank the fix and make time for the person." },
          { t: "\"How did a test cluster get forgotten?\"", mins: 3, s: 0, fx: { team: -8 }, fb: "He fixed it and told you. Blame teaches people to stop telling you." },
          { t: "👍", mins: 1, s: 1, fx: {}, fb: "You missed the second, more important message." }
        ], miss: { x: "You never replied to the DevOps lead's request to talk.", fx: { team: -5 } } },
      { id: "n3", at: "08:20", ch: "email", from: "Göteborg Region (procurement)", subject: "Migration to cloud: our position", imp: 2,
        body: "Our procurement rules do not permit moving to a new hosting model until our framework is re-tendered in 2028. Please confirm the desktop product will remain supported until then.",
        options: [
          { t: "Acknowledge, say a supported-extension option will be proposed by the end of the month, and add them as an exception case in today's proposal.", mins: 6, s: 3, fx: { cust: 4, focus: 10 }, fb: "Don't commit on the spot, and use it to sharpen the proposal." },
          { t: "Confirm support until 2028.", mins: 2, s: 0, fx: { cust: 5, founder: -6 }, fb: "You've just set the sunset date for everyone, without the co-founders." },
          { t: "Reply that the sunset date is fixed.", mins: 3, s: 0, fx: { cust: -12 }, fb: "7% of ARR now has a reason to tender." }
        ], miss: { x: "Göteborg Region heard nothing back and called Anna directly.", fx: { cust: -6, founder: -3 } } },
      { id: "m1", at: "09:00", ch: "meeting", title: "Co-founder weekly", dur: 45, from: "Anna Lind, Erik Holm", who: "founder", imp: 3,
        body: "Ten minutes in, Erik and Anna are arguing again about desktop. Erik: \"Switch it off in June.\" Anna: \"We'll lose the municipalities.\"",
        steps: [
          { q: "What do you do?", options: [
            { t: "Name the disagreement neutrally, and say Thursday will decide it on customer-by-customer data you're sending today.", s: 3, fx: { founder: 6 }, fb: "You turn opinion into evidence and give the decision a date." },
            { t: "Side with Erik: June is achievable.", s: 0, fx: { founder: -10 }, fb: "Now Anna sees you as Erik's ally." },
            { t: "Stay quiet and let them work it out.", s: 1, fx: { founder: -2 }, fb: "They've been working it out for a year." }] },
          { q: "Erik: \"Fine. But I need the DevOps lead for the Route Optimiser demo on Wednesday.\"", options: [
            { t: "Ask what the demo needs, and agree a half-day with a backup person, protecting migration time.", s: 3, fx: { founder: 4 }, fb: "Trade, don't block. Both priorities get a fair hearing." },
            { t: "Refuse: the migration comes first.", s: 1, fx: { founder: -6 }, fb: "Maybe right, but a flat no to a co-founder costs you." },
            { t: "Agree to whatever he needs.", s: 1, fx: { founder: 3 }, fb: "And the migration slips again." }] }
        ] },
      { id: "w1", at: "11:15", req: "devopsTalk", ch: "walkup", from: "DevOps lead", subject: "\"About that chat...\"", imp: 3,
        body: "\"I'm the only one on call. I've been woken up eleven times this month. I'm not sure I can do this migration on my own.\"",
        options: [
          { t: "Listen. Agree a second on-call engineer this week, and ask what else would make the migration doable.", mins: 25, s: 3, fx: { team: 10, energy: -3 }, fb: "Your single point of failure was about to burn out. This was the most important 25 minutes of the day." },
          { t: "\"It'll calm down after the migration.\"", mins: 5, s: 0, fx: { team: -12 }, fb: "He's telling you he might not make it to the end of the migration." },
          { t: "Promise a pay rise.", mins: 10, s: 1, fx: { team: 4 }, fb: "Money doesn't fix being woken eleven times a month." }
        ] },
      { id: "n4", at: "11:40", ch: "chat", from: "Sofia Berg (Support Manager)", subject: "3 customers didn't renew on 1 Jan", imp: 2, deadline: "15:00",
        body: "Three small fleets didn't renew. All on desktop, none contacted since go-live. I'd like to start calling the 40 biggest accounts this week. OK?",
        options: [
          { t: "\"Yes. Start with renewals due before June. Log why people stay or go, and let's review on Friday.\"", mins: 4, s: 3, fx: { cust: 6, team: 4 }, fb: "Empower the owner, focus on the revenue at risk, and set a check-in." },
          { t: "\"Wait until the CS business case is approved.\"", mins: 2, s: 0, fx: { team: -6, cust: -4 }, fb: "Calling your own customers doesn't need a business case." },
          { t: "Offer to make the calls yourself.", mins: 3, s: 1, fx: { energy: -5 }, fb: "And who does it after you leave?" }
        ], miss: { x: "Sofia waited for an answer that never came.", fx: { team: -5, cust: -3 } } },
      { id: "n5", at: "13:00", ch: "email", from: "Portfolio Manager", subject: "AI story for Friday", imp: 1,
        body: "Group wants every portfolio company's AI story by Friday. Short paragraph is fine.",
        options: [
          { t: "Reply that you'll send it by Thursday. Note it for tomorrow.", mins: 2, s: 3, fx: { pm: 2 }, fb: "Acknowledge and schedule. It isn't today's work." },
          { t: "Write it now.", mins: 40, s: 1, fx: { pm: 3 }, fb: "Not due until Friday, and it's eating your proposal time." }
        ] },
      { id: "n6", at: "13:30", ch: "email", from: "Monitoring tool vendor", subject: "Upgrade to Enterprise and save 10%!", imp: 0,
        body: "Limited-time offer...", options: [{ t: "Book a demo.", mins: 30, s: 0, fx: {}, fb: "You're paying for two monitoring tools already." }] },
      { id: "n7", at: "15:45", ch: "chat", from: "Anna Lind", subject: "Push Thursday?", imp: 2, deadline: "16:30",
        body: "Board pack is due Friday. Can we push the sunset session to next week?",
        options: [
          { t: "\"Every week of delay costs about £30k in double hosting, and two more renewals land. Could we do 60 minutes Thursday instead of two hours?\"", mins: 3, s: 3, fx: { founder: 3, pm: 2 }, fb: "Make the cost of delay visible, and offer a smaller ask." },
          { t: "\"Of course, no problem.\"", mins: 1, s: 1, fx: { founder: 2 }, fb: "And the decision slips another week." },
          { t: "Escalate to the PM.", mins: 3, s: 0, fx: { founder: -10 }, fb: "Over a diary clash?" }
        ], miss: { x: "No answer, so Anna moved the session to next week.", fx: { pm: -3 } } },
      { id: "w2", at: "16:30", ch: "walkup", from: "Nils Åberg (Route Optimiser lead)", subject: "\"Is Route Optimiser being killed?\"", imp: 2,
        body: "\"The team's asking. People are updating their LinkedIn.\"",
        options: [
          { t: "Be honest: no decision has been made, it'll be reviewed on evidence with Erik, and you'll tell the team first.", mins: 10, s: 3, fx: { team: 6 }, fb: "Honesty about the process, even without the answer, stops rumours spreading." },
          { t: "\"No, it's safe.\"", mins: 2, s: 0, fx: { team: 3 }, fb: "You don't know that." },
          { t: "\"Talk to Erik.\"", mins: 1, s: 1, fx: { team: -3 }, fb: "He's asking you because he thinks you know." }
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
          { t: "Confirm both: EU residency and no training. Ask her to send the final statement to the pilot firms today.", mins: 6, s: 3, fx: { cust: 6, flags: ["dpoDone"], focus: 10 }, fb: "Decisive on the gate that unlocks the whole AI line. It also strengthens your paper." },
          { t: "Say you'll decide after the go/no-go paper.", mins: 2, s: 0, fx: { cust: -4 }, fb: "The data position is an input to go/no-go, not a consequence of it." },
          { t: "Forward to Graham to decide.", mins: 2, s: 1, fx: {}, fb: "He's the owner, but he's not at his desk until 10." }
        ], miss: { x: "The DPO's noon deadline passed. Two pilot firms paused their trial.", fx: { cust: -8 } } },
      { id: "q2", at: "08:00", ch: "chat", from: "Carmen Vidal (Lexia MD)", subject: "Moved 2 UK queues to Madrid overnight 🙂", imp: 3,
        body: "Quick win! We moved the UK billing and templates ticket queues to Madrid overnight to test. Our team is great. Let's discuss later!",
        options: [
          { t: "Call her. Thank the initiative, ask to roll back today until the agreed design and UK-hours service levels are signed, and offer to fast-track that.", mins: 15, s: 3, fx: { team: 4, founder: 4 }, fb: "You stop a unilateral move without humiliating an ally, and keep the speed she wants." },
          { t: "Reply \"Great!\"", mins: 1, s: 0, fx: { team: -10, founder: -10 }, fb: "UK staff and Graham find out from a customer that their queues moved overnight." },
          { t: "Report it to the Portfolio Manager.", mins: 4, s: 1, fx: { team: -2 }, fb: "Escalating before talking to her damages your best integration ally." }
        ], miss: { x: "Nobody responded. UK customers got Spanish-hours replies all morning, and Graham heard from a client.", fx: { cust: -6, founder: -8 } } },
      { id: "q3", at: "08:15", ch: "email", from: "Margaret Byrne (UK support, 12 years)", subject: "Formal concern", imp: 2,
        body: "I'm writing formally because I've heard our jobs are moving to Madrid, and nobody has told us anything. I've been here 12 years. I'd like a meeting.",
        options: [
          { t: "Reply personally today. Acknowledge her, offer a meeting this week with HR, and say honestly what is and isn't decided.", mins: 8, s: 3, fx: { team: 8 }, fb: "Fast, human, and honest. A formal concern needs a proper process, and it starts with respect." },
          { t: "Forward to HR.", mins: 2, s: 1, fx: { team: -4 }, fb: "Procedurally fine, but it feels like being processed." },
          { t: "Leave it until the consultation starts.", mins: 1, s: 0, fx: { team: -8 }, fb: "Silence confirms the rumour." }
        ], miss: { x: "Margaret's email sat unanswered. She told the team you'd ignored her.", fx: { team: -8 } } },
      { id: "m1", at: "09:30", ch: "meeting", title: "Quill leadership", dur: 45, from: "Graham Holt, Head of PS, Sales lead", who: "founder", imp: 3,
        body: "Graham, energised: \"Law Society conference next week. We announce the AI drafting tier and take orders on the stand.\"",
        steps: [
          { q: "Your response?", options: [
            { t: "Back the energy. Propose announcing the pilot results and a waitlist at the conference, with paid launch the moment the DPO statement is final.", s: 3, fx: { founder: 6 }, fb: "You keep his story and his moment, without selling something the data position doesn't support yet." },
            { t: "\"We can't, there's no data statement.\"", s: 1, fx: { founder: -8 }, fb: "Correct but deflating, with no alternative offered." },
            { t: "Agree. Take orders.", s: 0, fx: { founder: 6, cust: -6 }, fb: "Lawyers will ask where their client data goes before they sign. You don't have the answer in writing." }] }
        ] },
      { id: "w1", at: "10:45", ch: "walkup", from: "Head of PS", subject: "\"We've got a problem with Kendall Marsh LLP\"", imp: 2,
        body: "\"Their migration is 60% over. The managing partner says he'll post about us on the Law Society forum unless we finish it free.\"",
        options: [
          { t: "Review the scope and change log with him now. Offer to fund what was in scope, and a capped price for what wasn't. Call the partner together.", mins: 25, s: 3, fx: { cust: 5, team: 4 }, fb: "Fair, documented, and it builds the change-control muscle." },
          { t: "\"Give them what they want.\"", mins: 2, s: 1, fx: { cust: 3, team: -2 }, fb: "And the next one will threaten the forum too." },
          { t: "\"Let them post. We're not a charity.\"", mins: 2, s: 0, fx: { cust: -10 }, fb: "Small, connected market. Reputation travels." }
        ] },
      { id: "q4", at: "11:30", ch: "email", from: "Portfolio Manager", subject: "Cash: should we pause the AI pilot?", imp: 2, deadline: "14:00",
        body: "Quill is still burning cash. Before your paper, a straight question: should we pause AI spend until the cost-out lands?",
        options: [
          { t: "\"Short answer in my 3pm paper. Headline: stage-gated. Pilot cost is small, conversion is the gate, and the cost-out timing funds it. I'll show the numbers.\"", mins: 4, s: 3, fx: { pm: 5 }, fb: "Answer a cash question with numbers and a decision gate." },
          { t: "\"AI is strategic, we can't pause it.\"", mins: 2, s: 0, fx: { pm: -6 }, fb: "\"Strategic\" without numbers loses to cash every time." },
          { t: "\"Yes, pause it.\"", mins: 1, s: 1, fx: { pm: 2, founder: -6 }, fb: "You've just killed the founder's project in an email." }
        ], miss: { x: "No reply before the PM's 2pm cash call.", fx: { pm: -5 } } },
      { id: "q5", at: "12:15", ch: "email", from: "Partner, Ferris Hale LLP (pilot firm)", subject: "Loved the drafting. Price?", imp: 2,
        body: "Our associates loved the drafting pilot. What will it cost per user? We'd like to budget for June.",
        options: [
          { t: "Thank her, ask for 15 minutes on the value they saw, and say pricing will follow within two weeks.", mins: 5, s: 3, fx: { cust: 5, focus: 10 }, fb: "Willingness-to-pay evidence for your paper, and you don't quote a price on the hoof." },
          { t: "Quote £50 a user a month on the spot.", mins: 3, s: 0, fx: { cust: 3 }, fb: "Competitors charge about £150. You've anchored low with your best reference customer." }
        ] },
      { id: "q6", at: "13:00", ch: "chat", from: "Lexia Finance Manager", subject: "Payroll shared service: sign-off?", imp: 2,
        body: "UK payroll goes live on our Madrid system next week. Can you sign off the UK employee data transfer?",
        options: [
          { t: "Don't sign yet. Ask HR and the DPO to confirm the transfer basis and that employees have been told. Aim for this week.", mins: 5, s: 3, fx: { team: 3 }, fb: "Moving employee personal data across entities needs a documented basis, and employees need telling." },
          { t: "Sign it.", mins: 1, s: 0, fx: { team: -4 }, fb: "You're not the right person to approve a personal data transfer without checks." }
        ] },
      { id: "q7", at: "14:20", ch: "email", from: "Legal tech newsletter", subject: "10 AI trends every law firm must know", imp: 0,
        body: "...", options: [{ t: "Read it now.", mins: 15, s: 0, fx: {}, fb: "Forty minutes to your deadline." }] },
      { id: "w2", at: "16:00", ch: "walkup", from: "Graham Holt", subject: "\"Have you got ten minutes?\"", imp: 3,
        body: "He shuts the door. \"I'll be honest. I'm thinking of going. It doesn't feel like my company any more.\"",
        options: [
          { t: "Listen properly. Then offer something real: he leads the UK AI product, with a clear target and a voice in the integration design.", mins: 30, s: 3, fx: { founder: 15 }, fb: "Status plus purpose. You can't buy a founder's commitment, but you can give him something worth staying for." },
          { t: "Remind him of the earn-out.", mins: 5, s: 0, fx: { founder: -10 }, fb: "Contractual leverage keeps his body, not his heart." },
          { t: "Tell the PM straight after.", mins: 5, s: 1, fx: { founder: -4, pm: 2 }, fb: "The PM should know, but not before you've tried and he's agreed what you'll share." }
        ] }
    ]
  }];
})();
