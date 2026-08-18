import { useEffect, useMemo, useState } from 'react';
import { ArchitectureFlow } from '../components/ArchitectureFlow';
import { OrderDetails } from '../components/OrderDetails';
import { OrderForm } from '../components/OrderForm';
import { OrdersTable } from '../components/OrdersTable';
import { languageLabels, type Language, translations } from '../i18n';
import { createOrder, listOrders } from '../services/ordersApi';
import type { CreateOrderPayload, Order } from '../types/order';
import { formatCurrency } from '../utils/formatters';

const languageStorageKey = 'fulfill-language';
const locales: Record<Language, string> = {
  pt: 'pt-BR',
  en: 'en-US'
};

function getInitialLanguage(): Language {
  const storedLanguage = window.localStorage.getItem(languageStorageKey);
  return storedLanguage === 'en' ? 'en' : 'pt';
}

export function OrdersPage() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const text = translations[language];
  const locale = locales[language];

  const totalRevenue = useMemo(
    () => orders.reduce((total, order) => total + Number(order.totalAmount), 0),
    [orders]
  );

  function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    window.localStorage.setItem(languageStorageKey, nextLanguage);
  }

  async function loadOrders() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listOrders();
      setOrders(data);
      setSelectedOrder((current) => current ?? data[0] ?? null);
    } catch {
      setError(text.orders.loadError);
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
      setSuccessMessage(text.orders.createSuccess);
    } catch {
      setError(text.orders.createError);
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
            <p>{text.app.subtitle}</p>
          </div>
        </div>
        <div className="topbar-actions">
          <div className="language-switcher" aria-label="Language">
            {(Object.keys(languageLabels) as Language[]).map((availableLanguage) => (
              <button
                key={availableLanguage}
                className={language === availableLanguage ? 'active' : undefined}
                type="button"
                onClick={() => changeLanguage(availableLanguage)}
                aria-pressed={language === availableLanguage}
              >
                {languageLabels[availableLanguage]}
              </button>
            ))}
          </div>
          <button className="primary-button" type="button" onClick={() => setIsFormOpen(true)}>
            {text.app.newOrder}
          </button>
        </div>
      </header>

      <section className="metrics-grid" aria-label={text.app.summaryLabel}>
        <div className="metric">
          <span>{text.metrics.totalOrders}</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="metric">
          <span>{text.metrics.processedValue}</span>
          <strong>{formatCurrency(totalRevenue, locale)}</strong>
        </div>
        <div className="metric">
          <span>{text.metrics.flow}</span>
          <strong>REST + Kafka</strong>
        </div>
      </section>

      <ArchitectureFlow text={text.architecture} />

      {successMessage && <p className="toast success" role="status">{successMessage}</p>}
      {error && <p className="toast error" role="alert">{error}</p>}

      {isFormOpen && (
        <section className="form-section" aria-label={text.form.title}>
          <div className="section-heading">
            <h2>{text.form.title}</h2>
            <p>{text.form.description}</p>
          </div>
          <OrderForm
            isSubmitting={isSubmitting}
            text={text.form}
            onCancel={() => setIsFormOpen(false)}
            onSubmit={handleCreateOrder}
          />
        </section>
      )}

      <section className="content-grid">
        <div className="orders-section">
          <div className="section-heading">
            <h2>{text.orders.title}</h2>
            <button className="secondary-button" type="button" onClick={() => void loadOrders()}>
              {text.orders.refresh}
            </button>
          </div>

          {isLoading && <div className="state-box">{text.orders.loading}</div>}
          {!isLoading && !error && orders.length === 0 && (
            <div className="state-box">{text.orders.empty}</div>
          )}
          {!isLoading && orders.length > 0 && (
            <OrdersTable
              orders={orders}
              selectedOrderId={selectedOrder?.id}
              locale={locale}
              text={text.orders.columns}
              onSelectOrder={setSelectedOrder}
            />
          )}
        </div>
        <OrderDetails
          order={selectedOrder}
          locale={locale}
          text={text.details}
          onClose={() => setSelectedOrder(null)}
        />
      </section>
    </main>
  );
}
