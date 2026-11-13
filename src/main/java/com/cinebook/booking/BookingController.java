package com.cinebook.booking;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final SeatReservationService seatReservationService;

    @PostMapping
    public ResponseEntity<BookingResponse> reserve(
            @RequestHeader("X-User-Id") Long userId, @Valid @RequestBody ReserveSeatsRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(seatReservationService.reserve(userId, request));
    }

    @GetMapping("/{bookingId}")
    public BookingResponse get(@PathVariable Long bookingId) {
        return bookingService.findById(bookingId);
    }

    @GetMapping
    public List<BookingResponse> list(@RequestHeader("X-User-Id") Long userId) {
        return bookingService.listForUser(userId);
    }
}
