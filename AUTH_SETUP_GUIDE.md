# Authentication Setup Guide

## Overview
Your PonProp.tech application now has a complete authentication system with email/password sign-up, sign-in, Google OAuth, and password reset functionality. This guide will help you get everything working.

## Current Implementation Status

✅ **Implemented:**
- Email/password sign-up with validation
- Email/password sign-in
- Google OAuth sign-in
- Password reset flow
- Session persistence
- Auth state monitoring
- Error handling and user feedback
- TypeScript compilation (builds successfully)

## Quick Start Checklist

### 1. Environment Variables (.env)
Your `.env` file already has the required Supabase credentials:
```
VITE_SUPABASE_URL=https://ivyfxbgnqqkiwbufszpw.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_sRzNXpvnNoXXY0aGWEdNoQ_VLEYC2dS
```

✅ These are already configured and valid.

---

## Email/Password Authentication Setup

### Enable Email Sign-Up in Supabase

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select project: **ivyfxbgnqqkiwbufszpw**

2. **Configure Email Provider:**
   - Navigate: **Authentication > Providers > Email**
   - Ensure **Email** provider is **ENABLED**

3. **Email Confirmation Setting** (Choose one):

   **Option A: For Development (Instant Sign-Up)**
   - Toggle **"Confirm email"** to OFF
   - Users can sign up and sign in immediately
   - Best for testing

   **Option B: For Production (Secure)**
   - Keep **"Confirm email"** ON (default)
   - Users must click email confirmation link
   - More secure but requires email delivery setup

### Testing Email Sign-Up

1. Start your app:
   ```bash
   npm run dev
   ```

2. Navigate to the auth page (should be at `/`)

3. Click **"Create Account"** tab

4. Fill in:
   - Email: `test@example.com`
   - Password: `TestPassword123` (8+ characters)
   - Confirm Password: `TestPassword123`

5. Click **"Sign Up"**

**If Confirm Email is ON:**
- You'll see: "Account created! A confirmation email has been sent..."
- Check browser **DevTools Console** (F12) for logs
- In production: Check the email inbox for confirmation link
- For testing: You can use Supabase's email testing in the dashboard

**If Confirm Email is OFF:**
- Account will be created instantly
- You'll be redirected to Sign In after 2 seconds
- You can immediately sign in with these credentials

### Debugging Sign-Up Issues

**Step 1: Check Browser Console**
- Open DevTools: Press `F12`
- Go to **Console** tab
- Try to create an account
- Look for these logs:
  ```
  Sign up response: { data: {...}, error: null }
  ✓ Account creation response received
  ```

**Step 2: Verify Credentials**
- Email must be valid format: `user@domain.com`
- Password must be 8+ characters
- Passwords must match exactly

**Step 3: Check Supabase Auth Settings**
- Go to Supabase Dashboard
- **Authentication > Providers > Email**
- Verify Email provider is ENABLED
- Check "Confirm email" setting matches your approach

**Step 4: Review Error Messages**
- Error messages from Supabase will display on screen
- Common issues:
  - "User already exists" - Email already signed up
  - "Password too short" - Password < 8 characters
  - Network errors - Check internet connection

---

## Google OAuth Setup

### Prerequisites
- Google Cloud Console account
- Supabase account (already set up)

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Create new project named "PonProp" if needed
   - Wait for project creation (1-2 minutes)

3. **Enable Google+ API:**
   - Search for "Google+ API" in the search bar
   - Click on "Google+ API"
   - Click **ENABLE**

4. **Create OAuth Credentials:**
   - Go to **Credentials** (left sidebar)
   - Click **+ CREATE CREDENTIALS**
   - Select **OAuth 2.0 Client IDs**
   - Choose application type: **Web application**
   - Name it: "PonProp Web App"

5. **Configure Authorized Redirect URIs:**
   - Add these URIs under "Authorized redirect URIs":
     ```
     http://localhost:5173
     http://localhost:5173/auth/google/callback
     http://localhost:5173/
     ```
   - For production, add your domain:
     ```
     https://ponprop.tech
     https://ponprop.tech/auth/google/callback
     https://ponprop.tech/
     ```
   - Click **SAVE**

6. **Copy Your Credentials:**
   - Find your credentials in the list
   - Click the edit icon
   - Copy the **Client ID** and **Client Secret**

### Step 2: Configure Supabase with Google OAuth

1. **Go to Supabase Dashboard:**
   - Select project: **ivyfxbgnqqkiwbufszpw**
   - Navigate: **Authentication > Providers > Google**

2. **Enable Google Provider:**
   - Toggle **Enabled** to ON

3. **Add Google Credentials:**
   - Paste your Google **Client ID** in the "Client ID" field
   - Paste your Google **Client Secret** in the "Client Secret" field
   - Click **SAVE**

### Testing Google OAuth

1. Start app:
   ```bash
   npm run dev
   ```

2. On the auth page, click **"Sign in with Google"**

3. You'll be redirected to Google login

4. After signing in, you'll be redirected back to the app

5. Check console for:
   ```
   Google OAuth initiated
   ```

---

## Email Templates & Configuration

### Password Reset Email

When users click "Forgot Password?":
1. They enter their email
2. Supabase sends password reset email
3. Email contains a reset link
4. Clicking the link takes them to password reset form

