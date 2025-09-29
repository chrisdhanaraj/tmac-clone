# Intake Form API

This feature handles intake form submissions from Google Apps Script.

## Overview

When a user submits the TMAC intake form via Google Forms:

1. Google Apps Script captures the submission
2. Posts the data to `/api/intake/submit`
3. This API validates, transforms, and stores the data
4. Creates or updates User + TennisProfile records

## API Endpoint

### `POST /api/intake/submit`

Creates or updates a user based on intake form submission.

#### Authentication

Requires a Bearer token in the Authorization header:

```
Authorization: Bearer <INTAKE_API_TOKEN>
```

The token must match the `INTAKE_API_TOKEN` environment variable.

#### Request Body

JSON object matching the Google Form field names:

```json
{
  "Timestamp": "1/15/2025 14:23:45",
  "Approved": "TRUE",
  "Gender": "Woman",
  "What is your first name?": "Jane",
  "What is your last name?": "Doe",
  "Email": "jane@example.com",
  "Phone Number (WhatsApp)": "+1234567890",
  "What district do you live in?": "District 3",
  "What's the first piece of TMAC gear we should launch?": "Hat",
  "What size are you?": "M",
  "What song would you add to The Mission Athletic Club playlist?": "Song Name",
  "Why do you wanna join The Mission Athletic Club?": "Reason here",
  "Who referred you?": "Friend's name",
  "Do you play Tennis?": "Yes",
  "What is your Tennis Ranking?": "3.5",
  "Who is your favorite Tennis player?": "Serena Williams",
  "What is your Instagram?": "@username",
  "Email Address": "jane@example.com",
  "Which most closely describes your gender?": "Woman",
  "Age": "26-35",
  "Birth Date": "1/1/1990",
  "Ethnicity": "Asian",
  "Are you okay with us celebrating your birthday in some way?": "Yes"
}
```

#### Response

**Success (200)**:

```json
{
  "success": true,
  "action": "created", // or "updated"
  "userId": "uuid-here"
}
```

**Error (400)**:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Unauthorized (401)**:

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

## Data Processing

The API performs the following transformations:

### Cleaning

- Email: Lowercase, trimmed
- Phone: Strips non-numeric characters except +
- Instagram: Removes @ prefix, truncates to 50 chars
- Text fields: Trimmed, truncated to max length

### Enum Mapping

- **Gender**: Maps text to `Gender` enum
- **Age**: Maps ranges/numbers to `AgeRange` enum
- **Ethnicity**: Maps text to `Ethnicity` enum
- **District**: Maps text to `District` enum (1-11 or Other)
- **Gear Preference**: Maps to `TmacGearPreference` enum
- **Gear Size**: Maps to `GearSize` enum (XXS-XXXL)
- **Tennis Ranking**: Maps decimal values to enum (1.0-7.0)

### Upsert Logic

- Uses email as unique identifier
- If user exists: Updates user info and tennis profile
- If user is new: Creates user + tennis profile
- All operations run in a database transaction

## Environment Variables

Add to your `.env` file:

```bash
INTAKE_API_TOKEN=your-secure-random-token-here
```

Generate a secure token:

```bash
openssl rand -base64 32
```

## Testing

### Using curl

```bash
curl -X POST http://localhost:5173/api/intake/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "Timestamp": "1/15/2025 14:23:45",
    "What is your first name?": "Test",
    "Email": "test@example.com"
  }'
```

### Using the Google Apps Script test function

See `/apps/front-office/scripts/google-apps-script/Code.gs` and run the `testAPIConnection()` function.

## Files

- `api/submit.ts` - Main API route handler
- `validation/intake-schema.ts` - Zod validation schema
- `README.md` - This file

## Related

- Google Apps Script: `/apps/front-office/scripts/google-apps-script/`
- Seed scripts: `/apps/front-office/scripts/seed-intake-form/`
- Prisma schema: `/apps/front-office/prisma/schema.prisma`
