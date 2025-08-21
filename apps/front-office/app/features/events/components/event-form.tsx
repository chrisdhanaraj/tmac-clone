import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { format, getWeek } from "date-fns";
import { CalendarIcon, Lock } from "lucide-react";
import { cn } from "~/utils/utils";
import { TimeField } from "~/components/ui/time-field";
import {
  Time,
  getLocalTimeZone,
  fromDate,
  parseAbsolute,
} from "@internationalized/date";
import { Badge } from "~/components/ui/badge";
import {
  BOOKING_TYPE,
  BOOKING_STATUS,
  bookingTypeOptions,
  bookingStatusOptions,
  createEventFormSchema,
  type CreateEventFormData,
} from "~/features/events/types/event-schemas";

type FormValues = CreateEventFormData;

interface EventFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<FormValues>;
  courtLocations: Array<{
    id: string;
    name: string;
    courts: Array<{
      id: string;
      name: string;
    }>;
  }>;
  users: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
  onSubmit: (values: FormValues) => void;
  isSubmitting?: boolean;
  isLocked?: boolean;
  submitError?: string | null;
  submitSuccess?: boolean;
  submitButtonText?: string;
}

// Helper functions for time handling using @internationalized/date
function formatTimeToISOString(
  time: Time | null | undefined,
  date: Date
): string {
  if (!time) return "";

  // Create ZonedDateTime from Date and local timezone
  const zonedDateTime = fromDate(date, getLocalTimeZone()).set({
    hour: time.hour,
    minute: time.minute,
    second: 0,
    millisecond: 0,
  });

  return zonedDateTime.toAbsoluteString();
}

function parseISOStringToTime(isoString: string): Time | undefined {
  if (!isoString) return undefined;
  try {
    const zonedDateTime = parseAbsolute(isoString, getLocalTimeZone());
    return new Time(zonedDateTime.hour, zonedDateTime.minute);
  } catch {
    return undefined;
  }
}

// Helper function to generate event title using date-fns for week calculation
function generateEventTitle(
  hostId: string,
  type: string,
  date: Date,
  users: Array<{ id: string; firstName: string; lastName: string }>
): string {
  const host = users.find((user) => user.id === hostId);
  const hostName = host ? host.firstName : "";

  const typeLabel =
    bookingTypeOptions.find((option) => option.value === type)?.label || "";

  if (!hostName || !typeLabel) {
    return "";
  }

  // Use date-fns to get week number - much simpler than manual calculation
  const weekNumber = getWeek(date, {
    weekStartsOn: 1, // Monday = 1 (ISO week)
    firstWeekContainsDate: 1, // First week contains Jan 1st
  });

  return `${hostName} Hosts ${typeLabel}: WEEK ${weekNumber}`;
}

