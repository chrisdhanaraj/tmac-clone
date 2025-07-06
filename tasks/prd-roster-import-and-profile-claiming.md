# Product Requirements Document: Roster Data Cleaning and Profile Claiming System

## Introduction/Overview

This feature enables the migration of approximately 1000 existing tennis profiles from a raw CSV file into the application database, followed by a user flow that allows new users to claim their existing tennis profile data when they create accounts. The system addresses the need to port over an existing user base while maintaining data integrity and providing a seamless user experience.

The feature consists of two main components:

1. **Roster Data Cleaning Process**: An AI agent-assisted tool that takes a raw CSV file and produces a cleaned, validated CSV file that conforms to the TennisProfile schema
2. **Profile Claiming Flow**: A mandatory user flow that connects newly registered users to their existing tennis profile data

## Goals

1. Successfully clean and validate ~1000 existing tennis profiles from raw CSV file to produce a schema-compliant CSV file
2. Provide a validation report that documents all data cleaning actions and issues requiring manual review
3. Implement a mandatory profile claiming flow that connects new user accounts to existing tennis profiles
4. Prevent duplicate tennis profiles in the cleaned dataset
5. Ensure data integrity through exact matching on email and phone number fields

## User Stories

### Administrator Stories

- As an administrator, I want to provide a raw CSV file to an AI agent and receive a cleaned CSV file that validates against the TennisProfile schema
- As an administrator, I want to receive a validation report documenting all data cleaning actions so that I can review what was changed or dropped
- As an administrator, I want to be alerted about duplicate records and data conflicts so that I can take manual action to resolve them

### New User Stories

- As a new user logging into the application, I want to be prompted to claim my existing tennis profile so that I don't have to re-enter my information
- As a new user, I want the system to automatically find my existing profile based on my email or phone number so that the claiming process is seamless
- As a new user, I must complete the profile claiming process before accessing the main application features

## Functional Requirements

### Data Cleaning Process Requirements

1. The AI agent must accept a raw CSV file containing tennis profile data as input
2. The AI agent must validate and clean data against the TennisProfile Prisma schema
3. The AI agent must generate a validation report in JSON format that includes:
   - Records that were successfully cleaned and mapped
   - Records with missing required fields that were dropped
   - Records with invalid data formats and how they were handled
   - Records that could not be mapped to the schema
   - Duplicate records found and how they were resolved
   - Records with partial matches (same email OR phone but not both)
4. The AI agent must output a cleaned CSV file that validates against the TennisProfile schema
5. The AI agent must drop data that cannot be mapped to the schema
6. The AI agent must not include profiles with partial matches (same email OR phone but not both with existing profiles) in the cleaned output
7. The AI agent must prevent duplicate tennis profiles in the cleaned dataset
8. The AI agent must alert administrators when multiple profiles match the same email or phone number
9. The cleaned CSV file must be structured to create TennisProfile records with nullable userId fields

### Profile Claiming Requirements

10. The system must check for existing tennis profiles when a user logs into the application
11. The system must match users to tennis profiles using exact matches on email OR phone number
12. The system must present a mandatory profile claiming flow when a match is found
13. Users must not be able to reject a suggested profile match
14. Users must not be able to create a new TennisProfile if a matching existing profile is found
15. The system must link the claimed TennisProfile to the user by updating the userId field
16. Users must complete the profile claiming process before accessing other application features
17. The system must allow users to edit their claimed tennis profile after claiming

### Data Management Requirements

18. The system must maintain unclaimed tennis profiles indefinitely
19. The system must prevent duplicate tennis profiles from being created during the claiming process
20. The system must ensure data integrity when linking users to tennis profiles

## Non-Goals (Out of Scope)

1. Fuzzy matching algorithms for email/phone number matching
2. Automated data cleanup without administrator review
3. User ability to reject profile matches
4. Time limits on unclaimed profiles
5. Tracking mechanisms for how profiles were created (imported vs. user-created)
6. Success metrics tracking or analytics
7. Audit logging for import and claiming activities
8. Support for importing from data sources other than CSV files

## Design Considerations

### AI Agent Interface

- The AI agent will be provided with a raw CSV file containing tennis profile data
- The AI agent must understand the TennisProfile Prisma schema structure and validation rules
- The AI agent will output both a cleaned CSV file and a JSON validation report

### Profile Claiming UI

- The claiming flow should be presented as a modal or dedicated page that blocks access to other features
- Display should clearly show the matched profile information for user confirmation
- Interface should guide users through the claiming process with clear instructions

## Technical Considerations

### Schema Requirements for AI Agent

- The AI agent must understand the TennisProfile Prisma schema structure
- TennisProfile model requires `userId` field to be nullable: `userId String? @unique`
- AI agent must understand all enum types (Gender, AgeRange, TennisRanking, etc.)
- AI agent must understand field constraints and validation rules

### Data Cleaning Logic

- Implement exact string matching for email addresses (case-insensitive)
- Implement phone number normalization before matching (remove formatting characters, standardize format)
- Implement exact string matching for normalized phone numbers
- Handle cases where records have both matching email AND phone with different profiles
- Reject profiles with partial matches (same email OR phone but not both) as validation errors

### AI Agent Output Requirements

- Generate cleaned CSV file with proper column headers matching TennisProfile schema
- Generate detailed validation report in JSON format with line numbers and specific actions taken
- Include partial match detection and duplicate resolution in validation process
- Ensure cleaned CSV can be directly imported into database without further validation

## Success Metrics

This feature is considered a hard requirement for the system migration. Success is defined as:

- Successful generation of a cleaned CSV file that validates against the TennisProfile schema
- Zero duplicate profiles in the cleaned dataset
- Comprehensive validation report documenting all cleaning actions and issues
- All new users successfully complete the profile claiming flow when matches are found
