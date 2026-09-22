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

export function formatPrice(machine, t) {
  if (machine.price === null || machine.price === undefined) {
    return machine.price_negotiable ? t.price_negotiable : t.price_on_request;
  }
  const formatted = `${Number(machine.price).toLocaleString()} ${machine.currency}`;
  return machine.price_negotiable ? `${formatted} · ${t.price_negotiable}` : formatted;
}
