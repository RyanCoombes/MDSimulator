/* Workshop building blocks. type drives the assessment rules. */
MDS.content.blocks = [
  { id: "pre", name: "Pre-read sent 2 days before", mins: 0, type: "pre", desc: "Data pack and decision options, so the session is about deciding, not reading." },
  { id: "obj", name: "Welcome, objectives and decisions needed", mins: 10, type: "open", desc: "State the outcome, the decisions in scope, and who decides." },
  { id: "ice", name: "Icebreaker", mins: 15, type: "open", desc: "Warm-up activity." },
  { id: "ctx", name: "Context: the data and the problem", mins: 25, type: "present", desc: "Short walkthrough of the facts everyone needs." },
  { id: "deck", name: "Detailed consultant presentation", mins: 45, type: "present", desc: "Full analysis deck." },
  { id: "voice", name: "Customer evidence: quotes, churn reasons", mins: 15, type: "present", desc: "Bring the customer into the room." },
  { id: "silent", name: "Silent individual idea generation", mins: 15, type: "diverge", desc: "Everyone writes options alone before discussion." },
  { id: "brain", name: "Open group brainstorm", mins: 25, type: "diverge", desc: "Ideas shouted out and captured." },
  { id: "break1", name: "Break", mins: 15, type: "break", desc: "" },
  { id: "break2", name: "Break", mins: 15, type: "break", desc: "" },
  { id: "group", name: "Small-group deep dives", mins: 40, type: "diverge", desc: "Breakouts develop the strongest options." },
  { id: "matrix", name: "Impact / effort prioritisation", mins: 25, type: "converge", desc: "Plot options and shortlist." },
  { id: "dots", name: "Dot voting", mins: 10, type: "converge", desc: "Quick show of preference." },
  { id: "premortem", name: "Pre-mortem: why would this fail?", mins: 20, type: "risk", desc: "Surface risks and objections safely." },
  { id: "decide", name: "Decision: decider confirms the choice", mins: 15, type: "decide", desc: "The named decider makes the call, in the room." },
  { id: "actions", name: "Actions, owners and dates", mins: 15, type: "actions", desc: "Who does what by when, and how progress is reported." },
  { id: "comms", name: "Agree what we tell the wider team", mins: 10, type: "actions", desc: "One consistent message." },
  { id: "park", name: "Parking lot review", mins: 5, type: "close", desc: "Close off or assign open questions." },
  { id: "close", name: "Close and quick feedback", mins: 5, type: "close", desc: "" }
];
