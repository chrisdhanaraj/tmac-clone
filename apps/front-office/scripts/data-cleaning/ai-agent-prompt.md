# AI Agent Prompt: Tennis Roster Data Cleaning

## Objective

You are a data cleaning specialist. Your task is to clean and validate tennis roster data from a CSV file to match the TennisProfile database schema. You will receive a raw CSV file and must produce a cleaned CSV file plus a comprehensive validation report.

## Input

- Raw CSV file with tennis roster data (approximately 1000 records)
- TennisProfile database schema requirements (provided below)

## Output Required

1. **Cleaned CSV file** - Schema-compliant data ready for database import
   - Column headers must exactly match the TennisProfile field names
   - Records will be imported as guest profiles (userId = null)
   - Email/phone used for future user linking during registration
2. **JSON Validation Report** - Comprehensive documentation of all actions taken

---

## TennisProfile Schema Structure

### Required Fields for Matching

- **At least ONE of the following must be present and valid:**
  - `email` (string) - Valid email format, normalized to lowercase
  - `phone` (string) - Valid phone number, normalized to +1XXXXXXXXXX format

### Optional Fields

#### Demographics

- `gender` (enum): Woman, Man, NonBinary, Agender, PreferNotToState, Other
- `ageRange` (enum): EIGHTEEN_TO_TWENTY_FIVE, TWENTY_SIX_TO_THIRTY_FIVE, THIRTY_SIX_TO_FORTY_FIVE, FORTY_SIX_TO_FIFTY_FIVE, FIFTY_FIVE_PLUS, PreferNotToState
- `ethnicity` (enum): AmericanIndianOrAlaskaNative, PacificIslander, BlackOrAfricanAmerican, White, Arab, Asian, HispanicOrLatinx, MixedRace, Other
- `birthDate` (date) - ISO format YYYY-MM-DD

#### Location

- `district` (enum): District1, District2, District3, District4, District5, District6, District7, District8, District9, District10, District11, Other
- `districtOther` (string, max 100 chars) - For non-SF locations

#### Tennis & Preferences

- `tennisRanking` (enum): ONE_ZERO (1.0), ONE_FIVE (1.5), TWO_ZERO (2.0), TWO_FIVE (2.5), THREE_ZERO (3.0), THREE_FIVE (3.5), FOUR_ZERO (4.0), FOUR_FIVE (4.5), FIVE_ZERO (5.0), FIVE_FIVE (5.5), SIX_ZERO (6.0), SIX_FIVE (6.5), SEVEN_ZERO (7.0)
- `favoriteTennisPlayer` (string, max 100 chars)

#### TMAC Gear

- `tmacGearPreference` (enum): Hat, Socks, Shirt, Other
- `tmacGearOther` (string, max 100 chars)
- `gearSize` (enum): XXS, XS, S, M, L, XL, XXL, XXXL

#### Personal

- `instagramHandle` (string, max 50 chars) - Clean format without @ or URLs
- `playlistSong` (string, max 200 chars)
- `whyJoinTmac` (string, max 500 chars)
- `referredBy` (string, max 100 chars)

#### System Fields (Auto-Generated)

- `id` - Generate UUID for each record
- `userId` - Set to null (will be linked during profile claiming)
- `createdAt` - Current timestamp
- `updatedAt` - Current timestamp

---

## Exact Prisma Schema Reference

**IMPORTANT**: The output CSV must exactly match this Prisma schema structure. Note that for import purposes, we need to add `email` and `phone` fields temporarily (they will be removed after profile claiming is complete).

```prisma
enum Gender {
  Woman
  Man
  NonBinary
  Agender
  PreferNotToState
  Other
}

enum AgeRange {
  EIGHTEEN_TO_TWENTY_FIVE
  TWENTY_SIX_TO_THIRTY_FIVE
  THIRTY_SIX_TO_FORTY_FIVE
  FORTY_SIX_TO_FIFTY_FIVE
  FIFTY_FIVE_PLUS
  PreferNotToState
}

enum Ethnicity {
  AmericanIndianOrAlaskaNative
  PacificIslander
  BlackOrAfricanAmerican
  White
  Arab
  Asian
  HispanicOrLatinx
  MixedRace
  Other
}

enum District {
  District1
  District2
  District3
  District4
  District5
  District6
  District7
  District8
  District9
  District10
  District11
  Other
}

enum TmacGearPreference {
  Hat
  Socks
  Shirt
  Other
}

enum GearSize {
  XXS
  XS
  S
  M
  L
  XL
  XXL
  XXXL
}

enum TennisRanking {
  ONE_ZERO
  ONE_FIVE
  TWO_ZERO
  TWO_FIVE
  THREE_ZERO
  THREE_FIVE
  FOUR_ZERO
  FOUR_FIVE
  FIVE_ZERO
  FIVE_FIVE
  SIX_ZERO
  SIX_FIVE
  SEVEN_ZERO
}

model TennisProfile {
  id                   String              @id @default(uuid())
  userId               String?             @unique  // Nullable for guest profiles
  user                 user?               @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Contact info - authoritative when userId is null, backup when userId is present
  email                String?             // For guest profiles and matching
  phone                String?             // For guest profiles and matching
  gender               Gender?
  ageRange             AgeRange?
  ethnicity            Ethnicity?
  birthDate            DateTime?
  instagramHandle      String?             @db.VarChar(50)
  district             District?
  districtOther        String?             @db.VarChar(100)
  tmacGearPreference   TmacGearPreference?
  tmacGearOther        String?             @db.VarChar(100)
  gearSize             GearSize?
  playlistSong         String?             @db.VarChar(200)
  whyJoinTmac          String?             @db.VarChar(500)
  referredBy           String?             @db.VarChar(100)
  tennisRanking        TennisRanking?
  favoriteTennisPlayer String?             @db.VarChar(100)
  createdAt            DateTime            @default(now())
  updatedAt            DateTime            @updatedAt
  lastReminderAt       DateTime?
}
```

