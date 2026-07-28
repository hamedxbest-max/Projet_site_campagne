export default function FormField({
  id,
  label,
  required = false,
  optional = false,
  error,
  children,
}) {
  return (
    <div
      className="form-field"
      id={id ? `field-${id}` : undefined}
      data-invalid={error ? 'true' : undefined}
    >
      <label htmlFor={id ? `input-${id}` : undefined}>
        {label}
        {required && <span className="required-mark"> *</span>}
        {optional && <span className="label-optional"> (optionnel)</span>}
      </label>
      {children}
      {error && (
        <div className="field-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
