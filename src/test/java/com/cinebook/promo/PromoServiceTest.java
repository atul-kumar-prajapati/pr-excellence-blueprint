package com.cinebook.promo;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.cinebook.booking.Booking;
import com.cinebook.booking.BookingRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PromoServiceTest {

    @Mock
    PromoCodeRepository promoRepo;

    @Mock
    BookingRepository bookingRepo;

    @InjectMocks
    PromoService promoService;

    @Test
    void testApplyPromo() {
        Booking booking = Booking.pending(1L, 42L, List.of(), new BigDecimal("249.50"));
        PromoCode promo = new PromoCode();
        promo.setPercentOff(15);
        promo.setMaxUses(100);
        promo.setExpiresAt(LocalDateTime.now().plusDays(1));
        when(bookingRepo.findByIdAndUserId(any(), any())).thenReturn(Optional.of(booking));
        when(promoRepo.findByCode("FRIDAY15")).thenReturn(Optional.of(promo));

        BigDecimal result = promoService.applyPromo(1L, 1L, "FRIDAY15");

        assertNotNull(result);
    }

    @Test
    void testApplyPromo2() {
        when(bookingRepo.findByIdAndUserId(any(), any()))
                .thenReturn(Optional.of(Booking.pending(1L, 42L, List.of(), new BigDecimal("249.50"))));

        promoService.applyPromo(1L, 1L, "EXPIRED");
    }
}
