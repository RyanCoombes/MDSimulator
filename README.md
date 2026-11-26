# MD Simulator

Practice cases for MD, GM and Business Transformation roles in software businesses, especially
buy-and-hold vertical market software groups.

All companies, people and figures are fictional. The forecast is a teaching model with invented
sensitivities. It shows cause and effect, and it isn't a forecast of any real business.

## Cases

| Case | Difficulty | Focus |
|---|---|---|
| Harbour Systems | Standard | Pricing, professional services, R&D focus, founder management |
| Nordline Fleet | Hard | Churn, a stalled cloud migration, co-founder dynamics, Swedish union consultation |
| Quill Legal | Very hard | Loss-making turnaround, integrating two acquisitions (UK and Spain), AI revenue, data protection |

## Tasks and tests

Each case has ten tabs:

1. **Brief**: the PM's brief and targets, profile, KPIs, P&L with drivers, interview notes.
2. **Investigate**: raw datasets that reconcile to the P&L, with planted root causes.
   - **Datasets:** customers, churned accounts, PS projects, consultant time, tickets, supplier contracts, headcount and the R&D portfolio.
   - **Tools:** filter, calculated columns (formula language), group-by with aggregates, charts, sorting, a findings notebook and copy-as-CSV.
   - **Questions:** twelve diagnostic questions that can only be answered from the data.
3. **Build the model**: a named-row financial model where every cell is a number or formula.
   - **Building it:** `prev()`, `act_…` actuals, functions, your own rows, and scenarios as cell overrides.
   - **Review:** tie-out to actuals, structure, evidence-based realism checks and targets.
4. **Stakeholders**: power, interest, stance and engagement approach (Mendelow grid), checked against the evidence.
5. **100-day plan**: phase and owner for each activity, assessed on dependencies, real deadlines (renewal months, notice periods, Swedish MBL consultation, UK consultation) and your personal capacity.
6. **Find the levers**: pick three of ten options. Some are traps.
7. **Lever lab**: a 3-year driver-based forecast.
   - **Constraints:** a change budget for a team of one (16 points), so overloading it slows delivery, and benefits phase in.
   - **What you see:** a downside stress test, stakeholder meters and second-order warnings.
   - **Score (out of 100):** base-case targets 40, downside resilience 20, people 20, realism 20.
8. **Modelling drill**: ten calculations to do yourself, timed, with fresh numbers each attempt. Covers PS revenue, NRR, uplift maths, payback, break-even utilisation, the Rule of 40 and more.
9. **Challenges**: six situations with four responses each. Consequences carry forward.
10. **Workshop**: build an agenda and invite list, then get assessed against facilitation practice.
   This covers objectives, pre-read, diverge then converge, the decider in the room, actions, breaks, timing, presenting share and group size.

11. **A day in the life**: a playable working day.
   - **The workspace:** a live clock, an inbox of emails, Teams messages, calls and walk-ups, meetings that pull you in when the time comes, and a deliverable due mid-afternoon that needs focus blocks.
   - **How it plays:** every response costs minutes, and unhandled items escalate at their deadline. Some items are noise.
   - **Score:** priorities 40, relationships 25, deliverable 20, looking after yourself 15, with an item-by-item review.
12. **Run the transformation**: 12 monthly turns of delivery.
   - **Each month:** you have 16 days to spend on 1:1s, co-design sessions, coaching owners, pushing workstreams, doing it yourself, escalating, all-hands and celebrating wins.
   - **What gets in the way:** workstreams stall when owners or required stakeholders aren't on board, they wait on dependencies, and they miss contract and renewal deadlines.
   - **Pressures:** change fatigue and your own energy, with events triggered by the current state (owners going quiet, founders going around you, resignations, outages, customer pushback, union and data-protection gates, a PM wanting faster value).
   - **Reporting:** a monthly RAG report to the Portfolio Manager. Reporting green when it isn't comes back as a surprise.
   - **Score (out of 100):** value 40, PM confidence 20, key people 20, sustainability 20, with a debrief of lessons.

The tabs are grouped into three phases: Diagnose, Plan and Deliver.

**Frameworks and operating models** is a separate test, drawn from a bank of situational questions.
Topics include ADKAR, Kotter, Bridges, the Operating Model Canvas, 7S, RAPID, RACI, the price waterfall,
utilisation vs realisation, NRR/GRR, the Rule of 40, Theory of Constraints, DMAIC, OKRs, Cynefin and pre-mortems.

Scores are kept per browser (localStorage). Nothing is sent anywhere.

## AI features (optional)

**What they are:**
- **Conversations:** role-play with case characters who have hidden concerns, a live stance meter and a coach's assessment.
- **Interview room:** a Portfolio Manager round and an HR round, with follow-up questions and competency feedback.
- **Write your own reply** in A day in the life.
- **Speaking practice:** use the microphone, and optionally hear the character's voice.

**Where the AI comes from, in order:**
1. **claude.ai.** When the app is opened as a claude.ai artifact, it uses the viewer's own Claude. No key needed.
2. **Your own server.** `server.py` calls the Anthropic API with your key. The key stays on the server.
   - Model: `claude-opus-5-5`, with server-side refusal fallbacks.
   - Settings: passcode protection and a daily request cap.
3. **Off.** AI features hide themselves, and everything else still works.

Speech uses claude.ai dictation and voices where available, otherwise the browser's own speech APIs (Chrome/Edge).

Switch AI on or off and enter the passcode under **⚙ Settings**.

## Run it

Without AI, no backend or dependencies are needed. Serve the `app/` folder:

```bash
python3 -m http.server 8080 --directory app
```

Then open http://localhost:8080.

With AI, using the included server:

```bash
pip install anthropic
```

```bash
ANTHROPIC_API_KEY=sk-ant-... MDSIM_PASSCODE=choose-one python3 server.py --port 8080
```

Optional settings: `MDSIM_MODEL` (default `claude-opus-5-5`) and `MDSIM_DAILY_LIMIT` (default 300 requests a day). Without a key the server still serves the app, with AI off.

On a Raspberry Pi with Docker:

```bash
docker build -t mdsim .
```

```bash
docker run -d --restart unless-stopped -p 8080:8080 -e ANTHROPIC_API_KEY=sk-ant-... -e MDSIM_PASSCODE=choose-one --name mdsim mdsim
```

Set a passcode whenever anyone else can reach the server: AI usage is billed to your Anthropic account.

To get a single self-contained HTML file (`dist/index.html`):

```bash
python3 tools/build.py
```

## Adding a case

Copy `app/scenarios/harbour.js`, change the data and add a `<script>` line in `app/index.html`.
A scenario defines:

- the base numbers and sensitivities
- targets
- people
- its own initiatives, each with effects per year
- ten lever-finder options
- six challenge events
- a workshop brief

The shared model is in `app/js/engine.js`. The tests are in `app/js/tests/`.
