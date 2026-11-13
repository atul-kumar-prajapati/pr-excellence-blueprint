package com.cinebook.payment;

import java.math.BigDecimal;

public interface PaymentClient {

    PaymentResult charge(Long userId, BigDecimal amount, String idempotencyKey);

    PaymentResult charge(Long userId, BigDecimal amount);
}
