/**
 * CineBook — UI Controller & Helpers
 * Handles rendering helpers, toasts, and view coordination via jQuery
 */

const UI = (function () {
    const $root = () => $('#app-root');
    const $toastContainer = () => $('#toast-container');
    const $modal = () => $('#cinebook-modal');

    return {
        /**
         * Render content into main SPA container
         * @param {string} html 
         */
        renderView: function (html) {
            $root().html(html);
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
            const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
            toast.show();

            $(toastElement).on('hidden.bs.toast', function () {
                $(this).remove();
            });
        },

        /**
         * Update active state on navigation links
         * @param {string} viewName 
         */
        setActiveNav: function (viewName) {
            $('.navbar-nav .nav-link').removeClass('active');
            $(`.navbar-nav .nav-link[data-view="${viewName}"]`).addClass('active');
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
})();
