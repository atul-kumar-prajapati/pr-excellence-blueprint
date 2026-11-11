export interface ConfidenceLevel {
  score: number
  label: string
  meaning: string
}

export const confidenceScale: ConfidenceLevel[] = [
  { score: 5, label: 'Merge now', meaning: 'Evidence covers every claim. Nothing left to discuss.' },
  { score: 4, label: 'Minor nits', meaning: 'Safe to merge once small, non-risky comments are addressed.' },
  { score: 3, label: 'Some risk, not blocking', meaning: 'Known gaps the author has called out and accepted.' },
  { score: 2, label: 'Blocking issues', meaning: 'Must change before merge.' },
  { score: 1, label: 'Rethink or split it', meaning: 'Too big, too mixed, or the approach is wrong.' },
]

export const confidenceGates = [
  'Any red on security, data integrity or rollback caps the score at 2.',
  'A claim without evidence caps the score at 3.',
  'An AI score is advisory. The human reviewer’s score is final.',
]

export const commentLabels = [
  { label: 'blocker', meaning: 'Must change before merge.' },
  { label: 'suggestion', meaning: 'Better idea; author decides.' },
  { label: 'nit', meaning: 'Trivial; never blocks.' },
  { label: 'question', meaning: 'I don’t understand yet — help me.' },
]

export const prTemplate = `<!-- PR title: type(scope): short description
     Conventional Commits types: feat, fix, refactor, test, docs, build, ci, perf, chore.
     If a section does not apply, write "Not applicable — <reason>". Do not leave it blank. -->

## Ticket

- Ticket / issue: <!-- link, or "None — <reason>" -->
- Risk: Low / Medium / High — <!-- blast radius if this fails -->

## What changed?

-

## Why?

<!-- Problem or requirement and expected outcome. Link the spec, design doc or ADR. -->

-

## Verification evidence

<!-- Do not claim a check passed without evidence. -->

- Local checks (build, formatting, lint or static analysis):
- CI / quality gate on the latest commit:
- AI-assisted: No / Yes — <!-- what for: code, tests, self-review -->
- Not run, and why:

## Test evidence

- Behaviour or acceptance criteria verified:
- Tests run and results (unit / integration / contract / end-to-end):
- Regression, negative or edge cases checked:
- How to reproduce / review locally:
- API examples (request, response, error response), if the API changed:
- Not tested, and why:

## Impact, risks and reviewer notes

<!-- Consider users, product, testers, frontend/backend consumers, support, SRE,
     DBA/data, release management, future maintainers and AI agents. -->

- Affected components / consumers:
- Risks and trade-offs (data integrity, security, performance):
- Configuration, environment variables or feature flags changed (including defaults):
- Rollout:
- Rollback (how to revert safely, including data):
- Observability (logs, metrics, alerts, runbook):
- Start reviewing at / needs particular attention:

## Linked PRs and merge order

<!-- Otherwise, write "None — standalone PR". -->

-

## Checklist

<!-- Only items that need author judgment and are not reliably enforced by CI. -->

- [ ] The change is scoped to the ticket, with no unrelated changes.
- [ ] Each acceptance criterion has a test that would fail without the change; bug fixes include a test reproducing the bug.
- [ ] Tests assert expected behaviour, including failure and edge cases.
- [ ] API contracts, documentation, ADRs, runbooks or agent docs (AGENTS.md) are updated where needed.
- [ ] No secrets, tokens or unnecessary personal data in code, tests, logs or fixtures.
- [ ] New or changed endpoints enforce authorization at the boundary and validate input.
- [ ] I understand and own every line, including AI-assisted changes.

Author merge confidence: _/5 — <!-- 5 merge now · 4 nits · 3 non-blocking risk · 2 blocking · 1 rethink/split -->

### Backend (Spring Boot)

- [ ] Errors use the agreed error response format (for example \`ProblemDetail\`) with correct HTTP status codes.
- [ ] No sensitive values are logged; external input in logs is sanitised.
- [ ] Transaction boundaries are on public bean methods, and concurrent updates are protected (locking or constraints).
- [ ] Database migrations are backward compatible for rolling deployments (expand, then contract).
- [ ] Calls to external services have timeouts, bounded retries and idempotency where retried.
- [ ] Service unit tests do not start the Spring context; integration tests cover persistence and transactions.

### Frontend

- [ ] API contract changes are consumed behind a compatible change or coordinated via linked PRs.
- [ ] Loading, empty and error states are handled.
`

