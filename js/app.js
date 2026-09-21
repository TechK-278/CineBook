/**
 * CineBook — Main Application Entry Point
 * Phase 1: SPA Routing, Event Handlers & View Management
 */

const CineBook = (function ($) {
    const VALID_VIEWS = ['home', 'movies', 'bookings', 'profile'];
    let currentView = 'home';

    /**
     * Navigate to specified SPA view
     * @param {string} viewName 
     * @param {boolean} updateHash 
     */
    function navigateTo(viewName, updateHash = true) {
        const targetView = VALID_VIEWS.includes(viewName) ? viewName : 'home';
        currentView = targetView;

        UI.showView(targetView);

        if (updateHash && window.location.hash !== `#${targetView}`) {
            window.location.hash = targetView;
        }

        console.log(`[CineBook] Navigated to view: ${targetView}`);
    }

    /**
     * Initialize event handlers
     */
    function initEvents() {
        // Global SPA navigation click handler
        $(document).on('click', '[data-view]', function (e) {
            e.preventDefault();
            const targetView = $(this).data('view');
            if (targetView) {
                navigateTo(targetView);
            }
        });

        // Search toggle placeholder handler
        $('#btn-search-toggle').on('click', function (e) {
            e.preventDefault();
            UI.showToast('Search feature will be available in upcoming phase.', 'info');
        });

        // Hash change handler for browser back/forward buttons
        $(window).on('hashchange', function () {
            const hashView = window.location.hash.replace('#', '');
            if (hashView && hashView !== currentView && VALID_VIEWS.includes(hashView)) {
                navigateTo(hashView, false);
            }
        });
    }

    /**
     * Initialize application state and initial view
     */
    function init() {
        console.log('[CineBook] Initializing CineBook application shell...');
        initEvents();

        // Determine initial view from URL hash if available
        const initialHash = window.location.hash.replace('#', '');
        if (initialHash && VALID_VIEWS.includes(initialHash)) {
            navigateTo(initialHash, false);
        } else {
            navigateTo('home', false);
        }
    }

    return {
        init: init,
        navigateTo: navigateTo,
        getCurrentView: function () {
            return currentView;
        }
    };
})(jQuery);

// Initialize on DOM ready
$(document).ready(function () {
    CineBook.init();
});
