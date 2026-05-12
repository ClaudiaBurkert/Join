/**
 * Returns a task object by ID or an empty object when it cannot be found.
 *
 * @param {number|string} taskID Task ID to resolve from the cached board data.
 * @returns {Object} Matching task object or an empty fallback object.
 */
function getTaskById(taskID) {
    return TASK?.[0]?.[`Task${taskID}`] || {};
}

/**
 * Converts a value into cleaned text and falls back for empty-like values.
 *
 * @param {*} value Value that should be converted to a safe string.
 * @param {string} [fallback=''] Fallback string returned for invalid values.
 * @returns {string} Normalized text value.
 */
function safeText(value, fallback = '') {
    if (value === undefined || value === null) {
        return fallback;
    }

    let normalized = String(value).trim();
    if (normalized.toLowerCase() === 'undefined' || normalized.toLowerCase() === 'null') {
        return fallback;
    }

    return normalized;
}

/**
 * Ensures a value is returned as an array and otherwise falls back to an empty array.
 *
 * @param {*} value Candidate value.
 * @returns {Array<*>} Normalized array value.
 */
function safeArray(value) {
    return Array.isArray(value) ? value : [];
}

/**
 * Normalizes priority labels into the display format used by the board.
 *
 * @param {*} value Raw priority value.
 * @returns {string} Normalized priority label.
 */
function normalizePriority(value) {
    let normalized = safeText(value, '').toLowerCase();
    if (normalized === 'low') return 'Low';
    if (normalized === 'medium') return 'Medium';
    if (normalized === 'urgent') return 'Urgent';
    return 'No priority';
}

/**
 * Normalizes a category value for safe display in the UI.
 *
 * @param {*} value Raw category value.
 * @returns {string} Normalized category label.
 */
function normalizeCategory(value) {
    return safeText(value, 'No category');
}

/**
 * Normalizes a due-date value for safe display in the UI.
 *
 * @param {string} value Raw due-date value in `YYYY-MM-DD` format.
 * @returns {string} Normalized due-date string for display.
 */
function normalizeDueDate(value) {
    let datetoString = value.toString();
    let dateSplit = value.split('-').reverse();
    let res = dateSplit.join('/');
    return safeText(res, '/');
}