export interface ChecklistGroup {
  name: string
  items: string[]
}

export const reviewerChecklist: ChecklistGroup[] = [
  {
    name: 'Intent and scope',
    items: [
      'One purpose; size is reviewable; unrelated changes split out.',
      'Title follows Conventional Commits; ticket linked or "None — reason".',
      'Description claims match the diff (risk, behaviour change, rollback).',
    ],
  },
  {
    name: 'Correctness and testing',
    items: [
      'Business rules and edge cases are correct.',
      'Tests assert behaviour, including failure and boundary cases.',
      'Integration or contract tests exist where mocks can’t prove the risk.',
      'Coverage is a signal, not a target.',
    ],
  },
  {
    name: 'Design and maintainability',
    items: [
      'Layer responsibilities respected; no unjustified abstractions or coupling.',
      'Clear naming; no dead code; TODOs tracked as issues.',
    ],
  },
  {
    name: 'Error handling and observability',
    items: [
      'Errors mapped to the agreed schema and status codes; nothing swallowed.',
      'Structured logs at the right level, plus metrics or alerts where needed.',
    ],
  },
  {
    name: 'Security and data protection',
    items: [
      'Authorization at the boundary, including ownership checks (IDOR).',
      'Input validated; queries parameterised; no mass assignment.',
      'No secrets or personal data in code, logs, responses or fixtures.',
      'New dependencies approved, licensed and free of known vulnerabilities.',
    ],
  },
  {
    name: 'Data integrity and persistence',
    items: [
      'Transaction boundaries and rollback behaviour are correct.',
      'Constraints, locking and idempotency protect concurrent writes.',
      'Queries are efficient: no N+1, indexed, paginated, stable ordering.',
    ],
  },
  {
    name: 'Performance and reliability',
    items: [
      'Latency or load evidence for hot paths.',
      'External calls have timeouts, bounded retries and defined failure modes.',
      'Resources are released; shared state is thread-safe.',
    ],
  },
  {
    name: 'Compatibility and release',
    items: [
      'API, event and schema changes are backward compatible or versioned.',
      'Migrations are safe for rolling deploys; rollback plan covers data.',
      'Config, flags and deploy order documented; linked PRs listed.',
      'README, API docs, runbooks and agent docs updated.',
    ],
  },
  {
    name: 'Automated gates (repo settings, not author checkboxes)',
    items: [
      'Build, tests, coverage, static analysis and formatting.',
      'Secret scanning and dependency scanning.',
      'Branch protection, required approvals, resolved conversations, merge strategy.',
    ],
  },
]

export interface Principle {
  role: 'author' | 'reviewer'
  title: string
  detail: string
  fromLab: string
}

export const principles: Principle[] = [
  {
    role: 'author',
    title: 'One purpose per PR',
    detail: 'If you can’t explain it in one sentence, split it.',
    fromLab: 'PR A mixed three changes; PR B hid behaviour changes inside a refactor.',
  },
  {
    role: 'author',
    title: 'No claim without evidence',
    detail: 'Show the test, the log or the CI result. "Tested locally" is not evidence.',
    fromLab: 'PR A: "works fine". PR B: "no behaviour change".',
  },
  {
    role: 'author',
    title: 'Make it reversible',
    detail: 'Plan compatibility and rollback from the start — including data.',
    fromLab: 'PR B: NOT NULL migration and a renamed API field. Reverting code doesn’t revert either.',
  },
  {
    role: 'reviewer',
    title: 'You own what you approve',
    detail: 'Only approve what you’d be willing to defend. Read the deleted lines too.',
    fromLab: 'PR B’s deleted lines held the seat lock and the idempotency key.',
  },
  {
    role: 'reviewer',
    title: 'Be clear and kind',
    detail: 'Label every comment: blocker, suggestion, nit or question. Review the code, not the person.',
    fromLab: 'Severity ranking in the lab is the same skill as labelling comments.',
  },
]

