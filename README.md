# CineBook — Raising Great PRs

A 90-minute in-house workshop: raise a PR that is easy to review, safe to merge, and ready to release.

**Session notes:** [atul-kumar-prajapati.github.io/pr-excellence-blueprint](https://atul-kumar-prajapati.github.io/pr-excellence-blueprint/)

**Lab (open these, not a local checkout):**

- Group A — [PR #1 promo codes](https://github.com/atul-kumar-prajapati/pr-excellence-blueprint/pull/1)
- Group B — [PR #2 reservation extract](https://github.com/atul-kumar-prajapati/pr-excellence-blueprint/pull/2)

Split the room. Each group reviews **one** PR. Score it 1–5. Do not send the expert notes before they review.

## What is in the repo

| Path | What it is |
|---|---|
| `main` | Working CineBook API (bookings, seats, payments with an idempotency key and an ownership check) |
| `lab/pr-a-promo` | Lab PR A — promo codes |
| `lab/pr-b-reservation` | Lab PR B — a tidy reservation refactor |
| `src/main/resources/static/notes.html` | Source for the GitHub Pages notes |
| `.github/pull_request_template.md` | The in-house PR template from the session |

## Run the API on your machine

The session is the Pages site. Run Spring Boot only if you want to hit the booking API.

Java 21.

```bash
./mvnw test
./mvnw spring-boot:run
```

API on port 4581:

```bash
curl -s http://127.0.0.1:4581/api/movies

curl -s http://127.0.0.1:4581/api/showtimes/1/seats

curl -s -X POST http://127.0.0.1:4581/api/bookings \
  -H 'Content-Type: application/json' \
  -H 'X-User-Id: 1' \
  -d '{"showtimeId":1,"seatIds":[1]}'
```

## Stack

Spring Boot 4.1 · Java 21 · Spring Web MVC · Spring Data JPA · H2 (in-memory) · JUnit 5.
