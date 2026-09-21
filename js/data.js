/**
 * CineBook — Data Models & Mock Layer
 * Conceptual schemas and baseline data structures for Phase 0
 */

const DataModel = (function () {
    /**
     * Conceptual Schemas:
     * 
     * Movie:
     * {
     *   id: string,
     *   title: string,
     *   poster: string,
     *   backdrop: string,
     *   genre: string[],
     *   duration: string,
     *   rating: number,
     *   language: string,
     *   certificate: string,
     *   description: string
     * }
     * 
     * Showtime:
     * {
     *   id: string,
     *   movieId: string,
     *   date: string,
     *   time: string,
     *   theatre: string,
     *   screen: string,
     *   price: number
     * }
     * 
     * Booking:
     * {
     *   id: string,
     *   movieId: string,
     *   showtimeId: string,
     *   seats: string[],
     *   totalAmount: number,
     *   bookingDate: string,
     *   status: 'confirmed' | 'cancelled'
     * }
     * 
     * User:
     * {
     *   name: string,
     *   email: string,
     *   phone: string,
     *   avatar: string
     * }
     */

    return {
        isInitialized: function () {
            return true;
        }
    };
})();
