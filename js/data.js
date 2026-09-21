/**
 * CineBook — Data Models & Mock Dataset
 * 12 Realistic Movies, Theatres, and Showtime Configuration
 */

const CineData = (function () {
    const MOVIES = [
        {
            id: "cb-mov-1",
            title: "Dune: Part Two",
            poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80",
            backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
            genre: ["Sci-Fi", "Adventure", "Action"],
            duration: "2h 46m",
            rating: 8.8,
            language: "English",
            certificate: "UA 16+",
            description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe.",
            releaseDate: "2024-03-01",
            price: 320,
            featured: true
        },
        {
            id: "cb-mov-2",
            title: "Oppenheimer",
            poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&auto=format&fit=crop&q=80",
            backdrop: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&auto=format&fit=crop&q=80",
            genre: ["Drama", "History", "Thriller"],
            duration: "3h 00m",
            rating: 8.9,
            language: "English",
            certificate: "A",
            description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project.",
            releaseDate: "2023-07-21",
            price: 350,
            featured: true
        },
        {
            id: "cb-mov-3",
            title: "Spider-Man: Across the Spider-Verse",
            poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&auto=format&fit=crop&q=80",
            backdrop: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80",
            genre: ["Animation", "Action", "Sci-Fi"],
            duration: "2h 20m",
            rating: 8.7,
            language: "English",
            certificate: "U",
            description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
            releaseDate: "2023-06-02",
            price: 280,
            featured: true
        },
        {
            id: "cb-mov-4",
            title: "The Batman",
            poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
            backdrop: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&auto=format&fit=crop&q=80",
            genre: ["Action", "Crime", "Drama"],
            duration: "2h 56m",
            rating: 7.9,
            language: "English",
            certificate: "UA 16+",
            description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.",
            releaseDate: "2022-03-04",
            price: 300,
            featured: true
        },
        {
            id: "cb-mov-5",
            title: "Interstellar: Re-Release",
            poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80",
            backdrop: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&auto=format&fit=crop&q=80",
            genre: ["Sci-Fi", "Drama", "Adventure"],
            duration: "2h 49m",
            rating: 8.7,
            language: "English",
            certificate: "UA",
            description: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.",
            releaseDate: "2024-09-15",
            price: 350,
            featured: false
        },
        {
            id: "cb-mov-6",
            title: "Joker: Folie à Deux",
            poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
            backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80",
            genre: ["Drama", "Crime", "Thriller"],
            duration: "2h 18m",
            rating: 7.5,
            language: "English",
            certificate: "A",
            description: "Failed comedian Arthur Fleck meets the love of his life, Harley Quinn, while incarcerated at Arkham State Hospital. Upon his release, the two embark on a doomed musical misadventure.",
            releaseDate: "2024-10-04",
            price: 300,
            featured: false
        },
        {
            id: "cb-mov-7",
            title: "Deadpool & Wolverine",
            poster: "https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?w=500&auto=format&fit=crop&q=80",
            backdrop: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80",
            genre: ["Action", "Comedy", "Sci-Fi"],
            duration: "2h 08m",
            rating: 8.0,
            language: "English",
            certificate: "A",
            description: "Deadpool's peaceful existence comes crashing down when the Time Variance Authority recruits him to help safeguard the multiverse, partnering with a reluctant Wolverine.",
            releaseDate: "2024-07-26",
            price: 320,
            featured: false
        },
        {
            id: "cb-mov-8",
            title: "Inside Out 2",
            poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80",
            backdrop: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80",
            genre: ["Animation", "Comedy", "Drama"],
            duration: "1h 36m",
            rating: 7.8,
            language: "English",
            certificate: "U",
            description: "Joy, Sadness, Anger, Fear, and Disgust have been running a successful operation. But when Anxiety, Envy, Ennui, and Embarrassment arrive, everything is thrown into disarray.",
            releaseDate: "2024-06-14",
            price: 260,
            featured: false
        },
        {
            id: "cb-mov-9",
            title: "Gladiator II",
            poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80",
            backdrop: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&auto=format&fit=crop&q=80",
            genre: ["Action", "Drama", "Adventure"],
            duration: "2h 28m",
            rating: 7.9,
            language: "English",
            certificate: "A",
            description: "Years after witnessing the death of revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors.",
            releaseDate: "2024-11-22",
            price: 340,
            featured: false
        },
        {
            id: "cb-mov-10",
            title: "Knives Out: Glass Onion",
            poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&auto=format&fit=crop&q=80",
            backdrop: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&auto=format&fit=crop&q=80",
            genre: ["Comedy", "Thriller", "Crime"],
            duration: "2h 19m",
            rating: 7.2,
            language: "English",
            certificate: "UA 13+",
            description: "Master detective Benoit Blanc travels to Greece to peel back the layers of a mystery involving a tech billionaire and his eclectic group of friends.",
            releaseDate: "2022-12-23",
            price: 250,
            featured: false
        },
        {
            id: "cb-mov-11",
            title: "A Quiet Place: Day One",
            poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
            backdrop: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&auto=format&fit=crop&q=80",
            genre: ["Thriller", "Sci-Fi", "Drama"],
            duration: "1h 39m",
            rating: 6.9,
            language: "English",
            certificate: "UA 16+",
            description: "A young woman named Sam must navigate a claustrophobic and harrowing invasion of New York City by bloodthirsty alien creatures with ultra-sensitive hearing.",
            releaseDate: "2024-06-28",
            price: 270,
            featured: false
        },
        {
            id: "cb-mov-12",
            title: "The Wild Robot",
            poster: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80",
            backdrop: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
            genre: ["Animation", "Sci-Fi", "Drama"],
            duration: "1h 42m",
            rating: 8.5,
            language: "English",
            certificate: "U",
            description: "After a shipwreck, an intelligent robot called Roz is stranded on an uninhabited island. To survive the harsh environment, Roz bonds with the island's animals and cares for an orphaned baby goose.",
            releaseDate: "2024-09-27",
            price: 290,
            featured: false
        }
    ];

    const THEATRES = [
        {
            id: "th-1",
            name: "Cineplex Central",
            location: "Downtown City Center",
            screen: "Screen 1 (4K Laser)",
            showtimes: ["10:30 AM", "01:15 PM", "04:30 PM", "07:45 PM", "10:30 PM"]
        },
        {
            id: "th-2",
            name: "PVR IMAX",
            location: "Phoenix Grand Mall",
            screen: "IMAX Screen with Dolby Atmos",
            showtimes: ["11:00 AM", "02:30 PM", "06:00 PM", "09:15 PM"]
        },
        {
            id: "th-3",
            name: "INOX Premiere",
            location: "Galleria Boulevard",
            screen: "Insignia Luxe Screen",
            showtimes: ["12:00 PM", "03:45 PM", "07:00 PM", "10:15 PM"]
        },
        {
            id: "th-4",
            name: "CineMax Arena",
            location: "West End Plaza",
            screen: "Screen 3 (Dolby 7.1)",
            showtimes: ["10:00 AM", "01:30 PM", "05:00 PM", "08:30 PM"]
        }
    ];

    const DEFAULT_PROFILE = {
        name: "Alex Morgan",
        email: "alex.morgan@cinebook.com",
        phone: "+91 98765 43210",
        city: "Mumbai",
        avatar: "AM"
    };

    /**
     * Generate 36 standard cinema seats (Rows A to F, 6 seats each)
     * Some randomly pre-occupied seats per session
     */
    function getSeatLayout(seed = 1) {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
        const cols = 6;
        const occupiedSet = new Set(['A3', 'A4', 'C2', 'D5', 'E1', 'E6', 'F3', 'F4']);

        const seats = [];
        rows.forEach(row => {
            for (let c = 1; c <= cols; c++) {
                const id = `${row}${c}`;
                let tier = 'Standard';
                let priceMultiplier = 1.0;

                if (row === 'A' || row === 'B') {
                    tier = 'Recliner';
                    priceMultiplier = 1.25;
                } else if (row === 'C' || row === 'D') {
                    tier = 'Premium';
                    priceMultiplier = 1.1;
                }

                seats.push({
                    id: id,
                    row: row,
                    col: c,
                    tier: tier,
                    isOccupied: occupiedSet.has(id),
                    priceMultiplier: priceMultiplier
                });
            }
        });

        return seats;
    }

    /**
     * Get upcoming 4 dates formatted
     */
    function getUpcomingDates() {
        const dates = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const now = new Date();
        for (let i = 0; i < 4; i++) {
            const d = new Date();
            d.setDate(now.getDate() + i);

            let label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
            let fullDate = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
            let isoDate = d.toISOString().split('T')[0];

            dates.push({
                index: i,
                label: label,
                dayName: days[d.getDay()],
                dayNumber: d.getDate(),
                month: months[d.getMonth()],
                fullDate: fullDate,
                isoDate: isoDate
            });
        }
        return dates;
    }

    return {
        getMovies: function () {
            return MOVIES;
        },
        getMovieById: function (id) {
            return MOVIES.find(m => m.id === id) || null;
        },
        getTheatres: function () {
            return THEATRES;
        },
        getDefaultProfile: function () {
            return { ...DEFAULT_PROFILE };
        },
        getSeatLayout: getSeatLayout,
        getUpcomingDates: getUpcomingDates
    };
})();
