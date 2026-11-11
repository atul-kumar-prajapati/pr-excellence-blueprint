# Spec: Raising Great PRs — Session Materials

**Status:** Draft — awaiting review of assumptions and open questions
**Session length:** 90 minutes
**Outcome:** By the end of the session, every engineer can raise an AI-assisted PR that's easy to review, safe to merge, and ready to release with confidence.

---

## 1. Assumptions (confirm or correct before planning is locked)

| # | Assumption | If wrong, what changes |
|---|---|---|
| A1 | Audience is 10–20 in-house engineers, mostly backend Java/Spring, mixed seniority. | Group sizes, lab PR difficulty, stakeholder examples. |
| A2 | Session is in person with a projector; laptops available for the lab. | Remote needs breakout rooms, online worksheet, no printouts. |
| A3 | The lab runs on **real PRs in a small sandbox Spring Boot repo**, not printed diffs. | Printed diffs are cheaper to build but lose realism and can't be reused for the AI demo. |
| A4 | The AI demo uses the AI coding tool the team already uses day to day. | Demo script and prompts are tool-specific. |
| A5 | The in-house PR template is derived from the client template, with client-specific items (Jira key, `ProblemDetail`, `siteCode`, `LogText`) replaced by generic equivalents. | If the team has its own conventions, the stack-specific checklist uses those. |
| A6 | Slides are Markdown-based (e.g. Marp) so they live in this repo and can be reviewed like code. | If the team uses Google Slides or PowerPoint, slides are built there and only the source notes live here. |
| A7 | One lead facilitator, plus one helper to float between lab groups. | Solo facilitation needs a tighter lab brief and printed instructions. |
| A8 | The 14 stakeholders are presented in **5 clusters** so the 8-minute segment stays discussable. | Presenting all 14 individually needs about 15 minutes. |

## 2. Scope

**In scope:** everything a facilitator needs to run the session as laid out in the agreed agenda, plus a short follow-up pack.

**Out of scope:** CI pipeline changes, enforcing the template across repos, building AI tooling, measuring team metrics beyond a simple baseline.

## 3. Deliverables and acceptance criteria

### D1. Facilitator guide
Minute-by-minute run sheet for all 8 segments.
- Each segment lists: goal, what I say (talking points, not a script), what participants do, questions to ask, expected answers, the takeaway line, and a time cue for when to move on.
- Includes a "if running late, cut this" note per segment.
- **Accepted when** a second facilitator could run the session from it without asking questions.

### D2. Slide deck
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
- **Sandbox repo:** a small Spring Boot service (orders/discounts domain) that builds and passes its own tests on `main`.
- **PR A — obviously messy:** vague description, tests with no meaningful assertions, N+1 query, `BigDecimal.equals` comparison, dead code, no ticket link.
- **PR B — looks clean, subtly broken:** good description and tidy code, but a backward-incompatible API field rename, `@Transactional` on a private method, customer email logged at INFO, missing ownership check (IDOR), retry around a non-idempotent payment call.
- Each PR is 150–250 changed lines.
- **Lab worksheet:** columns for issue, theme, severity (blocker/major/nit), stakeholder hurt; top 3; merge confidence score with reason.
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
- Simple baseline to compare against later: median PR size, time to first review, and rework (PRs needing more than one round of changes), if the data is available.
- **Accepted when** the pack can be sent the same day as the session.

## 4. Constraints

- Total runtime is fixed at 90 minutes; the lab gets 22 minutes and is not cut.
- All lab code must be fictional and contain no client code, names or data.
- All materials live in this repo and are reviewed like code.

## 5. Open questions

See the questions list shared alongside this spec; answers will update the assumptions table above.
