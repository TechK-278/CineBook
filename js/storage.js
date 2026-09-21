/**
 * CineBook — Storage Module
 * Centralized abstraction layer for LocalStorage persistence with defensive handling
 */

const Storage = (function () {
    'use strict';

    const PREFIX = 'cinebook_';
    const KEYS = Object.freeze({
        MOVIES: 'movies',
        BOOKINGS: 'bookings',
        PROFILE: 'profile'
    });

    /**
     * Safe LocalStorage getter
     * @param {string} key 
     * @param {*} defaultValue 
     * @returns {*}
     */
    function getItem(key, defaultValue = null) {
        try {
            const raw = localStorage.getItem(PREFIX + key);
            if (raw === null || raw === undefined) {
                return defaultValue;
            }
            return JSON.parse(raw);
        } catch (error) {
            console.warn(`[Storage] Failed to read or parse key "${key}":`, error);
            return defaultValue;
        }
    }

    /**
     * Safe LocalStorage setter
     * @param {string} key 
     * @param {*} value 
     * @returns {boolean}
     */
    function setItem(key, value) {
        try {
            localStorage.setItem(PREFIX + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`[Storage] Failed to write key "${key}":`, error);
            return false;
        }
    }

    return {
        /**
         * Initialize storage defaults if empty
         */
        init: function () {
            if (!getItem(KEYS.PROFILE)) {
                setItem(KEYS.PROFILE, CineData.getDefaultProfile());
            }

            if (!getItem(KEYS.BOOKINGS)) {
                setItem(KEYS.BOOKINGS, []);
            }
        },

        // Profile Management API
        getProfile: function () {
            return getItem(KEYS.PROFILE, CineData.getDefaultProfile());
        },
        saveProfile: function (profile) {
            if (!profile || typeof profile !== 'object') return false;
            return setItem(KEYS.PROFILE, profile);
        },

        // Bookings Management API
        getBookings: function () {
            const bookings = getItem(KEYS.BOOKINGS, []);
            return Array.isArray(bookings) ? bookings : [];
        },
        getBookingById: function (bookingId) {
            if (!bookingId) return null;
            const bookings = this.getBookings();
            return bookings.find(b => b.id === bookingId) || null;
        },
        addBooking: function (booking) {
            if (!booking || !booking.id) return null;
            const bookings = this.getBookings();
            bookings.unshift(booking); // Prepend so latest appears on top
            setItem(KEYS.BOOKINGS, bookings);
            return booking;
        },
        cancelBooking: function (bookingId) {
            if (!bookingId) return false;
            const bookings = this.getBookings();
            const target = bookings.find(b => b.id === bookingId);
            if (target && target.status !== 'Cancelled') {
                target.status = 'Cancelled';
                target.cancelledAt = new Date().toISOString();
                setItem(KEYS.BOOKINGS, bookings);
                return true;
            }
            return false;
        },

        // Raw low-level helpers
        get: getItem,
        set: setItem
    };
})();
