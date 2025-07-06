# Task List: Roster Data Cleaning (AI Agent Phase)

## Relevant Files

- `apps/front-office/scripts/data-cleaning/schema-analyzer.ts` - Analyzes and validates the TennisProfile Prisma schema for AI agent understanding.
- `apps/front-office/scripts/data-cleaning/csv-processor.ts` - Handles CSV file reading, parsing, and initial data processing.
- `apps/front-office/scripts/data-cleaning/data-cleaner.ts` - Core data cleaning and normalization logic.
- `apps/front-office/scripts/data-cleaning/duplicate-detector.ts` - Detects and resolves duplicate records and partial matches.
- `apps/front-office/scripts/data-cleaning/output-generator.ts` - Generates cleaned CSV file and JSON validation report.
- `apps/front-office/scripts/data-cleaning/types.ts` - TypeScript types and interfaces for data cleaning process.
- `apps/front-office/scripts/data-cleaning/utils.ts` - Utility functions for phone normalization, email validation, etc.
- `apps/front-office/scripts/data-cleaning/ai-agent-prompt.md` - Comprehensive AI agent prompt for data cleaning process.
- `apps/front-office/prisma/schema.prisma` - Reference to TennisProfile schema structure and enums.

### Notes

- ✅ **COMPLETED**: Created comprehensive AI agent prompt for data cleaning process
- ✅ **SCHEMA UPDATED**: Added email/phone fields to TennisProfile, made userId nullable for guest profiles
- ✅ **MIGRATION APPLIED**: Database schema updated to support guest-to-registered user flow
- The AI agent prompt provides complete instructions for processing ~1000 tennis roster records
- Output will be schema-compliant CSV ready for database import as guest profiles
- Validation report documents all cleaning actions and issues for administrator review

### Key Accomplishments

1. **Schema Analysis**: Complete TennisProfile structure documented with all enums and constraints
2. **Data Model Enhancement**: Added support for guest profiles (email/phone in TennisProfile)
3. **AI Agent Prompt**: Comprehensive instructions for data cleaning with exact schema compliance
4. **Migration Created**: Database updated to support new guest-to-registered user workflow

## Tasks

- [x] 1.0 Schema Analysis and Understanding

  - [x] 1.1 Extract TennisProfile schema structure from Prisma schema file
  - [x] 1.2 Document all enum types (Gender, AgeRange, TennisRanking, District, etc.)
  - [x] 1.3 Identify required vs optional fields and validation constraints
  - [x] 1.4 Create mapping documentation for CSV columns to schema fields
  - [x] 1.5 Define data type validation rules for each field

- [x] 2.0 CSV Data Processing and Validation

  - [x] 2.1 Read and parse raw CSV file input
  - [x] 2.2 Analyze CSV column headers and map to TennisProfile fields
  - [x] 2.3 Identify unmappable columns and document for dropping
  - [x] 2.4 Validate data formats against schema requirements
  - [x] 2.5 Flag records with missing critical data (email/phone)

- [x] 3.0 Data Cleaning and Normalization

  - [x] 3.1 Implement phone number normalization (remove formatting, standardize format)
  - [x] 3.2 Clean and validate email addresses (case-insensitive, format validation)
  - [x] 3.3 Map text values to enum types where possible
  - [x] 3.4 Handle date formatting for birthDate field
  - [x] 3.5 Validate and clean string length constraints (Instagram handle, district other, etc.)
  - [x] 3.6 Set appropriate null values for unmappable data

- [x] 4.0 Duplicate Detection and Resolution

  - [x] 4.1 Detect exact duplicates based on email and phone combinations
  - [x] 4.2 Identify partial matches (same email OR phone but not both)
  - [x] 4.3 Flag profiles with conflicting data for the same email/phone
  - [x] 4.4 Resolve duplicates by merging or dropping records
  - [x] 4.5 Document all duplicate resolution actions

- [x] 5.0 Output Generation (Cleaned CSV + Validation Report)
  - [x] 5.1 Generate cleaned CSV with proper TennisProfile schema column headers
  - [x] 5.2 Ensure all records in cleaned CSV validate against schema
  - [x] 5.3 Create comprehensive JSON validation report documenting all actions
  - [x] 5.4 Include statistics (total records processed, cleaned, dropped, etc.)
  - [x] 5.5 List all data quality issues and resolution actions taken
