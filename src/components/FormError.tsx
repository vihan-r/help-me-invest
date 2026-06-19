/**
 * Form-level / submission error block. Rendered ABOVE the submit button so it's in
 * view at the moment of submitting (vs. field errors, which sit by their field).
 * role="alert" announces it to assistive tech. Styling is currently palette-pure
 * and prominent (border + icon + medium weight); a dedicated error colour can be
 * swapped in via the .form-error CSS once the colour decision lands.
 */
export function FormError({ message }: { message: string }) {
  return (
    <div className="form-error" role="alert">
      <svg
        className="form-error-icon"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
}
