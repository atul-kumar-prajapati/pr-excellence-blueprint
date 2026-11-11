# Spec: Raising Great PRs — Session Materials

**Status:** Decisions confirmed — building
**Session length:** 90 minutes
**Outcome:** By the end of the session, every engineer can raise an AI-assisted PR that's easy to review, safe to merge, and ready to release with confidence.

---

## 1. Decisions

| # | Decision | Consequence for the materials |
|---|---|---|
| D-1 | **Audience:** first run is 20+ veteran architects; later runs are mixed junior to senior. | The first run doubles as a review of the standard. PR B must be subtle enough to challenge architects; PR A stays as the warm-up for mixed groups. The lab focuses on ranking and the merge decision, not just spotting issues. |
| D-2 | **Format:** remote or hybrid. | No printouts. Everything participants touch is a link: lab PRs, worksheet, handouts. Groups work in breakout rooms with an on-screen timer and built-in hints. |
| D-3 | **Content scope:** PRs in general, with concrete Java/Spring Boot examples on the backend and the frontend impact of backend changes. | Lab PRs are Spring Boot. Stakeholder and anatomy examples include the frontend view of API changes. |
| D-4 | **Lab domain:** a movie ticket booking service ("CineBook"). | Familiar to everyone. Naturally contains seat double-booking (concurrency), payments (idempotency), promo codes (money arithmetic), customer data (privacy) and a public API used by web and mobile apps. |
| D-5 | **Lab medium:** realistic PR pages (description, files changed, inline findings) inside the session web app. | Works remotely with no repository access or local build. A real sandbox repository can follow later. |
| D-6 | **AI tool:** OpenAI Codex. | Prompts are written for Codex but kept tool-agnostic so they work in other assistants. |
| D-7 | **Slides:** a dynamic HTML web app instead of a static deck. | The app contains the slides, presenter notes, segment timers, the lab and the handouts. |
| D-8 | **Stack-specific checks:** generic Spring Boot. | No client names or conventions anywhere. |
| D-9 | **Facilitation:** solo. | Presenter notes are built into the app; the lab has timed hints so breakout groups aren't blocked. |
| D-10 | **Ticketing:** no Jira internally. | The template uses a generic "Ticket / issue" field that accepts any link, or "None — reason". |
| D-11 | **Pre-read and baseline:** not needed for the first run. | Dropped from scope; can be added for later runs. |
| D-12 | **Stakeholders:** 14 roles shown in 5 clusters, going deep on 3. | Fits the 8-minute slot. |
| D-13 | **Timeline:** session in about 24 hours. | Priority is a complete, runnable session app; polish comes second. |

## 2. Scope

**In scope:** everything a facilitator needs to run the session as laid out in the agreed agenda, plus a short follow-up pack.

**Out of scope:** CI pipeline changes, enforcing the template across repos, building AI tooling, measuring team metrics.

## 3. Deliverables and acceptance criteria

### D1. Facilitator guide (presenter notes in the app)
Minute-by-minute run sheet for all 8 segments, shown as presenter notes beside each slide.
- Each segment lists: goal, what I say (talking points, not a script), what participants do, questions to ask, expected answers, the takeaway line, and a time cue for when to move on.
- Includes a "if running late, cut this" note per segment.
- **Accepted when** a second facilitator could run the session from it without asking questions.

### D2. Session web app (slides)
- A web app with keyboard navigation, an agenda bar showing which segment is live, a countdown for each segment, and a presenter-notes toggle.
- Interactive pieces where they help: flip-able stakeholder cards, the lab PR pages, copy buttons for the template and AI prompts, and a commitment card.
- Works on a shared screen and on participants' own laptops (remote).
- One title slide plus no more than 3 slides per 5 minutes of talk time (target ≤ 25 slides).
- Opens with the outcome; closes with commitments and next steps.
- Uses the same three themes (intent clarity, merge confidence, release certainty) wherever they appear.
- **Accepted when** every slide maps to a segment in the facilitator guide and the deck fits the 90-minute dry run.

### D3. The 5,000-line PR scenario (0–5 min)
- A short, believable story: PR stats (files, lines, days open, reviewers), what was skimmed, what broke in production, who found out first.
- Three questions for the room.
- **Accepted when** it names all three costs: review friction, hidden risk, cognitive load.

