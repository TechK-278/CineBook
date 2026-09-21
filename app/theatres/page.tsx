import { Film, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Theatre } from "@/types";

const THEATRES: Theatre[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Cineplex Central",
    location: "Downtown City Center",
    city: "Mumbai",
    address: "123 MG Road, Fort, Mumbai",
    amenities: ["4K Laser Projection", "Dolby Atmos", "Recliner Seating", "Gourmet Food"],
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "PVR IMAX",
    location: "Phoenix Grand Mall",
    city: "Mumbai",
    address: "Lower Parel, Mumbai",
    amenities: ["IMAX with Laser", "Dolby 7.1", "Valet Parking"],
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "INOX Premiere",
    location: "Galleria Boulevard",
    city: "Bengaluru",
    address: "Indiranagar, Bengaluru",
    amenities: ["Insignia Luxe Screen", "Butler on Call", "Plush Recliners"],
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "CineMax Arena",
    location: "West End Plaza",
    city: "Delhi",
    address: "Connaught Place, New Delhi",
    amenities: ["Dolby 7.1 Surround", "Snack Bar", "Wheelchair Accessible"],
  },
];

export default function TheatresPage() {
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
          {THEATRES.length} Theatres Across 3 Cities
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {THEATRES.map((theatre) => (
          <Card key={theatre.id} className="hover:border-zinc-700 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{theatre.name}</CardTitle>
                <Badge variant="outline">{theatre.city}</Badge>
              </div>
              <CardDescription className="flex items-center gap-1.5 text-zinc-400">
                <MapPin className="h-4 w-4 text-cinebook-accent" />
                {theatre.location} • {theatre.address}
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
