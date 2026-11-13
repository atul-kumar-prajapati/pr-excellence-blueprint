package com.cinebook.payment;

public class PaymentTimeoutException extends RuntimeException {

    public PaymentTimeoutException() {
        super("Payment provider timed out");
    }
}
