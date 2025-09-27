# Feature Specification: Magic Link Login Flow

**Feature Branch**: `001-i-want-to`  
**Created**: September 28, 2025  
**Status**: Draft  
**Input**: User description: "I want to implement a magic link login flow for my React Router application in front-office. I've already setup some parts (e.g., the @auth-client.ts , and @auth.server.ts ). I want to login in the @login.tsx route, and then redirect to the @user.tsx route. I want to use all the automatic things I can leverage, and not try to overcomplicate the verification"

## Execution Flow (main)

```
1. Parse user description from Input
   → Feature: Magic link authentication system
2. Extract key concepts from description
   → Actors: Users seeking authentication
   → Actions: Login via email link, redirect after verification
   → Data: User email addresses, authentication sessions
   → Constraints: Use existing auth infrastructure, avoid complexity
3. For each unclear aspect:
   → All key aspects are clearly defined
4. Fill User Scenarios & Testing section
   → Clear user flow: email entry → magic link → verification → redirect
5. Generate Functional Requirements
   → Each requirement is testable and specific
6. Identify Key Entities (if data involved)
   → Leverages existing User and Session entities
7. Run Review Checklist
   → No [NEEDS CLARIFICATION] markers present
   → No implementation details included
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines

- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## Clarifications

### Session 2025-09-28

- Q: What should happen when a user who doesn't exist in the system (no account) enters their email address on the login page? → A: Use BetterAuth Magic Link plugin defaults (auto-signup unless disableSignUp=true)
- Q: How long should magic links remain valid before expiring? → A: Use BetterAuth Magic Link plugin default (5 minutes)
- Q: What should happen if a user requests multiple magic links for the same email before the first one expires? → A: Use BetterAuth Magic Link plugin default (allows multiple valid links simultaneously)
- Q: After a user submits their email on the login page, what should the UI show while they wait for the email? → A: Stay on same page with "Check your email" message
- Q: When a magic link fails (expired, invalid, or already used), where should the user be redirected and what should they see? → A: Back to login page with error message above form

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a user, I want to log into the tennis club application using only my email address, so that I can access my account without remembering a password. The system should send me a secure link via email that automatically logs me in when clicked, then redirect me to my user dashboard.

### Acceptance Scenarios

1. **Given** a user is on the login page, **When** they enter their email address and submit the form, **Then** the system sends a magic link to their email and displays "Check your email" message on the same page
2. **Given** a user receives a magic link email, **When** they click the link, **Then** they are automatically authenticated and redirected to their user dashboard
3. **Given** a user clicks an expired magic link, **When** they attempt to authenticate, **Then** they are redirected back to the login page with an error message displayed above the form
4. **Given** a user is already authenticated, **When** they visit the login page, **Then** they are automatically redirected to their user dashboard

### Edge Cases

- **Invalid Email Format**: System MUST display client-side validation error and prevent form submission for invalid email addresses
- **Multiple Magic Link Requests**: System MUST allow multiple simultaneous valid magic links per BetterAuth plugin defaults (no invalidation of previous links)
- **Cross-Device Magic Links**: System MUST authenticate users successfully when clicking magic links from different devices/browsers (session created on target device)
- **Email Delivery Failures**: System MUST log email service errors server-side and display generic "Please try again" message to users

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow users to request authentication by entering only their email address
- **FR-002**: System MUST send a secure, time-limited magic link to the provided email address
- **FR-003**: System MUST validate email addresses before sending magic links
- **FR-003a**: System MUST follow BetterAuth Magic Link plugin default behavior for non-existent users (auto-signup unless disableSignUp=true)
- **FR-004**: System MUST authenticate users automatically when they click a valid magic link
- **FR-005**: System MUST redirect authenticated users to the user dashboard after successful login
- **FR-006**: System MUST expire magic links after 5 minutes (BetterAuth Magic Link plugin default)
- **FR-007**: System MUST display appropriate feedback messages during the login process (sending link, success, errors)
- **FR-007a**: System MUST show "Check your email" message on the same page after successful magic link request
- **FR-008**: System MUST handle invalid or expired magic links gracefully with clear error messages
- **FR-008a**: System MUST redirect users with failed magic links back to login page with error message displayed above the form
- **FR-009**: System MUST prevent authenticated users from accessing the login page by redirecting them to the dashboard
- **FR-010**: System MUST maintain user session state after successful magic link authentication
- **FR-011**: System MUST allow multiple valid magic links simultaneously (BetterAuth Magic Link plugin default behavior)
- **FR-012**: System MUST validate email format client-side before form submission
- **FR-013**: System MUST log email delivery failures without exposing service details to users
- **FR-014**: System MUST support magic link authentication across different devices and browsers

### Key Entities _(include if feature involves data)_

- **User**: Existing entity with email address as primary identifier for magic link delivery
- **Session**: Existing entity for maintaining authenticated user state after magic link verification
- **Magic Link Token**: Temporary authentication token with expiration time and single-use validation

_Note: All entities must be defined in Prisma schema before implementation (Constitutional Principle I)_

---

## Review & Acceptance Checklist

_GATE: Automated checks run during main() execution_

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed
- [x] User experience considerations documented (Constitutional Principle V)

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

_Updated by main() during processing_

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---
