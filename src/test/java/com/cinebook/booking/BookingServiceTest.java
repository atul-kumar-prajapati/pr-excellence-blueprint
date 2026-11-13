package com.cinebook.booking;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    BookingRepository bookingRepository;

    @InjectMocks
    BookingService bookingService;

    @Test
    void givenUnknownBooking_whenFindById_thenNotFound() {
        when(bookingRepository.findById(9L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.findById(9L)).isInstanceOf(BookingNotFoundException.class);
    }
}