export interface AiPrompt {
  theme: 'intent' | 'merge' | 'release'
  title: string
  whenToUse: string
  prompt: string
}

export const aiPrompts: AiPrompt[] = [
  {
    theme: 'intent',
    title: 'Draft the description and check the intent',
    whenToUse: 'Before opening the PR.',
    prompt: `Read the diff between this branch and main, plus the ticket text I paste below.

1. Fill in our PR template sections "What changed?" and "Why?" in plain language.
2. List anything in the diff that the ticket does not ask for (scope creep), and anything the ticket asks for that the diff does not do.
3. Flag every place where the diff changes behaviour, an API contract, a database schema or configuration — even if the change looks like a refactor.

Do not invent evidence. If something is unknown, say "unknown".

Ticket:
<paste ticket text>`,
  },
  {
    theme: 'merge',
    title: 'Self-review against the checklist and score it',
    whenToUse: 'After tests pass, before asking for review.',
    prompt: `Review the diff between this branch and main as a strict senior reviewer, using the reviewer checklist below.

For each finding give: file and line, severity (blocker / major / nit), theme (intent / merge / release), and the stakeholder it would hurt.
Pay special attention to the deleted lines: list any safeguard that was removed (locks, checks, idempotency keys, validation).
Then check the tests: for each test, say what behaviour it would catch if broken. Flag tests that would pass even if the code were wrong.

Finish with a merge confidence score from 1 to 5 using these rules:
5 merge now · 4 minor nits · 3 some risk, not blocking · 2 blocking issues · 1 rethink or split.
Any security, data-integrity or rollback blocker caps the score at 2. A claim without evidence caps it at 3.

Checklist:
<paste reviewer checklist>`,
  },
  {
    theme: 'release',
    title: 'Check release risk and draft rollout and rollback',
    whenToUse: 'For any PR touching APIs, schema, config or external calls.',
    prompt: `Analyse the diff between this branch and main for release risk.

1. Database: is every migration safe for a rolling deploy with old and new code running together? Will it fail or lock on a table with existing rows?
2. API and events: is any request or response field added, removed or renamed? Who consumes it (web, mobile, other teams)?
3. External calls: timeouts, retries, idempotency.
4. Logging: is any personal data or secret logged?
5. Configuration and feature flags: new values, defaults, per-environment differences.

Then draft the "Rollout", "Rollback (including data)" and "Linked PRs and merge order" sections of our PR template. If a rollback needs more than reverting the code, say exactly what.`,
  },
]

export const aiPitfalls = [
  {
    title: 'It makes the 5,000-line PR easy to produce',
    detail: 'Generating code is now cheap. Reviewing it is not. Size limits matter more with AI, not less.',
  },
  {
    title: 'Tests that look complete and check nothing',
    detail: 'AI happily writes `assertNotNull(result)` — or, like PR B, a test that locks in the bug.',
  },
  {
    title: 'Plausible and wrong',
    detail: '`@Transactional` on a private method compiles, reads well and does nothing.',
  },
  {
    title: 'It believes the description',
    detail: 'Ask it to compare the description’s claims against the diff, not to summarise the description.',
  },
  {
    title: 'Never paste secrets or customer data into a prompt',
    detail: 'Use fixtures and redacted logs.',
  },
  {
    title: 'Say when AI helped',
    detail: 'The template has a line for it. Disclosure is about review focus, not blame.',
  },
]
