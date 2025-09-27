# Quickstart: Magic Link Login Flow

## Overview

This quickstart guide validates the magic link authentication feature through manual testing scenarios. Each scenario corresponds to acceptance criteria from the feature specification.

## Prerequisites

- Development environment running (`pnpm dev`)
- Database migrations applied (`pnpm db:migrate`)
- Environment variables configured:
  - `LOOPS_MAGIC_EMAIL` - Loops transactional email template ID
  - `LOOPS_API_KEY` - Loops API key for email sending
  - `DATABASE_URL` - PostgreSQL connection string
  - `BETTER_AUTH_SECRET` - BetterAuth session secret

## Test Scenarios

### Scenario 1: Successful Magic Link Login

**Goal**: Verify complete magic link authentication flow

**Steps**:

1. Navigate to `/login` in browser
2. Enter valid email address: `test@example.com`
3. Click "Login" button
4. Verify "Check your email" message appears on same page
5. Check email inbox for magic link message
6. Click magic link in email
7. Verify automatic redirect to `/user` dashboard
8. Verify user is authenticated (session active)

**Expected Results**:

- Form submission shows success message without page navigation
- Email contains valid magic link with proper branding
- Magic link click authenticates user immediately
- User dashboard loads with authenticated session
- Session persists across browser refresh

**Validation Commands**:

```bash
# Check user was created/updated in database
pnpm db:studio
# Navigate to User table, verify email and emailVerified timestamp

# Check session exists
# Navigate to Session table, verify active session for user
```

### Scenario 2: Non-Existent User (Auto-Signup)

**Goal**: Verify BetterAuth auto-signup behavior for new users

**Steps**:

1. Navigate to `/login`
2. Enter email not in database: `newuser@example.com`
3. Submit form
4. Verify "Check your email" message (no error about non-existent user)
5. Click magic link from email
6. Verify user is created and authenticated
7. Verify redirect to `/user` dashboard

**Expected Results**:

- No "Account not found" error (auto-signup enabled)
- New user record created in database
- User authenticated successfully after magic link click
- Email verification timestamp set on new user

**Validation Commands**:

```bash
# Verify new user was created
pnpm db:studio
# Check User table for newuser@example.com with createdAt timestamp
```

### Scenario 3: Expired Magic Link

**Goal**: Verify error handling for expired magic links

**Steps**:

1. Navigate to `/login`
2. Enter valid email: `test@example.com`
3. Submit form and receive magic link email
4. Wait 6 minutes (beyond 5-minute expiration)
5. Click expired magic link
6. Verify redirect to `/login` with error message
7. Verify error message displayed above form

**Expected Results**:

- Expired link redirects to login page
- Error message clearly indicates link has expired
- Error message displayed above form (not separate page)
- User can request new magic link immediately

**Note**: For testing purposes, you may need to modify BetterAuth config temporarily to use 30-second expiration for faster testing.

### Scenario 4: Already Authenticated User

**Goal**: Verify redirect behavior for authenticated users

**Steps**:

1. Complete Scenario 1 (user is authenticated)
2. Navigate directly to `/login`
3. Verify automatic redirect to `/user` dashboard
4. No login form should be displayed

**Expected Results**:

- Immediate redirect to dashboard (no login form shown)
- User session remains active
- No unnecessary authentication requests

### Scenario 5: Invalid Email Format

**Goal**: Verify client-side email validation

**Steps**:

1. Navigate to `/login`
2. Enter invalid email: `notanemail`
3. Submit form
4. Verify validation error appears
5. Enter valid email format
6. Verify error clears and form submits

**Expected Results**:

- Client-side validation prevents form submission
- Clear error message about email format
- Error clears when valid email entered
- Form submits successfully with valid email

### Scenario 6: Multiple Magic Link Requests

**Goal**: Verify BetterAuth default behavior for multiple simultaneous links

**Steps**:

