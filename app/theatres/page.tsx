import { Film, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getActiveTheatres } from "@/lib/supabase/theatres";

export const revalidate = 3600;

export default async function TheatresPage() {
  const theatres = await getActiveTheatres({ city: "all" });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-cinebook-border pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Film className="h-8 w-8 text-cinebook-accent" />
            Partner Theatres
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Premium cinema locations & luxury screen formats
          </p>
        </div>
        <Badge variant="secondary" className="self-start md:self-auto">
          {theatres.length} Theatres Available
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {theatres.map((theatre) => (
          <Card key={theatre.id} className="hover:border-zinc-700 transition-colors bg-cinebook-surface border-cinebook-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-white">{theatre.name}</CardTitle>
                <Badge variant="outline">{theatre.city}</Badge>
              </div>
              <CardDescription className="flex items-center gap-1.5 text-zinc-400">
                <MapPin className="h-4 w-4 text-cinebook-accent" />
                {theatre.area || theatre.location} {theatre.address ? `• ${theatre.address}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {theatre.amenities.map((amenity, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
