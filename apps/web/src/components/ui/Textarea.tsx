import type { TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Textarea({ label, hint, error, id, className = '', ...props }: TextareaProps) {
  const textareaId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-');
  const hintId = hint ? `${textareaId}-hint` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <label className={`field ${className}`} htmlFor={textareaId}>
      <span className="field-label">
        {label}
        {props.required ? <span className="required-mark" aria-hidden="true"> *</span> : null}
      </span>
      <textarea
        id={textareaId}
        className="input textarea"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={props.required ? true : undefined}
        {...props}
      />
      {hint ? <span id={hintId} className="field-hint">{hint}</span> : null}
      {error ? <span id={errorId} className="field-error">{error}</span> : null}
    </label>
  );
}
