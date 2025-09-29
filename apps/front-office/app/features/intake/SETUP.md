# Intake Form API - Setup Guide

## Overview

This guide walks you through setting up the Google Apps Script integration for automatic user creation from intake form submissions.

## Prerequisites

- Backend API deployed and running
- Google Sheet connected to Google Form
- Database access

## Step 1: Database Migration

The intake API requires email to be unique in the database.

### Apply the migration:

```bash
cd apps/front-office
npx prisma migrate dev --name add_unique_email_constraint
```

This will:

- Add `@unique` constraint to the email field
- Regenerate Prisma types
- Update the database schema

## Step 2: Environment Variables

Add to your `.env` file:

```bash
# Generate a secure token
INTAKE_API_TOKEN=$(openssl rand -base64 32)
```

Or manually:

```bash
# apps/front-office/.env
INTAKE_API_TOKEN=your-secure-random-token-here
```

## Step 3: Deploy Backend

Deploy the updated code to your server:

```bash
# Build and deploy
npm run build
# Deploy via your preferred method
```

## Step 4: Configure Google Apps Script

1. Open your Google Sheet (the one receiving form submissions)
2. Click **Extensions** → **Apps Script**
3. Delete any existing code
4. Copy the code from `/scripts/google-apps-script/Code.gs`
5. Update configuration:

```javascript
const API_URL = "https://your-production-domain.com/api/intake/submit";
const API_TOKEN = "paste-your-INTAKE_API_TOKEN-here";
```

## Step 5: Create Trigger

1. In Apps Script, click the clock icon (⏰) → **Triggers**
2. Click **+ Add Trigger**
3. Configure:
   - Function: `onFormSubmit`
   - Deployment: Head
   - Event source: **From spreadsheet**
   - Event type: **On form submit**
4. Click **Save**
5. Authorize the script when prompted

## Step 6: Test the Integration

### Option 1: Use the test function

1. In Apps Script editor, select `testAPIConnection` from function dropdown
2. Click **Run**
3. Check **View** → **Logs** for results

### Option 2: Submit a real form

1. Submit a test form
2. Check Apps Script execution logs: **View** → **Executions**
3. Verify user created in database
4. Check backend API logs

## Verification Checklist

- [ ] Migration applied successfully
- [ ] INTAKE_API_TOKEN set in environment
- [ ] Backend deployed with new code
- [ ] Google Apps Script installed
- [ ] Trigger created and active
- [ ] Test submission successful
- [ ] User created in database

## Troubleshooting

### 401 Unauthorized

- Verify `API_TOKEN` in Apps Script matches `INTAKE_API_TOKEN` in backend

### 404 Not Found

- Check `API_URL` is correct
- Ensure route is deployed: `POST /api/intake/submit`

### Prisma Error: email not unique

- Run the migration: `npx prisma migrate dev --name add_unique_email_constraint`
- Regenerate client: `npx prisma generate`

### Duplicate Users

- Email should now be unique - duplicates will update existing users
- Check for typos in email addresses

## Monitoring

- **Apps Script Logs**: Extensions → Apps Script → View → Executions
- **Backend Logs**: Check your server logs for API requests
- **Database**: Query users table to verify data

## Next Steps

Once verified, the integration will:

- Automatically process all new form submissions
- Create/update users in real-time
- Continue working alongside existing seed scripts
- Provide audit trail via Apps Script execution logs
