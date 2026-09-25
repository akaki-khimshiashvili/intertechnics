const FIELD_ORDER = [
  "engine",
  "power_hp",
  "operating_weight_kg",
  "load_capacity_kg",
  "lift_height_m",
  "fuel_type",
  "cabin",
  "warranty",
  "working_hours",
];

const FIELD_UNITS = {
  power_hp: "hp",
  operating_weight_kg: "kg",
  load_capacity_kg: "kg",
  lift_height_m: "m",
  working_hours: "h",
};

export function buildSpecLines(machine, labels) {
  const lines = [];
  for (const field of FIELD_ORDER) {
    const value = machine[field];
    if (value === null || value === undefined || value === "") continue;
    const unit = FIELD_UNITS[field] || "";
    lines.push({ label: labels[field] || field, value: `${value}${unit ? ` ${unit}` : ""}` });
  }
  for (const spec of machine.specs || []) {
    lines.push({ label: spec.label, value: spec.value });
  }
  return lines;
}

const DEFAULT_PHONE = "599 50 25 17";

/** The number to call about a machine: its own contact_phone, else the main line. */
export function machinePhone(machine) {
  const display = machine.contact_phone?.trim() || DEFAULT_PHONE;
  let digits = display.replace(/[^\d+]/g, "");
  // Local Georgian numbers (599502517, 032 2 12 34 56) get the +995 prefix.
  if (!digits.startsWith("+")) {
    digits = digits.replace(/^0+/, "");
    digits = digits.startsWith("995") ? `+${digits}` : `+995${digits}`;
  }
  return { display, href: `tel:${digits}` };
}

export function formatPrice(machine, t) {
  if (machine.price === null || machine.price === undefined) {
    return machine.price_negotiable ? t.price_negotiable : t.price_on_request;
  }
  const vat = machine.vat_percent !== null && machine.vat_percent !== undefined
    ? ` + ${machine.vat_percent}% ${t.vat}`
    : "";
  const formatted = `${Number(machine.price).toLocaleString()} ${machine.currency}${vat}`;
  return machine.price_negotiable ? `${formatted} · ${t.price_negotiable}` : formatted;
}
