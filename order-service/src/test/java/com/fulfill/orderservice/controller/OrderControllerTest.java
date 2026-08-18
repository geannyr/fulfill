package com.fulfill.orderservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fulfill.orderservice.domain.OrderStatus;
import com.fulfill.orderservice.dto.CreateOrderRequest;
import com.fulfill.orderservice.dto.OrderResponse;
import com.fulfill.orderservice.exception.OrderNotFoundException;
import com.fulfill.orderservice.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    @Test
    void shouldCreateOrder() throws Exception {
        UUID id = UUID.randomUUID();
        OrderResponse response = new OrderResponse(
                id,
                "Ana Souza",
                "ana@example.com",
                OrderStatus.CREATED,
                new BigDecimal("149.90"),
                Instant.parse("2026-08-17T21:30:00Z")
        );

        when(orderService.createOrder(any(CreateOrderRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateOrderRequest(
                                "Ana Souza",
                                "ana@example.com",
                                new BigDecimal("149.90")
                        ))))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/api/orders/" + id))
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.customerName").value("Ana Souza"))
                .andExpect(jsonPath("$.customerEmail").value("ana@example.com"))
                .andExpect(jsonPath("$.status").value("CREATED"))
                .andExpect(jsonPath("$.totalAmount").value(149.90));
    }

    @Test
    void shouldReturnBadRequestWhenPayloadIsInvalid() throws Exception {
        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "customerName": "",
                                  "customerEmail": "invalid-email",
                                  "totalAmount": 0
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.customerName").exists())
                .andExpect(jsonPath("$.fieldErrors.customerEmail").exists())
                .andExpect(jsonPath("$.fieldErrors.totalAmount").exists());
    }

    @Test
    void shouldReturnOrderById() throws Exception {
        UUID id = UUID.randomUUID();
        OrderResponse response = new OrderResponse(
                id,
                "Bruno Lima",
                "bruno@example.com",
                OrderStatus.CREATED,
                new BigDecimal("59.00"),
                Instant.parse("2026-08-17T22:00:00Z")
        );

        when(orderService.getOrderById(id)).thenReturn(response);

        mockMvc.perform(get("/api/orders/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.customerName").value("Bruno Lima"));
    }

    @Test
    void shouldReturnNotFoundWhenOrderDoesNotExist() throws Exception {
        UUID id = UUID.randomUUID();
        when(orderService.getOrderById(id)).thenThrow(new OrderNotFoundException(id));

        mockMvc.perform(get("/api/orders/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Order not found: " + id));
    }

    @Test
    void shouldListOrders() throws Exception {
        UUID id = UUID.randomUUID();
        OrderResponse response = new OrderResponse(
                id,
                "Carla Dias",
                "carla@example.com",
                OrderStatus.CREATED,
                new BigDecimal("25.50"),
                Instant.parse("2026-08-17T23:00:00Z")
        );

        when(orderService.listOrders()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(id.toString()));
    }
}
