export type OrderStatus = 'CREATED';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
}

export interface CreateOrderPayload {
  customerName: string;
  customerEmail: string;
  totalAmount: number;
}
