/**
 * CineBook — UI Controller & Rendering Engine
 * Handles dynamic component rendering, view transitions, and accessible UI feedback
 */

const UI = (function ($) {
    'use strict';

    const VIEW_MAP = Object.freeze({
        'home': '#homeView',
        'movies': '#moviesView',
        'booking': '#bookingView',
        'confirmation': '#confirmationView',
        'bookings': '#bookingsView',
        'profile': '#profileView'
    });

    const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';

    /**
     * Escape special HTML characters to prevent XSS
     * @param {string} str 
     * @returns {string}
     */
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    return {
        /**
         * Switch visible SPA view
         * @param {string} viewName 
         */
        showView: function (viewName) {
            const targetSelector = VIEW_MAP[viewName] || VIEW_MAP.home;
            const normalizedView = VIEW_MAP[viewName] ? viewName : 'home';

            // Toggle visibility of views
            $('.spa-view').addClass('d-none');
            $(targetSelector).removeClass('d-none');

            // Synchronize active navigation indicator
            this.setActiveNav(normalizedView);

            // Collapse mobile navbar if expanded
            const collapseEl = document.getElementById('navbarContent');
            if (collapseEl && collapseEl.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(collapseEl);
                if (bsCollapse) {
                    bsCollapse.hide();
                }
            }

            // Smooth scroll to top of viewport
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        /**
         * Update active state on navigation items
         * @param {string} viewName 
         */
        setActiveNav: function (viewName) {
            $('.navbar-nav .nav-link').removeClass('active');
            $(`.navbar-nav .nav-link[data-view="${viewName}"]`).addClass('active');

            if (viewName === 'profile') {
                $('#btn-profile').addClass('active');
            } else {
                $('#btn-profile').removeClass('active');
            }
        },

        /**
         * Generate HTML template for a single movie card
         * @param {Object} movie 
         * @returns {string}
         */
        createMovieCardHtml: function (movie) {
            if (!movie) return '';
            const genreBadge = movie.genre.slice(0, 2).join(' • ');
            const safeTitle = escapeHtml(movie.title);
            const safeDesc = escapeHtml(movie.description);

            return `
                <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
                    <article class="card cb-card h-100 border-cinebook">
                        <div class="movie-card-img-wrap">
                            <img src="${movie.poster}" alt="Poster of ${safeTitle}" onerror="this.onerror=null;this.src='${FALLBACK_POSTER}';" loading="lazy">
                            <span class="movie-certificate-badge">${escapeHtml(movie.certificate)}</span>
                            <span class="movie-rating-badge" aria-label="Rating ${movie.rating} out of 10">
                                <i class="bi bi-star-fill text-warning me-1" aria-hidden="true"></i>${movie.rating}
                            </span>
                        </div>
                        <div class="card-body d-flex flex-column p-3">
                            <div class="d-flex justify-content-between align-items-baseline mb-1">
                                <span class="fs-8 text-cinebook-muted">${escapeHtml(genreBadge)}</span>
                                <span class="fs-8 text-cinebook-muted">${escapeHtml(movie.duration)}</span>
                            </div>
                            <h3 class="card-title h6 fw-bold text-white mb-2 text-truncate" title="${safeTitle}">
                                ${safeTitle}
                            </h3>
                            <p class="card-text text-cinebook-secondary fs-8 flex-grow-1 mb-3" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                ${safeDesc}
                            </p>
                            <div class="d-flex gap-2 pt-2 border-top border-cinebook mt-auto">
                                <button type="button" class="btn btn-cinebook-outline btn-sm flex-fill btn-view-details" data-movie-id="${movie.id}" aria-label="View details for ${safeTitle}">
                                    Details
                                </button>
                                <button type="button" class="btn btn-cinebook-accent btn-sm flex-fill btn-book-movie" data-movie-id="${movie.id}" aria-label="Book tickets for ${safeTitle}">
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </article>
                </div>
            `;
        },

        /**
         * Render movie catalog grid and dynamic results count
         * @param {Array} movies 
         * @param {boolean} isFiltered 
         */
        renderCatalogue: function (movies, isFiltered = false) {
            const $grid = $('#movies-catalogue-grid');
            const $empty = $('#movies-empty-state');
            const $count = $('#movies-results-count');

            const count = movies ? movies.length : 0;
            const countLabel = count === 1 ? '1 movie' : `${count} movies`;
            $count.text(isFiltered ? `${countLabel} found` : `${countLabel} available`);

            if (!movies || movies.length === 0) {
                $grid.empty();
                $empty.removeClass('d-none');
                return;
            }

            $empty.addClass('d-none');
            const html = movies.map(m => this.createMovieCardHtml(m)).join('');
            $grid.html(html);
        },

        /**
         * Render featured movies on Home view (4 items)
         * @param {Array} movies 
         */
        renderFeaturedMovies: function (movies) {
            const featured = movies.slice(0, 4);
            const html = featured.map(m => this.createMovieCardHtml(m)).join('');
            $('#home-featured-grid').html(html);
        },

        /**
         * Open Movie Details Modal
         * @param {Object} movie 
         */
        showMovieDetailsModal: function (movie) {
            if (!movie) return;

            const safeTitle = escapeHtml(movie.title);
            const safeDesc = escapeHtml(movie.description);
            const genresHtml = movie.genre.map(g => `<span class="badge bg-cinebook-tertiary border border-cinebook text-cinebook-secondary">${escapeHtml(g)}</span>`).join(' ');

            $('#movieDetailsModalLabel').text(safeTitle);

            const modalHtml = `
                <div class="row g-0">
                    <div class="col-12 col-md-5">
                        <div class="modal-poster-wrap h-100">
                            <img src="${movie.poster}" alt="Poster of ${safeTitle}" class="img-fluid w-100 h-100 object-fit-cover" onerror="this.onerror=null;this.src='${FALLBACK_POSTER}';">
                        </div>
                    </div>
                    <div class="col-12 col-md-7 p-4 d-flex flex-column justify-content-between">
                        <div>
                            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                                <div>
                                    <h3 class="h4 fw-bold text-white mb-1" id="movie-detail-title">${safeTitle}</h3>
                                    <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                                        <span class="badge bg-cinebook-accent text-white">${escapeHtml(movie.certificate)}</span>
                                        <span class="text-cinebook-secondary fs-7"><i class="bi bi-clock me-1" aria-hidden="true"></i>${escapeHtml(movie.duration)}</span>
                                        <span class="text-cinebook-secondary fs-7">• ${escapeHtml(movie.language)}</span>
                                    </div>
                                </div>
                                <div class="d-flex align-items-center gap-1 bg-cinebook-tertiary border border-cinebook px-2 py-1 rounded" aria-label="Rating ${movie.rating} out of 10">
                                    <i class="bi bi-star-fill text-warning" aria-hidden="true"></i>
                                    <span class="fw-bold text-white fs-7">${movie.rating}</span>
                                </div>
                            </div>

                            <div class="mb-3 d-flex flex-wrap gap-1" aria-label="Genres">
                                ${genresHtml}
                            </div>

                            <h4 class="text-white fs-8 text-uppercase tracking-tight text-cinebook-muted mb-1">Synopsis</h4>
                            <p class="text-cinebook-secondary fs-7 mb-3">
                                ${safeDesc}
                            </p>
                        </div>

                        <div>
                            <div class="p-3 rounded bg-cinebook-tertiary border border-cinebook mb-3 d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="text-cinebook-muted fs-8">Ticket Starting From</div>
                                    <div class="fw-bold text-cinebook-accent fs-5">₹${movie.price}</div>
                                </div>
                                <div class="text-cinebook-muted fs-8 text-end">
                                    Release: ${movie.releaseDate}
                                </div>
                            </div>

                            <div class="d-flex gap-2">
                                <button type="button" class="btn btn-cinebook-surface flex-fill" data-bs-dismiss="modal" aria-label="Close movie details modal">Close</button>
                                <button type="button" class="btn btn-cinebook-accent flex-fill btn-modal-book-now d-inline-flex align-items-center justify-content-center gap-2" data-movie-id="${movie.id}" aria-label="Book tickets for ${safeTitle}">
                                    <i class="bi bi-ticket-perforated" aria-hidden="true"></i> Book Tickets
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            $('#movie-details-modal-body').html(modalHtml);
            const modalEl = document.getElementById('movieDetailsModal');
            if (modalEl) {
                const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
                modalInstance.show();
            }
        },

        /**
         * Render Movie Banner on Booking View
         * @param {Object} movie 
         */
        renderBookingMovieBanner: function (movie) {
            if (!movie) return;
            const safeTitle = escapeHtml(movie.title);
            const genresHtml = escapeHtml(movie.genre.join(', '));

            const bannerHtml = `
                <div class="cb-surface p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 shadow">
                    <div class="d-flex align-items-center gap-3">
                        <img src="${movie.poster}" alt="${safeTitle}" class="rounded border border-cinebook" style="width: 64px; height: 86px; object-fit: cover;" onerror="this.onerror=null;this.src='${FALLBACK_POSTER}';">
                        <div>
                            <div class="d-flex align-items-center gap-2 mb-1">
                                <span class="badge bg-cinebook-accent text-white fs-8">${escapeHtml(movie.certificate)}</span>
                                <span class="text-cinebook-muted fs-8">${escapeHtml(movie.duration)} • ${escapeHtml(movie.language)}</span>
                            </div>
                            <h2 class="h4 fw-bold text-white mb-1">${safeTitle}</h2>
                            <p class="text-cinebook-secondary fs-8 mb-0">${genresHtml} • <i class="bi bi-star-fill text-warning me-1" aria-hidden="true"></i>${movie.rating}/10</p>
                        </div>
                    </div>
                    <button type="button" class="btn btn-cinebook-outline btn-sm px-3 align-self-start align-self-md-center" data-view="movies" aria-label="Choose a different movie">
                        <i class="bi bi-arrow-left me-1" aria-hidden="true"></i> Change Movie
                    </button>
                </div>
            `;
            $('#booking-movie-banner-container').html(bannerHtml);
        },

        /**
         * Render Date selection cards
         * @param {Array} dates 
         * @param {number} selectedIndex 
         */
        renderBookingDates: function (dates, selectedIndex = 0) {
            const html = dates.map((d, idx) => {
                const isSelected = idx === selectedIndex;
                return `
                    <button type="button" class="booking-date-card ${isSelected ? 'active' : ''}" data-date-index="${idx}" aria-label="Select date ${d.fullDate}" aria-pressed="${isSelected}">
                        <span class="fs-8 ${isSelected ? 'text-white' : 'text-cinebook-muted'} fw-semibold d-block">${d.label}</span>
                        <span class="fs-5 fw-bold ${isSelected ? 'text-cinebook-accent' : 'text-white'} d-block">${d.dayNumber}</span>
                        <span class="fs-8 text-cinebook-secondary d-block">${d.month}</span>
                    </button>
                `;
            }).join('');
            $('#booking-dates-container').html(html);
        },

        /**
         * Render Theatres and showtimes
         * @param {Array} theatres 
         * @param {string} selectedTheatreId 
         * @param {string} selectedShowtime 
         */
        renderBookingTheatres: function (theatres, selectedTheatreId, selectedShowtime) {
            const html = theatres.map(th => {
                const isTheatreSelected = th.id === selectedTheatreId;
                const showtimesHtml = th.showtimes.map(st => {
                    const isActive = isTheatreSelected && st === selectedShowtime;
                    return `<button type="button" class="showtime-pill ${isActive ? 'active' : ''}" data-theatre-id="${th.id}" data-showtime="${st}" aria-label="${th.name} at ${st}" aria-pressed="${isActive}">${st}</button>`;
                }).join(' ');

                return `
                    <div class="p-3 rounded bg-cinebook-tertiary border ${isTheatreSelected ? 'border-cinebook-accent' : 'border-cinebook'}">
                        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
                            <div>
                                <h3 class="text-white mb-0 h6 fw-semibold">${escapeHtml(th.name)}</h3>
                                <span class="fs-8 text-cinebook-muted"><i class="bi bi-geo-alt me-1" aria-hidden="true"></i>${escapeHtml(th.location)} • <span class="text-cinebook-secondary">${escapeHtml(th.screen)}</span></span>
                            </div>
                            ${isTheatreSelected ? '<span class="badge bg-cinebook-surface text-cinebook-accent border border-cinebook fs-8"><i class="bi bi-check2 me-1" aria-hidden="true"></i>Selected Theatre</span>' : ''}
                        </div>
                        <div class="d-flex flex-wrap gap-2" role="group" aria-label="Available Showtimes at ${escapeHtml(th.name)}">
                            ${showtimesHtml}
                        </div>
                    </div>
                `;
            }).join('');
            $('#booking-theatres-container').html(html);
        },

        /**
         * Render Cinema Seat Grid (A to F)
         * @param {Array} seats 
         * @param {Array} selectedSeats 
         */
        renderSeatGrid: function (seats, selectedSeats = []) {
            const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
            let html = '';

            rows.forEach(r => {
                const rowSeats = seats.filter(s => s.row === r);
                const seatButtons = rowSeats.map(s => {
                    const isSelected = selectedSeats.includes(s.id);
                    const isOccupied = s.isOccupied;
                    const seatClass = isOccupied ? 'occupied' : isSelected ? 'selected' : '';
                    const statusText = isOccupied ? 'Occupied' : isSelected ? 'Selected' : 'Available';
                    const ariaLabel = `Seat ${s.id} (${statusText})`;
                    return `<button type="button" class="seat-btn ${seatClass}" data-seat-id="${s.id}" ${isOccupied ? 'disabled' : ''} aria-label="${ariaLabel}" aria-pressed="${isSelected}">${s.col}</button>`;
                }).join('');

                html += `
                    <div class="seat-row">
                        <span class="seat-row-label" aria-hidden="true">${r}</span>
                        ${seatButtons}
                        <span class="seat-row-label" aria-hidden="true">${r}</span>
                    </div>
                `;
            });

            $('#booking-seat-grid').html(html);
        },

        /**
         * Update the Live Booking Summary Panel
         */
        updateBookingSummary: function (movie, theatre, date, showtime, selectedSeats = [], pricePerTicket = 250) {
            $('#summary-movie-title').text(movie ? movie.title : '—');
            $('#summary-theatre').text(theatre ? `${theatre.name} (${theatre.screen})` : '—');
            $('#summary-date').text(date ? date.fullDate : '—');
            $('#summary-showtime').text(showtime || '—');
            $('#summary-seats').text(selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected');
            $('#summary-seat-count').text(selectedSeats.length);

            const pricing = CineData.calculatePricing(pricePerTicket, selectedSeats.length);

            $('#summary-subtotal').text(`₹${pricing.subtotal}`);
            $('#summary-fee').text(`₹${pricing.fee}`);
            $('#summary-grand-total').text(`₹${pricing.grandTotal}`);

            // Update Progress Indicator
            const hasDate = Boolean(date);
            const hasShowtime = Boolean(theatre && showtime);
            const hasSeats = Boolean(selectedSeats.length > 0);

            $('#step-pill-1').toggleClass('completed', hasDate).toggleClass('active', !hasShowtime);
            $('#step-pill-2').toggleClass('completed', hasShowtime).toggleClass('active', hasDate && !hasSeats);
            $('#step-pill-3').toggleClass('completed', hasSeats).toggleClass('active', hasShowtime && !hasSeats);
            $('#step-pill-4').toggleClass('active', hasSeats);

            // Enable confirmation if movie, theatre, showtime, date, and seats are selected
            const isValid = Boolean(movie && theatre && date && showtime && selectedSeats.length > 0);
            $('#btn-confirm-booking').prop('disabled', !isValid);
        },

        /**
         * Render Confirmation Receipt
         * @param {Object} booking 
         */
        renderConfirmation: function (booking) {
            if (!booking) return;
            const safeTitle = escapeHtml(booking.movieTitle);
            const safeCust = escapeHtml(booking.customer.name);
            const safeEmail = escapeHtml(booking.customer.email);

            const html = `
                <div class="p-3 rounded bg-cinebook-surface border border-cinebook">
                    <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-cinebook">
                        <span class="text-cinebook-muted fs-8">BOOKING REFERENCE</span>
                        <span class="badge bg-cinebook-accent text-white font-monospace">${booking.id}</span>
                    </div>
                    <div class="d-flex gap-3 align-items-center mb-3">
                        <img src="${booking.poster}" alt="${safeTitle}" class="rounded border border-cinebook" style="width: 54px; height: 72px; object-fit: cover;" onerror="this.onerror=null;this.src='${FALLBACK_POSTER}';">
                        <div>
                            <h5 class="text-white mb-1 fw-bold">${safeTitle}</h5>
                            <div class="text-cinebook-secondary fs-8">${escapeHtml(booking.theatre)}</div>
                            <div class="text-cinebook-muted fs-8">${booking.date} • ${booking.showtime}</div>
                        </div>
                    </div>
                    <div class="row g-2 pt-2 border-top border-cinebook fs-7">
                        <div class="col-6">
                            <span class="text-cinebook-muted fs-8 d-block">RESERVED SEATS</span>
                            <span class="fw-bold text-white">${booking.seats.join(', ')}</span>
                        </div>
                        <div class="col-6 text-end">
                            <span class="text-cinebook-muted fs-8 d-block">TOTAL PAID</span>
                            <span class="fw-bold text-cinebook-accent fs-6">₹${booking.totalAmount}</span>
                        </div>
                        <div class="col-12 mt-2 pt-2 border-top border-cinebook">
                            <span class="text-cinebook-muted fs-8 d-block">GUEST NAME</span>
                            <span class="text-white">${safeCust} (${safeEmail})</span>
                        </div>
                    </div>
                </div>
            `;
            $('#confirmation-pass-details').html(html);
        },

        /**
         * Render My Bookings List
         * @param {Array} bookings 
         */
        renderBookingsList: function (bookings) {
            const $container = $('#my-bookings-container');
            const $empty = $('#bookings-empty-state');

            if (!bookings || bookings.length === 0) {
                $container.empty();
                $empty.removeClass('d-none');
                return;
            }

            $empty.addClass('d-none');
            const html = bookings.map(b => {
                const isConfirmed = b.status === 'Confirmed';
                const safeTitle = escapeHtml(b.movieTitle);
                const statusBadge = isConfirmed ? 
                    `<span class="badge bg-success text-white"><i class="bi bi-check-circle me-1" aria-hidden="true"></i>Confirmed</span>` :
                    `<span class="badge bg-secondary text-white"><i class="bi bi-x-circle me-1" aria-hidden="true"></i>Cancelled</span>`;

                const cancelBtn = isConfirmed ? 
                    `<button type="button" class="btn btn-cinebook-surface btn-sm text-danger border-danger-subtle btn-trigger-cancel" data-booking-id="${b.id}" aria-label="Cancel booking ${b.id}">Cancel Booking</button>` :
                    `<span class="fs-8 text-cinebook-muted">Cancelled on ${new Date(b.cancelledAt || b.bookingDate).toLocaleDateString()}</span>`;

                return `
                    <div class="cb-card p-3 p-md-4">
                        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                            <div class="d-flex align-items-center gap-3">
                                <img src="${b.poster}" alt="${safeTitle}" class="rounded border border-cinebook" style="width: 60px; height: 80px; object-fit: cover;" onerror="this.onerror=null;this.src='${FALLBACK_POSTER}';">
                                <div>
                                    <div class="d-flex align-items-center gap-2 mb-1">
                                        <span class="font-monospace text-cinebook-muted fs-8">${b.id}</span>
                                        ${statusBadge}
                                    </div>
                                    <h5 class="text-white mb-1 fw-bold">${safeTitle}</h5>
                                    <p class="text-cinebook-secondary fs-8 mb-0">
                                        <i class="bi bi-geo-alt me-1" aria-hidden="true"></i>${escapeHtml(b.theatre)} • ${b.date} • ${b.showtime}
                                    </p>
                                    <p class="text-cinebook-muted fs-8 mb-0">
                                        Seats: <span class="text-cinebook-accent fw-semibold">${b.seats.join(', ')}</span> (${b.seats.length} Tickets)
                                    </p>
                                </div>
                            </div>
                            <div class="d-flex flex-row flex-md-column justify-content-between align-items-end gap-2 pt-2 pt-md-0 border-top border-md-0 border-cinebook">
                                <div class="text-end">
                                    <span class="text-cinebook-muted fs-8 d-block">Amount</span>
                                    <span class="fw-bold text-white fs-6">₹${b.totalAmount}</span>
                                </div>
                                ${cancelBtn}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            $container.html(html);
        },

        /**
         * Render Profile View and Navigation Profile badge
         * @param {Object} profile 
         * @param {number} bookingsCount 
         */
        renderProfile: function (profile, bookingsCount = 0) {
            if (!profile) return;
            const initials = profile.avatar || profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

            $('#profile-avatar-initials').text(initials);
            $('#profile-display-name').text(profile.name);
            $('#profile-display-email').text(profile.email);
            $('#profile-display-phone').text(profile.phone);
            $('#profile-display-city').text(profile.city);
            $('#profile-total-bookings').text(bookingsCount);

            $('#nav-profile-name').text(profile.name.split(' ')[0]);

            // Pre-fill edit modal form
            $('#edit-profile-name').val(profile.name);
            $('#edit-profile-email').val(profile.email);
            $('#edit-profile-phone').val(profile.phone);
            $('#edit-profile-city').val(profile.city);

            // Pre-fill customer form in booking
            $('#cust-name').val(profile.name);
            $('#cust-email').val(profile.email);
            $('#cust-phone').val(profile.phone);
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
                            ${escapeHtml(message)}
                        </div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                </div>
            `;

            $('#toast-container').append(toastHtml);
            const toastElement = document.getElementById(toastId);
            if (toastElement) {
                const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
                toast.show();

                $(toastElement).on('hidden.bs.toast', function () {
                    $(this).remove();
                });
            }
        }
    };
})(jQuery);
