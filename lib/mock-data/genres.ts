/**
 * CineBook v2 — Genres Dataset
 */

export interface GenreItem {
  id: string;
  name: string;
  icon?: string;
  count: number;
}

export const GENRES: GenreItem[] = [
  { id: "action", name: "Action", count: 8 },
  { id: "sci-fi", name: "Sci-Fi", count: 6 },
  { id: "drama", name: "Drama", count: 9 },
  { id: "thriller", name: "Thriller", count: 7 },
  { id: "comedy", name: "Comedy", count: 5 },
  { id: "adventure", name: "Adventure", count: 6 },
  { id: "animation", name: "Animation", count: 4 },
  { id: "crime", name: "Crime", count: 4 },
  { id: "romance", name: "Romance", count: 3 },
  { id: "family", name: "Family", count: 4 },
];
