import { SidebarTrigger } from "~/components/ui/sidebar";
import type { Route } from "./+types/courts";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Plus, CheckCircle2 } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import prisma from "~/lib/prisma";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Courts" },
    { name: "description", content: "Manage tennis courts" },
  ];
}

export async function loader() {
  // Load existing court locations with their courts
  const courtLocations = await prisma.courtLocation.findMany({
    include: {
      courts: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return { courtLocations };
}

export default function Courts({ loaderData }: Route.ComponentProps) {
  const { courtLocations } = loaderData;
  const [searchParams] = useSearchParams();
  const [showAlert, setShowAlert] = useState(false);

  // Handle success alert from create page
  useEffect(() => {
    const success = searchParams.get("success");

    if (success === "created") {
      setShowAlert(true);

      // Auto-hide alert after 5 seconds
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const dismissAlert = () => {
    setShowAlert(false);
    // Clear URL params
    const url = new URL(window.location.href);
    url.searchParams.delete("success");
    url.searchParams.delete("location");
    window.history.replaceState({}, "", url);
  };

  const location = searchParams.get("location");

  return (
    <div>
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">Courts</h1>
        </div>
      </header>
      <div className="p-4">
        {/* Success Alert */}
        {showAlert && location && (
          <div className="mb-6">
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1">
                Court location "{decodeURIComponent(location)}" created
                successfully!
              </span>
              <button
                onClick={dismissAlert}
                className="text-current hover:opacity-70"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Courts Management</h1>
            <p className="text-muted-foreground">
              Manage court locations and their associated courts.
            </p>
          </div>
        </div>

        {courtLocations.length === 0 ? (
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">
                  No court locations yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first court location.
                </p>
                <Button asChild>
                  <Link to="/dashboard/courts/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Court Location
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courtLocations.map((location) => (
              <Card key={location.id}>
                <CardHeader>
                  <CardTitle>{location.name}</CardTitle>
                  {location.bookingUrl && (
                    <a
                      href={location.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm "
                    >
                      View Booking System →
                    </a>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">
                        Courts ({location.courts.length})
                      </h4>
                      <div className="space-y-2">
                        {location.courts
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((court) => (
                            <div
                              key={court.id}
                              className="flex justify-between items-center p-2 bg-muted rounded-sm text-sm"
                            >
                              <span>{court.name}</span>
                              <span className="text-muted-foreground">
                                {court.bookingDuration}min
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                    {location.googlePlaceId && (
                      <div className="text-xs text-muted-foreground">
                        Google Place ID: {location.googlePlaceId}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
