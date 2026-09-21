/**
 * CineBook — Storage Module
 * Abstraction layer for localStorage persistence with safe defaults
 */

const Storage = (function () {
    const PREFIX = 'cinebook_';
    const KEYS = {
        MOVIES: 'movies',
        BOOKINGS: 'bookings',
        PROFILE: 'profile'
    };

    /**
     * Internal safe get
     */
    function getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(PREFIX + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`[Storage] Error reading key "${key}":`, error);
            return defaultValue;
        }
    }

    /**
     * Internal safe set
     */
    function setItem(key, value) {
        try {
            localStorage.setItem(PREFIX + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`[Storage] Error writing key "${key}":`, error);
            return false;
        }
    }

    return {
        /**
         * Initialize storage with default data if empty
         */
        init: function () {
            // Initialize Profile
            if (!getItem(KEYS.PROFILE)) {
                setItem(KEYS.PROFILE, CineData.getDefaultProfile());
            }

            // Initialize Bookings if none
            if (!getItem(KEYS.BOOKINGS)) {
                setItem(KEYS.BOOKINGS, []);
            }
        },

        // Profile API
        getProfile: function () {
            return getItem(KEYS.PROFILE, CineData.getDefaultProfile());
        },
        saveProfile: function (profile) {
            return setItem(KEYS.PROFILE, profile);
        },

        // Bookings API
        getBookings: function () {
            return getItem(KEYS.BOOKINGS, []);
        },
        addBooking: function (booking) {
            const bookings = getItem(KEYS.BOOKINGS, []);
            bookings.unshift(booking); // newest first
            setItem(KEYS.BOOKINGS, bookings);
            return booking;
        },
        cancelBooking: function (bookingId) {
            const bookings = getItem(KEYS.BOOKINGS, []);
            const booking = bookings.find(b => b.id === bookingId);
            if (booking) {
                booking.status = 'Cancelled';
                booking.cancelledAt = new Date().toISOString();
                setItem(KEYS.BOOKINGS, bookings);
                return true;
            }
            return false;
        },
        getBookingById: function (bookingId) {
            const bookings = getItem(KEYS.BOOKINGS, []);
            return bookings.find(b => b.id === bookingId) || null;
        },

        // Raw Storage helpers
        get: getItem,
        set: setItem
    };
})();
