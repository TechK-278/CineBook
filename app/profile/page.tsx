import { User, Mail, Phone, MapPin, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ProfilePage() {
  const profile = {
    fullName: "Alex Morgan",
    email: "alex.morgan@cinebook.com",
    phone: "+91 98765 43210",
    city: "Mumbai",
    role: "customer" as const,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-cinebook-border pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <User className="h-8 w-8 text-cinebook-accent" />
            User Profile
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your account details and preferences
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cinebook-accent text-xl font-bold text-white shadow">
            AM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">{profile.fullName}</CardTitle>
              <Badge variant="secondary" className="capitalize">
                {profile.role}
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-1.5 mt-1">
              <Mail className="h-3.5 w-3.5" />
              {profile.email}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 border-t border-cinebook-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg bg-cinebook-dark p-3 border border-cinebook-border">
              <span className="text-xs text-zinc-400 block mb-1">Phone Number</span>
              <div className="flex items-center gap-2 text-sm text-white font-medium">
                <Phone className="h-4 w-4 text-cinebook-accent" />
                {profile.phone}
              </div>
            </div>
            <div className="rounded-lg bg-cinebook-dark p-3 border border-cinebook-border">
              <span className="text-xs text-zinc-400 block mb-1">City</span>
              <div className="flex items-center gap-2 text-sm text-white font-medium">
                <MapPin className="h-4 w-4 text-cinebook-accent" />
                {profile.city}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
