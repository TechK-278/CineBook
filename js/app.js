/**
 * CineBook — Main Application Logic & Controller
 * Handles SPA state management, booking engine, search/filter/sort, profile, and event workflows
 */

const CineBook = (function ($) {
    const VALID_VIEWS = ['home', 'movies', 'booking', 'confirmation', 'bookings', 'profile'];
    let currentView = 'home';

    let allMovies = [];
    let allTheatres = [];
    let upcomingDates = [];
    let seatLayout = [];

    // Filter & Search State
    let filterState = {
        search: '',
        genre: 'All',
        sort: 'popularity'
    };

    // Active Booking State
    let activeBooking = {
        movie: null,
        movieId: null,
        dateIndex: 0,
        date: null,
        theatreId: null,
        theatre: null,
        showtime: null,
        selectedSeats: [],
        totalAmount: 0
    };

    let cancellingBookingId = null;

    /**
     * Filter and sort movies according to state
     */
    function getFilteredMovies() {
        let list = [...allMovies];

        // 1. Search Query (Title or Genre)
        if (filterState.search.trim() !== '') {
            const query = filterState.search.toLowerCase().trim();
            list = list.filter(m => 
                m.title.toLowerCase().includes(query) || 
                m.genre.some(g => g.toLowerCase().includes(query)) ||
                m.language.toLowerCase().includes(query)
            );
        }

        // 2. Genre Filter
        if (filterState.genre && filterState.genre !== 'All') {
            list = list.filter(m => m.genre.includes(filterState.genre));
        }

        // 3. Sorting
        if (filterState.sort === 'rating') {
            list.sort((a, b) => b.rating - a.rating);
        } else if (filterState.sort === 'title') {
            list.sort((a, b) => a.title.localeCompare(b.title));
        } else if (filterState.sort === 'newest') {
            list.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        } else {
            // Default: Popularity (featured first, then rating)
            list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating);
        }

        return list;
    }

    /**
     * Update catalogue grid based on current filter/search
     */
    function applyCatalogueFilters() {
        const filtered = getFilteredMovies();
        UI.renderCatalogue(filtered);

        // Toggle clear search button
        if (filterState.search.trim() !== '') {
            $('#catalog-search-clear').removeClass('d-none');
        } else {
            $('#catalog-search-clear').addClass('d-none');
        }
    }

    /**
     * Centralized SPA Navigation
     */
    function navigateTo(viewName, updateHash = true) {
        const targetView = VALID_VIEWS.includes(viewName) ? viewName : 'home';
        currentView = targetView;

        // Perform view-specific preparations
        if (targetView === 'movies') {
            applyCatalogueFilters();
        } else if (targetView === 'bookings') {
            const bookings = Storage.getBookings();
            UI.renderBookingsList(bookings);
        } else if (targetView === 'profile') {
            const profile = Storage.getProfile();
            const bookings = Storage.getBookings();
            UI.renderProfile(profile, bookings.length);
        }

        UI.showView(targetView);

        if (updateHash && window.location.hash !== `#${targetView}`) {
            window.location.hash = targetView;
        }
    }

    /**
     * Start Booking Flow for a specific movie
     */
    function startBookingForMovie(movieId) {
        const movie = CineData.getMovieById(movieId);
        if (!movie) {
            UI.showToast('Movie details not found.', 'danger');
            return;
        }

        // Hide movie details modal if open
        const modalEl = document.getElementById('movieDetailsModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
            modalInstance.hide();
        }

        // Reset and populate active booking state
        activeBooking.movie = movie;
        activeBooking.movieId = movie.id;
        activeBooking.dateIndex = 0;
        activeBooking.date = upcomingDates[0];
        activeBooking.theatreId = allTheatres[0].id;
        activeBooking.theatre = allTheatres[0];
        activeBooking.showtime = allTheatres[0].showtimes[0];
        activeBooking.selectedSeats = [];

        // Pre-fill customer form from saved profile
        const profile = Storage.getProfile();
        UI.renderProfile(profile, Storage.getBookings().length);

        // Render booking step components
        UI.renderBookingMovieBanner(movie);
        UI.renderBookingDates(upcomingDates, activeBooking.dateIndex);
        UI.renderBookingTheatres(allTheatres, activeBooking.theatreId, activeBooking.showtime);
        UI.renderSeatGrid(seatLayout, activeBooking.selectedSeats);
        UI.updateBookingSummary(
            activeBooking.movie,
            activeBooking.theatre,
            activeBooking.date,
            activeBooking.showtime,
            activeBooking.selectedSeats,
            activeBooking.movie.price
        );

        // Clear previous form validation state
        $('#booking-customer-form').removeClass('was-validated');

        // Navigate to booking view
        navigateTo('booking');
    }

    /**
     * Confirm and finalize the current booking
     */
    function finalizeBooking() {
        const form = document.getElementById('booking-customer-form');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            UI.showToast('Please fill all required customer contact details.', 'warning');
            return;
        }

        if (activeBooking.selectedSeats.length === 0) {
            UI.showToast('Please select at least one cinema seat.', 'warning');
            return;
        }

        const customerName = $('#cust-name').val().trim();
        const customerEmail = $('#cust-email').val().trim();
        const customerPhone = $('#cust-phone').val().trim();

        const subtotal = activeBooking.selectedSeats.length * activeBooking.movie.price;
        const fee = Math.round(subtotal * 0.12);
        const grandTotal = subtotal + fee;

        const bookingId = `CB-${Math.floor(100000 + Math.random() * 900000)}`;

        const bookingObj = {
            id: bookingId,
            movieId: activeBooking.movieId,
            movieTitle: activeBooking.movie.title,
            poster: activeBooking.movie.poster,
            theatre: activeBooking.theatre.name,
            screen: activeBooking.theatre.screen,
            date: activeBooking.date.fullDate,
            showtime: activeBooking.showtime,
            seats: [...activeBooking.selectedSeats],
            customer: {
                name: customerName,
                email: customerEmail,
                phone: customerPhone
            },
            totalAmount: grandTotal,
            status: 'Confirmed',
            bookingDate: new Date().toISOString()
        };

        // Persist booking
        Storage.addBooking(bookingObj);

        // Update profile booking count
        const profile = Storage.getProfile();
        UI.renderProfile(profile, Storage.getBookings().length);

        // Render confirmation view
        UI.renderConfirmation(bookingObj);
        UI.showToast(`Booking ${bookingId} confirmed successfully!`, 'success');

        // Navigate to confirmation view
        navigateTo('confirmation');
    }

    /**
     * Wire up all event listeners
     */
    function initEvents() {
        // Global SPA link clicks
        $(document).on('click', '[data-view]', function (e) {
            e.preventDefault();
            const targetView = $(this).data('view');
            if (targetView) {
                navigateTo(targetView);
            }
        });

        // Search inputs (navbar and catalogue synced)
        $('#catalog-search-input, #navbar-search-input').on('input', function () {
            const val = $(this).val();
            filterState.search = val;
            $('#catalog-search-input, #navbar-search-input').val(val);
            
            if (currentView !== 'movies') {
                navigateTo('movies');
            } else {
                applyCatalogueFilters();
            }
        });

        // Clear search input
        $('#catalog-search-clear').on('click', function () {
            filterState.search = '';
            $('#catalog-search-input, #navbar-search-input').val('');
            applyCatalogueFilters();
        });

        // Reset all filters in empty state
        $('#btn-reset-filters').on('click', function () {
            filterState.search = '';
            filterState.genre = 'All';
            filterState.sort = 'popularity';
            $('#catalog-search-input, #navbar-search-input').val('');
            $('#catalog-sort-select').val('popularity');
            $('.btn-filter-pill').removeClass('active');
            $('.btn-filter-pill[data-genre="All"]').addClass('active');
            applyCatalogueFilters();
        });

        // Genre Filter Pills
        $('#genre-filter-container').on('click', '.btn-filter-pill', function () {
            const genre = $(this).data('genre');
            filterState.genre = genre;
            $('.btn-filter-pill').removeClass('active');
            $(this).addClass('active');
            applyCatalogueFilters();
        });

        // Sort Select Change
        $('#catalog-sort-select').on('change', function () {
            filterState.sort = $(this).val();
            applyCatalogueFilters();
        });

        // View Movie Details Click
        $(document).on('click', '.btn-view-details', function (e) {
            e.preventDefault();
            const movieId = $(this).data('movie-id');
            const movie = CineData.getMovieById(movieId);
            UI.showMovieDetailsModal(movie);
        });

        // Book Movie Click (from card or modal)
        $(document).on('click', '.btn-book-movie, .btn-modal-book-now', function (e) {
            e.preventDefault();
            const movieId = $(this).data('movie-id');
            startBookingForMovie(movieId);
        });

        // Booking: Date Selection
        $('#booking-dates-container').on('click', '.booking-date-card', function () {
            const idx = $(this).data('date-index');
            activeBooking.dateIndex = idx;
            activeBooking.date = upcomingDates[idx];
            UI.renderBookingDates(upcomingDates, idx);
            UI.updateBookingSummary(
                activeBooking.movie,
                activeBooking.theatre,
                activeBooking.date,
                activeBooking.showtime,
                activeBooking.selectedSeats,
                activeBooking.movie.price
            );
        });

        // Booking: Theatre & Showtime Selection
        $('#booking-theatres-container').on('click', '.showtime-pill', function () {
            const theatreId = $(this).data('theatre-id');
            const showtime = $(this).data('showtime');
            const theatre = allTheatres.find(t => t.id === theatreId);

            activeBooking.theatreId = theatreId;
            activeBooking.theatre = theatre;
            activeBooking.showtime = showtime;

            UI.renderBookingTheatres(allTheatres, theatreId, showtime);
            UI.updateBookingSummary(
                activeBooking.movie,
                activeBooking.theatre,
                activeBooking.date,
                activeBooking.showtime,
                activeBooking.selectedSeats,
                activeBooking.movie.price
            );
        });

        // Booking: Seat Selection Click
        $('#booking-seat-grid').on('click', '.seat-btn', function () {
            const seatId = $(this).data('seat-id');
            if ($(this).hasClass('occupied')) return;

            const index = activeBooking.selectedSeats.indexOf(seatId);
            if (index > -1) {
                activeBooking.selectedSeats.splice(index, 1);
                $(this).removeClass('selected');
            } else {
                if (activeBooking.selectedSeats.length >= 8) {
                    UI.showToast('You can select a maximum of 8 seats per booking.', 'warning');
                    return;
                }
                activeBooking.selectedSeats.push(seatId);
                $(this).addClass('selected');
            }

            UI.updateBookingSummary(
                activeBooking.movie,
                activeBooking.theatre,
                activeBooking.date,
                activeBooking.showtime,
                activeBooking.selectedSeats,
                activeBooking.movie.price
            );
        });

        // Confirm & Book Tickets Button
        $('#btn-confirm-booking').on('click', function () {
            finalizeBooking();
        });

        // Cancellation Trigger on Booking Card
        $(document).on('click', '.btn-trigger-cancel', function () {
            cancellingBookingId = $(this).data('booking-id');
            $('#cancel-modal-booking-info').text(`Booking Reference: ${cancellingBookingId}`);
            const modalEl = document.getElementById('cancelBookingModal');
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
            modalInstance.show();
        });

        // Confirm Cancellation Button in Modal
        $('#btn-confirm-cancel-booking').on('click', function () {
            if (!cancellingBookingId) return;
            const success = Storage.cancelBooking(cancellingBookingId);
            const modalEl = document.getElementById('cancelBookingModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) {
                modalInstance.hide();
            }

            if (success) {
                UI.showToast(`Booking ${cancellingBookingId} cancelled.`, 'info');
                const bookings = Storage.getBookings();
                UI.renderBookingsList(bookings);
                UI.renderProfile(Storage.getProfile(), bookings.length);
            }
            cancellingBookingId = null;
        });

        // Edit Profile Trigger
        $('#btn-edit-profile-trigger').on('click', function () {
            const profile = Storage.getProfile();
            UI.renderProfile(profile, Storage.getBookings().length);
            const modalEl = document.getElementById('editProfileModal');
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
            modalInstance.show();
        });

        // Save Profile Form Submission
        $('#edit-profile-form').on('submit', function (e) {
            e.preventDefault();
            if (!this.checkValidity()) {
                $(this).addClass('was-validated');
                return;
            }

            const updatedProfile = {
                name: $('#edit-profile-name').val().trim(),
                email: $('#edit-profile-email').val().trim(),
                phone: $('#edit-profile-phone').val().trim(),
                city: $('#edit-profile-city').val().trim(),
                avatar: $('#edit-profile-name').val().trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            };

            Storage.saveProfile(updatedProfile);
            const bookings = Storage.getBookings();
            UI.renderProfile(updatedProfile, bookings.length);

            const modalEl = document.getElementById('editProfileModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) {
                modalInstance.hide();
            }

            UI.showToast('Profile updated successfully!', 'success');
        });

        // Browser Back/Forward navigation support
        $(window).on('hashchange', function () {
            const hashView = window.location.hash.replace('#', '');
            if (hashView && hashView !== currentView && VALID_VIEWS.includes(hashView)) {
                navigateTo(hashView, false);
            }
        });
    }

    /**
     * Application Initialization
     */
    function init() {
        Storage.init();

        allMovies = CineData.getMovies();
        allTheatres = CineData.getTheatres();
        upcomingDates = CineData.getUpcomingDates();
        seatLayout = CineData.getSeatLayout();

        // Render Home featured movies & Catalogue
        UI.renderFeaturedMovies(allMovies);
        UI.renderCatalogue(allMovies);

        // Load profile and bookings
        const profile = Storage.getProfile();
        const bookings = Storage.getBookings();
        UI.renderProfile(profile, bookings.length);
        UI.renderBookingsList(bookings);

        // Wire event listeners
        initEvents();

        // Route to initial view based on URL hash
        const initialHash = window.location.hash.replace('#', '');
        if (initialHash && VALID_VIEWS.includes(initialHash)) {
            navigateTo(initialHash, false);
        } else {
            navigateTo('home', false);
        }

        console.log('[CineBook] CineBook SPA initialized successfully.');
    }

    return {
        init: init,
        navigateTo: navigateTo,
        startBookingForMovie: startBookingForMovie
    };
})(jQuery);

// Boot application when DOM is ready
$(document).ready(function () {
    CineBook.init();
});
