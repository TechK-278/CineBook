import { Clapperboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Movie } from "@/types";

const INITIAL_MOVIES: Movie[] = [
  {
    id: "a1111111-1111-1111-1111-111111111111",
    title: "Dune: Part Two",
    overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    posterPath: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80",
    genres: ["Sci-Fi", "Adventure", "Action"],
    durationMinutes: 166,
    rating: 8.8,
    language: "English",
    certificate: "UA 16+",
    releaseDate: "2024-03-01",
    basePrice: 320,
    isFeatured: true,
  },
  {
    id: "a2222222-2222-2222-2222-222222222222",
    title: "Oppenheimer",
    overview: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project.",
    posterPath: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&auto=format&fit=crop&q=80",
    genres: ["Drama", "History", "Thriller"],
    durationMinutes: 180,
    rating: 8.9,
    language: "English",
    certificate: "A",
    releaseDate: "2023-07-21",
    basePrice: 350,
    isFeatured: true,
  },
  {
    id: "a3333333-3333-3333-3333-333333333333",
    title: "Spider-Man: Across the Spider-Verse",
    overview: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    posterPath: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&auto=format&fit=crop&q=80",
    genres: ["Animation", "Action", "Sci-Fi"],
    durationMinutes: 140,
    rating: 8.7,
    language: "English",
    certificate: "U",
    releaseDate: "2023-06-02",
    basePrice: 280,
    isFeatured: true,
  },
  {
    id: "a4444444-4444-4444-4444-444444444444",
    title: "The Batman",
    overview: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city hidden corruption.",
    posterPath: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
    genres: ["Action", "Crime", "Drama"],
    durationMinutes: 176,
    rating: 7.9,
    language: "English",
    certificate: "UA 16+",
    releaseDate: "2022-03-04",
    basePrice: 300,
    isFeatured: true,
  },
];

export default function MoviesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-cinebook-border pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Clapperboard className="h-8 w-8 text-cinebook-accent" />
            Movie Catalogue
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Now screening in theatres & upcoming blockbusters
          </p>
        </div>
        <Badge variant="secondary" className="self-start md:self-auto">
          {INITIAL_MOVIES.length} Movies Available
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {INITIAL_MOVIES.map((movie) => (
          <Card key={movie.id} className="overflow-hidden flex flex-col group hover:border-zinc-700 transition-colors">
            <div className="aspect-[2/3] relative w-full overflow-hidden bg-cinebook-dark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={movie.posterPath}
                alt={`Poster of ${movie.title}`}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 bg-cinebook-dark/80 backdrop-blur px-2 py-0.5 rounded text-xs font-semibold text-yellow-400 border border-cinebook-border">
                ★ {movie.rating}
              </div>
            </div>
            <CardContent className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>{movie.genres.join(", ")}</span>
                  <span>{movie.durationMinutes}m</span>
                </div>
                <h2 className="font-semibold text-white text-base line-clamp-1">{movie.title}</h2>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{movie.overview}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-cinebook-border flex items-center justify-between">
                <span className="text-sm font-semibold text-white">From ₹{movie.basePrice}</span>
                <Badge variant="outline">{movie.certificate}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
