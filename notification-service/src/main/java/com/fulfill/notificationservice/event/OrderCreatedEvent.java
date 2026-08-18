package com.fulfill.notificationservice.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OrderCreatedEvent(
        UUID orderId,
        String customerName,
        String customerEmail,
        BigDecimal totalAmount,
        String status,
        Instant createdAt
) {
}