### D4. Quality bar one-pager (5–12 min)
- Must-haves vs nice-to-haves.
- A "how this 5,000-line PR should have been split" example (refactor → additive migration → feature behind flag → cleanup).
- **Accepted when** each must-have maps to a section of the PR template.

### D5. Stakeholder map (12–20 min)
- 14 stakeholders in 5 clusters: Business (user, product owner, CEO), Engineering (senior engineer, architect, future developer, frontend engineer), Quality and operations (tester, support engineer, SRE, release manager), Data (DBA / analytics), Consumers and agents (other teams / external clients, AI agent).
- For each stakeholder: what they fear from a backend PR, and which template section answers it.
- **Accepted when** every stakeholder points to at least one template section.

### D6. In-house PR template
- Generic version of the agreed client layout: Ticket, What changed?, Why?, Verification evidence, Test evidence, Impact/risks/reviewer notes, Linked PRs and merge order, Checklist, stack-specific section(s).
- Keeps the "Not applicable — reason", "Not run, and why" and "Not tested, and why" rules.
- Includes risk level, rollback, observability, AI-assistance line, and optional author merge confidence score.
- **Accepted when** it fits on one screen in edit view per section and contains no client-specific names.

### D7. Reviewer checklist
- The grouped reviewer standard (intent and scope; correctness and testing; design; error handling and observability; security; data integrity; performance and reliability; compatibility and release; automated gates).
- **Accepted when** every item is either judgment-based for a human or explicitly marked as CI-enforced.

### D8. Merge confidence scale
- 1–5 scale with plain-language meanings and gating rules (security, data integrity or rollback red → max 2; missing evidence → max 3; AI score advisory, human score final).
- **Accepted when** the same scale is used unchanged in the lab, the AI demo and the template.

### D9. Lab materials (35–57 min)
- **PR pages in the app:** each looks like a real PR (title, description, files changed with line numbers) from the fictional CineBook Spring Boot service.
- **PR A — obviously messy (promo codes):** vague description, no ticket, tests with no meaningful assertions, N+1 query, `BigDecimal.equals` comparison, swallowed exception, dead code, unrelated changes.
- **PR B — looks clean, subtly broken (seat reservation refactor):** good description and tidy code, but a backward-incompatible API field rename with no linked frontend PR, `@Transactional` on a private method (seats can be double-booked), customer email logged at INFO, missing ownership check on booking lookup (IDOR), retry around a non-idempotent payment call, and a `NOT NULL` migration with no default.
- Each PR is 150–250 changed lines.
- **Lab worksheet (built into the PR page):** participants click a line to log a finding with theme, severity (blocker/major/nit) and the stakeholder it hurts; pick a top 3; give a merge confidence score with a reason. Findings stay in the browser.
- **Timed hints** appear for breakout groups at set points, since the facilitator can't be in every room.
- **Expert answer key** per PR: every planted issue with severity, theme, stakeholder, why it matters, and the expected merge confidence score.
- **Accepted when** a pilot reviewer (not the author) finds at least half the planted issues in 10 minutes, and a second senior engineer agrees with the answer key's rankings.

### D10. Principles poster (57–65 min)
- Pre-seeded with the 5 draft principles (3 author, 2 reviewer), refined live from lab findings.
- **Accepted when** each principle traces back to at least one planted lab issue.

### D11. AI demo kit (65–80 min)
- Three prompts, one per theme: describe-the-PR (intent), self-review against the checklist and score (merge confidence), release-risk check (release certainty).
- Demo script run against PR B, with expected AI output captured in advance as a fallback if the live run fails or is slow.
- A "where AI goes wrong" slide with a real example from the dry run (e.g. a test the AI wrote that asserts nothing).
- **Accepted when** the demo runs end to end in under 10 minutes and the fallback outputs are saved.

### D12. Commitments and follow-up pack (80–90 min)
- Commitment card: one change as an author, one as a reviewer.
- Follow-up pack: final template, reviewer checklist, merge confidence scale, AI prompts, and a date for the check-in.
- **Accepted when** the pack can be sent the same day as the session (the handouts page in the app is the pack).

## 4. Constraints

- Total runtime is fixed at 90 minutes; the lab gets 22 minutes and is not cut.
- All lab code must be fictional and contain no client code, names or data.
- All materials live in this repo and are reviewed like code.

## 5. Later (not for the first run)

- A real sandbox repository with PR A and PR B opened as actual PRs.
- A pre-read and baseline PR metrics for mixed-seniority runs.
