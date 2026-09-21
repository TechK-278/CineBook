/**
 * CineBook — Storage Module
 * Abstraction layer for localStorage persistence
 */

const Storage = (function () {
    const PREFIX = 'cinebook_';

    return {
        /**
         * Get item from storage
         * @param {string} key 
         * @param {*} defaultValue 
         * @returns {*}
         */
        get: function (key, defaultValue = null) {
            try {
                const item = localStorage.getItem(PREFIX + key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error(`[Storage] Error reading key "${key}":`, error);
                return defaultValue;
            }
        },

        /**
         * Save item to storage
         * @param {string} key 
         * @param {*} value 
         * @returns {boolean}
         */
        set: function (key, value) {
            try {
                localStorage.setItem(PREFIX + key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error(`[Storage] Error writing key "${key}":`, error);
                return false;
            }
        },

        /**
         * Remove item from storage
         * @param {string} key 
         */
        remove: function (key) {
            try {
                localStorage.removeItem(PREFIX + key);
            } catch (error) {
                console.error(`[Storage] Error removing key "${key}":`, error);
            }
        },

        /**
         * Clear all CineBook storage items
         */
        clear: function () {
            try {
                Object.keys(localStorage).forEach(k => {
                    if (k.startsWith(PREFIX)) {
                        localStorage.removeItem(k);
                    }
                });
            } catch (error) {
                console.error('[Storage] Error clearing storage:', error);
            }
        }
    };
})();
