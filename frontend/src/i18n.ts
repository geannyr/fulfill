export type Language = 'pt' | 'en';

export const languageLabels: Record<Language, string> = {
  pt: 'PT',
  en: 'EN'
};

export const translations = {
  pt: {
    app: {
      subtitle: 'Event-driven order management',
      newOrder: 'Novo pedido',
      summaryLabel: 'Resumo de pedidos'
    },
    metrics: {
      totalOrders: 'Total de pedidos',
      processedValue: 'Valor processado',
      flow: 'Fluxo'
    },
    architecture: {
      label: 'Fluxo arquitetural',
      title: 'Fluxo orientado a eventos',
      description: 'Pedido criado -> PostgreSQL -> Kafka -> Notification Service',
      steps: ['Pedido criado', 'PostgreSQL', 'Kafka', 'Notification Service']
    },
    form: {
      title: 'Novo pedido',
      description: 'Crie um pedido e acompanhe o evento percorrer o backend.',
      customerName: 'Nome do cliente',
      customerEmail: 'E-mail',
      totalAmount: 'Valor total',
      cancel: 'Cancelar',
      submit: 'Criar pedido',
      submitting: 'Criando...',
      nameRequired: 'Informe o nome do cliente.',
      invalidEmail: 'Informe um e-mail valido.',
      invalidAmount: 'Informe um valor maior que zero.'
    },
    orders: {
      title: 'Pedidos',
      refresh: 'Atualizar',
      loading: 'Carregando pedidos...',
      empty: 'Nenhum pedido criado ainda.',
      loadError: 'Nao foi possivel carregar os pedidos.',
      createError: 'Nao foi possivel criar o pedido.',
      createSuccess: 'Pedido criado com sucesso.',
      columns: {
        order: 'Pedido',
        customer: 'Cliente',
        email: 'E-mail',
        amount: 'Valor',
        status: 'Status',
        createdAt: 'Criado em'
      }
    },
    details: {
      label: 'Detalhes do pedido',
      empty: 'Selecione um pedido para visualizar os detalhes.',
      order: 'Pedido',
      customer: 'Cliente',
      email: 'E-mail',
      amount: 'Valor',
      status: 'Status',
      createdAt: 'Criado em',
      close: 'Fechar detalhes'
    }
  },
  en: {
    app: {
      subtitle: 'Event-driven order management',
      newOrder: 'New order',
      summaryLabel: 'Orders summary'
    },
    metrics: {
      totalOrders: 'Total orders',
      processedValue: 'Processed value',
      flow: 'Flow'
    },
    architecture: {
      label: 'Architecture flow',
      title: 'Event-driven flow',
      description: 'Order created -> PostgreSQL -> Kafka -> Notification Service',
      steps: ['Order created', 'PostgreSQL', 'Kafka', 'Notification Service']
    },
    form: {
      title: 'New order',
      description: 'Create an order and follow the event through the backend.',
      customerName: 'Customer name',
      customerEmail: 'E-mail',
      totalAmount: 'Total amount',
      cancel: 'Cancel',
      submit: 'Create order',
      submitting: 'Creating...',
      nameRequired: 'Enter the customer name.',
      invalidEmail: 'Enter a valid e-mail.',
      invalidAmount: 'Enter an amount greater than zero.'
    },
    orders: {
      title: 'Orders',
      refresh: 'Refresh',
      loading: 'Loading orders...',
      empty: 'No orders created yet.',
      loadError: 'Unable to load orders.',
      createError: 'Unable to create the order.',
      createSuccess: 'Order created successfully.',
      columns: {
        order: 'Order',
        customer: 'Customer',
        email: 'E-mail',
        amount: 'Amount',
        status: 'Status',
        createdAt: 'Created at'
      }
    },
    details: {
      label: 'Order details',
      empty: 'Select an order to view details.',
      order: 'Order',
      customer: 'Customer',
      email: 'E-mail',
      amount: 'Amount',
      status: 'Status',
      createdAt: 'Created at',
      close: 'Close details'
    }
  }
} as const;

export type Translation = (typeof translations)[Language];
