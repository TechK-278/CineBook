/**
 * CineBook v2 — Cinemas Dataset (Demo Data)
 * Inspired by real-world location-aware multiplex directories
 */

export interface CinemaDetail {
  id: string;
  name: string;
  chain: "PVR" | "INOX" | "Cinépolis" | "Miraj" | "Mukta A2" | "Independent";
  locationArea: string; // Area / Mall
  address: string;
  cityId: string;
  cityName: string;
  screenCount: number;
  movieCount: number;
  showCount: number;
  amenities: string[];
  formats: string[];
  rating: number;
  isPopular: boolean;
}

export const CINEMAS: CinemaDetail[] = [
  {
    id: "pvr-palladium-ahmedabad",
    name: "PVR: Palladium Mall",
    chain: "PVR",
    locationArea: "Thaltej, SG Highway",
    address: "4th Floor, Palladium Mall, Sarkhej - Gandhinagar Hwy, Thaltej, Ahmedabad, Gujarat 380054",
    cityId: "ahmedabad",
    cityName: "Ahmedabad",
    screenCount: 9,
    movieCount: 8,
    showCount: 32,
    amenities: ["IMAX Laser", "LUXE Recliners", "Dolby Atmos", "Gourmet Menu", "Valet Parking"],
    formats: ["IMAX 2D", "IMAX 3D", "LUXE", "2D", "3D"],
    rating: 4.8,
    isPopular: true,
  },
  {
    id: "inox-himalaya-mall-ahmedabad",
    name: "INOX: Himalaya Mall",
    chain: "INOX",
    locationArea: "Drive-In Road, Memnagar",
    address: "3rd Floor, Himalaya Mall, Drive In Rd, Gurukul, Ahmedabad, Gujarat 380052",
    cityId: "ahmedabad",
    cityName: "Ahmedabad",
    screenCount: 5,
    movieCount: 6,
    showCount: 22,
    amenities: ["Insignia Lounge", "Dolby 7.1", "Recliner Seats", "Wheelchair Accessible"],
    formats: ["Insignia", "2D", "3D"],
    rating: 4.5,
    isPopular: true,
  },
  {
    id: "cinepolis-alpha-one-ahmedabad",
    name: "Cinépolis: Ahmedabad One Mall",
    chain: "Cinépolis",
    locationArea: "Vastrapur",
    address: "Alpha One Mall, Near Vastrapur Lake, Vastrapur, Ahmedabad, Gujarat 380015",
    cityId: "ahmedabad",
    cityName: "Ahmedabad",
    screenCount: 8,
    movieCount: 7,
    showCount: 28,
    amenities: ["4DX Motion Seats", "VIP Lounge", "Dolby Atmos", "Coffee Tree"],
    formats: ["4DX 3D", "VIP", "2D", "3D"],
    rating: 4.6,
    isPopular: true,
  },
  {
    id: "pvr-acropolis-ahmedabad",
    name: "PVR: Acropolis Mall",
    chain: "PVR",
    locationArea: "Thaltej Crossroads",
    address: "Acropolis Mall, SG Highway, Thaltej, Ahmedabad, Gujarat 380059",
    cityId: "ahmedabad",
    cityName: "Ahmedabad",
    screenCount: 6,
    movieCount: 6,
    showCount: 24,
    amenities: ["Dolby Atmos", "Snack Lounge", "Express Pick-Up"],
    formats: ["2D", "3D"],
    rating: 4.4,
    isPopular: true,
  },
  {
    id: "wide-angle-sg-highway-ahmedabad",
    name: "Wide Angle Multiplex",
    chain: "Independent",
    locationArea: "SG Highway",
    address: "Wide Angle, Near ISCON Cross Roads, SG Highway, Ahmedabad, Gujarat 380015",
    cityId: "ahmedabad",
    cityName: "Ahmedabad",
    screenCount: 6,
    movieCount: 5,
    showCount: 20,
    amenities: ["Laser Projection", "Dolby 7.1", "Food Court", "Parking"],
    formats: ["2D", "3D"],
    rating: 4.3,
    isPopular: false,
  },
  {
    id: "pvr-inox-phoenix-mumbai",
    name: "PVR INOX: Phoenix Palladium",
    chain: "PVR",
    locationArea: "Lower Parel",
    address: "High Street Phoenix, 462 Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013",
    cityId: "mumbai",
    cityName: "Mumbai",
    screenCount: 11,
    movieCount: 9,
    showCount: 42,
    amenities: ["IMAX Laser", "Director's Cut", "Dolby Atmos", "Valet"],
    formats: ["IMAX 2D", "Director's Cut", "2D"],
    rating: 4.9,
    isPopular: true,
  },
  {
    id: "pvr-ambience-delhi",
    name: "PVR: Ambience Mall",
    chain: "PVR",
    locationArea: "Vasant Kunj",
    address: "Ambience Mall, Nelson Mandela Marg, Vasant Kunj, New Delhi 110070",
    cityId: "delhi",
    cityName: "Delhi-NCR",
    screenCount: 7,
    movieCount: 6,
    showCount: 26,
    amenities: ["Gold Class", "Dolby Atmos", "Chef Curated Menu"],
    formats: ["Gold Class", "2D", "3D"],
    rating: 4.7,
    isPopular: true,
  },
  {
    id: "pvr-forum-koramangala-bengaluru",
    name: "PVR: Forum Mall",
    chain: "PVR",
    locationArea: "Koramangala",
    address: "The Forum Mall, Hosur Rd, Koramangala, Bengaluru, Karnataka 560095",
    cityId: "bengaluru",
    cityName: "Bengaluru",
    screenCount: 11,
    movieCount: 8,
    showCount: 36,
    amenities: ["IMAX", "Gold Class", "Dolby Atmos"],
    formats: ["IMAX 2D", "Gold Class", "2D"],
    rating: 4.8,
    isPopular: true,
  },
];
