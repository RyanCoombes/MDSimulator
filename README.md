# MD Simulator

A practice simulator for MD / GM / Business Transformation roles in software businesses.

## Case 01: Harbour Systems (first 100 days)

A fictional, founder-led UK vertical software company that's just been acquired. You:

1. **Data room**: read the P&L, operating data and interview notes.
2. **Find the levers**: pick the top three value levers and get feedback on your judgement.
3. **Lever lab**: set pricing, professional services, support/AI, R&D and cost levers and see a
   3-year driver-based forecast, target checks, stakeholder reactions and second-order effects.

All figures are invented for practice. Benchmarks in the hints are rough industry ranges, not any
company's real numbers.

## Run it

It's a single static page (`app/index.html`), with no backend or build step.

Locally:

```bash
python3 -m http.server 8080 --directory app
```

Then open http://localhost:8080.

On a Raspberry Pi with Docker:

```bash
docker build -t mdsim .
docker run -d --restart unless-stopped -p 8080:80 --name mdsim mdsim
```

## Editing the case

The scenario data sits at the top of the `<script>` in `app/index.html`:

- `BASE`: the company's starting numbers
- `LEVERS`: the controls and their hints
- `OPTIONS`: the lever-finding answers and feedback

The forecast logic lives in `model()`, the stakeholder scores in `people()`, and the feedback rules in `warnings()`.