1. Navigate to `/login`
2. Enter email: `test@example.com`
3. Submit form (first magic link)
4. Immediately submit form again (second magic link)
5. Check email for two magic link messages
6. Click first magic link - verify authentication
7. Open second magic link in new tab - verify still works

**Expected Results**:

- Both magic links are sent successfully
- Both magic links remain valid (no invalidation)
- Either link can be used for authentication
- Multiple valid links align with BetterAuth defaults

## Performance Validation

### Response Time Test

**Goal**: Verify authentication performance meets requirements (<200ms)

**Steps**:

1. Open browser developer tools
2. Navigate to `/login`
3. Enter email and submit form
4. Measure time from form submission to success message
5. Click magic link and measure redirect time

**Expected Results**:

- Form submission response: <200ms
- Magic link verification: <200ms
- Overall flow feels immediate and responsive

### Email Delivery Test

**Goal**: Verify email delivery reliability

**Steps**:

1. Submit magic link request
2. Check email delivery time (Loops service)
3. Verify email content and formatting
4. Test with different email providers (Gmail, Outlook, etc.)

**Expected Results**:

- Email delivered within 30 seconds
- Proper email formatting and branding
- Magic link URL correctly formatted
- Works across major email providers

## Error Recovery Testing

### Network Failure Simulation

**Goal**: Verify graceful handling of network issues

**Steps**:

1. Disable network connection
2. Submit magic link form
3. Verify appropriate error message
4. Re-enable network
5. Retry form submission

**Expected Results**:

- Clear error message for network issues
- Form can be resubmitted after network recovery
- No data loss or broken states

### Email Service Failure

**Goal**: Verify handling of email delivery failures

**Steps**:

1. Temporarily misconfigure Loops API key
2. Submit magic link form
3. Verify user-friendly error message
4. Check server logs for actual error details

**Expected Results**:

- Generic "please try again" message to user
- Detailed error logged server-side
- No sensitive information exposed to user

## Browser Compatibility

### Cross-Browser Testing

**Goal**: Verify functionality across major browsers

**Test Matrix**:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**For each browser**:

1. Complete Scenario 1 (successful login)
2. Test form validation behavior
3. Verify session persistence
4. Test magic link click handling

**Expected Results**:

- Consistent behavior across all browsers
- Proper form validation in each browser
- Session cookies work correctly
- Magic links open in same browser

## Mobile Testing

### Responsive Design

**Goal**: Verify mobile user experience

**Steps**:

1. Open `/login` on mobile device
2. Verify form layout and usability
3. Test form submission
4. Open magic link email on mobile
5. Verify magic link works in mobile browser

**Expected Results**:

- Login form properly sized for mobile
- Touch-friendly form inputs
- Magic link opens in mobile browser
- Authentication flow works end-to-end on mobile

## Security Validation

### Token Security

**Goal**: Verify magic link token security

**Steps**:

1. Generate magic link and inspect token in URL
2. Verify token appears cryptographically random
3. Verify token length (should be 32+ characters)
4. Test token reuse (should fail after first use)

**Expected Results**:

- Token appears random (no predictable patterns)
- Sufficient entropy for security
- Single-use enforcement works correctly

### Session Security

**Goal**: Verify session management security

**Steps**:

1. Authenticate via magic link
2. Inspect session cookie in browser
3. Verify cookie security flags
4. Test session expiration

**Expected Results**:

- Session cookie marked HttpOnly and Secure
- Session expires after configured time
- Session invalidation works correctly

## Cleanup

After completing all scenarios:

1. Clear test data from database if needed
2. Reset email configuration
3. Clear browser cookies and local storage
4. Verify system returns to clean state

## Success Criteria

✅ All 6 test scenarios pass  
✅ Performance requirements met (<200ms)  
✅ Email delivery works reliably  
✅ Error handling graceful and user-friendly  
✅ Cross-browser compatibility confirmed  
✅ Mobile experience validated  
✅ Security requirements verified

When all criteria are met, the magic link login flow is ready for production deployment.