**To Customize Reset Email:**
1. Supabase Dashboard
2. **Authentication > Email Templates**
3. Click **Reset Password** email template
4. Customize the design/message
5. Click **SAVE**

### Confirmation Email

When email confirmation is enabled:
1. Users receive confirmation email after sign-up
2. Email contains confirmation link
3. Clicking confirms their account

**To Customize Confirmation Email:**
1. Supabase Dashboard
2. **Authentication > Email Templates**
3. Click **Confirm signup** email template
4. Customize the design/message
5. Click **SAVE**

---

## Understanding Auth Flow

### Sign-Up Flow (Email Confirmation ON)
```
User enters email/password
     ↓
Supabase validates credentials
     ↓
User account created (inactive)
     ↓
Confirmation email sent
     ↓
User clicks email link
     ↓
Account activated
     ↓
User can sign in
```

### Sign-In Flow
```
User enters email/password
     ↓
Supabase validates credentials
     ↓
Session created (stored in browser localStorage)
     ↓
Redirect to /home (authenticated area)
     ↓
App detects session and shows dashboard
```

### Google OAuth Flow
```
User clicks "Sign in with Google"
     ↓
Redirected to Google login page
     ↓
User signs in with Google account
     ↓
User grants permissions to app
     ↓
Google redirects back to app with auth token
     ↓
Supabase creates/retrieves user account
     ↓
Session created
     ↓
Redirect to /home (authenticated area)
```

---

## File Locations & Code Structure

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client initialization |
| `src/pages/AuthPage.tsx` | Complete auth UI (sign-up, sign-in, password reset) |
| `src/App.tsx` | Routing and app layout |
| `.env` | Environment variables (Supabase URL and key) |

### Key Functions in AuthPage.tsx

| Function | Purpose |
|----------|---------|
| `handleSignUp()` | Create new account with email/password |
| `handleSignIn()` | Sign in with existing credentials |
| `handleGoogleSignIn()` | Initiate Google OAuth flow |
| `handleForgotPassword()` | Send password reset email |
| `checkSession()` | Check if user is already authenticated |

---

## Troubleshooting

### "Cannot create an account" - Nothing happens
**Solution:**
1. Open browser console (F12)
2. Look for error messages
3. Check if password is 8+ characters
4. Verify email format is correct
5. Check Supabase email provider is ENABLED

### "User already exists"
**Solution:**
- That email address is already registered
- Use a different email or sign in instead
- Or use password reset if you forgot password

### "Sign in with Google" doesn't work
**Solution:**
1. Verify Google OAuth credentials are added to Supabase
2. Check authorized redirect URIs include `http://localhost:5173`
3. Verify Google+ API is enabled
4. Check browser console for error details

### Email confirmation not received
**Solution:**
1. Check spam/junk folder
2. Verify email provider is configured in Supabase
3. For development: Disable "Confirm email" option temporarily
4. In Supabase Dashboard > Authentication > Email > Check SMTP settings

### Password reset email not received
**Solution:**
- Follow same steps as email confirmation troubleshooting
- Verify "Reset password" email template is enabled

---

## Next Steps

### 1. Test All Auth Flows
- ✅ Sign up with email/password
- ✅ Sign in with email/password
- ✅ Google OAuth sign-in
- ✅ Password reset flow
- ✅ Session persistence (refresh page)

### 2. Customize UI (Optional)
- Edit email templates in Supabase
- Modify auth form styling in `src/pages/AuthPage.tsx`
- Add your branding/logo

### 3. Deploy to Production
- Update Google OAuth redirect URIs to your domain
- Update Supabase settings for production
- Set email confirmation to ON for security
- Configure proper email delivery (SMTP)

### 4. Protect Routes (Optional)
- Add route guards to prevent unauthorized access
- Check session before showing protected pages
- Redirect to /auth if not authenticated

---

## Code Implementation Details

### Current Features

**Session Check on Mount:**
```typescript
useEffect(() => {
  checkSession();
}, []);
```
Checks if user is already logged in when page loads.

**Auth State Listener:**
```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (session) {
        navigate("/home"); // Redirect to dashboard
      }
    }
  );
  return () => subscription?.unsubscribe();
}, [navigate]);
```
Monitors auth changes and redirects authenticated users.

**Sign-Up Validation:**
- Email required and valid format
- Password required and 8+ characters
- Confirm password must match password
- Uses Supabase built-in validation

---

## Support & Resources

- **Supabase Docs:** https://supabase.com/docs/guides/auth
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Google Cloud Console:** https://console.cloud.google.com/
- **Your Project:** https://app.supabase.com/projects/ivyfxbgnqqkiwbufszpw

---

## Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Preview production build
npm run preview
```

---

## Summary

Your authentication system is **fully implemented and ready to use**. The main tasks now are:

1. **Email/Password:** Enable & test email provider in Supabase
2. **Google OAuth:** Create Google credentials and add to Supabase
3. **Test:** Try all auth flows (sign-up, sign-in, password reset, Google)
4. **Configure:** Adjust Supabase settings for your needs
5. **Deploy:** Move to production with proper security settings

All code is already in place. Follow this guide to configure Supabase and test each flow.
