import type { LabPullRequest } from '../types'

export const prA: LabPullRequest = {
  id: 'a',
  number: 212,
  title: 'promo code changes',
  author: 'ravi-k',
  branch: 'feature/promo',
  label: 'PR A · Promo codes',
  summary: 'Adds promo codes to bookings. Looks rushed — the warm-up PR.',
  description: `Added promo codes. Also fixed some stuff in booking and added a summary endpoint the app team asked for.

Tested locally, works fine.

Please review asap, needed for the Friday release 🙏`,
  files: [
    {
      path: 'src/main/resources/db/migration/V7__create_promo_code.sql',
      status: 'added',
      diff: `@@ -0,0 +1,8 @@
+CREATE TABLE promo_code (
+    id            BIGSERIAL PRIMARY KEY,
+    code          VARCHAR(32)  NOT NULL,
+    percent_off   INTEGER      NOT NULL,
+    max_uses      INTEGER      NOT NULL,
+    used_count    INTEGER      NOT NULL DEFAULT 0,
+    expires_at    TIMESTAMP    NOT NULL
+);`,
    },
    {
      path: 'src/main/java/com/cinebook/promo/PromoCode.java',
      status: 'added',
      diff: `@@ -0,0 +1,23 @@
+package com.cinebook.promo;
+
+import jakarta.persistence.Entity;
+import jakarta.persistence.GeneratedValue;
+import jakarta.persistence.Id;
+import java.time.LocalDateTime;
+import lombok.Getter;
+import lombok.Setter;
+
+@Entity
+@Getter
+@Setter
+public class PromoCode {
+
+    @Id
+    @GeneratedValue
+    private Long id;
+
+    private String code;
+    private int percentOff;
+    private int maxUses;
+    private int usedCount;
+    private LocalDateTime expiresAt;
+}`,
    },
    {
      path: 'src/main/java/com/cinebook/promo/PromoCodeRepository.java',
      status: 'added',
      diff: `@@ -0,0 +1,8 @@
+package com.cinebook.promo;
+
+import java.util.Optional;
+import org.springframework.data.jpa.repository.JpaRepository;
+
+public interface PromoCodeRepository extends JpaRepository<PromoCode, Long> {
+    Optional<PromoCode> findByCode(String code);
+}`,
    },
    {
      path: 'src/main/java/com/cinebook/promo/PromoService.java',
      status: 'added',
      diff: `@@ -0,0 +1,56 @@
+package com.cinebook.promo;
+
+import com.cinebook.booking.Booking;
+import com.cinebook.booking.BookingRepository;
+import java.math.BigDecimal;
+import java.time.LocalDateTime;
+import org.springframework.beans.factory.annotation.Autowired;
+import org.springframework.beans.factory.annotation.Value;
+import org.springframework.stereotype.Service;
+
+@Service
+public class PromoService {
+
+    @Autowired
+    private PromoCodeRepository promoRepo;
+
+    @Autowired
+    private BookingRepository bookingRepo;
+
+    @Value("\${promo.admin-key}")
+    private String adminKey;
+
+    public BigDecimal applyPromo(Long userId, Long bookingId, String code) {
+        Booking b = bookingRepo.findByIdAndUserId(bookingId, userId).get();
+        BigDecimal total = b.getTotal();
+        try {
+            PromoCode p = promoRepo.findByCode(code).get();
+            if (p.getExpiresAt().isBefore(LocalDateTime.now())) {
+                return total;
+            }
+            if (p.getUsedCount() < p.getMaxUses()) {
+                double discounted = total.doubleValue() - (total.doubleValue() * p.getPercentOff() / 100);
+                BigDecimal newTotal = new BigDecimal(discounted);
+                if (newTotal.equals(BigDecimal.ZERO)) {
+                    newTotal = BigDecimal.ONE;
+                }
+                p.setUsedCount(p.getUsedCount() + 1);
+                promoRepo.save(p);
+                b.setTotal(newTotal);
+                bookingRepo.save(b);
+                return newTotal;
+            }
+        } catch (Exception e) {
+            return total;
+        }
+        return total;
+    }
+
+    public boolean isAdmin(String key) {
+        return adminKey.equals(key);
+    }
+
+    // public BigDecimal calculateDiscountOld(BigDecimal total, int pct) {
+    //     return total.multiply(BigDecimal.valueOf(pct)).divide(BigDecimal.valueOf(100));
+    // }
+}`,
    },
    {
      path: 'src/main/java/com/cinebook/booking/BookingController.java',
      status: 'modified',
      diff: `@@ -18,6 +18,8 @@ public class BookingController {
 
     private final BookingService bookingService;
+    private final PromoService promoService;
+    private final ShowtimeRepository showtimeRepository;
 
     @PostMapping
     public ResponseEntity<BookingResponse> create(@AuthenticationPrincipal CineUser user,
@@ -30,4 +32,22 @@ public class BookingController {
         return bookingService.findForUser(bookingId, user.id());
     }
+
+    @PostMapping("/{bookingId}/promo")
+    public BigDecimal applyPromo(@AuthenticationPrincipal CineUser user,
+                                 @PathVariable Long bookingId, @RequestParam String code) {
+        return promoService.applyPromo(user.id(), bookingId, code);
+    }
+
+    @GetMapping("/summary")
+    public List<BookingSummary> summary(@AuthenticationPrincipal CineUser user) {
+        List<BookingSummary> result = new ArrayList<>();
+        for (Booking booking : bookingService.findAllForUser(user.id())) {
+            Showtime showtime = showtimeRepository.findById(booking.getShowtimeId()).orElseThrow();
+            result.add(new BookingSummary(booking.getId(), showtime.getMovieTitle(),
+                    showtime.getStartsAt(), booking.getTotal()));
+        }
+        return result;
+    }
 }`,
    },
    {
      path: 'src/main/java/com/cinebook/booking/BookingService.java',
      status: 'modified',
      diff: `@@ -22,10 +22,15 @@ public class BookingService {
 
-    public BookingResponse findForUser(Long bookingId, Long userId) {
-        return bookingRepository.findByIdAndUserId(bookingId, userId)
-                .map(BookingResponse::from)
-                .orElseThrow(() -> new BookingNotFoundException(bookingId));
-    }
+    public BookingResponse findForUser(Long id, Long uid) {
+        System.out.println("finding booking " + id + " for " + uid);
+        return bookingRepository.findByIdAndUserId(id, uid)
+                .map(BookingResponse::from)
+                .orElseThrow(() -> new BookingNotFoundException(id));
+    }
+
+    public List<Booking> findAllForUser(Long userId) {
+        return bookingRepository.findAllByUserId(userId);
+    }
 }`,
    },
    {
      path: 'src/main/resources/application.yml',
      status: 'modified',
      diff: `@@ -8,3 +8,6 @@ spring:
   jpa:
     open-in-view: false
+
+promo:
+  admin-key: cinebook-promo-admin-2026!`,
    },
    {
      path: 'src/test/java/com/cinebook/promo/PromoServiceTest.java',
      status: 'added',
      diff: `@@ -0,0 +1,51 @@
+package com.cinebook.promo;
+
+import static org.junit.jupiter.api.Assertions.assertNotNull;
+import static org.mockito.ArgumentMatchers.any;
+import static org.mockito.Mockito.when;
+
+import com.cinebook.booking.Booking;
+import com.cinebook.booking.BookingRepository;
+import java.math.BigDecimal;
+import java.time.LocalDateTime;
+import java.util.Optional;
+import org.junit.jupiter.api.Test;
+import org.junit.jupiter.api.extension.ExtendWith;
+import org.mockito.InjectMocks;
+import org.mockito.Mock;
+import org.mockito.junit.jupiter.MockitoExtension;
+
+@ExtendWith(MockitoExtension.class)
+class PromoServiceTest {
+
+    @Mock
+    PromoCodeRepository promoRepo;
+
+    @Mock
+    BookingRepository bookingRepo;
+
+    @InjectMocks
+    PromoService promoService;
+
+    @Test
+    void testApplyPromo() {
+        Booking booking = new Booking();
+        booking.setTotal(new BigDecimal("249.50"));
+        PromoCode promo = new PromoCode();
+        promo.setPercentOff(15);
+        promo.setMaxUses(100);
+        promo.setExpiresAt(LocalDateTime.now().plusDays(1));
+        when(bookingRepo.findByIdAndUserId(any(), any())).thenReturn(Optional.of(booking));
+        when(promoRepo.findByCode("FRIDAY15")).thenReturn(Optional.of(promo));
+
+        BigDecimal result = promoService.applyPromo(1L, 1L, "FRIDAY15");
+
+        assertNotNull(result);
+    }
+
+    @Test
+    void testApplyPromo2() {
+        when(bookingRepo.findByIdAndUserId(any(), any())).thenReturn(Optional.of(new Booking()));
+
+        promoService.applyPromo(1L, 1L, "EXPIRED");
+    }
+}`,
    },
  ],
  issues: [
    {
      id: 'a-secret',
      title: 'Admin key committed in plain text',
      file: 'src/main/resources/application.yml',
      anchor: 'admin-key: cinebook-promo-admin-2026!',
      severity: 'blocker',
      theme: 'merge',
      stakeholders: ['ceo', 'sre'],
      whyItMatters:
        'Anyone with read access to the repo, its forks or CI logs now holds an admin credential. Removing it in a later commit does not help — it stays in git history.',
      betterApproach:
        'Read it from the environment or a secret manager (for example `promo.admin-key: ${PROMO_ADMIN_KEY}`), rotate the leaked key, and let secret scanning block the push next time.',
    },
    {
      id: 'a-double-money',
      title: 'Money calculated with double',
      file: 'src/main/java/com/cinebook/promo/PromoService.java',
      anchor: 'double discounted',
      severity: 'blocker',
      theme: 'merge',
      stakeholders: ['user', 'product-owner'],
      whyItMatters:
        '15% off 249.50 becomes 212.07499999999998863131622783839702606201171875 once it goes through double and `new BigDecimal(double)`. Customers get charged odd amounts and finance reconciliation breaks.',
      betterApproach:
        'Stay in BigDecimal end to end: `total.multiply(percent).divide(HUNDRED, 2, RoundingMode.HALF_EVEN)`, with the rounding rule agreed with finance and covered by a test.',
    },
    {
      id: 'a-bigdecimal-equals',
      title: 'BigDecimal compared with equals, plus an unexplained business rule',
      file: 'src/main/java/com/cinebook/promo/PromoService.java',
      anchor: 'newTotal.equals(BigDecimal.ZERO)',
      severity: 'major',
      theme: 'merge',
      stakeholders: ['product-owner', 'future-developer'],
      whyItMatters:
        '`equals` also compares scale, so 0.00 is not equal to 0 and the branch never runs. And why does a 100% promo cost 1? Nobody reviewing can tell whether that is a rule or a guess.',
      betterApproach:
        'Use `compareTo(BigDecimal.ZERO) == 0`, and either link the business rule in the description or remove it.',
    },
    {
      id: 'a-usage-race',
      title: 'Promo usage limit can be exceeded under load',
      file: 'src/main/java/com/cinebook/promo/PromoService.java',
      anchor: 'p.getUsedCount() < p.getMaxUses()',
      severity: 'major',
      theme: 'release',
      stakeholders: ['product-owner', 'dba'],
      whyItMatters:
        'Check-then-act with no transaction or lock: two requests at the same moment both see 99 of 100 uses and both succeed. A Friday-night promo can be redeemed far beyond its budget.',
      betterApproach:
        'Do it atomically: `UPDATE promo_code SET used_count = used_count + 1 WHERE code = ? AND used_count < max_uses`, or use optimistic locking with `@Version`, inside one transaction with the booking update.',
    },
    {
      id: 'a-swallowed-exception',
      title: 'Every failure silently returns the full price',
      file: 'src/main/java/com/cinebook/promo/PromoService.java',
      anchor: 'catch (Exception e)',
      severity: 'major',
      theme: 'release',
      stakeholders: ['support-engineer', 'user'],
      whyItMatters:
        'Unknown code, expired code, database error — the customer sees the same undiscounted price with no message, and support has no log to look at. Meanwhile `.get()` on the booking lookup throws a 500 outside the try.',
      betterApproach:
        'Return specific, documented errors (for example 404 unknown code, 422 expired or used up) through the standard error response, and log unexpected failures with context.',
    },
    {
      id: 'a-n-plus-one',
      title: 'N+1 queries and an unbounded list in the summary endpoint',
      file: 'src/main/java/com/cinebook/booking/BookingController.java',
      anchor: 'showtimeRepository.findById(booking.getShowtimeId())',
      severity: 'major',
      theme: 'release',
      stakeholders: ['sre', 'dba', 'frontend-engineer'],
      whyItMatters:
        'One query per booking, no pagination. A regular customer with 300 bookings costs 301 queries per page load. The controller also bypasses the service layer to reach the repository.',
      betterApproach:
        'A single join or projection query in the service layer, with pagination and a stable sort order that the frontend can rely on.',
    },
    {
      id: 'a-empty-tests',
      title: 'Tests run the code but prove nothing',
      file: 'src/test/java/com/cinebook/promo/PromoServiceTest.java',
      anchor: 'assertNotNull(result);',
      severity: 'major',
      theme: 'merge',
      stakeholders: ['tester', 'future-developer'],
      whyItMatters:
        'The first test would pass if the discount were wrong; the second asserts nothing at all. Coverage goes up while confidence stays at zero. No negative cases: expired, used up, unknown code.',
      betterApproach:
        'Behaviour-named tests that assert the exact amount (`givenFifteenPercentPromo_whenApplied_thenTotalIs212_08`) plus the failure cases.',
    },
    {
      id: 'a-no-unique-code',
      title: 'Nothing stops two promos having the same code',
      file: 'src/main/resources/db/migration/V7__create_promo_code.sql',
      anchor: 'VARCHAR(32)',
      severity: 'major',
      theme: 'release',
      stakeholders: ['dba', 'product-owner'],
      whyItMatters:
        'Without a unique constraint, a duplicate code makes `findByCode` throw, which the catch-all turns into "full price" for every customer using it.',
      betterApproach: 'Add `UNIQUE` on `code` (and consider a CHECK on `percent_off` between 1 and 100).',
    },
    {
      id: 'a-intent',
      title: 'Vague description, no ticket, three changes in one PR',
      severity: 'major',
      theme: 'intent',
      stakeholders: ['senior-engineer', 'release-manager', 'future-developer'],
      whyItMatters:
        'Promo codes, a new summary endpoint and unrelated booking edits ship together with "tested locally" as the only evidence. The reviewer has to reverse-engineer intent, and "asap" pressures a rubber stamp.',
      betterApproach:
        'Split into a promo PR and a summary-endpoint PR, each with a ticket, the business rule, test evidence and a rollout note.',
    },
    {
      id: 'a-hygiene',
      title: 'Unrelated edits, debug output, dead code and field injection',
      file: 'src/main/java/com/cinebook/booking/BookingService.java',
      anchor: 'System.out.println',
      severity: 'nit',
      theme: 'merge',
      stakeholders: ['future-developer'],
      whyItMatters:
        'Renaming parameters to `id`/`uid` and adding a `System.out.println` add noise to the diff and to production logs. The commented-out method and `@Autowired` fields go against the codebase conventions.',
      betterApproach:
        'Drop the unrelated edits, use the logger, delete dead code (git remembers it) and use constructor injection.',
    },
  ],
  expertTopThree: ['a-secret', 'a-double-money', 'a-intent'],
  expertScore: 1,
  expertVerdict:
    'Rethink and split. A leaked credential and wrong money arithmetic block it outright, and the PR mixes three changes with no evidence beyond "tested locally". Rotate the key first, then come back as two focused PRs.',
  hints: [
    {
      afterMinutes: 3,
      text: 'Open the config file. Would you be comfortable if this repository became public tomorrow?',
    },
    {
      afterMinutes: 6,
      text: 'Work out a 15% promo on 249.50 using the code exactly as written. What does the customer pay?',
    },
  ],
}
