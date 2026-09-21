/**
 * CineBook v2 — Shows & Showtimes Dataset (Demo Data)
 */

export interface ShowtimeSlot {
  id: string;
  time: string; // e.g. "10:30 AM"
  format: string; // e.g. "IMAX 2D", "Dolby Atmos", "2D"
  screenName: string;
  price: number;
  status: "available" | "fast-filling" | "sold-out";
}

export interface CinemaMovieShows {
  movieId: string;
  movieTitle: string;
  language: string;
  certificate: string;
  slots: ShowtimeSlot[];
}

export interface CinemaShowSchedule {
  cinemaId: string;
  cinemaName: string;
  locationArea: string;
  movies: CinemaMovieShows[];
}

export const MOCK_SHOWTIMES_SAMPLE: ShowtimeSlot[] = [
  { id: "slot-1", time: "10:30 AM", format: "IMAX 2D", screenName: "Audi 1 (IMAX)", price: 380, status: "available" },
  { id: "slot-2", time: "01:45 PM", format: "IMAX 2D", screenName: "Audi 1 (IMAX)", price: 420, status: "fast-filling" },
  { id: "slot-3", time: "05:00 PM", format: "IMAX 2D", screenName: "Audi 1 (IMAX)", price: 450, status: "sold-out" },
  { id: "slot-4", time: "08:15 PM", format: "IMAX 2D", screenName: "Audi 1 (IMAX)", price: 450, status: "fast-filling" },
  { id: "slot-5", time: "11:30 PM", format: "2D", screenName: "Audi 3", price: 300, status: "available" },
];

export const MOCK_DATES = [
  { day: "Today", date: "21 Sep", fullDate: "2026-09-21", isAvailable: true },
  { day: "Tomorrow", date: "22 Sep", fullDate: "2026-09-22", isAvailable: true },
  { day: "Wed", date: "23 Sep", fullDate: "2026-09-23", isAvailable: true },
  { day: "Thu", date: "24 Sep", fullDate: "2026-09-24", isAvailable: true },
  { day: "Fri", date: "25 Sep", fullDate: "2026-09-25", isAvailable: true },
];
