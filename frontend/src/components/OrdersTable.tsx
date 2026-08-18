import type { Order } from '../types/order';
import { formatCurrency, formatDate, shortId } from '../utils/formatters';

interface OrdersTableProps {
  orders: Order[];
  selectedOrderId?: string;
  onSelectOrder: (order: Order) => void;
}

export function OrdersTable({ orders, selectedOrderId, onSelectOrder }: OrdersTableProps) {
  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>E-mail</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Criado em</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className={selectedOrderId === order.id ? 'selected-row' : undefined}
              onClick={() => onSelectOrder(order)}
            >
              <td className="mono">{shortId(order.id)}</td>
              <td>{order.customerName}</td>
              <td>{order.customerEmail}</td>
              <td>{formatCurrency(order.totalAmount)}</td>
              <td>
                <span className="status-badge">{order.status}</span>
              </td>
              <td>{formatDate(order.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
