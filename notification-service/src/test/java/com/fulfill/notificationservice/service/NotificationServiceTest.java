package com.fulfill.notificationservice.service;

import com.fulfill.notificationservice.event.OrderCreatedEvent;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class NotificationServiceTest {

    @Test
    void shouldBuildNotificationSummaryWithOrderData() {
        NotificationService notificationService = new NotificationService();
        UUID orderId = UUID.randomUUID();
        OrderCreatedEvent event = new OrderCreatedEvent(
                orderId,
                "Ana Souza",
                "ana@example.com",
                new BigDecimal("99.80"),
                "CREATED",
                Instant.parse("2026-08-18T18:00:00Z")
        );

        String summary = notificationService.buildNotificationSummary(event);

        assertThat(summary).contains(orderId.toString());
        assertThat(summary).contains("Ana Souza");
        assertThat(summary).contains("ana@example.com");
        assertThat(summary).contains("99.80");
    }

    @Test
    void shouldProcessOrderCreatedEventWithoutExternalDependencies() {
        NotificationService notificationService = new NotificationService();
        OrderCreatedEvent event = new OrderCreatedEvent(
                UUID.randomUUID(),
                "Bruno Lima",
                "bruno@example.com",
                new BigDecimal("149.90"),
                "CREATED",
                Instant.parse("2026-08-18T18:30:00Z")
        );

        notificationService.processOrderCreated(event);
    }
}
