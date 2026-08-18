import { useEffect, useMemo, useState } from 'react';
import { ArchitectureFlow } from '../components/ArchitectureFlow';
import { OrderDetails } from '../components/OrderDetails';
import { OrderForm } from '../components/OrderForm';
import { OrdersTable } from '../components/OrdersTable';
import { createOrder, listOrders } from '../services/ordersApi';
import type { CreateOrderPayload, Order } from '../types/order';
import { formatCurrency } from '../utils/formatters';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const totalRevenue = useMemo(
    () => orders.reduce((total, order) => total + Number(order.totalAmount), 0),
    [orders]
  );

  async function loadOrders() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listOrders();
      setOrders(data);
      setSelectedOrder((current) => current ?? data[0] ?? null);
    } catch {
      setError('Não foi possível carregar os pedidos.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateOrder(payload: CreateOrderPayload) {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const createdOrder = await createOrder(payload);
      setOrders((current) => [createdOrder, ...current]);
      setSelectedOrder(createdOrder);
      setIsFormOpen(false);
      setSuccessMessage('Pedido criado com sucesso.');
    } catch {
      setError('Não foi possível criar o pedido.');
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-group">
          <div className="brand-mark" aria-hidden="true">F</div>
          <div>
            <h1>Fulfill</h1>
            <p>Event-driven order management</p>
          </div>
        </div>
        <button className="primary-button" type="button" onClick={() => setIsFormOpen(true)}>
          Novo pedido
        </button>
      </header>

      <section className="metrics-grid" aria-label="Resumo de pedidos">
        <div className="metric">
          <span>Total de pedidos</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="metric">
          <span>Valor processado</span>
          <strong>{formatCurrency(totalRevenue)}</strong>
        </div>
        <div className="metric">
          <span>Fluxo</span>
          <strong>REST + Kafka</strong>
        </div>
      </section>

      <ArchitectureFlow />

      {successMessage && <p className="toast success" role="status">{successMessage}</p>}
      {error && <p className="toast error" role="alert">{error}</p>}

      {isFormOpen && (
        <section className="form-section" aria-label="Novo pedido">
          <div className="section-heading">
            <h2>Novo pedido</h2>
            <p>Crie um pedido e acompanhe o evento percorrer o backend.</p>
          </div>
          <OrderForm
            isSubmitting={isSubmitting}
            onCancel={() => setIsFormOpen(false)}
            onSubmit={handleCreateOrder}
          />
        </section>
      )}

      <section className="content-grid">
        <div className="orders-section">
          <div className="section-heading">
            <h2>Pedidos</h2>
            <button className="secondary-button" type="button" onClick={() => void loadOrders()}>
              Atualizar
            </button>
          </div>

          {isLoading && <div className="state-box">Carregando pedidos...</div>}
          {!isLoading && !error && orders.length === 0 && (
            <div className="state-box">Nenhum pedido criado ainda.</div>
          )}
          {!isLoading && orders.length > 0 && (
            <OrdersTable
              orders={orders}
              selectedOrderId={selectedOrder?.id}
              onSelectOrder={setSelectedOrder}
            />
          )}
        </div>
        <OrderDetails order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      </section>
    </main>
  );
}
