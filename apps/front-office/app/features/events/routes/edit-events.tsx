import { SidebarTrigger } from "~/components/ui/sidebar";
import type { Route } from "./+types/edit-events";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, Lock, AlertTriangle } from "lucide-react";
import prisma from "~/lib/prisma";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Link, useNavigate } from "react-router";
import { EventForm } from "~/features/events/components/event-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import {
  createEventApiSchema,
  type CreateEventFormData,
} from "~/features/events/types/event-schemas";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Edit Event - ${params.id}` },
    { name: "description", content: "Edit an existing event" },
  ];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  if (!id) {
    throw new Response("Event ID is required", { status: 400 });
  }

  // Fetch the specific booking/event with all related data
  const booking = await prisma.booking.findUnique({
    where: { id: id },
    include: {
      host: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      courtLocation: {
        select: {
          id: true,
          name: true,
        },
      },
      courts: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!booking) {
    throw new Response("Event not found", { status: 404 });
  }

  // Fetch reference data needed for the edit form
  const [courtLocations, users] = await Promise.all([
    prisma.courtLocation.findMany({
      include: {
        courts: {
          orderBy: {
            name: "asc",
          },
        },
      },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    }),
  ]);

  return {
    booking,
    courtLocations,
    users,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;

  if (!id) {
    return {
      success: false,
      error: "Event ID is required",
    };
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Parse JSON directly from request body
    const parsedData = await request.json();
    const validatedData = createEventApiSchema.parse(parsedData);

    // First, check if the booking exists and if it's locked
    const existingBooking = await prisma.booking.findUnique({
      where: { id: id },
      select: {
        id: true,
        status: true,
        title: true,
      },
    });

    if (!existingBooking) {
      return {
        success: false,
        error: "Event not found",
      };
    }

    // Prevent editing locked events
    if (
      existingBooking.status === "ready" ||
      existingBooking.status === "complete"
    ) {
      return {
        success: false,
        error: `Cannot edit event with status "${existingBooking.status}". Only draft events can be edited.`,
      };
    }

    // Update booking with courts in a transaction
    const result = await prisma.booking.update({
      where: { id: id },
      data: {
        title: validatedData.title,
        type: validatedData.type,
        status: validatedData.status,
        date: validatedData.date,
        bookingTimeStart: new Date(validatedData.bookingTimeStart),
        bookingTimeEnd: new Date(validatedData.bookingTimeEnd),
        eventTimeStart: new Date(validatedData.eventTimeStart),
        eventTimeEnd: new Date(validatedData.eventTimeEnd),
        hostId: validatedData.hostId,
        courtLocationId: validatedData.courtLocationId,
        courts: {
          set: [], // Clear existing courts first
          connect: validatedData.courtIds.map((id) => ({ id })), // Then connect new ones
        },
      },
      include: {
        courts: true,
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
    });

    return { success: true, booking: result };
  } catch (error) {
    console.error("Error updating booking:", error);

    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors);
      return {
        success: false,
        error: "Validation failed",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Failed to update event",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export default function EditEventPage({ loaderData }: Route.ComponentProps) {
  const { booking, courtLocations, users } = loaderData;
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const [submitState, setSubmitState] = useState<{
    status: SubmitStatus;
    error: string | null;
  }>({
    status: "idle",
    error: null,
  });

  // Determine if the event is locked (cannot be edited)
  const isEventLocked =
    booking.status === "ready" || booking.status === "complete";

  // Handle fetcher state changes
  useEffect(() => {
    if (fetcher.state === "submitting") {
      setSubmitState({ status: "submitting", error: null });
    } else if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success) {
        setSubmitState({ status: "success", error: null });
        // Navigate back to events list after successful update
        setTimeout(() => {
          navigate("/dashboard/events");
        }, 1500); // Give user time to see success message
      } else {
        const errorMessage = fetcher.data.error || "Failed to update event";
        setSubmitState({ status: "error", error: errorMessage });
      }
    } else if (fetcher.state === "idle") {
      setSubmitState((prev) => ({ ...prev, status: "idle" }));
    }
  }, [fetcher.state, fetcher.data, navigate]);

  const handleSubmit = (values: CreateEventFormData) => {
    // Prevent submission if event is locked
    if (isEventLocked) {
      return;
    }

    // Clear any previous submit state
    setSubmitState({
      status: "idle",
      error: null,
    });

    // Submit JSON data using fetcher to the same route (edit action)
    fetcher.submit(
      {
        ...values,
        date: values.date.toISOString(),
      },
      {
        method: "post", // React Router uses POST for actions, the action will handle the update
        encType: "application/json",
      }
    );
  };

  // Get status badge variant based on booking status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "ready":
        return "default";
      case "complete":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const { status, error } = submitState;
  const isSubmitting = status === "submitting";
  const hasError = status === "error";
  const hasSuccess = status === "success";

  return (
    <div className="flex flex-col max-w-[800px]">
      {/* Header */}
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />

          {/* Breadcrumb navigation */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/dashboard/events" className="hover:text-foreground">
              Events
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{booking.title}</span>
            <span>/</span>
            <span className="text-foreground font-medium">Edit</span>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Page header with title and status - Fixed at top */}
        <div className="flex-shrink-0 p-4 bg-background border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard/events")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Events
              </Button>

              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Edit Event</h1>

                {/* Event status badge */}
                <Badge variant={getStatusVariant(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() +
                    booking.status.slice(1)}
                </Badge>

                {/* Lock indicator */}
                {isEventLocked && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm">Locked</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lock warning */}
          {isEventLocked && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <p className="text-amber-700">
                  This event is locked and cannot be edited because its status
                  is "{booking.status}". Only events with "draft" status can be
                  modified.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Edit Event Form - Takes remaining height */}
        <div className="flex-1 min-h-0 p-4">
          <EventForm
            mode="edit"
            initialValues={{
              title: booking.title,
              type: booking.type as any,
              status: booking.status as any,
              date: new Date(booking.date),
              bookingTimeStart: booking.bookingTimeStart.toISOString(),
              bookingTimeEnd: booking.bookingTimeEnd.toISOString(),
              eventTimeStart: booking.eventTimeStart.toISOString(),
              eventTimeEnd: booking.eventTimeEnd.toISOString(),
              courtLocationId: booking.courtLocationId,
              courtIds: booking.courts.map((court) => court.id),
              hostId: booking.hostId,
            }}
            courtLocations={courtLocations}
            users={users}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isLocked={isEventLocked}
            submitError={error}
            submitSuccess={hasSuccess}
          />
        </div>
      </div>
    </div>
  );
}
