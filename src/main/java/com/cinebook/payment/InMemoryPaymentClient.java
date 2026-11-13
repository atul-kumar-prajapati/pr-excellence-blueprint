package com.cinebook.payment;

import java.math.BigDecimal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class InMemoryPaymentClient implements PaymentClient {

    private final Map<String, PaymentResult> charges = new ConcurrentHashMap<>();

    @Override
    public PaymentResult charge(Long userId, BigDecimal amount, String idempotencyKey) {
        return charges.computeIfAbsent(
                idempotencyKey, key -> new PaymentResult("pay_" + key.substring(0, 8)));
    }
}
