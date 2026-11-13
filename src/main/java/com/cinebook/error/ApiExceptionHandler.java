package com.cinebook.error;

import com.cinebook.booking.BookingNotFoundException;
import com.cinebook.seat.SeatUnavailableException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(SeatUnavailableException.class)
    ProblemDetail seatUnavailable(SeatUnavailableException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, exception.getMessage());
        problem.setTitle("Seat unavailable");
        return problem;
    }

    @ExceptionHandler(BookingNotFoundException.class)
    ProblemDetail bookingNotFound(BookingNotFoundException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
        problem.setTitle("Booking not found");
        return problem;
    }
}
