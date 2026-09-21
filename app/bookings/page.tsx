import { Ticket, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function BookingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-cinebook-border pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Ticket className="h-8 w-8 text-cinebook-accent" />
            My Reservations
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            View active movie passes and booking history
          </p>
        </div>
      </div>

      <Card className="p-8 text-center border-dashed border-cinebook-border bg-cinebook-surface/40">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cinebook-surface border border-cinebook-border text-cinebook-accent mb-4">
          <Ticket className="h-6 w-6" />
        </div>
        <CardTitle className="text-lg">No Active Bookings Found</CardTitle>
        <CardDescription className="max-w-md mx-auto mt-2">
          Your confirmed movie passes and booking history will appear here once you reserve tickets.
        </CardDescription>
      </Card>
    </div>
  );
}
