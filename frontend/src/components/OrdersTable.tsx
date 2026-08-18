import type { Translation } from '../i18n';
import type { Order } from '../types/order';
import { formatCurrency, formatDate, shortId } from '../utils/formatters';

interface OrdersTableProps {
  orders: Order[];
  selectedOrderId?: string;
  locale: string;
  text: Translation['orders']['columns'];
  onSelectOrder: (order: Order) => void;
}

export function OrdersTable({ orders, selectedOrderId, locale, text, onSelectOrder }: OrdersTableProps) {
  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>
            <th>{text.order}</th>
            <th>{text.customer}</th>
            <th>{text.email}</th>
            <th>{text.amount}</th>
            <th>{text.status}</th>
            <th>{text.createdAt}</th>
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
              <td>{formatCurrency(order.totalAmount, locale)}</td>
              <td>
                <span className="status-badge">{order.status}</span>
              </td>
              <td>{formatDate(order.createdAt, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
