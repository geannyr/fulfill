import type { Translation } from '../i18n';
import type { Order } from '../types/order';
import { formatCurrency, formatDate, shortId } from '../utils/formatters';

interface OrderDetailsProps {
  order: Order | null;
  locale: string;
  text: Translation['details'];
  onClose: () => void;
}

export function OrderDetails({ order, locale, text, onClose }: OrderDetailsProps) {
  if (!order) {
    return (
      <aside className="details-panel details-panel-empty" aria-label={text.label}>
        <p>{text.empty}</p>
      </aside>
    );
  }

  return (
    <aside className="details-panel" aria-label={text.label}>
      <div className="details-header">
        <div>
          <span className="eyebrow">{text.order}</span>
          <h2>{shortId(order.id)}</h2>
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label={text.close}>
          x
        </button>
      </div>
      <dl className="details-list">
        <div>
          <dt>{text.customer}</dt>
          <dd>{order.customerName}</dd>
        </div>
        <div>
          <dt>{text.email}</dt>
          <dd>{order.customerEmail}</dd>
        </div>
        <div>
          <dt>{text.amount}</dt>
          <dd>{formatCurrency(order.totalAmount, locale)}</dd>
        </div>
        <div>
          <dt>{text.status}</dt>
          <dd>
            <span className="status-badge">{order.status}</span>
          </dd>
        </div>
        <div>
          <dt>{text.createdAt}</dt>
          <dd>{formatDate(order.createdAt, locale)}</dd>
        </div>
      </dl>
    </aside>
  );
}
