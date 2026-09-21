/**
 * CineBook — UI Controller & Helpers
 * Handles rendering helpers, view transitions, toasts, and view coordination via jQuery
 */

const UI = (function ($) {
    const $toastContainer = () => $('#toast-container');
    const $modal = () => $('#cinebook-modal');
    const $navbarCollapse = () => $('#navbarContent');

    const VIEW_MAP = {
        'home': '#homeView',
        'movies': '#moviesView',
        'bookings': '#bookingsView',
        'profile': '#profileView'
    };

    return {
        /**
         * Switch visible SPA view
         * @param {string} viewName 
         */
        showView: function (viewName) {
            const targetSelector = VIEW_MAP[viewName] || VIEW_MAP['home'];
            const normalizedView = VIEW_MAP[viewName] ? viewName : 'home';

            // Hide all views and show target view
            $('.spa-view').addClass('d-none');
            $(targetSelector).removeClass('d-none');

            // Update navigation active states
            this.setActiveNav(normalizedView);

            // Collapse mobile navbar if open
            const collapseEl = document.getElementById('navbarContent');
            if (collapseEl && collapseEl.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(collapseEl);
                if (bsCollapse) {
                    bsCollapse.hide();
                }
            }

            // Smooth scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        /**
         * Update active state on navigation links
         * @param {string} viewName 
         */
        setActiveNav: function (viewName) {
            $('.navbar-nav .nav-link').removeClass('active');
            $(`.navbar-nav .nav-link[data-view="${viewName}"]`).addClass('active');

            // Profile button active state
            if (viewName === 'profile') {
                $('#btn-profile').addClass('active');
            } else {
                $('#btn-profile').removeClass('active');
            }
        },

        /**
         * Display a Bootstrap toast notification
         * @param {string} message 
         * @param {'info' | 'success' | 'warning' | 'danger'} type 
         */
        showToast: function (message, type = 'info') {
            const toastId = `toast-${Date.now()}`;
            const bgClass = type === 'danger' ? 'bg-danger text-white' :
                            type === 'success' ? 'bg-success text-white' :
                            type === 'warning' ? 'bg-warning text-dark' : 'bg-cinebook-surface text-cinebook-primary border border-cinebook';

            const toastHtml = `
                <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="d-flex">
                        <div class="toast-body">
                            ${message}
                        </div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                </div>
            `;

            $toastContainer().append(toastHtml);
            const toastElement = document.getElementById(toastId);
            if (toastElement) {
                const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
                toast.show();

                $(toastElement).on('hidden.bs.toast', function () {
                    $(this).remove();
                });
            }
        },

        /**
         * Show modal with title and content
         * @param {string} title 
         * @param {string} contentHtml 
         */
        showModal: function (title, contentHtml) {
            $('#cinebookModalLabel').text(title);
            $('#cinebook-modal-body').html(contentHtml);
            const modalInstance = bootstrap.Modal.getOrCreateInstance($modal()[0]);
            modalInstance.show();
        },

        /**
         * Hide modal
         */
        hideModal: function () {
            const modalInstance = bootstrap.Modal.getInstance($modal()[0]);
            if (modalInstance) {
                modalInstance.hide();
            }
        }
    };
})(jQuery);
