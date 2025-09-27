# Research: Magic Link Login Flow

## BetterAuth Magic Link Plugin Integration

### Decision: Use BetterAuth Magic Link Plugin Defaults

**Rationale**: The feature specification explicitly requests using "all the automatic things I can leverage, and not try to overcomplicate the verification". BetterAuth Magic Link plugin provides:

- Built-in token generation and validation
- Automatic email sending integration
- 5-minute default expiration
- Support for multiple simultaneous valid links
- Auto-signup for non-existent users (configurable)

**Alternatives considered**:

- Custom JWT-based magic link implementation (rejected: adds complexity)
- Auth0 Magic Links (rejected: introduces external dependency)
- Supabase Auth (rejected: requires migration from BetterAuth)

### Decision: React Router 7 Form Handling with Progressive Enhancement

**Rationale**: React Router 7 provides excellent form handling with server-side validation and progressive enhancement. The login form can work without JavaScript while providing enhanced UX with JS enabled.

**Alternatives considered**:

- Client-side only form handling (rejected: no SSR benefits)
- Separate API endpoints (rejected: React Router provides unified approach)

### Decision: Existing UI Components (shadcn/ui)

**Rationale**: The codebase already has Button, Card, Input, and Label components from shadcn/ui (which wraps Radix UI primitives with Tailwind styling). These provide accessibility out of the box, maintain design consistency, and offer excellent developer experience with proper TypeScript support.

**Alternatives considered**:

- Direct Radix UI usage (rejected: shadcn/ui provides better styling integration)
- Custom form components (rejected: reinvents accessible patterns)
- Headless UI (rejected: already using shadcn/ui ecosystem)

## React Router 7 Authentication Patterns

### Decision: Server-Side Session Management

**Rationale**: BetterAuth handles session creation and validation server-side. React Router 7's loader/action pattern allows server-side authentication checks before rendering.

**Implementation Pattern**:

```typescript
// In route loader
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session) {
    // Redirect authenticated users away from login
    throw redirect("/user");
  }
  return null;
}
```

### Decision: Magic Link Verification Route

**Rationale**: BetterAuth requires a dedicated endpoint for magic link verification. React Router 7 can handle this with a dynamic route that processes the token and redirects appropriately.

**Pattern**: `/auth/magic-link/verify?token=...&callbackURL=...`

## Email Integration with Loops

### Decision: Leverage Existing Loops Integration

**Rationale**: The codebase already has Loops integration in `loopsClient.server.ts` for transactional emails. BetterAuth Magic Link plugin allows custom email sending via the `sendMagicLink` callback.

**Configuration**:

```typescript
magicLink({
  sendMagicLink: async ({ email, url }) => {
    loops.sendTransactionalEmail({
      transactionalId: process.env.LOOPS_MAGIC_EMAIL,
      email,
      dataVariables: { url },
    });
  },
});
```

## Error Handling and User Experience

### Decision: Inline Error Display

**Rationale**: Based on clarifications, errors should be displayed on the same page above the form. This provides immediate feedback without navigation disruption.

**Pattern**: Use React Router 7 action data to pass errors back to the form component.

### Decision: Progressive Enhancement for Form States

**Rationale**: Show loading states and success messages using React Router 7's navigation state and action data.

**States to handle**:

- Submitting: Show loading spinner on submit button
- Success: Show "Check your email" message
- Error: Show specific error message above form

## Testing Strategy

### Decision: Multi-Layer Testing Approach

**Rationale**: Constitutional requirement for TDD with contract, integration, and unit tests.

**Test Layers**:

1. **Contract Tests**: Verify magic link API endpoints match expected schemas
2. **Integration Tests**: Test complete user flows (submit email → receive link → click → authenticated)
3. **Unit Tests**: Test individual components and utility functions
4. **E2E Tests**: Playwright tests for full browser flows including email verification

### Decision: Mock Email Service in Tests

**Rationale**: Tests should not send actual emails. Mock the Loops service and verify correct parameters are passed.

## Security Considerations

### Decision: Trust BetterAuth Security Defaults

**Rationale**: BetterAuth Magic Link plugin handles:

- Cryptographically secure token generation
- Time-based expiration (5 minutes)
- Single-use token validation (configurable)
- CSRF protection

**Additional Measures**:

- Rate limiting on magic link requests (prevent spam)
- Email validation before sending links
- Proper session management after verification

## Performance Optimization

### Decision: Minimal Client-Side JavaScript

**Rationale**: Magic link flow is primarily server-driven. Client-side enhancements should be progressive.

**Optimizations**:

- Server-side form validation
- Immediate feedback for form submission
- Preload user dashboard route after successful authentication

## Accessibility Requirements

### Decision: WCAG 2.1 AA Compliance

**Rationale**: Constitutional requirement for accessibility. shadcn/ui components (built on Radix UI primitives) provide accessible foundation with proper ARIA attributes, keyboard navigation, and screen reader support.

**Requirements**:

- Proper form labels and error announcements (built into shadcn/ui Label and Input)
- Keyboard navigation support (inherited from Radix UI primitives)
- Screen reader compatible error messages (using proper ARIA attributes)
- High contrast error states (customizable via Tailwind CSS variants)
- Focus management after form submission (handled by shadcn/ui Button component)
