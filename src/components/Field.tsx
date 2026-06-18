import { forwardRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

/**
 * Shared form-field primitives. They wrap the existing `.field` /
 * `.field-group` / `.field-radio` CSS and add the accessibility wiring
 * (label association, aria-required, aria-invalid, aria-describedby, role=alert
 * on errors) in one place, so the four forms don't reinvent it. Designed to take
 * react-hook-form's `register()` result directly (`{...register("x")}` for inputs,
 * `registration={register("x")}` for radio groups).
 */

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  /** Supporting/help text (functional — rendered in Warm Charcoal). */
  help?: string;
  /** Validation message; presence flips the field to the invalid state. */
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { id, label, help, error, required, type = "text", ...rest },
  ref,
) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        ref={ref}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={[helpId, errorId].filter(Boolean).join(" ") || undefined}
        {...rest}
      />
      {help && (
        <p className="field-help" id={helpId}>
          {help}
        </p>
      )}
      {error && (
        <p className="field-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  help?: string;
  error?: string;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  function TextAreaField({ id, label, help, error, required, ...rest }, ref) {
    const helpId = help ? `${id}-help` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    return (
      <div className="field">
        <label htmlFor={id}>{label}</label>
        <textarea
          id={id}
          ref={ref}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={[helpId, errorId].filter(Boolean).join(" ") || undefined}
          {...rest}
        />
        {help && (
          <p className="field-help" id={helpId}>
            {help}
          </p>
        )}
        {error && (
          <p className="field-error" id={errorId} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioGroupProps {
  legend: string;
  options: RadioOption[];
  /** react-hook-form's register(name) result, spread onto every radio. */
  registration: UseFormRegisterReturn;
  required?: boolean;
  error?: string;
}

export function RadioGroup({ legend, options, registration, required, error }: RadioGroupProps) {
  const errorId = error ? `${registration.name}-error` : undefined;
  return (
    <fieldset
      className="field-group"
      aria-required={required || undefined}
      aria-invalid={error ? true : undefined}
      aria-describedby={errorId}
    >
      <legend>{legend}</legend>
      <div className="field-radio-group">
        {options.map((opt) => (
          <label className="field-radio" key={opt.value}>
            <input type="radio" value={opt.value} {...registration} />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="field-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
