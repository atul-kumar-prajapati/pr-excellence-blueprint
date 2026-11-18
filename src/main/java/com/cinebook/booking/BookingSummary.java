package com.cinebook.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BookingSummary(Long id, String movieTitle, LocalDateTime startsAt, BigDecimal total) {
}
