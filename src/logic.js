export function number(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || !/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(value.trim())) return null;
  const result = Number(value.trim().replace(',', '.'));
  return Number.isFinite(result) ? result : null;
}

export function trimLine(points, [scaleX, scaleY], start, end) {
  if ((!start && !end) || !(scaleX > 0 && scaleY > 0)) return points;
  const trimStart = (path, pixels) => {
    while (pixels > 0 && path.length > 1) {
      const [[x, y], [nextX, nextY]] = path;
      const dx = nextX - x;
      const dy = nextY - y;
      const length = Math.hypot(dx * scaleX, dy * scaleY);
      if (length > pixels) {
        const fraction = pixels / length;
        path[0] = [x + dx * fraction, y + dy * fraction];
        return;
      }
      path.shift();
      pixels -= length;
    }
  };
  const visible = [...points];
  trimStart(visible, start);
  visible.reverse();
  trimStart(visible, end);
  return visible.length > 1 ? visible.reverse() : [];
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
