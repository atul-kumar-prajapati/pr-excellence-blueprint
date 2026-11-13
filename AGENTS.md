# CineBook conventions

- Money is `BigDecimal`, scale 2, `RoundingMode.HALF_EVEN`. Never `double`.
- Errors go out as `ProblemDetail` with the correct HTTP status.
- `@Transactional` belongs on public methods of Spring beans. Private self-invocation is not transactional.
- Seat holds use `findAllByIdForUpdate` (pessimistic lock) inside the booking transaction.
- Payments always pass `booking.getIdempotencyKey()`. Timeouts are not failures.
- `GET /api/bookings/{id}` is scoped to the caller (`X-User-Id`). Never `findById` alone.
- JSON field names are part of the contract. Do not rename `seatNumbers` without a linked frontend PR.
- Migrations for rolling deploys are additive. No `NOT NULL` on a new column until every writer sets it and existing rows are backfilled.
- Do not log names, emails, tokens or card data.
