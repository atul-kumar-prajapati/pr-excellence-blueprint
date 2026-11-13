package com.cinebook.booking;

import com.cinebook.seat.Seat;
import java.math.BigDecimal;
import java.util.List;

public record BookingResponse(
        Long id,
        Long showtimeId,
        List<String> seatNumbers,
        BigDecimal total,
        String status,
        String paymentReference) {

    public static BookingResponse from(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getShowtimeId(),
                booking.getSeats().stream().map(Seat::getLabel).toList(),
                booking.getTotal(),
                booking.getStatus().name(),
                booking.getPaymentReference());
    }
}
