import { buildErrorSummary } from '../utils/formErrors.js';

export default function FormErrorSummary({ errors, title = 'Veuillez corriger les champs suivants :' }) {
  const items = buildErrorSummary(errors);
  if (!items.length) return null;

  return (
    <div className="form-summary-error" role="alert">
      <strong>{title}</strong>
      <ul>
        {items.map(({ key, label, message }) => (
          <li key={key}>
            <button
              type="button"
              className="form-summary-link"
              onClick={() => document.getElementById(`field-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            >
              {label} — {message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
