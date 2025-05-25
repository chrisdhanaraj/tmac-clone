import { SidebarTrigger } from "~/components/ui/sidebar";
import type { Route } from "./+types/events";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import prisma from "~/lib/prisma";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { EventsTable } from "~/features/events/components/events-table";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Events" },
    { name: "description", content: "List of all the events" },
  ];
}

export async function loader({}: LoaderFunctionArgs) {
  const bookings = await prisma.booking.findMany({
    include: {
      host: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      courtLocation: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  return { bookings };
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method === "DELETE") {
    try {
      const url = new URL(request.url);
      const bookingId = url.searchParams.get("id");

      if (!bookingId) {
        return {
          success: false,
          error: "Booking ID is required",
        };
      }

      // First, check if the booking exists and is a draft
      const existingBooking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { id: true, status: true, title: true },
      });

      if (!existingBooking) {
        return {
          success: false,
          error: "Event not found",
        };
      }

      if (existingBooking.status !== "draft") {
        return {
          success: false,
          error: "Only draft events can be deleted",
        };
      }

      // Delete the booking
      await prisma.booking.delete({
        where: { id: bookingId },
      });

      return {
        success: true,
        message: `Event "${existingBooking.title}" has been deleted`,
      };
    } catch (error) {
      console.error("Error deleting booking:", error);
      return {
        success: false,
        error: "Failed to delete event",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}

export default function Events({ loaderData }: Route.ComponentProps) {
  const { bookings } = loaderData;

  return (
    <div className="min-w-0 flex-1 flex flex-col">
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">Events</h1>
        </div>
      </header>

      <div className="p-4 min-w-0 flex-1">
        <div className="flex justify-between items-center mb-4">
          <h1>Events</h1>
          <Button asChild>
            <Link to="/dashboard/events/create">Create Event</Link>
          </Button>
        </div>

        <div className="min-w-0">
          <EventsTable bookings={bookings} />
        </div>
      </div>
    </div>
  );
}
