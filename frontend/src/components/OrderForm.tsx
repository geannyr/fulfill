import { type FormEvent, useState } from 'react';
import type { CreateOrderPayload } from '../types/order';

interface OrderFormProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateOrderPayload) => Promise<void>;
}

interface FormState {
  customerName: string;
  customerEmail: string;
  totalAmount: string;
}

const initialState: FormState = {
  customerName: '',
  customerEmail: '',
  totalAmount: ''
};

export function OrderForm({ isSubmitting, onCancel, onSubmit }: OrderFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const amount = Number(form.totalAmount);
    if (!form.customerName.trim()) {
      setError('Informe o nome do cliente.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
      setError('Informe um e-mail válido.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }

    await onSubmit({
      customerName: form.customerName.trim(),
      customerEmail: form.customerEmail.trim(),
      totalAmount: amount
    });
    setForm(initialState);
  }

  return (
    <form className="order-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <label>
          Nome do cliente
          <input
            value={form.customerName}
            onChange={(event) => updateField('customerName', event.target.value)}
            placeholder="Ana Souza"
            autoComplete="name"
          />
        </label>
        <label>
          E-mail
          <input
            value={form.customerEmail}
            onChange={(event) => updateField('customerEmail', event.target.value)}
            placeholder="ana@example.com"
            autoComplete="email"
            type="email"
          />
        </label>
        <label>
          Valor total
          <input
            value={form.totalAmount}
            onChange={(event) => updateField('totalAmount', event.target.value)}
            placeholder="99.80"
            inputMode="decimal"
          />
        </label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button className="secondary-button" type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando...' : 'Criar pedido'}
        </button>
      </div>
    </form>
  );
}
