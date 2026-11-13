package com.cinebook.seat;

import java.util.Collection;

public class SeatUnavailableException extends RuntimeException {

    public SeatUnavailableException(Collection<Long> seatIds) {
        super("One or more seats are unavailable: " + seatIds);
    }
}
