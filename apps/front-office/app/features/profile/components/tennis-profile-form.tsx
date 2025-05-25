import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useFetcher } from "react-router";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Calendar, Save } from "lucide-react";
import {
  tennisProfileSchema,
  type TennisProfileSchemaType,
} from "~/features/profile/utils/tennis-profile";
import {
  District,
  TmacGearPreference,
  type TennisProfile,
  GenderLabels,
  AgeRangeLabels,
  EthnicityLabels,
  DistrictLabels,
  TmacGearPreferenceLabels,
  GearSizeLabels,
  TennisRankingLabels,
} from "~/features/profile/types/tennis-profile";

interface TennisProfileFormProps {
  profile?: TennisProfile | null;
  completionStatus: {
    completionPercentage: number;
    completedFields: number;
    totalFields: number;
  };
}

export function TennisProfileForm({
  profile,
  completionStatus,
}: TennisProfileFormProps) {
  const fetcher = useFetcher();

  // Initialize form with existing profile data
  const form = useForm<TennisProfileSchemaType>({
    resolver: zodResolver(tennisProfileSchema),
    defaultValues: {
      gender: profile?.gender || undefined,
      ageRange: profile?.ageRange || undefined,
      ethnicity: profile?.ethnicity || undefined,
      birthDate: profile?.birthDate
        ? new Date(profile.birthDate).toISOString().split("T")[0]
        : undefined,
      instagramHandle: profile?.instagramHandle || undefined,
      district: profile?.district || undefined,
      districtOther: profile?.districtOther || undefined,
      tmacGearPreference: profile?.tmacGearPreference || undefined,
      tmacGearOther: profile?.tmacGearOther || undefined,
      gearSize: profile?.gearSize || undefined,
      playlistSong: profile?.playlistSong || undefined,
      whyJoinTmac: profile?.whyJoinTmac || undefined,
      referredBy: profile?.referredBy || undefined,
      tennisRanking: profile?.tennisRanking || undefined,
      favoriteTennisPlayer: profile?.favoriteTennisPlayer || undefined,
    },
  });

  // Auto-save functionality with debouncing
  const watchedValues = form.watch();

  useEffect(() => {
    const subscription = form.watch((data) => {
      // Debounce auto-save to avoid excessive API calls
      const timeoutId = setTimeout(() => {
        if (form.formState.isDirty) {
          fetcher.submit(data, {
            method: "post",
            encType: "application/json",
          });
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    });

    return () => subscription.unsubscribe();
  }, [form, fetcher]);

  // Show auto-save status
  const isAutoSaving = fetcher.state === "submitting";
  const showDistrictOther = form.watch("district") === District.Other;
  const showGearOther =
    form.watch("tmacGearPreference") === TmacGearPreference.Other;

  return (
    <div className="space-y-8">
      {/* Auto-save indicator */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-3">
          <Save
            className={`h-5 w-5 ${
              isAutoSaving ? "animate-spin text-blue-500" : "text-green-500"
            }`}
          />
          <div>
            <p className="text-sm font-medium">
              {isAutoSaving ? "Saving changes..." : "All changes saved"}
            </p>
            <p className="text-xs text-muted-foreground">
              Your profile updates automatically
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-medium">
            {completionStatus.completedFields}/{completionStatus.totalFields}{" "}
            Fields
          </Badge>
          <Badge
            variant={
              completionStatus.completionPercentage === 100
                ? "default"
                : "secondary"
            }
            className="font-medium"
          >
            {completionStatus.completionPercentage}% Complete
          </Badge>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-8">
          {/* Personal Information Section */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-3">
                    Personal Information
                    <Badge variant="secondary" className="text-xs font-medium">
                      Private & Secure
                    </Badge>
                  </CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This information is kept private and used only for community
                    demographics and age verification.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Gender
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(GenderLabels).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ageRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Age Range
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select age range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(AgeRangeLabels).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ethnicity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Ethnicity
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select ethnicity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(EthnicityLabels).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Birth Date
                      </FormLabel>
                      <FormControl>
                        <Input type="date" className="w-full" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Optional - used for age verification only
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tennis Information Section */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-3">
                    Tennis Information
                    <Badge variant="outline" className="text-xs font-medium">
                      Community Visible
                    </Badge>
                  </CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Help others understand your tennis background and playing
                    level.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="tennisRanking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Tennis Ranking (NTRP)
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select your tennis ranking" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(TennisRankingLabels).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        Your NTRP (National Tennis Rating Program) level helps
                        match you with players
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="favoriteTennisPlayer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Favorite Tennis Player
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Serena Williams, Rafael Nadal"
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Who inspires your game and style of play?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Community Information Section */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  Community Information
                </CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Connect with other TMAC members and help us understand your
                  story.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="instagramHandle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Instagram Handle
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="@yourhandle or yourhandle"
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Connect with the TMAC community on social media
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        District
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select your district" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(DistrictLabels).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        SF district or select 'Other' for Bay Area locations
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {showDistrictOther && (
                <div className="mt-6">
                  <FormField
                    control={form.control}
                    name="districtOther"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          District Location
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Oakland, Berkeley, South Bay"
                            className="w-full"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Please specify your city or area in the Bay Area
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="space-y-8">
                <FormField
                  control={form.control}
                  name="whyJoinTmac"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Why do you want to join TMAC?
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us what brought you to The Mission Athletic Club..."
                          className="min-h-[120px] w-full resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Share your tennis journey and what you're looking for in
                        our community
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="referredBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Who referred you?
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Name or how you found us"
                            className="w-full"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Help us track how people discover TMAC
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="playlistSong"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Playlist Song Suggestion
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Artist - Song Title"
                            className="w-full"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Add your favorite song to our community playlist
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  Gear Preferences
                </CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Help us prioritize which TMAC merchandise to launch first.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="tmacGearPreference"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2 lg:col-span-1">
                      <FormLabel className="text-sm font-medium text-foreground">
                        First TMAC Gear to Launch
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select gear type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(TmacGearPreferenceLabels).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        What type of TMAC merchandise would you most want to
                        buy?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gearSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Your Size
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(GearSizeLabels).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        Size for the gear type selected above
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {showGearOther && (
                <div className="mt-6">
                  <FormField
                    control={form.control}
                    name="tmacGearOther"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Other Gear Suggestion
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Sweatshirt, Water Bottle, Tennis Bag"
                            className="w-full"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Suggest any other TMAC merchandise you'd be interested
                          in
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
