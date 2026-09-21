/**
 * CineBook — Main Application Controller
 * Orchestrates SPA routing, booking workflows, catalog interactions, and persistence
 */

const CineBook = (function ($) {
    'use strict';

    const VALID_VIEWS = Object.freeze(['home', 'movies', 'booking', 'confirmation', 'bookings', 'profile']);
    const MAX_SEATS_PER_BOOKING = 8;

    // Centralized Application State
    const appState = {
        currentView: 'home',
        movies: [],
        theatres: [],
        upcomingDates: [],
        seatLayout: [],
        filter: {
            search: '',
            genre: 'All',
            sort: 'popularity'
        },
        activeBooking: {
            movie: null,
            movieId: null,
            dateIndex: 0,
            date: null,
            theatreId: null,
            theatre: null,
            showtime: null,
            selectedSeats: []
        },
        cancellingBookingId: null
    };

    /**
     * Compute filtered and sorted movie list
     * @returns {Array}
     */
    function getFilteredMovies() {
        let list = [...appState.movies];
        const query = appState.filter.search.trim().toLowerCase();

        // 1. Text Search across Title, Genre, Language
        if (query) {
            list = list.filter(movie => 
                movie.title.toLowerCase().includes(query) ||
                movie.genre.some(g => g.toLowerCase().includes(query)) ||
                movie.language.toLowerCase().includes(query)
            );
        }

        // 2. Genre Tag Filter
        if (appState.filter.genre && appState.filter.genre !== 'All') {
            list = list.filter(movie => movie.genre.includes(appState.filter.genre));
        }

        // 3. Sorting Rules
        switch (appState.filter.sort) {
            case 'rating':
                list.sort((a, b) => b.rating - a.rating);
                break;
            case 'title':
                list.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'newest':
                list.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
                break;
            case 'popularity':
            default:
                list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating);
                break;
        }

        return list;
    }

    /**
     * Update movie catalogue view based on current filter state
     */
    function applyCatalogueFilters() {
        const filtered = getFilteredMovies();
        const isFiltered = Boolean(appState.filter.search.trim().length > 0 || (appState.filter.genre && appState.filter.genre !== 'All'));
        
        UI.renderCatalogue(filtered, isFiltered);

        // Toggle clear search icon button
        const hasSearch = appState.filter.search.trim().length > 0;
        $('#catalog-search-clear').toggleClass('d-none', !hasSearch);
    }

    /**
     * Centralized SPA Navigation
     * @param {string} viewName 
     * @param {boolean} updateHash 
     */
    function navigateTo(viewName, updateHash = true) {
        const targetView = VALID_VIEWS.includes(viewName) ? viewName : 'home';
        appState.currentView = targetView;

        // Perform view-specific data refresh
        switch (targetView) {
            case 'movies':
                applyCatalogueFilters();
                break;
            case 'bookings': {
                const bookings = Storage.getBookings();
                UI.renderBookingsList(bookings);
                break;
            }
            case 'profile': {
                const profile = Storage.getProfile();
                const bookings = Storage.getBookings();
                UI.renderProfile(profile, bookings.length);
                break;
            }
            default:
                break;
        }

        UI.showView(targetView);

        if (updateHash && window.location.hash !== `#${targetView}`) {
            window.location.hash = targetView;
        }
    }

    /**
     * Start Booking Flow for a given movie ID
     * @param {string} movieId 
     */
    function startBookingForMovie(movieId) {
        const movie = CineData.getMovieById(movieId);
        if (!movie) {
            UI.showToast('Movie not found or unavailable.', 'danger');
            return;
        }

        // Hide Details Modal if open
        const modalEl = document.getElementById('movieDetailsModal');
        if (modalEl) {
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) {
                modalInstance.hide();
            }
        }

        // Initialize active booking state
        appState.activeBooking.movie = movie;
        appState.activeBooking.movieId = movie.id;
        appState.activeBooking.dateIndex = 0;
        appState.activeBooking.date = appState.upcomingDates[0];
        appState.activeBooking.theatreId = appState.theatres[0].id;
        appState.activeBooking.theatre = appState.theatres[0];
        appState.activeBooking.showtime = appState.theatres[0].showtimes[0];
        appState.activeBooking.selectedSeats = [];

        // Pre-fill profile contact info
        const profile = Storage.getProfile();
        UI.renderProfile(profile, Storage.getBookings().length);

        // Render booking step components
        UI.renderBookingMovieBanner(movie);
        UI.renderBookingDates(appState.upcomingDates, appState.activeBooking.dateIndex);
        UI.renderBookingTheatres(appState.theatres, appState.activeBooking.theatreId, appState.activeBooking.showtime);
        UI.renderSeatGrid(appState.seatLayout, appState.activeBooking.selectedSeats);
        UI.updateBookingSummary(
            appState.activeBooking.movie,
            appState.activeBooking.theatre,
            appState.activeBooking.date,
            appState.activeBooking.showtime,
            appState.activeBooking.selectedSeats,
            appState.activeBooking.movie.price
        );

        // Reset previous form validation state
        $('#booking-customer-form').removeClass('was-validated');

        // Navigate to booking view
        navigateTo('booking');
    }

    /**
     * Finalize and confirm the current booking
     */
    function finalizeBooking() {
        const form = document.getElementById('booking-customer-form');
        if (!form) return;

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            UI.showToast('Please complete all required customer details.', 'warning');
            return;
        }

        if (appState.activeBooking.selectedSeats.length === 0) {
            UI.showToast('Please select at least one seat to proceed.', 'warning');
            return;
        }

        const customerName = $('#cust-name').val().trim();
        const customerEmail = $('#cust-email').val().trim();
        const customerPhone = $('#cust-phone').val().trim();

        const pricing = CineData.calculatePricing(
            appState.activeBooking.movie.price,
            appState.activeBooking.selectedSeats.length
        );

        const bookingId = `CB-${Math.floor(100000 + Math.random() * 900000)}`;

        const bookingObj = {
            id: bookingId,
            movieId: appState.activeBooking.movieId,
            movieTitle: appState.activeBooking.movie.title,
            poster: appState.activeBooking.movie.poster,
            theatre: appState.activeBooking.theatre.name,
            screen: appState.activeBooking.theatre.screen,
            date: appState.activeBooking.date.fullDate,
            showtime: appState.activeBooking.showtime,
            seats: [...appState.activeBooking.selectedSeats],
            customer: {
                name: customerName,
                email: customerEmail,
                phone: customerPhone
            },
            totalAmount: pricing.grandTotal,
            status: 'Confirmed',
            bookingDate: new Date().toISOString()
        };

        // Persist booking to LocalStorage
        Storage.addBooking(bookingObj);

        // Update profile stats and render confirmation
        const profile = Storage.getProfile();
        UI.renderProfile(profile, Storage.getBookings().length);
        UI.renderConfirmation(bookingObj);
        UI.showToast(`Booking ${bookingId} confirmed successfully!`, 'success');

        // Navigate to confirmation view
        navigateTo('confirmation');
    }

    /**
     * Register all delegated event listeners
     */
    function registerEvents() {
        // Global SPA link clicks
        $(document).on('click', '[data-view]', function (e) {
            e.preventDefault();
            const target = $(this).data('view');
            if (target) {
                navigateTo(target);
            }
        });

        // Search inputs synchronized between navbar and catalogue
        $('#catalog-search-input, #navbar-search-input').on('input', function () {
            const query = $(this).val();
            appState.filter.search = query;
            $('#catalog-search-input, #navbar-search-input').val(query);

            if (appState.currentView !== 'movies') {
                navigateTo('movies');
            } else {
                applyCatalogueFilters();
            }
        });

        // Clear search input button
        $('#catalog-search-clear').on('click', function () {
            appState.filter.search = '';
            $('#catalog-search-input, #navbar-search-input').val('');
            applyCatalogueFilters();
        });

        // Reset filter button in empty state
        $('#btn-reset-filters').on('click', function () {
            appState.filter.search = '';
            appState.filter.genre = 'All';
            appState.filter.sort = 'popularity';
            $('#catalog-search-input, #navbar-search-input').val('');
            $('#catalog-sort-select').val('popularity');
            $('.btn-filter-pill').removeClass('active');
            $('.btn-filter-pill[data-genre="All"]').addClass('active');
            applyCatalogueFilters();
        });

        // Genre Filter Pills
        $('#genre-filter-container').on('click', '.btn-filter-pill', function () {
            const genre = $(this).data('genre');
            appState.filter.genre = genre;
            $('.btn-filter-pill').removeClass('active');
            $(this).addClass('active');
            applyCatalogueFilters();
        });

        // Sort Dropdown Selection
        $('#catalog-sort-select').on('change', function () {
            appState.filter.sort = $(this).val();
            applyCatalogueFilters();
        });

        // View Movie Details Modal Trigger
        $(document).on('click', '.btn-view-details', function (e) {
            e.preventDefault();
            const movieId = $(this).data('movie-id');
            const movie = CineData.getMovieById(movieId);
            UI.showMovieDetailsModal(movie);
        });

        // Book Movie Trigger (Card and Modal)
        $(document).on('click', '.btn-book-movie, .btn-modal-book-now', function (e) {
            e.preventDefault();
            const movieId = $(this).data('movie-id');
            startBookingForMovie(movieId);
        });

        // Date Picker Selection
        $('#booking-dates-container').on('click', '.booking-date-card', function () {
            const idx = parseInt($(this).data('date-index'), 10);
            if (!isNaN(idx) && appState.upcomingDates[idx]) {
                appState.activeBooking.dateIndex = idx;
                appState.activeBooking.date = appState.upcomingDates[idx];
                UI.renderBookingDates(appState.upcomingDates, idx);
                UI.updateBookingSummary(
                    appState.activeBooking.movie,
                    appState.activeBooking.theatre,
                    appState.activeBooking.date,
                    appState.activeBooking.showtime,
                    appState.activeBooking.selectedSeats,
                    appState.activeBooking.movie.price
                );
            }
        });

        // Theatre & Showtime Selection
        $('#booking-theatres-container').on('click', '.showtime-pill', function () {
            const theatreId = $(this).data('theatre-id');
            const showtime = $(this).data('showtime');
            const theatre = CineData.getTheatreById(theatreId);

            if (theatre && showtime) {
                appState.activeBooking.theatreId = theatreId;
                appState.activeBooking.theatre = theatre;
                appState.activeBooking.showtime = showtime;

                UI.renderBookingTheatres(appState.theatres, theatreId, showtime);
                UI.updateBookingSummary(
                    appState.activeBooking.movie,
                    appState.activeBooking.theatre,
                    appState.activeBooking.date,
                    appState.activeBooking.showtime,
                    appState.activeBooking.selectedSeats,
                    appState.activeBooking.movie.price
                );
            }
        });

        // Seat Toggle Selection
        $('#booking-seat-grid').on('click', '.seat-btn', function () {
            const seatId = $(this).data('seat-id');
            if ($(this).hasClass('occupied') || !seatId) return;

            const index = appState.activeBooking.selectedSeats.indexOf(seatId);
            if (index > -1) {
                appState.activeBooking.selectedSeats.splice(index, 1);
                $(this).removeClass('selected');
            } else {
                if (appState.activeBooking.selectedSeats.length >= MAX_SEATS_PER_BOOKING) {
                    UI.showToast(`You can select a maximum of ${MAX_SEATS_PER_BOOKING} seats per booking.`, 'warning');
                    return;
                }
                appState.activeBooking.selectedSeats.push(seatId);
                $(this).addClass('selected');
            }

            UI.updateBookingSummary(
                appState.activeBooking.movie,
                appState.activeBooking.theatre,
                appState.activeBooking.date,
                appState.activeBooking.showtime,
                appState.activeBooking.selectedSeats,
                appState.activeBooking.movie.price
            );
        });

        // Confirm & Book Tickets Button
        $('#btn-confirm-booking').on('click', function () {
            finalizeBooking();
        });

        // Cancellation Modal Trigger
        $(document).on('click', '.btn-trigger-cancel', function () {
            appState.cancellingBookingId = $(this).data('booking-id');
            $('#cancel-modal-booking-info').text(`Booking Reference: ${appState.cancellingBookingId}`);
            const modalEl = document.getElementById('cancelBookingModal');
            if (modalEl) {
                const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
                modalInstance.show();
            }
        });

        // Confirm Cancellation in Modal
        $('#btn-confirm-cancel-booking').on('click', function () {
            if (!appState.cancellingBookingId) return;
            const success = Storage.cancelBooking(appState.cancellingBookingId);
            const modalEl = document.getElementById('cancelBookingModal');
            if (modalEl) {
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }

            if (success) {
                UI.showToast(`Booking ${appState.cancellingBookingId} cancelled.`, 'info');
                const bookings = Storage.getBookings();
                UI.renderBookingsList(bookings);
                UI.renderProfile(Storage.getProfile(), bookings.length);
            }
            appState.cancellingBookingId = null;
        });

        // Edit Profile Modal Trigger
        $('#btn-edit-profile-trigger').on('click', function () {
            const profile = Storage.getProfile();
            UI.renderProfile(profile, Storage.getBookings().length);
            const modalEl = document.getElementById('editProfileModal');
            if (modalEl) {
                const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
                modalInstance.show();
            }
        });

        // Save Profile Form Submission
        $('#edit-profile-form').on('submit', function (e) {
            e.preventDefault();
            if (!this.checkValidity()) {
                $(this).addClass('was-validated');
                return;
            }

            const name = $('#edit-profile-name').val().trim();
            const email = $('#edit-profile-email').val().trim();
            const phone = $('#edit-profile-phone').val().trim();
            const city = $('#edit-profile-city').val().trim();
            const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

            const updatedProfile = {
                name: name,
                email: email,
                phone: phone,
                city: city,
                avatar: initials
            };

            Storage.saveProfile(updatedProfile);
            const bookings = Storage.getBookings();
            UI.renderProfile(updatedProfile, bookings.length);

            const modalEl = document.getElementById('editProfileModal');
            if (modalEl) {
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }

            UI.showToast('Profile updated successfully!', 'success');
        });

        // Hash Navigation Handler
        $(window).on('hashchange', function () {
            const hashView = window.location.hash.replace('#', '');
            if (hashView && hashView !== appState.currentView && VALID_VIEWS.includes(hashView)) {
                navigateTo(hashView, false);
            }
        });
    }

    /**
     * Application Bootstrapper
     */
    function init() {
        Storage.init();

        appState.movies = CineData.getMovies();
        appState.theatres = CineData.getTheatres();
        appState.upcomingDates = CineData.getUpcomingDates();
        appState.seatLayout = CineData.getSeatLayout();

        // Initial render for views
        UI.renderFeaturedMovies(appState.movies);
        UI.renderCatalogue(appState.movies);

        const profile = Storage.getProfile();
        const bookings = Storage.getBookings();
        UI.renderProfile(profile, bookings.length);
        UI.renderBookingsList(bookings);

        // Register event listeners
        registerEvents();

        // Route to initial view from hash or default to 'home'
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
        startBookingForMovie: startBookingForMovie
    };
})(jQuery);

// Initialize when DOM is ready
$(document).ready(function () {
    CineBook.init();
});
