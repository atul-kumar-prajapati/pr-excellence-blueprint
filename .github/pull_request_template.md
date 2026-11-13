<!-- PR title: type(scope): short description
     Conventional Commits: feat, fix, refactor, test, docs, build, ci, perf, chore.
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

- [ ] The change is scoped to the ticket, with no unrelated changes.
- [ ] Each acceptance criterion has a test that would fail without the change; bug fixes include a test reproducing the bug.
- [ ] Tests assert expected behaviour, including failure and edge cases.
- [ ] API contracts, documentation, ADRs, runbooks or agent docs are updated where needed.
- [ ] No secrets, tokens or unnecessary personal data in code, tests, logs or fixtures.
- [ ] New or changed endpoints enforce authorization at the boundary and validate input.
- [ ] I understand and own every line, including AI-assisted changes.

Author merge confidence: _/5 — <!-- 5 merge now · 4 nits · 3 non-blocking risk · 2 blocking · 1 rethink/split -->

### Backend (Spring Boot)

- [ ] Errors use the agreed error response format with correct HTTP status codes.
- [ ] No sensitive values are logged.
- [ ] Transaction boundaries are on public bean methods, and concurrent updates are protected.
- [ ] Database migrations are backward compatible for rolling deployments (expand, then contract).
- [ ] External calls have timeouts, bounded retries and idempotency where retried.
- [ ] Service unit tests do not start the Spring context; integration tests cover persistence and transactions.
