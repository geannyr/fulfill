package com.fulfill.notificationservice.consumer;

import com.fulfill.notificationservice.event.OrderCreatedEvent;
import com.fulfill.notificationservice.service.NotificationService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class OrderCreatedConsumer {

    private final NotificationService notificationService;

    public OrderCreatedConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @KafkaListener(
            topics = "${fulfill.kafka.topics.order-created}",
            groupId = "${spring.kafka.consumer.group-id}"
    )
    public void consume(OrderCreatedEvent event) {
        notificationService.processOrderCreated(event);
    }
}
