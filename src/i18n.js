// Namespaced VIS 2 translation keys; saved widget values remain language-neutral.
export const messageKey = text => 'ugso_special_' + text;

export function translate(text) {
  const key = messageKey(text);
  const value = window.visRxWidget.t(key);
  return value === key ? text : value;
}
