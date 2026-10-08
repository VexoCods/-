/** Small form-validation helpers shared by the contact and checkout forms. */

export const rules = {
  required: (message = "This field is required") => (value) => (value ? "" : message),
  email: (message = "Enter a valid email address") => (value) =>
    !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : message,
  phone: (message = "Enter a valid phone number") => (value) =>
    !value || /^[+\d][\d\s()-]{6,}$/.test(value) ? "" : message,
  minLength: (length, message) => (value) => (!value || value.length >= length ? "" : message),
};

/** Validates a form against `{ fieldName: ruleFn }`; focuses the first error. */
export function validate(form, fieldRules) {
  let firstInvalid = null;

  for (const [name, rule] of Object.entries(fieldRules)) {
    const field = form.querySelector(`[name="${name}"]`);
    if (!field) continue;

    const message = rule(String(field.value).trim());
    const wrapper = field.closest(".field");
    const errorNode = wrapper?.querySelector(".field__error");

    if (message) {
      wrapper?.classList.add("has-error");
      field.setAttribute("aria-invalid", "true");
      if (errorNode) errorNode.textContent = message;
      if (!firstInvalid) firstInvalid = field;
    } else {
      wrapper?.classList.remove("has-error");
      field.removeAttribute("aria-invalid");
      if (errorNode) errorNode.textContent = "";
    }
  }

  if (firstInvalid) firstInvalid.focus({ preventScroll: false });
  return !firstInvalid;
}
