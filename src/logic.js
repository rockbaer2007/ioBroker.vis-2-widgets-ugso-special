export function number(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || !/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(value.trim())) return null;
  const result = Number(value.trim().replace(',', '.'));
  return Number.isFinite(result) ? result : null;
}

export function calculate(left, right, operation) {
  const a = number(left);
  const b = number(right);
  if (a === null || b === null) return null;
  const result = operation === 'subtract' ? a - b : operation === 'multiply' ? a * b :
    operation === 'divide' ? (b === 0 ? NaN : a / b) : a + b;
  return Number.isFinite(result) ? result : null;
}

export function convert(value, operation) {
  if (value === undefined || value === null) return null;
  if (operation === 'text') return String(value);
  if (operation === 'boolean') {
    const normalized = String(value).trim().toLowerCase();
    if (['true', 'on', 'ein', '1'].includes(normalized)) return true;
    if (['false', 'off', 'aus', '0'].includes(normalized)) return false;
    return null;
  }
  return number(value);
}
