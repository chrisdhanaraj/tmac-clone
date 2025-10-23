# TMAC Intake Form Database Seeder

This directory contains scripts to seed the database with user data from the TMAC intake form CSV.

## Files

- **`types.ts`** - TypeScript interfaces for CSV data and processed data
- **`enum-mappers.ts`** - Functions to map CSV values to Prisma enum values
- **`data-cleaners.ts`** - Utilities for cleaning and validating data (emails, phones, etc.)
- **`csv-parser.ts`** - CSV parsing and basic validation
- **`data-processor.ts`** - Main data processing logic and reporting
- **`database-seeder.ts`** - Database operations using Prisma
- **`main.ts`** - Main seeding script
- **`test-runner.ts`** - Test script to analyze data without database operations

## Usage

### 1. Install Dependencies

```bash
cd apps/front-office
pnpm install
```

### 2. Analyze Data Patterns (Recommended First Step)

```bash
pnpm seed:analyze-intake
```

This will show you all the unique values in the CSV for each field (gender, district, tennis ranking, etc.) to understand the data patterns.

### 3. Test Data Processing (Recommended Second Step)

```bash
pnpm seed:test-intake
```

This will:

- Parse the CSV data
- Show mapping results for the first 10 records
- Generate a full processing report
- Identify potential issues without touching the database

### 4. Run Database Seeding

```bash
pnpm seed:intake-form
```

This will:

- Process all approved records from the CSV
- Create User and TennisProfile entries in the database
- Handle duplicates gracefully
- Provide detailed success/error reporting

## Data Mapping

### CSV Columns → Database Fields

| CSV Column                                             | Database Field                | Notes                 |
| ------------------------------------------------------ | ----------------------------- | --------------------- |
| `Approved`                                             | `User.approved`               | Boolean from CSV      |
| `What is your first name?`                             | `TennisProfile.firstName`     | Cleaned and validated |
| `What is your last name?`                              | `TennisProfile.lastName`      | Optional              |
| `Email` / `Email Address`                              | `TennisProfile.email`         | Primary key, required |
| `Phone Number (WhatsApp)`                              | `TennisProfile.phone`         | Standardized format   |
| `Gender` / `Which most closely describes your gender?` | `TennisProfile.gender`        | Mapped to enum        |
| `What district do you live in?`                        | `TennisProfile.district`      | Mapped to enum        |
| `What is your Tennis Ranking?`                         | `TennisProfile.tennisRanking` | Mapped to enum        |
| `Age`                                                  | `TennisProfile.ageRange`      | Mapped to enum        |
| `Ethnicity`                                            | `TennisProfile.ethnicity`     | Mapped to enum        |

### Enum Mappings

**Gender:**

- `m`, `male`, `man` → `Man`
- `f`, `female`, `woman` → `Woman`
- `they/them`, `non-binary` → `NonBinary`
- `n`, empty → `PreferNotToState`

**District:**

- `District 1` through `District 11` → `District1` through `District11`
- Other locations (Oakland, Berkeley, etc.) → `Other`

**Tennis Ranking:**

- Numeric values (1.0, 3.5, 4.5, etc.) → Corresponding enum values
- `1` → `ONE_ZERO`, `3.5` → `THREE_FIVE`, etc.

## Error Handling

- **Duplicates**: Skipped gracefully (based on email)
- **Invalid data**: Logged with details
- **Mapping failures**: Tracked and reported
- **Database errors**: Captured with context

## Safety Features

- **Dry run capability** via test script
- **Transaction safety** for database operations
- **Detailed logging** for troubleshooting
- **Graceful error handling** to prevent partial data corruption
