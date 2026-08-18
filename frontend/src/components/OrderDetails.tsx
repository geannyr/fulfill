import type { Order } from '../types/order';
import { formatCurrency, formatDate, shortId } from '../utils/formatters';

interface OrderDetailsProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderDetails({ order, onClose }: OrderDetailsProps) {
  if (!order) {
    return (
      <aside className="details-panel details-panel-empty" aria-label="Detalhes do pedido">
        <p>Selecione um pedido para visualizar os detalhes.</p>
      </aside>
    );
  }

  return (
    <aside className="details-panel" aria-label="Detalhes do pedido">
      <div className="details-header">
        <div>
          <span className="eyebrow">Pedido</span>
          <h2>{shortId(order.id)}</h2>
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar detalhes">
          x
        </button>
      </div>
      <dl className="details-list">
        <div>
          <dt>Cliente</dt>
          <dd>{order.customerName}</dd>
        </div>
        <div>
          <dt>E-mail</dt>
          <dd>{order.customerEmail}</dd>
        </div>
        <div>
          <dt>Valor</dt>
          <dd>{formatCurrency(order.totalAmount)}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <span className="status-badge">{order.status}</span>
          </dd>
        </div>
        <div>
          <dt>Criado em</dt>
          <dd>{formatDate(order.createdAt)}</dd>
        </div>
      </dl>
    </aside>
  );
}