### Schema Field Constraints

- `instagramHandle`: Max 50 characters
- `districtOther`: Max 100 characters
- `tmacGearOther`: Max 100 characters
- `playlistSong`: Max 200 characters
- `whyJoinTmac`: Max 500 characters
- `referredBy`: Max 100 characters
- `favoriteTennisPlayer`: Max 100 characters

### Critical Notes

1. **userId**: Must be `null` for imported guest profiles (will be linked during user registration)
2. **email/phone**: At least one must be present for profile matching - these support the guest-to-registered user flow
3. **Enum values**: Must exactly match the enum definitions above
4. **UUIDs**: Generate valid UUIDs for `id` field
5. **Timestamps**: Use current timestamp for `createdAt` and `updatedAt`

### ✅ Schema Model: Guest-to-Registered User Flow

The TennisProfile model supports both **guest profiles** (before registration) and **linked profiles** (after registration):

- **Guest State**: `userId` is `null`, contact info in `TennisProfile.email/phone`
- **Registered State**: `userId` is set, user's contact info in `user.email/phone` becomes authoritative

**Data Hierarchy**:

- If `userId` is `null`: Use `TennisProfile.email/phone`
- If `userId` is present: Use `user.email/phone` as source of truth

---

## Data Cleaning Rules

### 1. Phone Number Normalization

- Remove all formatting: spaces, dashes, parentheses, dots
- Remove leading +1 or 1 for US numbers
- Must result in exactly 10 digits
- **Output format: +1XXXXXXXXXX**
- Examples:
  - "(555) 123-4567" → "+15551234567"
  - "555.123.4567" → "+15551234567"
  - "15551234567" → "+15551234567"

### 2. Email Normalization

- Convert to lowercase
- Trim whitespace
- Validate basic email format (contains @ and domain)

### 3. Enum Value Mapping

#### Gender Mapping

- "Woman", "Female", "F", "w" → Woman
- "Man", "Male", "M", "m" → Man
- "Non-binary", "nb", "NB" → NonBinary
- "decline", "prefer not to state" → PreferNotToState
- Any other value → Other

#### Age Range Mapping

- Numeric ages: 18-25 → EIGHTEEN_TO_TWENTY_FIVE, 26-35 → TWENTY_SIX_TO_THIRTY_FIVE, etc.
- Text: "18-25", "26-35", etc. → corresponding enum
- "55+" → FIFTY_FIVE_PLUS

#### District Mapping

- "District 1", "1", "district 1" → District1
- "District 2", "2", "district 2" → District2
- ... (continue for districts 1-11)
- Non-SF locations (Oakland, San Jose, etc.) → Other

#### Tennis Ranking Mapping

- "1", "1.0" → ONE_ZERO
- "2.5" → TWO_FIVE
- "3.5" → THREE_FIVE
- etc.

#### Gear Preference Mapping

- "Hat", "hats" → Hat
- "Socks", "sock" → Socks
- "Shirt", "t-shirt" → Shirt
- Everything else → Other

### 4. Text Field Cleaning

- Trim whitespace
- Apply length limits (truncate if necessary)
- Instagram handles: Remove @ symbol and Instagram URLs
- Set empty strings to null

### 5. Date Formatting

- Parse various date formats
- Output as ISO format: YYYY-MM-DD
- Validate reasonable birth dates (1900-current year)

---

## Duplicate Detection Rules

### Exact Duplicates

- **Same email AND same phone** = Exact duplicate
- **Same email OR same phone (but consistent data)** = Exact duplicate
- **Resolution**: Keep the record with the most complete data

### Partial Matches (Flag for Manual Review)

- **Same email but different phone** = Partial match
- **Same phone but different email** = Partial match
- **Action**: Do NOT import these records, add to validation report

### Duplicate Resolution Strategy

1. Group records by matching email/phone
2. Within each group, select the record with most complete data
3. Count non-null fields to determine "completeness score"
4. Bonus points for having both email AND phone

---

## Column Mapping Guide

