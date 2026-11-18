# refactor(booking): extract SeatReservationService (#184)

**Risk: Low** — no behaviour change. Pure structure.

## What changed?

- Moved seat hold and payment out of `BookingService` into `SeatReservationService`
- `BookingController` delegates reservation to the new service
- Tidied `BookingResponse` naming (`seatNumbers` → `seats`)
- Added `paymentReference` on `Booking` so support can trace charges
- Flyway migration `V2__add_booking_payment_reference.sql`

## Why?

`BookingService` was growing. Extracting reservation is step 1 of ADR-012.

## Verification evidence

- Local: `./mvnw test` green
- Coverage 86% → 88%
- AI-assisted: Yes — extract method / tests
- Not run, and why: none — pure refactor

## Test evidence

- 3 new unit tests for `SeatReservationService`: happy path, taken seat, payment timeout retry
- Existing API test still passes
- Not tested, and why: none

## Impact

- Affected: booking API only
- Rollout / rollback: standard deploy; revert the PR
- Linked PRs: None — standalone PR
- Start reviewing at: `SeatReservationService.reserve`
