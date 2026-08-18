package com.fulfill.notificationservice.service;

import com.fulfill.notificationservice.event.OrderCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationService.class);

    public void processOrderCreated(OrderCreatedEvent event) {
        LOGGER.info("Simulated notification processed: {}", buildNotificationSummary(event));
    }

    String buildNotificationSummary(OrderCreatedEvent event) {
        return "orderId=%s, customerName=%s, customerEmail=%s, totalAmount=%s"
                .formatted(event.orderId(), event.customerName(), event.customerEmail(), event.totalAmount());
    }
}
