// Namespaced VIS 2 translation keys; saved widget values remain language-neutral.
export const messageKey = text => `ugso_special_${text}`;

/**
 * Resolve a namespaced VIS translation with the English source as fallback.
 *
 * @param {string} text English source text.
 * @returns {string} Localized text.
 */
export function translate(text) {
    const key = messageKey(text);
    const value = window.visRxWidget.t(key);
    return value === key ? text : value;
}
