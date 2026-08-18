package com.fulfill.orderservice.event;

import com.fulfill.orderservice.domain.Order;
import com.fulfill.orderservice.domain.OrderStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class OrderEventPublisherTest {

    @Mock
    private KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;

    @Test
    void shouldPublishOrderCreatedEvent() {
        Order order = new Order("Ana Souza", "ana@example.com", new BigDecimal("149.90"));
        OrderEventPublisher publisher = new OrderEventPublisher(kafkaTemplate, "order-created");

        publisher.publishOrderCreated(order);

        ArgumentCaptor<OrderCreatedEvent> eventCaptor = ArgumentCaptor.forClass(OrderCreatedEvent.class);
        verify(kafkaTemplate).send(
                org.mockito.ArgumentMatchers.eq("order-created"),
                org.mockito.ArgumentMatchers.eq(order.getId().toString()),
                eventCaptor.capture()
        );

        OrderCreatedEvent event = eventCaptor.getValue();
        assertThat(event.orderId()).isEqualTo(order.getId());
        assertThat(event.customerName()).isEqualTo("Ana Souza");
        assertThat(event.customerEmail()).isEqualTo("ana@example.com");
        assertThat(event.totalAmount()).isEqualByComparingTo("149.90");
        assertThat(event.status()).isEqualTo(OrderStatus.CREATED);
        assertThat(event.createdAt()).isEqualTo(order.getCreatedAt());
    }
}
