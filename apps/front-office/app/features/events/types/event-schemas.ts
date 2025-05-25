import * as z from "zod";

// Shared constants for booking types and statuses
export const BOOKING_TYPE = {
  first_volleys: "first_volleys",
  volley_and_vibes: "volley_and_vibes",
  vibras_and_voleas: "vibras_and_voleas",
  feeder_session: "feeder_session",
  tempo: "tempo",
  starters: "starters",
  flow: "flow",
} as const;

export const BOOKING_STATUS = {
  draft: "draft",
  ready: "ready",
  complete: "complete",
  cancelled: "cancelled",
} as const;

// Type definitions derived from constants
export type BookingType = (typeof BOOKING_TYPE)[keyof typeof BOOKING_TYPE];
export type BookingStatus =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

// Shared booking type and status options for UI
export const bookingTypeOptions = [
  { value: BOOKING_TYPE.first_volleys, label: "First Volleys" },
  { value: BOOKING_TYPE.volley_and_vibes, label: "Volley and Vibes" },
  { value: BOOKING_TYPE.vibras_and_voleas, label: "Vibras and Voleas" },
  { value: BOOKING_TYPE.feeder_session, label: "Feeder Session" },
  { value: BOOKING_TYPE.tempo, label: "Tempo" },
  { value: BOOKING_TYPE.starters, label: "Starters" },
  { value: BOOKING_TYPE.flow, label: "Flow" },
] as const;

export const bookingStatusOptions = [
  {
    value: BOOKING_STATUS.draft,
    label: "Draft",
    variant: "secondary" as const,
  },
  { value: BOOKING_STATUS.ready, label: "Ready", variant: "default" as const },
  {
    value: BOOKING_STATUS.complete,
    label: "Complete",
    variant: "outline" as const,
  },
  {
    value: BOOKING_STATUS.cancelled,
    label: "Cancelled",
    variant: "destructive" as const,
  },
] as const;

// Base schema with shared validation logic
const baseEventSchema = z.object({
  title: z.string(),
  type: z.enum([
    BOOKING_TYPE.first_volleys,
    BOOKING_TYPE.volley_and_vibes,
    BOOKING_TYPE.vibras_and_voleas,
    BOOKING_TYPE.feeder_session,
    BOOKING_TYPE.tempo,
    BOOKING_TYPE.starters,
    BOOKING_TYPE.flow,
  ]),
  status: z.enum([
    BOOKING_STATUS.draft,
    BOOKING_STATUS.ready,
    BOOKING_STATUS.complete,
    BOOKING_STATUS.cancelled,
  ]),
  bookingTimeStart: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid time"),
  bookingTimeEnd: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid time"),
  eventTimeStart: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid time"),
  eventTimeEnd: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid time"),
  courtLocationId: z.string(),
  courtIds: z.array(z.string()),
  hostId: z.string().min(1, "Host is required"),
});

// Form schema for client-side validation (expects Date objects)
export const createEventFormSchema = baseEventSchema.extend({
  date: z.date(),
});

// API schema for server-side validation (expects ISO strings)
export const createEventApiSchema = baseEventSchema.extend({
  date: z.string().transform((str) => new Date(str)),
});

// Type definitions
export type CreateEventFormData = z.infer<typeof createEventFormSchema>;
export type CreateEventApiData = z.infer<typeof createEventApiSchema>;
