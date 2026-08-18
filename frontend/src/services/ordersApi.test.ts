import { afterEach, describe, expect, it, vi } from 'vitest';
import { createOrder, listOrders } from './ordersApi';

const fetchMock = vi.fn();

vi.stubGlobal('fetch', fetchMock);

describe('ordersApi', () => {
  afterEach(() => {
    fetchMock.mockReset();
  });

  it('loads orders from the backend', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'order-1', customerName: 'Ana Souza' }]
    });

    const orders = await listOrders();

    expect(fetchMock).toHaveBeenCalledWith('/api/orders', expect.any(Object));
    expect(orders).toHaveLength(1);
  });

  it('creates orders with JSON payload', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'order-1' })
    });

    await createOrder({
      customerName: 'Ana Souza',
      customerEmail: 'ana@example.com',
      totalAmount: 99.8
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/orders',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          customerName: 'Ana Souza',
          customerEmail: 'ana@example.com',
          totalAmount: 99.8
        })
      })
    );
  });
});
