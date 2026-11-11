# Raising Great PRs

An interactive web app for running a 90-minute in-house session on raising and reviewing great pull requests, including AI-assisted ones.

**Outcome:** By the end of the session, every engineer can raise an AI-assisted PR that's easy to review, safe to merge, and ready to release with confidence.

## What's inside

- **Slides** (`#/slide/1`): 22 slides across the 8 agenda segments, with an agenda bar, a 90-minute session clock that tells you if you're behind, and presenter notes (press `N`).
- **Lab** (`#/lab/a`, `#/lab/b`): two realistic PR pages from a fictional movie-ticket booking service (CineBook, Spring Boot).
  - PR A is a messy promo-code PR, the warm-up.
  - PR B is a tidy refactor that hides blockers.
  - Groups click diff lines to log findings, star a top 3, score merge confidence, then reveal the expert review.
  - Timed hints help breakout rooms when the facilitator isn't there.
- **Handouts** (`#/handouts`): the PR template, reviewer checklist, merge confidence scale, principles and Codex prompts, each with a copy button, plus "copy whole pack".

Findings, scores, commitments and the AI demo fallback are saved in each person's browser (`localStorage`). There is no backend.

## Run locally

Requires Node 20 or later.

```bash
npm install
npm run dev        # http://127.0.0.1:4517
```

Other scripts:

```bash
npm test           # checks lab answer keys line up with the diffs
npm run lint
npm run build
```

## Keyboard

`←` / `→` move between slides · `N` presenter notes · `F` fullscreen · `Home` / `End` first and last slide.

## Editing content

All wording lives in `src/content/` (agenda, stakeholders, handouts, lab PRs) and `src/slides/` (one file per segment, with presenter notes next to each slide). Run `npm test` after editing a lab PR: each planted issue must anchor to exactly one line of its diff.

## Docs

- [`docs/specs/raising-great-prs-session.md`](docs/specs/raising-great-prs-session.md): what the materials must contain, decisions and acceptance criteria.
- [`docs/plans/raising-great-prs-session-plan.md`](docs/plans/raising-great-prs-session-plan.md): build order, verification and risks.
