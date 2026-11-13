# feat(promo): apply percentage codes at checkout

**Ticket:** #231  
**Risk:** Low — booking totals only, no schema change that affects other services.

## What changed?

- New `PromoCode` entity and `POST /api/bookings/{id}/promo?code=`
- `GET /api/bookings/summary` so the web app can show movie title + total on the “My tickets” page
- Seed data includes `FRIDAY15` (15% off)

## Why?

Product wants Friday promo codes on checkout. Finance agreed 15% of the current booking total.

## Verification evidence

- Local: `./mvnw test` green
- AI-assisted: Yes — tests
- Not run, and why: none

## Test evidence

- `PromoServiceTest` covers apply and an expired/unknown path
- Existing booking tests still pass

## Impact

- Affected: booking API
- Rollout / rollback: standard deploy; revert the PR
- Linked PRs: None — standalone PR
- Start reviewing at: `PromoService.applyPromo`
