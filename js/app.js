/**
 * CineBook — Main Application Entry Point
 * Phase 0 Initialization & Event Wire-up
 */

const CineBook = (function ($) {
    let currentView = 'home';

    function initEvents() {
        // Navigation click handlers
        $(document).on('click', '[data-view]', function (e) {
            e.preventDefault();
            const targetView = $(this).data('view');
            navigateTo(targetView);
        });

        // Search toggle placeholder handler
        $('#btn-search-toggle').on('click', function () {
            UI.showToast('Search feature will be available in upcoming phase.', 'info');
        });
    }

    function navigateTo(viewName) {
        currentView = viewName;
        UI.setActiveNav(viewName);
        console.log(`[CineBook] Navigation triggered: ${viewName}`);
    }

    function init() {
        console.log('[CineBook] Application initialized successfully (Phase 0 Baseline).');
        initEvents();
    }

    return {
        init: init,
        navigateTo: navigateTo
    };
})(jQuery);

// Initialize on DOM ready
$(document).ready(function () {
    CineBook.init();
});
