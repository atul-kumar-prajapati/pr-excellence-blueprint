# Plan: Preparing the Raising Great PRs Session Materials

**Status:** Draft — depends on the spec in `docs/specs/raising-great-prs-session.md` being approved.

## Build order

The order follows dependencies: the template and the merge confidence scale are referenced by everything else, and the lab PRs feed the principles, the AI demo and the slides.

| Phase | Deliverables | Depends on | Review gate |
|---|---|---|---|
| 1. Foundations | D6 PR template, D7 reviewer checklist, D8 merge confidence scale | Spec approved | You approve the template and scale wording. |
| 2. Lab | D9 sandbox repo, PR A, PR B, worksheet, answer key | Phase 1 | Pilot with one engineer who hasn't seen the PRs; second senior checks the answer key. |
| 3. Story and content | D3 scenario, D4 quality bar, D5 stakeholder map, D10 principles poster | Phases 1–2 | You review for tone and accuracy. |
| 4. AI demo | D11 prompts, demo script, captured fallback outputs | Phases 1–2 | Demo runs end to end against PR B. |
| 5. Delivery | D1 facilitator guide, D2 slide deck | Phases 1–4 | Full timed dry run. |
| 6. Follow-up | D12 commitment card, follow-up pack, baseline numbers | Phases 1–5 | Ready to send on session day. |

## Proposed repo layout

```
docs/
  specs/raising-great-prs-session.md
  plans/raising-great-prs-session-plan.md
session/
  facilitator-guide.md
  slides.md
  handouts/
    pr-template.md
    reviewer-checklist.md
    merge-confidence-scale.md
    stakeholder-map.md
    quality-bar.md
    lab-worksheet.md
    commitment-card.md
  ai-demo/
    prompts.md
    demo-script.md
    fallback-outputs/
  lab/
    answer-key-pr-a.md
    answer-key-pr-b.md
lab-repo/            # sandbox Spring Boot service (or a separate repo, see open questions)
```

## Verification

- **Timing:** one full dry run against a stopwatch; any segment more than 2 minutes over gets trimmed using the facilitator guide's "cut this" notes.
- **Lab difficulty:** pilot reviewer finds at least half the planted issues in 10 minutes; if they find all of them, PR B is too obvious.
- **Answer key:** a second senior engineer independently ranks the issues; disagreements are resolved before the session.
- **AI demo:** run it twice on different days to make sure the output is stable enough to present; keep the captured fallback.
- **Consistency check:** the three themes, the merge confidence scale and the template section names are spelled the same in every artifact.

## Risks

| Risk | Mitigation |
|---|---|
| Lab overruns because participants spend time setting up | PRs are reviewed in the browser; no local build needed. |
| AI demo is slow or gives a poor result live | Captured fallback outputs; treat a poor result as a teaching moment. |
| 14 stakeholders don't fit in 8 minutes | Present in 5 clusters; go deep on 3. |
| PR B is too subtle and nobody finds the IDOR | Helper drops a hint at the 7-minute mark. |
| Template feels like extra bureaucracy | Show it as replacing the reviewer's questions, not adding to the author's work. |
