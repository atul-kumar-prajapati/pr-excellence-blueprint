package com.cinebook.booking;

import com.cinebook.catalog.Showtime;
import com.cinebook.catalog.ShowtimeRepository;
import com.cinebook.promo.PromoService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.ArrayList;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final PromoService promoService;
    private final ShowtimeRepository showtimeRepository;

    @PostMapping
    public ResponseEntity<BookingResponse> reserve(
            @RequestHeader("X-User-Id") Long userId, @Valid @RequestBody ReserveSeatsRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.reserve(userId, request));
    }

    @GetMapping("/{bookingId}")
    public BookingResponse get(
            @RequestHeader("X-User-Id") Long userId, @PathVariable Long bookingId) {
        return bookingService.findForUser(bookingId, userId);
    }

    @GetMapping
    public List<BookingResponse> list(@RequestHeader("X-User-Id") Long userId) {
        return bookingService.listForUser(userId);
    }

    @PostMapping("/{bookingId}/promo")
    public BigDecimal applyPromo(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long bookingId,
            @RequestParam String code) {
        return promoService.applyPromo(userId, bookingId, code);
    }

    @GetMapping("/summary")
    public List<BookingSummary> summary(@RequestHeader("X-User-Id") Long userId) {
        List<BookingSummary> result = new ArrayList<>();
        for (BookingResponse booking : bookingService.listForUser(userId)) {
            Showtime showtime = showtimeRepository.findById(booking.showtimeId()).orElseThrow();
            result.add(new BookingSummary(
                    booking.id(), showtime.getMovie().getTitle(), showtime.getStartsAt(), booking.total()));
        }
        return result;
    }
}
