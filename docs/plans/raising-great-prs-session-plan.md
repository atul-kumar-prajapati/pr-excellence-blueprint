# Plan: Preparing the Raising Great PRs Session Materials

**Status:** In progress — follows `docs/specs/raising-great-prs-session.md`.

Everything ships as one web app: slides, presenter notes, lab PR pages and handouts. Participants open the same link remotely.

## Build order

| Phase | What | Done when |
|---|---|---|
| 1. Content foundations | PR template, reviewer checklist, merge confidence scale (as data the app renders and copies) | Template has no client names; scale is identical everywhere it appears. |
| 2. Lab content | PR A and PR B diffs, descriptions, planted issues with answer keys, timed hints | Each PR is 150–250 changed lines; every planted issue has severity, theme, stakeholder and "why it matters". |
| 3. App shell | Vite + React + TypeScript + Tailwind + shadcn/ui; agenda bar, segment timer, keyboard navigation, presenter notes | Can click or arrow through all 8 segments with notes. |
| 4. Slides | Content for all 8 segments, including the 5,000-line story, quality bar, stakeholder clusters, anatomy, principles, AI segment, commitments | Every segment has slides and presenter notes. |
| 5. Lab pages | PR page with files changed, click-to-log findings, top 3, score, reveal expert review | A group can complete the worksheet and compare against the key. |
| 6. Handouts | Template, checklist, scale and Codex prompts with copy buttons | Each handout copies as clean Markdown. |
| 7. Verify | Build, lint, click through every slide and both labs on desktop and laptop widths | No broken slide; lab works end to end. |

## Repo layout

```
docs/specs/   docs/plans/
src/
  content/    # session content as typed data: slides, notes, template, checklist, scale, lab PRs, prompts
  components/ # slide renderers, PR diff viewer, timer, agenda bar
  pages/      # deck, lab, handouts
```

Keeping content in `src/content/` means wording changes don't touch layout code.

## Verification

- **Timing:** dry run with the in-app timers; trim using the presenter notes' "if running late" lines.
- **Lab difficulty:** ask one person who hasn't seen the PRs to try PR B for 10 minutes; they should find about half the planted issues.
- **AI demo:** run the three Codex prompts against PR B before the session; paste the best output into the fallback panel.

## Risks

| Risk | Mitigation |
|---|---|
| Architects find PR A trivial | Use PR A only as a 2-minute warm-up for them, or give both groups PR B and compare rankings. |
| Remote groups get stuck | Timed hints in the lab page. |
| Live AI demo is slow or poor | Saved fallback output; a poor result becomes the teaching point. |
| Content edits close to the session | All wording lives in `src/content/`. |
