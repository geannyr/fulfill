const steps = ['Pedido criado', 'PostgreSQL', 'Kafka', 'Notification Service'];

export function ArchitectureFlow() {
  return (
    <section className="architecture" aria-label="Fluxo arquitetural">
      <div>
        <span className="eyebrow">Fluxo orientado a eventos</span>
        <p>Pedido criado {'->'} PostgreSQL {'->'} Kafka {'->'} Notification Service</p>
      </div>
      <ol className="architecture-steps">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}
