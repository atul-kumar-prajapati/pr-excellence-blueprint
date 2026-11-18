# CineBook — Raising Great PRs

A small **Spring Boot** movie-ticket booking API, plus an HTML session deck. Use it to run a 90-minute in-house workshop on raising pull requests that are easy to review, safe to merge, and ready to release.

**Outcome:** By the end of the session, every engineer can raise an AI-assisted PR that's easy to review, safe to merge, and ready to release with confidence.

## What you get

| Path | What it is |
|---|---|
| `main` | Working CineBook API (bookings, seats, payments with an idempotency key and an ownership check) |
| `lab/pr-a-promo` | Lab PR A — promo codes. Looks finished. The issues need a focused read. |
| `lab/pr-b-reservation` | Lab PR B — a tidy reservation refactor. The template says “no behaviour change”. Read the deleted lines. |
| `src/main/resources/static/` | Original session: `index.html` and `handouts.html` |
| `src/main/resources/static/v2/` | Revised landing + session after 16 Nov feedback (Helvetica, reveal, real 5k story) |
| `.github/pull_request_template.md` | The in-house PR template from the session |

This is a normal Maven repo. Push it to any GitHub remote and open PRs from the two `lab/*` branches against `main`.

## Run the app and the deck

Java 21.

```bash
./mvnw test
./mvnw spring-boot:run
```

Then:

- Original session deck (kept as-is): http://127.0.0.1:4581/
- Original handouts: http://127.0.0.1:4581/handouts.html
- Notepad notes for presenting to architects: http://127.0.0.1:4581/notes.html
- Revised version after the 16 Nov review (Helvetica, landing page, human copy): http://127.0.0.1:4581/v2/
- Revised session: http://127.0.0.1:4581/v2/session.html
- API: `GET http://127.0.0.1:4581/api/movies`

You can also open `src/main/resources/static/index.html` or `src/main/resources/static/v2/index.html` directly in a browser (the CSS and JS are relative).

Keys: **← →** move slides · **N** presenter notes.

Demo bookings use the header `X-User-Id`:

```bash
# list seats for the Dune evening show (id 1 after seed)
curl -s http://127.0.0.1:4581/api/showtimes/1/seats

# reserve A1 as user 1
curl -s -X POST http://127.0.0.1:4581/api/bookings \
  -H 'Content-Type: application/json' \
  -H 'X-User-Id: 1' \
  -d '{"showtimeId":1,"seatIds":[1]}'
```

## How to run the lab

Split the room. Each group reviews **one branch**, not both.

```bash
git checkout lab/pr-a-promo          # Group A
git diff main...HEAD
./mvnw test                          # green is not the same as safe

git checkout lab/pr-b-reservation    # Group B
git diff main...HEAD
```

Score it 1–5 using the scale on the deck. Then compare with the expert reveal on the next slides (or in presenter notes).

Facilitator: do not send people the expert notes before they review. The planted issues are meant to be found by reading, not by grepping for `TODO`.

## Push to your own GitHub

```bash
git remote add github git@github.com:<you>/cinebook.git
git push -u github main
git push github lab/pr-a-promo lab/pr-b-reservation
```

Then open two pull requests from those branches. That is the lab.

## Stack

Spring Boot 4.1 · Java 21 · Spring Web MVC · Spring Data JPA · H2 (in-memory) · JUnit 5.