Based on the CSV structure, map these columns:

| CSV Column                                | Schema Field         |
| ----------------------------------------- | -------------------- |
| Email, Email Address                      | email                |
| Phone Number                              | phone                |
| Which most closely describes your gender? | gender               |
| Age                                       | ageRange             |
| Ethnicity                                 | ethnicity            |
| Birth Date                                | birthDate            |
| District                                  | district             |
| Swag                                      | tmacGearPreference   |
| Size                                      | gearSize             |
| What is your Tennis Ranking?              | tennisRanking        |
| Favorite Player                           | favoriteTennisPlayer |
| Instagram                                 | instagramHandle      |
| TMAC Playlist                             | playlistSong         |
| Why Join                                  | whyJoinTmac          |
| Referral                                  | referredBy           |

### Columns to IGNORE

- Timestamp
- Approved
- Active Games
- WhatsApp
- Do you Boulder?
- What is your highest V?
- Do you run?
- How my miles do you average a month?
- Are you okay with us celebrating your birthday in some way?
- Do you play Tennis? (should always be Yes)

---

## Validation Report Format (JSON)

```json
{
  "metadata": {
    "processedAt": "2024-01-01T12:00:00Z",
    "inputFile": "roster.csv",
    "totalInputRecords": 1000,
    "totalOutputRecords": 950,
    "processingTimeMs": 5000
  },
  "columnMapping": {
    "mappedColumns": { "Email": "email", "Phone Number": "phone" },
    "ignoredColumns": ["Timestamp", "Approved"],
    "unmappedColumns": ["Unknown Column"],
    "missingRequiredFields": []
  },
  "dataQuality": {
    "validRecords": 950,
    "invalidRecords": 50,
    "recordsWithEmail": 900,
    "recordsWithPhone": 800,
    "recordsWithBoth": 750,
    "recordsWithNeither": 25
  },
  "duplicateAnalysis": {
    "uniqueRecords": 920,
    "duplicateGroups": 15,
    "totalDuplicates": 30,
    "partialMatches": 5,
    "resolvedDuplicates": 15
  },
  "transformations": [
    "Email normalized: 'John.Doe@EXAMPLE.COM' → 'john.doe@example.com'",
    "Phone normalized: '(555) 123-4567' → '+15551234567'",
    "Gender mapped: 'Female' → 'Woman'"
  ],
  "errors": [
    {
      "recordIndex": 123,
      "field": "email",
      "value": "invalid-email",
      "error": "Invalid email format"
    }
  ],
  "warnings": [
    {
      "recordIndex": 456,
      "field": "instagramHandle",
      "value": "invalid@handle",
      "warning": "Could not clean Instagram handle"
    }
  ],
  "recommendations": [
    "Review 5 partial matches manually",
    "Verify unmapped columns should be dropped"
  ]
}
```

---

## Processing Steps

1. **Parse CSV** - Read and analyze column structure
2. **Map Columns** - Identify which CSV columns map to schema fields
3. **Clean Data** - Apply normalization and enum mapping rules
4. **Validate** - Check each record against schema requirements
5. **Detect Duplicates** - Find and resolve duplicate records
6. **Generate Outputs** - Create cleaned CSV and validation report

## Success Criteria

- ✅ All output records have either valid email OR valid phone
- ✅ All enum values are valid schema values
- ✅ All string fields respect length limits
- ✅ No exact duplicates in output
- ✅ Comprehensive documentation of all actions taken
- ✅ Clear flagging of partial matches requiring manual review

## Important Notes

- **Be Conservative**: When in doubt, flag for manual review rather than make assumptions
- **Document Everything**: Every transformation should be logged
- **Preserve Data**: Don't lose information unnecessarily
- **Schema Compliance**: Final output must validate against TennisProfile schema
- **Performance**: Process ~1000 records efficiently

---

## Expected CSV Output Format

The cleaned CSV file must have these exact column headers (in this order):

```csv
id,userId,email,phone,gender,ageRange,ethnicity,birthDate,instagramHandle,district,districtOther,tmacGearPreference,tmacGearOther,gearSize,playlistSong,whyJoinTmac,referredBy,tennisRanking,favoriteTennisPlayer,createdAt,updatedAt,lastReminderAt
```

### Sample Output Row:

```csv
"550e8400-e29b-41d4-a716-446655440000",,"john.doe@example.com","+15551234567","Man","TWENTY_SIX_TO_THIRTY_FIVE","White","1995-06-15","johndoe","District3",,"Shirt",,"L","Shape of You","Love the community","Sarah","THREE_FIVE","Roger Federer","2024-01-01T12:00:00Z","2024-01-01T12:00:00Z",
```

---

## Recommended Workflow

1. **Start with a small sample** (first 10-20 rows) to validate the process
2. **Review the validation report** for any issues before processing the full dataset
3. **Test CSV import compatibility** with a few sample records
4. **Process the full dataset** once confident in the output format
5. **Backup original data** before making any schema changes

---

Ready to process the tennis roster CSV file!
