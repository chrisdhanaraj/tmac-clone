# Data Model: Magic Link Login Flow

## Entity Analysis

### Existing Entities (from Prisma Schema)

#### User Entity

**Purpose**: Represents tennis club members and their authentication data
**Key Attributes**:

- `id`: Primary key (string/UUID)
- `email`: Unique identifier for magic link delivery
- `firstName`: Required field for personalization
- `lastName`: Required field for personalization
- `emailVerified`: Timestamp of email verification (set after magic link verification)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last modification timestamp

**Relationships**:

- One-to-many with Session (user can have multiple active sessions)
- One-to-many with Account (for potential future OAuth providers)

**Validation Rules**:

- Email must be valid format and unique
- firstName and lastName are required (from BetterAuth config)
- Email verification status tracked automatically

#### Session Entity

**Purpose**: Manages authenticated user sessions after magic link verification
**Key Attributes**:

- `id`: Primary key (string)
- `sessionToken`: Unique session identifier
- `userId`: Foreign key to User
- `expires`: Session expiration timestamp
- `createdAt`: Session creation **timestamp**

**Relationships**:

- Many-to-one with User (session belongs to one user)

**Validation Rules**:

- Session token must be cryptographically secure
- Expiration must be future timestamp
- User ID must reference existing user

### BetterAuth Managed Entities

#### Magic Link Token (Managed by BetterAuth)

**Purpose**: Temporary authentication tokens sent via email
**Key Attributes** (handled internally by BetterAuth):

- Token: Cryptographically secure random string
- Email: Target email address
- Expiration: 5-minute TTL from creation
- Used: Boolean flag for single-use enforcement
- Created: Token generation timestamp

**Validation Rules** (enforced by BetterAuth):

- Token must be cryptographically secure (32+ bytes entropy)
- Email must match existing user (auto-signup disabled)
- Expiration enforced at verification time
- Single-use enforcement prevents replay attacks

**Lifecycle**:

1. **Created**: When user submits email on login form
2. **Sent**: Via Loops email service with magic link URL
3. **Verified**: When user clicks link and token validates
4. **Consumed**: Token marked as used, session created
5. **Expired**: Automatic cleanup after 5 minutes

#### Verification Entity (BetterAuth managed)

**Purpose**: Tracks email verification status and attempts
**Key Attributes**:

- `id`: Primary key
- `identifier`: Email address
- `value`: Verification token
- `expiresAt`: Token expiration
- `createdAt`: Creation timestamp
- `updatedAt`: Last update

## Data Flow Analysis

### Magic Link Request Flow

```
1. User submits email → Validate email format
2. Check if user exists → If not, return error (auto-signup disabled)
3. Generate magic link token → Store with 5-minute expiration
4. Send email with magic link → Via Loops service
5. Show confirmation → "Check your email" message
```

### Magic Link Verification Flow

```
1. User clicks link → Extract token from URL
2. Validate token → Check expiration and usage status
3. Verify token → Mark as used, prevent replay
4. Create session → Generate session token, set expiration
5. Redirect user → Navigate to dashboard (/user route)
```

### Error Handling Data States

```
1. Invalid email format → Client-side validation error
2. User not found → Return 400 error (auto-signup disabled)
3. Token expired → Redirect to login with error message
4. Token already used → Redirect to login with error message
5. Email delivery failure → Log error, show generic message
```

## Database Schema Requirements

### No Schema Changes Required

The existing Prisma schema already supports magic link authentication:

- User table has email field for magic link delivery
- Session table manages authenticated sessions
- BetterAuth handles magic link tokens internally
- Email verification status tracked in User.emailVerified

### Configuration Changes Only

Magic link functionality requires only BetterAuth plugin configuration:

```typescript
// In auth.server.ts
plugins: [
  magicLink({
    sendMagicLink: async ({ email, url }) => {
      loops.sendTransactionalEmail({
        transactionalId: process.env.LOOPS_MAGIC_EMAIL,
        email,
        dataVariables: { url },
      });
    },
    // Configuration:
    // - expiresIn: 300 seconds (5 minutes) - default
    // - allowMultiple: true - default
    // - disableSignUp: true (auto-signup disabled)
  }),
];
```

## Validation Schema (Zod)

### Email Submission Validation

```typescript
const MagicLinkRequestSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required")
    .max(254, "Email address too long"),
});
```

### Magic Link Verification Validation

```typescript
const MagicLinkVerifySchema = z.object({
  token: z
    .string()
    .min(1, "Token is required")
    .max(512, "Invalid token format"),
  callbackURL: z
    .string()
    .url("Invalid callback URL")
    .optional()
    .default("/user"),
});
```

## State Management

### UI State (React Component State)

- `isSubmitting`: Boolean for form submission state (used with shadcn/ui Button loading state)
- `message`: String for success/error messages (displayed with shadcn/ui styling)
- `email` String for form input value (managed by shadcn/ui Input component)

### Server State (React Router Loaders/Actions)

- User authentication status (via BetterAuth sesion)
- Magic link verification result
- Redirect targets based on auth state

### Session State (BetterAuth Managed)

- User session data after successful authentication
- Session epiration and renewal
- Cross-request authentication persistence

## Performance Considerations

### Database Queries

- Single query to check user existence by email
- Sigle query to create session after verification
- No complex joins required for magic link flow

### Caching Strategy

- User session data cached in browser cookies
- No additional cachig needed for magic link tokens (short-lived)
- Email verification status cached in session

### Cleanup Requirements

- Magic link tokens auto-expire (5 minutes)
- Expired sessions cleaned up by BetterAuth
- No manual cleanup required for this feature
