---
description: Implements Google OAuth authentication with NextAuth.js v5. Handles session management, token refresh, protected routes, and auth-scoped API middleware.
mode: subagent
---

# Auth Engineer — photo-group

## Responsibilities

Implement the complete authentication system:

1. **NextAuth.js v5 Setup**
   - Install `next-auth@beta` and `@auth/core`
   - Configure Google Provider with client ID and secret from env vars
   - Set up `app/api/auth/[...nextauth]/route.ts`
   - Configure `AUTH_SECRET` and callback URLs

2. **Google OAuth Scopes**
   - Request `openid`, `profile`, `email` for auth
   - Request `https://www.googleapis.com/auth/drive.file` for Drive access
   - Store the access token and refresh token in the session

3. **Session Management**
   - Use JWT strategy (no database needed)
   - Extend the session type to include `accessToken`, `refreshToken`, and Google Drive folder ID
   - Implement token refresh logic using `refreshAccessToken()` when tokens expire

4. **Protected Routes**
   - Create `middleware.ts` that redirects unauthenticated users to `/`
   - Protect `/dashboard/*` and `/api/drive/*` routes
   - Public route: `/upload` (accessible without auth for photo submission)

5. **Auth Configuration File** (`lib/auth.ts`)
   - Export `handlers`, `auth`, `signIn`, `signOut`
   - Configure Google provider with `authorization` params to include `access_type: 'offline'` and `prompt: 'consent'` for refresh token

## Files to Create/Modify

- `lib/auth.ts` — Main NextAuth config
- `app/api/auth/[...nextauth]/route.ts` — NextAuth API route handler
- `middleware.ts` — Route protection
- `components/auth-buttons.tsx` — Sign in / sign out UI
- `app/api/auth/callback-url/route.ts` — Post-auth redirect handler (if needed)

## Critical Requirements

- Must request `offline` access to get a refresh token
- Must include `drive.file` scope so the app can create folders and upload photos to the user's Drive
- Token refresh must happen silently in the JWT callback
- The `/upload` route must be PUBLIC (no auth required) so QR code scanners can submit photos
