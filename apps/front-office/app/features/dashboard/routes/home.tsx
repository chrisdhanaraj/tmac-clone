import { SidebarTrigger } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import type { Route } from "./+types/home";
import { useRouteLoaderData } from "react-router";
import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  ThumbsUp,
  Sun,
  CloudRain,
} from "lucide-react";
import {
  generateAllMockData,
  formatRelativeTime,
  formatEventDate,
  REACTION_EMOJIS,
} from "../utils/mock-data";

// Colocated TypeScript interfaces
interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  spotsAvailable: number;
  totalSpots: number;
  description: string;
}

interface MatchResult {
  id: string;
  player1: string;
  player2: string;
  score: string;
  timestamp: Date;
  reactions: Record<string, number>;
  notes?: string;
}

interface WhatsAppActivity {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  channel: string;
  avatar: string;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TMAC Dashboard" },
    { name: "description", content: "Tennis community dashboard" },
  ];
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const dashboardData = useRouteLoaderData(
    "features/dashboard/routes/dashboard"
  );
  const [mockData, setMockData] = useState<{
    events: Event[];
    matchResults: MatchResult[];
    whatsAppActivities: WhatsAppActivity[];
  }>({ events: [], matchResults: [], whatsAppActivities: [] });
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Generate mock data on component mount
  useEffect(() => {
    setMockData(generateAllMockData());
  }, []);

  // Simulate real-time WhatsApp updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMockData((prev) => {
        const newData = generateAllMockData();
        return {
          ...prev,
          whatsAppActivities: newData.whatsAppActivities,
        };
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (!dashboardData) {
    return null;
  }

  const { session } = dashboardData;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1 text-foreground" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4 bg-border"
          />
          <h1 className="text-base font-medium text-foreground">Dashboard</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-background">
        {/* Hero Section */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Welcome back, {session.user.firstName}!
              </h1>
              {/* Weather Status for Mission Dolores */}
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-foreground">
                    Dolo is dry
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">68°F</span>
                  <span>/</span>
                  <span>20°C</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium h-9 px-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Post Match Result
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border border-border shadow-lg">
                  <DialogHeader>
                    <DialogTitle className="text-foreground text-lg font-semibold">
                      Post Match Result
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-foreground text-sm font-medium">
                          Player 1
                        </Label>
                        <Input
                          placeholder="Enter player name"
                          className="mt-1 border-input focus:border-ring focus:ring-ring"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground text-sm font-medium">
                          Player 2
                        </Label>
                        <Input
                          placeholder="Enter player name"
                          className="mt-1 border-input focus:border-ring focus:ring-ring"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-foreground text-sm font-medium">
                        Score
                      </Label>
                      <Input
                        placeholder="6-4, 6-3"
                        className="mt-1 border-input focus:border-ring focus:ring-ring"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground text-sm font-medium">
                        Notes (optional)
                      </Label>
                      <Textarea
                        placeholder="Match highlights or notes..."
                        className="mt-1 border-input focus:border-ring focus:ring-ring"
                      />
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Post Result
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                className="text-sm font-medium h-9 px-4"
              >
                Join Event
              </Button>
            </div>
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-base font-medium text-foreground">
                Upcoming Events
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-muted-foreground hover:text-foreground -mr-2"
              >
                View all
              </Button>
            </div>

            {/* Horizontal scrolling events */}
            <div className="px-6 pb-6">
              <div className="border border-border rounded-md overflow-x-auto">
                <div className="flex w-max">
                  {mockData.events.slice(0, 10).map((event, index) => (
                    <div
                      key={event.id}
                      className={`flex-shrink-0 w-72 p-4  transition-colors ${
                        index > 0 ? "border-l border-border" : ""
                      }`}
                    >
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-medium text-foreground text-sm">
                            {event.title}
                          </h3>
                          <div className="text-xs text-muted-foreground mt-2 space-y-1">
                            <div>
                              {formatEventDate(event.date)} at {event.time}
                            </div>
                            <div>{event.location}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="text-xs text-muted-foreground">
                            <span className="text-foreground font-medium">
                              {event.spotsAvailable}
                            </span>{" "}
                            of {event.totalSpots} spots
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 px-3 text-xs font-medium"
                          >
                            Join
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Layout: Match Results & WhatsApp Activity */}
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3">
          {/* Recent Match Results - 60% width */}
          <div className="lg:col-span-2 lg:border-r border-border">
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-base font-medium text-foreground">
                Recent Match Results
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-muted-foreground hover:text-foreground -mr-2"
              >
                View all
              </Button>
            </div>

            <div className="bg-card">
              {mockData.matchResults.slice(0, 6).map((result, index) => (
                <div
                  key={result.id}
                  className={`px-6 py-4 ${
                    index > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-foreground font-medium text-sm">
                          {result.player1}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          defeated
                        </span>
                        <span className="text-foreground font-medium text-sm">
                          {result.player2}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-foreground mb-1">
                        {result.score}
                      </div>
                      {result.notes && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {result.notes}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        {REACTION_EMOJIS.map((emoji) => (
                          <Button
                            key={emoji}
                            variant="ghost"
                            size="sm"
                            className="h-auto py-1 px-2 text-xs"
                          >
                            <span className="text-sm mr-1">{emoji}</span>
                            <span>{result.reactions[emoji] || 0}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground/60 ml-4">
                      {formatRelativeTime(result.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Activity - 40% width */}
          <div>
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-base font-medium text-foreground flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                Match Play Activity
              </h2>
            </div>

            <div className="bg-card max-h-[500px] overflow-y-auto">
              {mockData.whatsAppActivities
                .slice(0, 8)
                .map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`flex gap-3 px-6 py-3 hover:bg-accent transition-colors ${
                      index > 0 ? "border-t border-border" : ""
                    }`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={activity.avatar} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
                        {activity.sender
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {activity.sender}
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          {formatRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {activity.message}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
