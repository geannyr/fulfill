import type { Translation } from '../i18n';

interface ArchitectureFlowProps {
  text: Translation['architecture'];
}

export function ArchitectureFlow({ text }: ArchitectureFlowProps) {
  return (
    <section className="architecture" aria-label={text.label}>
      <div>
        <span className="eyebrow">{text.title}</span>
        <p>{text.description}</p>
      </div>
      <ol className="architecture-steps">
        {text.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}
