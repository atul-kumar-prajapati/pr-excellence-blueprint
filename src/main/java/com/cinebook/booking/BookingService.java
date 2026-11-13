package com.cinebook.booking;

import com.cinebook.payment.PaymentClient;
import com.cinebook.payment.PaymentResult;
import com.cinebook.seat.Seat;
import com.cinebook.seat.SeatRepository;
import com.cinebook.seat.SeatUnavailableException;
import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final PaymentClient paymentClient;

    @Transactional
    public BookingResponse reserve(Long userId, ReserveSeatsRequest request) {
        List<Long> requestedIds = request.seatIds().stream().distinct().toList();
        List<Seat> seats = seatRepository.findAllByIdForUpdate(requestedIds);

        boolean missing = seats.size() != requestedIds.size();
        boolean taken = seats.stream().anyMatch(Seat::isTaken);
        boolean wrongShow = seats.stream().anyMatch(seat -> !seat.getShowtime().getId().equals(request.showtimeId()));
        if (missing || taken || wrongShow) {
            throw new SeatUnavailableException(new LinkedHashSet<>(requestedIds));
        }

        seats.forEach(Seat::markTaken);
        seatRepository.saveAll(seats);

        BigDecimal total = seats.stream().map(Seat::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add);
        Booking booking = bookingRepository.save(Booking.pending(userId, request.showtimeId(), seats, total));

        PaymentResult payment = paymentClient.charge(userId, total, booking.getIdempotencyKey());
        booking.confirm(payment.reference());
        return BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public BookingResponse findForUser(Long bookingId, Long userId) {
        return bookingRepository
                .findByIdAndUserId(bookingId, userId)
                .map(BookingResponse::from)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> listForUser(Long userId) {
        return bookingRepository.findAllByUserIdOrderByIdDesc(userId).stream()
                .map(BookingResponse::from)
                .toList();
    }
}
