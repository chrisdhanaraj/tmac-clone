import { z } from "zod";

/**
 * Schema for intake form submission from Google Apps Script
 * Matches the Google Form field names exactly
 */
export const IntakeFormSubmissionSchema = z.object({
  Timestamp: z.string(),
  Approved: z.string().optional(),
  Gender: z.string().optional(),
  "What is your first name?": z.string(),
  "What is your last name?": z.string().optional(),
  Email: z.string().email(),
  "Phone Number (WhatsApp)": z.string().optional(),
  "What district do you live in?": z.string().optional(),
  "What's the first piece of TMAC gear we should launch?": z
    .string()
    .optional(),
  "What size are you?": z.string().optional(),
  "What song would you add to The Mission Athletic Club playlist?": z
    .string()
    .optional(),
  "Why do you wanna join The Mission Athletic Club?": z.string().optional(),
  "Who referred you?": z.string().optional(),
  "Do you play Tennis?": z.string().optional(),
  "What is your Tennis Ranking?": z.string().optional(),
  "Who is your favorite Tennis player?": z.string().optional(),
  "What is your Instagram?": z.string().optional(),
  "Email Address": z.string().optional(),
  "Which most closely describes your gender?": z.string().optional(),
  Age: z.string().optional(),
  "Birth Date": z.string().optional(),
  Ethnicity: z.string().optional(),
  "Are you okay with us celebrating your birthday in some way?": z
    .string()
    .optional(),
});

export type IntakeFormSubmission = z.infer<typeof IntakeFormSubmissionSchema>;