export function EventForm({
  mode,
  initialValues,
  courtLocations,
  users,
  onSubmit,
  isSubmitting = false,
  isLocked = false,
  submitError = null,
  submitSuccess = false,
  submitButtonText,
}: EventFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(createEventFormSchema),
    defaultValues: {
      title: initialValues?.title || "",
      type: initialValues?.type || BOOKING_TYPE.first_volleys,
      status: initialValues?.status || BOOKING_STATUS.draft,
      date: initialValues?.date || new Date(),
      bookingTimeStart: initialValues?.bookingTimeStart || "",
      bookingTimeEnd: initialValues?.bookingTimeEnd || "",
      eventTimeStart: initialValues?.eventTimeStart || "",
      eventTimeEnd: initialValues?.eventTimeEnd || "",
      courtLocationId: initialValues?.courtLocationId || "",
      courtIds: initialValues?.courtIds || [],
      hostId: initialValues?.hostId || "",
    },
  });

  // Helper function to update title when relevant fields change
  const updateTitle = () => {
    const hostId = form.getValues("hostId");
    const type = form.getValues("type");
    const date = form.getValues("date");

    if (hostId && type && date) {
      const generatedTitle = generateEventTitle(hostId, type, date, users);
      form.setValue("title", generatedTitle);
    }
  };

  const handleSubmit = (values: FormValues) => {
    // Prevent submission if event is locked
    if (isLocked) {
      return;
    }
    onSubmit(values);
  };

  const selectedLocation = form.watch("courtLocationId");
  const availableCourts = courtLocations.find(
    (location) => location.id === selectedLocation
  )?.courts;

  const defaultSubmitText = mode === "create" ? "Create Event" : "Update Event";
  const submittingText = mode === "create" ? "Creating..." : "Updating...";
  const successText = mode === "create" ? "Created!" : "Updated!";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="relative">
        {/* Form Status Messages */}
        {submitError && (
          <div className="mb-8 p-4 bg-destructive/10 text-destructive rounded-lg">
            <p className="text-sm font-medium">{submitError}</p>
          </div>
        )}

        {submitSuccess && (
          <div className="mb-8 p-4 bg-primary/10 text-primary rounded-lg">
            <p className="text-sm font-medium">
              {mode === "create"
                ? "Event created successfully!"
                : "Event updated successfully!"}
            </p>
          </div>
        )}

        {/* Generated Title Display */}
        {form.watch("title") && (
          <div className="mb-8 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Generated Title:
            </p>
            <p className="text-lg font-semibold text-foreground">
              {form.watch("title")}
            </p>
          </div>
        )}

        {/* Scrollable Content Area with bottom padding for pinned button */}
        <div className="pb-24">
          <div className="space-y-12">
            {/* Event Information Section */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-border pb-12 md:grid-cols-3">
              <div>
                <h2 className="text-base/7 font-semibold text-foreground flex items-center gap-2">
                  Event Information
                  {isLocked && (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </h2>
                <p className="mt-1 text-sm/6 text-muted-foreground">
                  Basic details about the event including host, type, status,
                  and date.
                  {isLocked && " This event is locked and cannot be modified."}
                </p>
              </div>

              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                {/* Host Field */}
                <div className="col-span-full">
                  <FormField
                    control={form.control}
                    name="hostId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm/6 font-medium text-foreground">
                          Host
                        </FormLabel>
                        <div className="mt-2">
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              updateTitle();
                            }}
                            defaultValue={field.value}
                            disabled={isLocked}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  "w-full",
                                  isLocked && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                <SelectValue placeholder="Select host" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.firstName} {user.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Type Field */}
                <div className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm/6 font-medium text-foreground">
                          Booking Type
                        </FormLabel>
                        <div className="mt-2">
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              updateTitle();
                            }}
                            defaultValue={field.value}
                            disabled={isLocked}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  "w-full",
                                  isLocked && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                <SelectValue placeholder="Select booking type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {bookingTypeOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Status Field */}
                <div className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm/6 font-medium text-foreground">
                          Status
                        </FormLabel>
                        <div className="mt-2">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isLocked}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  "w-full",
                                  isLocked && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                <SelectValue placeholder="Select status">
                                  {field.value && (
                                    <Badge
                                      variant={
                                        bookingStatusOptions.find(
                                          (option) =>
                                            option.value === field.value
                                        )?.variant || "default"
                                      }
                                    >
                                      {
                                        bookingStatusOptions.find(
                                          (option) =>
                                            option.value === field.value
                                        )?.label
                                      }
                                    </Badge>
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {bookingStatusOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  <Badge variant={option.variant}>
                                    {option.label}
                                  </Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Date Field */}
                <div className="col-span-full">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm/6 font-medium text-foreground">
                          Date
                        </FormLabel>
                        <div className="mt-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                    isLocked && "opacity-50 cursor-not-allowed"
                                  )}
                                  disabled={isLocked}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  updateTitle();
                                }}
                                disabled={(date) =>
                                  date < new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Booking Times Section */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-border pb-12 md:grid-cols-3">
              <div>
                <h2 className="text-base/7 font-semibold text-foreground flex items-center gap-2">
                  Booking Times
                  {isLocked && (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </h2>
                <p className="mt-1 text-sm/6 text-muted-foreground">
                  The time slots reserved for the booking. This is typically the
                  full court rental period.
                </p>
              </div>

              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 md:col-span-2">
                <FormField
                  control={form.control}
                  name="bookingTimeStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TimeField
                          label="Booking Start Time (PST)"
                          value={parseISOStringToTime(field.value) ?? null}
                          onChange={(val) =>
                            field.onChange(
                              formatTimeToISOString(val, form.watch("date"))
                            )
                          }
                          disabled={isLocked}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bookingTimeEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TimeField
                          label="Booking End Time (PST)"
                          value={parseISOStringToTime(field.value) ?? null}
                          onChange={(val) =>
                            field.onChange(
                              formatTimeToISOString(val, form.watch("date"))
                            )
                          }
                          disabled={isLocked}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Event Times Section */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-border pb-12 md:grid-cols-3">
              <div>
                <h2 className="text-base/7 font-semibold text-foreground flex items-center gap-2">
                  Event Times
                  {isLocked && (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </h2>
                <p className="mt-1 text-sm/6 text-muted-foreground">
                  The actual event time when activities begin and end. This is
                  typically within the booking period.
                </p>
              </div>

              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 md:col-span-2">
                <FormField
                  control={form.control}
                  name="eventTimeStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TimeField
                          label="Event Start Time (PST)"
                          value={parseISOStringToTime(field.value) ?? null}
                          onChange={(val) =>
                            field.onChange(
                              formatTimeToISOString(val, form.watch("date"))
                            )
                          }
                          disabled={isLocked}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventTimeEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TimeField
                          label="Event End Time (PST)"
                          value={parseISOStringToTime(field.value) ?? null}
                          onChange={(val) =>
                            field.onChange(
                              formatTimeToISOString(val, form.watch("date"))
                            )
                          }
                          disabled={isLocked}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Court Selection Section */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 pb-12 md:grid-cols-3">
              <div>
                <h2 className="text-base/7 font-semibold text-foreground flex items-center gap-2">
                  Court Selection
                  {isLocked && (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </h2>
                <p className="mt-1 text-sm/6 text-muted-foreground">
                  Choose the location and specific courts for this event.
                  Multiple courts can be selected.
                </p>
              </div>

              <div className="max-w-2xl space-y-4 md:col-span-2">
                {/* Court Location */}
                <FormField
                  control={form.control}
                  name="courtLocationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm/6 font-medium text-foreground">
                        Court Location
                      </FormLabel>
                      <div className="mt-2">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLocked}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={cn(
                                "w-full",
                                isLocked && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <SelectValue placeholder="Select court location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courtLocations.map((location) => (
                              <SelectItem key={location.id} value={location.id}>
                                {location.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Courts Selection */}
                <FormField
                  control={form.control}
                  name="courtIds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="block text-sm/6 font-medium text-foreground">
                          Courts
                        </FormLabel>
                        <p className="mt-1 text-sm/6 text-muted-foreground">
                          Select which courts to reserve for this event.
                        </p>
                      </div>
                      <div className="space-y-6">
                        {availableCourts?.map((court) => (
                          <FormField
                            key={court.id}
                            control={form.control}
                            name="courtIds"
                            render={({ field }) => {
                              return (
                                <FormItem>
                                  <div className="flex items-center gap-3">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          court.id
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                court.id,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== court.id
                                                )
                                              );
                                        }}
                                        disabled={isLocked}
                                        className={cn(isLocked && "opacity-50")}
                                      />
                                    </FormControl>
                                    <FormLabel
                                      className={cn(
                                        "text-sm font-medium text-foreground cursor-pointer",
                                        isLocked &&
                                          "opacity-50 cursor-not-allowed"
                                      )}
                                    >
                                      {court.name}
                                    </FormLabel>
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t shadow-[0_-4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.3)] z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="text-xs text-muted-foreground">
                Scroll up to see more fields
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || submitSuccess || isLocked}
                className={cn(
                  "min-w-[140px] shadow-lg",
                  isLocked && "bg-muted hover:bg-muted"
                )}
              >
                {isLocked && (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Event Locked
                  </>
                )}
                {!isLocked && isSubmitting && submittingText}
                {!isLocked && submitSuccess && successText}
                {!isLocked && submitError && "Try Again"}
                {!isLocked &&
                  !isSubmitting &&
                  !submitSuccess &&
                  !submitError &&
                  (submitButtonText || defaultSubmitText)}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
