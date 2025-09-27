import * as z from "zod";
import { bookingType, bookingStatus } from "~/generated/prisma/enums";

// Shared booking type and status options for UI
export const bookingTypeOptions = [
  { value: bookingType.first_volleys, label: "First Volleys" },
  { value: bookingType.volley_and_vibes, label: "Volley and Vibes" },
  { value: bookingType.vibras_and_voleas, label: "Vibras and Voleas" },
  { value: bookingType.feeder_session, label: "Feeder Session" },
  { value: bookingType.tempo, label: "Tempo" },
  { value: bookingType.starters, label: "Starters" },
  { value: bookingType.flow, label: "Flow" },
] as const;

export const bookingStatusOptions = [
  {
    value: bookingStatus.draft,
    label: "Draft",
    variant: "secondary" as const,
  },
  { value: bookingStatus.ready, label: "Ready", variant: "default" as const },
  {
    value: bookingStatus.complete,
    label: "Complete",
    variant: "outline" as const,
  },
  {
    value: bookingStatus.cancelled,
    label: "Cancelled",
    variant: "destructive" as const,
  },
] as const;

// Base schema with shared validation logic
const baseEventSchema = z.object({
  title: z.string(),
  type: z.nativeEnum(bookingType),
  status: z.nativeEnum(bookingStatus),
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
