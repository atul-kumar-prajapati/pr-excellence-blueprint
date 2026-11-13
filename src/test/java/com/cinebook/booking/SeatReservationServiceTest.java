package com.cinebook.booking;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cinebook.catalog.Movie;
import com.cinebook.catalog.Showtime;
import com.cinebook.payment.PaymentClient;
import com.cinebook.payment.PaymentResult;
import com.cinebook.payment.PaymentTimeoutException;
import com.cinebook.seat.Seat;
import com.cinebook.seat.SeatRepository;
import com.cinebook.seat.SeatUnavailableException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SeatReservationServiceTest {

    @Mock
    SeatRepository seatRepository;

    @Mock
    BookingRepository bookingRepository;

    @Mock
    PaymentClient paymentClient;

    @InjectMocks
    SeatReservationService service;

    private final ReserveSeatsRequest request =
            new ReserveSeatsRequest(42L, List.of(7L, 8L), "Asha Rao", "asha@example.com");

    @Test
    void givenFreeSeats_whenReserve_thenBookingIsConfirmed() {
        Seat a1 = seat(7L, "A7");
        Seat a2 = seat(8L, "A8");
        when(seatRepository.findAllById(request.seatIds())).thenReturn(List.of(a1, a2));
        when(bookingRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentClient.charge(any(), any())).thenReturn(new PaymentResult("pay_123"));

        BookingResponse response = service.reserve(1L, request);

        assertThat(response.status()).isEqualTo("CONFIRMED");
        assertThat(response.seats()).containsExactly("A7", "A8");
    }

    @Test
    void givenTakenSeat_whenReserve_thenThrowsSeatUnavailable() {
        Seat taken = seat(7L, "A7");
        taken.markTaken();
        when(seatRepository.findAllById(request.seatIds())).thenReturn(List.of(taken, seat(8L, "A8")));

        assertThatThrownBy(() -> service.reserve(1L, request)).isInstanceOf(SeatUnavailableException.class);
    }

    @Test
    void givenPaymentTimesOutOnce_whenReserve_thenRetriesAndConfirms() {
        when(seatRepository.findAllById(request.seatIds())).thenReturn(List.of(seat(7L, "A7"), seat(8L, "A8")));
        when(bookingRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentClient.charge(any(), any()))
                .thenThrow(new PaymentTimeoutException())
                .thenReturn(new PaymentResult("pay_123"));

        BookingResponse response = service.reserve(1L, request);

        assertThat(response.paymentReference()).isEqualTo("pay_123");
        verify(paymentClient, times(2)).charge(any(), any());
    }

    private static Seat seat(Long id, String label) {
        Movie movie = new Movie("Dune: Part Two", 166);
        Showtime showtime = new Showtime(movie, LocalDateTime.of(2026, 11, 14, 19, 30), "Screen 1");
        Seat seat = new Seat(showtime, label, new BigDecimal("249.50"));
        try {
            var field = Seat.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(seat, id);
        } catch (ReflectiveOperationException exception) {
            throw new IllegalStateException(exception);
        }
        return seat;
    }
}
