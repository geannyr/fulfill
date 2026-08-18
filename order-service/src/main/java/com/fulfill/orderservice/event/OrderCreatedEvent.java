package com.fulfill.orderservice.event;

import com.fulfill.orderservice.domain.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OrderCreatedEvent(
        UUID orderId,
        String customerName,
        String customerEmail,
        BigDecimal totalAmount,
        OrderStatus status,
        Instant createdAt
) {
}
