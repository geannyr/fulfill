package com.fulfill.notificationservice.consumer;

import com.fulfill.notificationservice.event.OrderCreatedEvent;
import com.fulfill.notificationservice.service.NotificationService;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class OrderCreatedConsumerTest {

    @Test
    void shouldDelegateReceivedEventToNotificationService() {
        NotificationService notificationService = mock(NotificationService.class);
        OrderCreatedConsumer consumer = new OrderCreatedConsumer(notificationService);
        OrderCreatedEvent event = new OrderCreatedEvent(
                UUID.randomUUID(),
                "Ana Souza",
                "ana@example.com",
                new BigDecimal("99.80"),
                "CREATED",
                Instant.parse("2026-08-18T18:00:00Z")
        );

        consumer.consume(event);

        verify(notificationService).processOrderCreated(event);
    }
}
