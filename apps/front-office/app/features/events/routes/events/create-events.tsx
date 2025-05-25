import { SidebarTrigger } from "~/components/ui/sidebar";
import type { Route } from "./+types/create-events";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import prisma from "~/lib/prisma";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Link, useNavigate } from "react-router";
import { EventForm } from "~/features/events/components/event-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { createEventApiSchema } from "../../types/event-schemas";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create New Event" },
    { name: "description", content: "Create a new event booking" },
  ];
}

export async function loader({}: LoaderFunctionArgs) {
  // Fetch reference data needed for the create form
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
    courtLocations,
    users,
  };
}

export async function action({ request }: ActionFunctionArgs) {
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

    // Create booking with courts in a transaction
    const result = await prisma.booking.create({
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
          connect: validatedData.courtIds.map((id) => ({ id })),
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
    console.error("Error creating booking:", error);

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
      error: "Failed to create event",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export default function CreateEventPage({ loaderData }: Route.ComponentProps) {
  const { courtLocations, users } = loaderData || {
    courtLocations: [],
    users: [],
  };
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const [submitState, setSubmitState] = useState<{
    status: SubmitStatus;
    error: string | null;
  }>({
    status: "idle",
    error: null,
  });

  // Handle fetcher state changes
  useEffect(() => {
    if (fetcher.state === "submitting") {
      setSubmitState({ status: "submitting", error: null });
    } else if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success) {
        setSubmitState({ status: "success", error: null });
        // Navigate back to events list after successful creation
        setTimeout(() => {
          navigate("/dashboard/events");
        }, 1500); // Give user time to see success message
      } else {
        const errorMessage = fetcher.data.error || "Failed to create event";
        setSubmitState({ status: "error", error: errorMessage });
      }
    } else if (fetcher.state === "idle") {
      setSubmitState((prev) => ({ ...prev, status: "idle" }));
    }
  }, [fetcher.state, fetcher.data, navigate]);

  const handleSubmit = (values: any) => {
    // Clear any previous submit state
    setSubmitState({
      status: "idle",
      error: null,
    });

    // Submit JSON data using fetcher
    fetcher.submit(
      {
        ...values,
        date: values.date.toISOString(),
      },
      {
        method: "post",
        encType: "application/json",
      }
    );
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
            <span className="text-foreground font-medium">Create</span>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Page header with title - Fixed at top */}
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

              <h1 className="text-2xl font-bold">Create New Event</h1>
            </div>
          </div>
        </div>

        {/* Create Event Form - Takes remaining height */}
        <div className="flex-1 min-h-0 p-4">
          <EventForm
            mode="create"
            courtLocations={courtLocations}
            users={users}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitError={error}
            submitSuccess={hasSuccess}
          />
        </div>
      </div>
    </div>
  );
}
