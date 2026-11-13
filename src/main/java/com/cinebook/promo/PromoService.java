package com.cinebook.promo;

import com.cinebook.booking.Booking;
import com.cinebook.booking.BookingRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PromoService {

    @Autowired
    private PromoCodeRepository promoRepo;

    @Autowired
    private BookingRepository bookingRepo;

    public BigDecimal applyPromo(Long userId, Long bookingId, String code) {
        Booking booking = bookingRepo.findByIdAndUserId(bookingId, userId).get();
        BigDecimal total = booking.getTotal();
        try {
            PromoCode promo = promoRepo.findByCode(code).get();
            if (promo.getExpiresAt().isBefore(LocalDateTime.now())) {
                return total;
            }
            if (promo.getUsedCount() < promo.getMaxUses()) {
                double discounted = total.doubleValue() - (total.doubleValue() * promo.getPercentOff() / 100);
                BigDecimal newTotal = new BigDecimal(discounted);
                if (newTotal.equals(BigDecimal.ZERO)) {
                    newTotal = BigDecimal.ONE;
                }
                promo.setUsedCount(promo.getUsedCount() + 1);
                promoRepo.save(promo);
                booking.setTotal(newTotal);
                bookingRepo.save(booking);
                return newTotal;
            }
        } catch (Exception exception) {
            return total;
        }
        return total;
    }
}
