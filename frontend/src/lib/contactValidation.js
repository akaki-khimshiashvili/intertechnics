// Same rules the API enforces (ContactController).
// Georgian mobile: 5XX XXX XXX, optionally with 995 in front. The field
// only ever holds digits — everything else is stripped as it's typed.
const MOBILE_PATTERN = /^(?:995)?5\d{8}$/;
export const PHONE_MAX = 12; // 995 + 9 digits
// Letters in any script (Georgian, Latin, Cyrillic…) plus the joiners
// names use; must start with a letter and hold at least two.
const NAME_PATTERN = /^\p{L}[\p{L}\p{M}\s'’.-]*$/u;
export const NAME_MAX = 50;
export const MACHINE_MAX = 100;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CHECKED_FIELDS = ["name", "phone", "email", "machine", "message"];

/** The check for one field; "" when it's fine. */
export function checkField(id, raw, errors) {
  const value = raw.trim();
  switch (id) {
    case "name":
      if (!value) return errors.required;
      if (
        !NAME_PATTERN.test(value) ||
        (value.match(/\p{L}/gu) || []).length < 2 ||
        value.length > NAME_MAX
      )
        return errors.name;
      return "";
    case "phone":
      if (!value) return errors.required;
      return MOBILE_PATTERN.test(value) ? "" : errors.phone;
    case "email":
      return value && !EMAIL_PATTERN.test(value) ? errors.email : "";
    case "machine":
      return value.length > MACHINE_MAX ? errors.tooLong : "";
    case "message":
      return value ? "" : errors.required;
    default:
      return "";
  }
}

export function validate(values, errors) {
  const out = {};
  for (const id of CHECKED_FIELDS) {
    const error = checkField(id, values[id], errors);
    if (error) out[id] = error;
  }
  return out;
}
