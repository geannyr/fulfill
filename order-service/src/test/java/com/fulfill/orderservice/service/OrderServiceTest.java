package com.fulfill.orderservice.service;

import com.fulfill.orderservice.domain.Order;
import com.fulfill.orderservice.domain.OrderStatus;
import com.fulfill.orderservice.dto.CreateOrderRequest;
import com.fulfill.orderservice.dto.OrderResponse;
import com.fulfill.orderservice.event.OrderEventPublisher;
import com.fulfill.orderservice.exception.OrderNotFoundException;
import com.fulfill.orderservice.mapper.OrderMapper;
import com.fulfill.orderservice.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private OrderEventPublisher orderEventPublisher;

    @InjectMocks
    private OrderService orderService;

    @Test
    void shouldCreateOrderWithCreatedStatus() {
        CreateOrderRequest request = new CreateOrderRequest(
                "Ana Souza",
                "ana@example.com",
                new BigDecimal("149.90")
        );
        OrderResponse expectedResponse = new OrderResponse(
                UUID.randomUUID(),
                "Ana Souza",
                "ana@example.com",
                OrderStatus.CREATED,
                new BigDecimal("149.90"),
                java.time.Instant.now()
        );

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderMapper.toResponse(any(Order.class))).thenReturn(expectedResponse);

        OrderResponse response = orderService.createOrder(request);

        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(orderCaptor.capture());

        Order savedOrder = orderCaptor.getValue();
        assertThat(savedOrder.getCustomerName()).isEqualTo("Ana Souza");
        assertThat(savedOrder.getCustomerEmail()).isEqualTo("ana@example.com");
        assertThat(savedOrder.getTotalAmount()).isEqualByComparingTo("149.90");
        assertThat(savedOrder.getStatus()).isEqualTo(OrderStatus.CREATED);
        assertThat(savedOrder.getId()).isNotNull();
        assertThat(savedOrder.getCreatedAt()).isNotNull();
        assertThat(response).isEqualTo(expectedResponse);
        verify(orderEventPublisher).publishOrderCreated(savedOrder);
    }

    @Test
    void shouldReturnOrderById() {
        UUID id = UUID.randomUUID();
        Order order = new Order("Bruno Lima", "bruno@example.com", new BigDecimal("59.00"));
        OrderResponse expectedResponse = new OrderResponse(
                id,
                "Bruno Lima",
                "bruno@example.com",
                OrderStatus.CREATED,
                new BigDecimal("59.00"),
                order.getCreatedAt()
        );

        when(orderRepository.findById(id)).thenReturn(Optional.of(order));
        when(orderMapper.toResponse(order)).thenReturn(expectedResponse);

        OrderResponse response = orderService.getOrderById(id);

        assertThat(response).isEqualTo(expectedResponse);
    }

    @Test
    void shouldThrowWhenOrderDoesNotExist() {
        UUID id = UUID.randomUUID();
        when(orderRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getOrderById(id))
                .isInstanceOf(OrderNotFoundException.class)
                .hasMessageContaining(id.toString());
    }

    @Test
    void shouldListOrders() {
        Order order = new Order("Carla Dias", "carla@example.com", new BigDecimal("25.50"));
        OrderResponse expectedResponse = new OrderResponse(
                order.getId(),
                "Carla Dias",
                "carla@example.com",
                OrderStatus.CREATED,
                new BigDecimal("25.50"),
                order.getCreatedAt()
        );

        when(orderRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(order));
        when(orderMapper.toResponse(order)).thenReturn(expectedResponse);

        List<OrderResponse> response = orderService.listOrders();

        assertThat(response).containsExactly(expectedResponse);
    }
}
