import type { LabPullRequest } from '../types'

export const prB: LabPullRequest = {
  id: 'b',
  number: 219,
  title: 'refactor(booking): extract seat reservation into SeatReservationService (#184)',
  author: 'meera-s',
  branch: 'refactor/seat-reservation-service',
  label: 'PR B · Seat reservation refactor',
  summary: 'A tidy refactor with a well-filled template. Read it like an architect.',
  description: `## Ticket
- #184 — Extract seat reservation out of \`BookingService\`
- Risk: **Low** — no behaviour change

## What changed?
- Moved the seat hold and payment flow from \`BookingService\` into a new \`SeatReservationService\`.
- \`BookingController\` delegates reservation to the new service.
- Tidied \`BookingResponse\` naming.
- Added \`paymentReference\` to \`Booking\` so support can trace payments.

## Why?
- \`BookingService\` is 900+ lines and owns three responsibilities. Extracting reservation is step 1 of ADR-012.

## Verification evidence
- Local: \`./mvnw verify\` green.
- CI: build #1043 green, quality gate passed, coverage 86% → 88%.
- Not run, and why: none.

## Test evidence
- 3 new unit tests for \`SeatReservationService\`: happy path, taken seat, payment timeout retry.
- Existing \`BookingServiceTest\` still passes.
- Not tested, and why: none — pure refactor.

## Impact, risks and reviewer notes
- Affected components: booking API only.
- Configuration or feature flags: Not applicable — no configuration change.
- Rollout / rollback: standard deploy; revert the PR if needed.
- Start reviewing at: \`SeatReservationService.reserve\`.

## Linked PRs and merge order
- None — standalone PR.`,
  files: [
    {
      path: 'src/main/java/com/cinebook/booking/SeatReservationService.java',
      status: 'added',
      diff: `@@ -0,0 +1,55 @@
+package com.cinebook.booking;
+
+import com.cinebook.payment.PaymentClient;
+import com.cinebook.payment.PaymentResult;
+import com.cinebook.payment.PaymentTimeoutException;
+import com.cinebook.seat.Seat;
+import com.cinebook.seat.SeatRepository;
+import com.cinebook.seat.SeatUnavailableException;
+import java.util.List;
+import lombok.RequiredArgsConstructor;
+import lombok.extern.slf4j.Slf4j;
+import org.springframework.stereotype.Service;
+import org.springframework.transaction.annotation.Transactional;
+
+@Slf4j
+@Service
+@RequiredArgsConstructor
+public class SeatReservationService {
+
+    private static final int MAX_PAYMENT_ATTEMPTS = 3;
+
+    private final SeatRepository seatRepository;
+    private final BookingRepository bookingRepository;
+    private final PaymentClient paymentClient;
+
+    public BookingResponse reserve(Long userId, ReserveSeatsRequest request) {
+        log.info("Reserving seats {} for {} <{}>", request.seatIds(), request.customerName(), request.customerEmail());
+
+        Booking booking = holdSeats(userId, request);
+        PaymentResult payment = chargeWithRetry(booking);
+        booking.confirm(payment.reference());
+
+        return BookingResponse.from(bookingRepository.save(booking));
+    }
+
+    @Transactional
+    private Booking holdSeats(Long userId, ReserveSeatsRequest request) {
+        List<Seat> seats = seatRepository.findAllById(request.seatIds());
+        if (seats.stream().anyMatch(Seat::isTaken)) {
+            throw new SeatUnavailableException(request.seatIds());
+        }
+        seats.forEach(Seat::markTaken);
+        seatRepository.saveAll(seats);
+        return bookingRepository.save(Booking.pending(userId, request.showtimeId(), seats));
+    }
+
+    private PaymentResult chargeWithRetry(Booking booking) {
+        for (int attempt = 1; ; attempt++) {
+            try {
+                return paymentClient.charge(booking.getUserId(), booking.getTotal());
+            } catch (PaymentTimeoutException e) {
+                if (attempt == MAX_PAYMENT_ATTEMPTS) {
+                    throw e;
+                }
+                log.warn("Payment timed out for booking {}, attempt {}", booking.getId(), attempt);
+            }
+        }
+    }
+}`,
    },
    {
      path: 'src/main/java/com/cinebook/booking/BookingService.java',
      status: 'modified',
      diff: `@@ -31,29 +31,18 @@ public class BookingService {
 
     private final BookingRepository bookingRepository;
-    private final SeatRepository seatRepository;
-    private final PaymentClient paymentClient;
-
-    @Transactional
-    public BookingResponse reserve(Long userId, ReserveSeatsRequest request) {
-        List<Seat> seats = seatRepository.findAllByIdForUpdate(request.seatIds());
-        if (seats.stream().anyMatch(Seat::isTaken)) {
-            throw new SeatUnavailableException(request.seatIds());
-        }
-        seats.forEach(Seat::markTaken);
-        Booking booking = bookingRepository.save(Booking.pending(userId, request.showtimeId(), seats));
-
-        PaymentResult payment = paymentClient.charge(booking.getUserId(), booking.getTotal(), booking.idempotencyKey());
-        booking.confirm();
-        return BookingResponse.from(booking);
-    }
 
     public BookingResponse findForUser(Long bookingId, Long userId) {
         return bookingRepository.findByIdAndUserId(bookingId, userId)
                 .map(BookingResponse::from)
                 .orElseThrow(() -> new BookingNotFoundException(bookingId));
     }
+
+    public BookingResponse findById(Long bookingId) {
+        return bookingRepository.findById(bookingId)
+                .map(BookingResponse::from)
+                .orElseThrow(() -> new BookingNotFoundException(bookingId));
+    }
 }`,
    },
    {
      path: 'src/main/java/com/cinebook/booking/BookingController.java',
      status: 'modified',
      diff: `@@ -21,17 +21,18 @@ public class BookingController {
 
     private final BookingService bookingService;
+    private final SeatReservationService seatReservationService;
 
     @PostMapping
     public ResponseEntity<BookingResponse> reserve(@AuthenticationPrincipal CineUser user,
                                                    @Valid @RequestBody ReserveSeatsRequest request) {
-        BookingResponse booking = bookingService.reserve(user.id(), request);
+        BookingResponse booking = seatReservationService.reserve(user.id(), request);
         return ResponseEntity.status(HttpStatus.CREATED).body(booking);
     }
 
     @GetMapping("/{bookingId}")
-    public BookingResponse get(@AuthenticationPrincipal CineUser user, @PathVariable Long bookingId) {
-        return bookingService.findForUser(bookingId, user.id());
+    public BookingResponse get(@PathVariable Long bookingId) {
+        return bookingService.findById(bookingId);
     }
 }`,
    },
    {
      path: 'src/main/java/com/cinebook/booking/BookingResponse.java',
      status: 'modified',
      diff: `@@ -6,18 +6,20 @@ import java.util.List;
 public record BookingResponse(
         Long id,
         Long showtimeId,
-        List<String> seatNumbers,
+        List<String> seats,
         BigDecimal total,
-        String status) {
+        String status,
+        String paymentReference) {
 
     public static BookingResponse from(Booking booking) {
         return new BookingResponse(
                 booking.getId(),
                 booking.getShowtimeId(),
                 booking.getSeats().stream().map(Seat::label).toList(),
                 booking.getTotal(),
-                booking.getStatus().name());
+                booking.getStatus().name(),
+                booking.getPaymentReference());
     }
 }`,
    },
    {
      path: 'src/main/java/com/cinebook/booking/Booking.java',
      status: 'modified',
      diff: `@@ -40,6 +40,9 @@ public class Booking {
     @Enumerated(EnumType.STRING)
     private BookingStatus status;
 
+    @Column(nullable = false)
+    private String paymentReference;
+
     public static Booking pending(Long userId, Long showtimeId, List<Seat> seats) {
         return new Booking(userId, showtimeId, seats, BookingStatus.PENDING);
     }
@@ -52,6 +55,7 @@ public class Booking {
 
-    public void confirm() {
+    public void confirm(String paymentReference) {
+        this.paymentReference = paymentReference;
         this.status = BookingStatus.CONFIRMED;
     }`,
    },
    {
      path: 'src/main/resources/db/migration/V8__add_booking_payment_reference.sql',
      status: 'added',
      diff: `@@ -0,0 +1 @@
+ALTER TABLE booking ADD COLUMN payment_reference VARCHAR(64) NOT NULL;`,
    },
    {
      path: 'src/test/java/com/cinebook/booking/SeatReservationServiceTest.java',
      status: 'added',
      diff: `@@ -0,0 +1,79 @@
+package com.cinebook.booking;
+
+import static org.assertj.core.api.Assertions.assertThat;
+import static org.assertj.core.api.Assertions.assertThatThrownBy;
+import static org.mockito.ArgumentMatchers.any;
+import static org.mockito.Mockito.times;
+import static org.mockito.Mockito.verify;
+import static org.mockito.Mockito.when;
+
+import com.cinebook.payment.PaymentClient;
+import com.cinebook.payment.PaymentResult;
+import com.cinebook.payment.PaymentTimeoutException;
+import com.cinebook.seat.Seat;
+import com.cinebook.seat.SeatRepository;
+import com.cinebook.seat.SeatUnavailableException;
+import java.util.List;
+import org.junit.jupiter.api.Test;
+import org.junit.jupiter.api.extension.ExtendWith;
+import org.mockito.InjectMocks;
+import org.mockito.Mock;
+import org.mockito.junit.jupiter.MockitoExtension;
+
+@ExtendWith(MockitoExtension.class)
+class SeatReservationServiceTest {
+
+    @Mock SeatRepository seatRepository;
+    @Mock BookingRepository bookingRepository;
+    @Mock PaymentClient paymentClient;
+    @InjectMocks SeatReservationService service;
+
+    private final ReserveSeatsRequest request =
+            new ReserveSeatsRequest(42L, List.of(7L, 8L), "Asha Rao", "asha@example.com");
+
+    @Test
+    void givenFreeSeats_whenReserve_thenBookingIsConfirmed() {
+        // Arrange
+        when(seatRepository.findAllById(request.seatIds())).thenReturn(List.of(seat(7L), seat(8L)));
+        when(bookingRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
+        when(paymentClient.charge(any(), any())).thenReturn(new PaymentResult("pay_123"));
+
+        // Act
+        BookingResponse response = service.reserve(1L, request);
+
+        // Assert
+        assertThat(response.status()).isEqualTo("CONFIRMED");
+        assertThat(response.seats()).containsExactly("A7", "A8");
+    }
+
+    @Test
+    void givenTakenSeat_whenReserve_thenThrowsSeatUnavailable() {
+        // Arrange
+        Seat taken = seat(7L);
+        taken.markTaken();
+        when(seatRepository.findAllById(request.seatIds())).thenReturn(List.of(taken, seat(8L)));
+
+        // Act & Assert
+        assertThatThrownBy(() -> service.reserve(1L, request))
+                .isInstanceOf(SeatUnavailableException.class);
+    }
+
+    @Test
+    void givenPaymentTimesOutOnce_whenReserve_thenRetriesAndConfirms() {
+        // Arrange
+        when(seatRepository.findAllById(request.seatIds())).thenReturn(List.of(seat(7L), seat(8L)));
+        when(bookingRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
+        when(paymentClient.charge(any(), any()))
+                .thenThrow(new PaymentTimeoutException())
+                .thenReturn(new PaymentResult("pay_123"));
+
+        // Act
+        BookingResponse response = service.reserve(1L, request);
+
+        // Assert
+        assertThat(response.paymentReference()).isEqualTo("pay_123");
+        verify(paymentClient, times(2)).charge(any(), any());
+    }
+
+    private static Seat seat(Long id) {
+        return new Seat(id, "A" + id);
+    }
+}`,
    },
  ],
  issues: [
    {
      id: 'b-idor',
      title: 'Any signed-in user can read any booking',
      file: 'src/main/java/com/cinebook/booking/BookingController.java',
      anchor: 'return bookingService.findById(bookingId);',
      severity: 'blocker',
      theme: 'merge',
      stakeholders: ['ceo', 'user'],
      whyItMatters:
        'The ownership check (`findForUser`) was quietly swapped for `findById`. Booking IDs are sequential, so a script can walk every booking — names, seats, payment references. That is a reportable data breach (IDOR).',
      betterApproach:
        'Keep `findForUser(bookingId, user.id())`, and add a test where user B requests user A\'s booking and gets 404.',
    },
    {
      id: 'b-migration',
      title: 'NOT NULL column breaks the deploy and every new booking',
      file: 'src/main/resources/db/migration/V8__add_booking_payment_reference.sql',
      anchor: 'ADD COLUMN payment_reference',
      severity: 'blocker',
      theme: 'release',
      stakeholders: ['dba', 'sre', 'release-manager'],
      whyItMatters:
        'On a table with existing rows the migration fails outright. Even on an empty table, `holdSeats` saves a PENDING booking before payment exists, so `@Column(nullable = false)` rejects every reservation. During a rolling deploy, old pods also insert without the column.',
      betterApproach:
        'Expand then contract: add the column as nullable, deploy, backfill, and only add NOT NULL once every writer sets it (if it ever should be — pending bookings have no reference).',
    },
    {
      id: 'b-double-charge',
      title: 'Payment retried without an idempotency key — customers can be charged twice',
      file: 'src/main/java/com/cinebook/booking/SeatReservationService.java',
      anchor: 'return paymentClient.charge(booking.getUserId(), booking.getTotal());',
      severity: 'blocker',
      theme: 'release',
      stakeholders: ['user', 'support-engineer', 'ceo'],
      whyItMatters:
        'A timeout does not mean the charge failed. The old code passed `booking.idempotencyKey()`; the refactor dropped it and added retries. The new test even asserts two charge calls succeed.',
      betterApproach:
        'Restore the idempotency key on every attempt, and add a test that a timed-out-then-retried charge uses the same key.',
    },
    {
      id: 'b-private-transactional',
      title: '@Transactional on a private method does nothing',
      file: 'src/main/java/com/cinebook/booking/SeatReservationService.java',
      anchor: '@Transactional',
      severity: 'blocker',
      theme: 'release',
      stakeholders: ['architect', 'user'],
      whyItMatters:
        'Spring applies transactions through a proxy, which never sees a private method called from inside the same class. Seat updates and the booking insert are no longer atomic — a failure halfway leaves seats taken with no booking.',
      betterApproach:
        'Put the transactional boundary on a public method of a Spring bean (or use `TransactionTemplate`), and prove it with an integration test, not a mock.',
    },
    {
      id: 'b-lost-lock',
      title: 'Seat lock removed — two people can book the same seat',
      file: 'src/main/java/com/cinebook/booking/SeatReservationService.java',
      anchor: 'seatRepository.findAllById(request.seatIds());',
      severity: 'major',
      theme: 'release',
      stakeholders: ['user', 'product-owner', 'architect'],
      whyItMatters:
        'The old code used `findAllByIdForUpdate` (a row lock). `findAllById` reads without locking, so two concurrent requests both see the seat free and both take it — even once the transaction is fixed.',
      betterApproach:
        'Keep the pessimistic lock or add optimistic locking (`@Version`), backed by a unique constraint on (showtime_id, seat_id) as the last line of defence.',
    },
    {
      id: 'b-stuck-seats',
      title: 'A failed payment leaves seats blocked forever',
      file: 'src/main/java/com/cinebook/booking/SeatReservationService.java',
      anchor: 'PaymentResult payment = chargeWithRetry(booking);',
      severity: 'major',
      theme: 'release',
      stakeholders: ['user', 'product-owner', 'support-engineer'],
      whyItMatters:
        'Seats are marked taken before payment. If payment fails after three attempts, nothing releases them — a sold-out show that is actually half empty, and support tickets to match.',
      betterApproach:
        'Release seats on payment failure, or hold them with an expiry that a scheduled job clears. Add a test for the failure path.',
    },
    {
      id: 'b-pii-logs',
      title: 'Customer name and email written to INFO logs',
      file: 'src/main/java/com/cinebook/booking/SeatReservationService.java',
      anchor: 'request.customerEmail()',
      severity: 'major',
      theme: 'merge',
      stakeholders: ['ceo', 'sre'],
      whyItMatters:
        'Every booking now writes personal data into the log pipeline, where retention, access and deletion rules (GDPR, DPDP Act) were never designed for it.',
      betterApproach: 'Log the booking ID and user ID only. If you must correlate, use a hashed or masked identifier.',
    },
    {
      id: 'b-breaking-rename',
      title: '"Tidied naming" is a breaking API change',
      file: 'src/main/java/com/cinebook/booking/BookingResponse.java',
      anchor: 'List<String> seats,',
      severity: 'blocker',
      theme: 'release',
      stakeholders: ['frontend-engineer', 'external-clients', 'release-manager'],
      whyItMatters:
        'Renaming `seatNumbers` to `seats` changes the JSON. The web app breaks on deploy, and mobile apps already installed on phones break until users update. "Linked PRs: none" means nobody told the frontend.',
      betterApproach:
        'Keep the old field (add the new one alongside and deprecate), or version the API. Link the frontend PR and agree a merge order.',
    },
    {
      id: 'b-misleading-description',
      title: 'The description says "pure refactor" — it isn\'t',
      severity: 'major',
      theme: 'intent',
      stakeholders: ['senior-engineer', 'release-manager', 'future-developer'],
      whyItMatters:
        'It claims low risk, no behaviour change, nothing untested, and rollback by revert. The diff changes the API contract, the schema, security and payment behaviour — and reverting code does not revert a migration. A good-looking template filled with wrong claims is worse than an empty one.',
      betterApproach:
        'Keep the refactor behaviour-preserving and ship the payment reference, field rename and migration as separate PRs, each with honest risk and rollback notes.',
    },
    {
      id: 'b-mock-only-tests',
      title: 'Mock-only tests cannot catch any of the real risks',
      file: 'src/test/java/com/cinebook/booking/SeatReservationServiceTest.java',
      anchor: '@ExtendWith(MockitoExtension.class)',
      severity: 'major',
      theme: 'merge',
      stakeholders: ['tester', 'architect'],
      whyItMatters:
        'With mocked repositories there is no transaction, no lock, no NOT NULL constraint and no concurrency. The tests are well named and structured, yet every blocker above passes them. 88% coverage, very little confidence.',
      betterApproach:
        'Add integration tests against a real database (for example Testcontainers): concurrent booking of one seat, payment failure releases seats, and the migration on a table with rows.',
    },
  ],
  expertTopThree: ['b-migration', 'b-double-charge', 'b-idor'],
  expertScore: 2,
  expertVerdict:
    'Blocking issues. The refactor itself is a good idea and the structure is cleaner, but it hides three behaviour changes and drops two safeguards (the seat lock and the idempotency key) that the old code had. Restore the safeguards, keep the API and ownership check unchanged, and ship the payment reference separately with an expand-then-contract migration.',
  hints: [
    {
      afterMinutes: 4,
      text: 'The description makes four claims: low risk, no behaviour change, nothing untested, and "revert to roll back". Check each one against the diff — especially the deleted lines in BookingService.',
    },
    {
      afterMinutes: 7,
      text: 'Two Spring questions: does @Transactional work on a private method called from the same class? And what did the old code pass to paymentClient.charge that the new code doesn\'t?',
    },
  ],
}
