<!-- PR title: type(scope): short description
     Follow Conventional Commit Types: feat | fix | refactor | chore | docs | style | perf | test | build | ci
     If a section does not apply, write "Not applicable — <reason>". Do not leave it blank. -->

## What changed?

-

## Why?

<!-- Write this so a reviewer understands the purpose without opening Jira.
     A ticket link is extra, not a substitute.
     The problem or requirement, and why this PR exists now.
     Link the spec, design doc or ADR if there is one. -->

-

## Verification evidence

<!-- Static self-review: what you examined before raising this PR.
     Provide evidence of every check you ran — linting, secrets scan, static
     analysis, adversarial AI code review, architectural conformance, etc.
     A thorough verification here helps the reviewer significantly. -->

- Linting / formatting:
- Secrets / sensitive-data scan:
- Static / AI self-review:
- If not verified, share why:

## Test evidence

<!-- Dynamic evidence: show that the code behaves as expected.
     Attach or inline results for every level that applies —
     unit, integration, contract, and end-to-end tests.
     For UI changes: attach before/after screenshots or a screen recording.
     For API changes: attach request/response samples or a Postman run.
     Map each result back to the acceptance criteria it covers. -->

- Unit tests:
- Integration / contract tests:
- End-to-end / manual tests:
- Screenshots or recordings:
- If not tested, share why:

## Linked PRs and merge order

<!-- For work spanning more than one repo or PR. "None" if this PR stands alone. -->

-

## Reviewer notes

<!-- Risks, trade-offs, anything needing a closer look, and how to undo this if it misbehaves. -->

-

## Checklist

<!-- Only what CI does not prove. -->

- [ ] Repo checks pass locally after the last change.
- [ ] Each acceptance criterion has a test that fails without this change. A bug fix has a
      regression test that reproduces the bug.
- [ ] No secrets, tokens or personal data in code, tests, logs or fixtures.
- [ ] Docs, ADR or OpenAPI updated where behaviour or a contract changed.
- [ ] Any new config, env var or feature flag is named above, with its default, and applied in the
      target environments.
- [ ] Scoped to one change, with no unrelated files.
- [ ] AI-assisted changes are read, understood and owned by the author.

### Backend

- [ ] Errors go through `ProblemDetail`. No sensitive value is logged.
- [ ] A new or changed table: the migration is additive for a rolling deploy.
- [ ] Authentication and authorization verified at the correct boundaries.
- [ ] Input validated at the API layer; business constraints enforced in the service layer.
- [ ] Unit tests for services do not use `@SpringBootTest`.
