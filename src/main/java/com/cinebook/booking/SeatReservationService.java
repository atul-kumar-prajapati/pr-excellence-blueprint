package com.cinebook.booking;

import com.cinebook.payment.PaymentClient;
import com.cinebook.payment.PaymentResult;
import com.cinebook.payment.PaymentTimeoutException;
import com.cinebook.seat.Seat;
import com.cinebook.seat.SeatRepository;
import com.cinebook.seat.SeatUnavailableException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeatReservationService {

    private static final int MAX_PAYMENT_ATTEMPTS = 3;

    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final PaymentClient paymentClient;

    public BookingResponse reserve(Long userId, ReserveSeatsRequest request) {
        log.info(
                "Reserving seats {} for {} <{}>",
                request.seatIds(),
                request.customerName(),
                request.customerEmail());

        Booking booking = holdSeats(userId, request);
        PaymentResult payment = chargeWithRetry(booking);
        booking.confirm(payment.reference());
        return BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional
    private Booking holdSeats(Long userId, ReserveSeatsRequest request) {
        List<Seat> seats = seatRepository.findAllById(request.seatIds());
        if (seats.stream().anyMatch(Seat::isTaken)) {
            throw new SeatUnavailableException(request.seatIds());
        }
        seats.forEach(Seat::markTaken);
        seatRepository.saveAll(seats);
        java.math.BigDecimal total =
                seats.stream().map(Seat::getPrice).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        return bookingRepository.save(Booking.pending(userId, request.showtimeId(), seats, total));
    }

    private PaymentResult chargeWithRetry(Booking booking) {
        for (int attempt = 1; ; attempt++) {
            try {
                return paymentClient.charge(booking.getUserId(), booking.getTotal());
            } catch (PaymentTimeoutException exception) {
                if (attempt == MAX_PAYMENT_ATTEMPTS) {
                    throw exception;
                }
                log.warn("Payment timed out for booking {}, attempt {}", booking.getId(), attempt);
            }
        }
    }
}
