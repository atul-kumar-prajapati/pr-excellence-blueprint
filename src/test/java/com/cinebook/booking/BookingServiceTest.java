package com.cinebook.booking;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cinebook.catalog.Movie;
import com.cinebook.catalog.Showtime;
import com.cinebook.payment.PaymentClient;
import com.cinebook.payment.PaymentResult;
import com.cinebook.seat.Seat;
import com.cinebook.seat.SeatRepository;
import com.cinebook.seat.SeatUnavailableException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    SeatRepository seatRepository;

    @Mock
    BookingRepository bookingRepository;

    @Mock
    PaymentClient paymentClient;

    @InjectMocks
    BookingService bookingService;

    private Seat seatA1;
    private Seat seatA2;

    @BeforeEach
    void setUp() {
        Movie movie = new Movie("Dune: Part Two", 166);
        Showtime showtime = new Showtime(movie, LocalDateTime.of(2026, 11, 14, 19, 30), "Screen 1");
        setId(showtime, 42L);
        seatA1 = new Seat(showtime, "A1", new BigDecimal("249.50"));
        seatA2 = new Seat(showtime, "A2", new BigDecimal("249.50"));
        setId(seatA1, 7L);
        setId(seatA2, 8L);
    }

    @Test
    void givenFreeSeats_whenReserve_thenChargesOnceWithIdempotencyKeyAndConfirms() {
        ReserveSeatsRequest request = new ReserveSeatsRequest(42L, List.of(7L, 8L));
        when(seatRepository.findAllByIdForUpdate(List.of(7L, 8L))).thenReturn(List.of(seatA1, seatA2));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            if (booking.getId() == null) {
                setId(booking, 100L);
            }
            return booking;
        });
        when(paymentClient.charge(eq(1L), any(), any())).thenReturn(new PaymentResult("pay_abc"));

        BookingResponse response = bookingService.reserve(1L, request);

        assertThat(response.status()).isEqualTo("CONFIRMED");
        assertThat(response.total()).isEqualByComparingTo("499.00");
        assertThat(response.seatNumbers()).containsExactly("A1", "A2");
        assertThat(response.paymentReference()).isEqualTo("pay_abc");

        ArgumentCaptor<String> key = ArgumentCaptor.forClass(String.class);
        verify(paymentClient).charge(eq(1L), eq(new BigDecimal("499.00")), key.capture());
        assertThat(key.getValue()).isNotBlank();
        assertThat(seatA1.isTaken()).isTrue();
    }

    @Test
    void givenTakenSeat_whenReserve_thenThrowsSeatUnavailable() {
        seatA1.markTaken();
        when(seatRepository.findAllByIdForUpdate(List.of(7L, 8L))).thenReturn(List.of(seatA1, seatA2));

        assertThatThrownBy(() -> bookingService.reserve(1L, new ReserveSeatsRequest(42L, List.of(7L, 8L))))
                .isInstanceOf(SeatUnavailableException.class);
    }

    @Test
    void givenOtherUsersBooking_whenFindForUser_thenNotFound() {
        when(bookingRepository.findByIdAndUserId(9L, 2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.findForUser(9L, 2L)).isInstanceOf(BookingNotFoundException.class);
    }

    private static void setId(Object entity, Long id) {
        try {
            var field = entity.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (ReflectiveOperationException exception) {
            throw new IllegalStateException(exception);
        }
    }
}
