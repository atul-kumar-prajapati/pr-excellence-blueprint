package com.cinebook.booking;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public BookingResponse findForUser(Long bookingId, Long userId) {
        return bookingRepository
                .findByIdAndUserId(bookingId, userId)
                .map(BookingResponse::from)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
    }

    @Transactional(readOnly = true)
    public BookingResponse findById(Long bookingId) {
        return bookingRepository
                .findById(bookingId)
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
