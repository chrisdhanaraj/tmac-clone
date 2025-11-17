import { z } from "zod";

export const MatchStatusSchema = z.enum(["open", "matched", "completed"]);

export const MatchRequestPayloadSchema = z.object({
  discordUserId: z.string(),
  location: z.string(),
  channelId: z.string().optional(),
});

export type MatchRequestPayload = z.infer<typeof MatchRequestPayloadSchema>;

export const MatchRequestResponseSchema = z.object({
  id: z.string(),
  discordUserId: z.string(),
  location: z.string(),
  status: MatchStatusSchema,
  createdAt: z.coerce.date(),
  channelId: z.string().optional(),
});

export type MatchRequestResponse = z.infer<typeof MatchRequestResponseSchema>;

export const WelcomeRequestPayloadSchema = z.object({
  discordUserId: z.string(),
});

export type WelcomeRequestPayload = z.infer<typeof WelcomeRequestPayloadSchema>;

export const WelcomeResponseSchema = z.object({
  message: z.string(),
});

export type WelcomeResponse = z.infer<typeof WelcomeResponseSchema>;
