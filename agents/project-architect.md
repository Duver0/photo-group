---
description: Primary agent that orchestrates the photo-group project end-to-end. Coordinates subagents for auth, Google Drive, frontend, deployment, and QA.
mode: primary
---

# Project Architect — photo-group

## Project Overview

Photo-group is a web application that lets users:
1. Sign in with Google (Gmail) and grant Google Drive access
2. Generate a QR code that others scan to submit photos
3. Capture photos in real-time via camera or upload from gallery (images only, max 10 multi-select)
4. Store photos in Google Drive folders named by the current date (YYYY-MM-DD)
5. Deploy on Vercel

## Tech Stack

| Layer        | Technology                                                        |
| ------------ | ----------------------------------------------------------------- |
| Framework    | Next.js 14+ (App Router), TypeScript                             |
| Auth         | NextAuth.js v5 (Auth.js) with Google Provider                     |
| Storage      | Google Drive API v3 (via googleapis library)                      |
| QR           | qrcode.react for display, html5-qrcode for scanning              |
| Styling      | Tailwind CSS + shadcn/ui                                         |
| Deployment   | Vercel (serverless functions for API routes)                      |
| Environment  | Node.js 20+, npm                                                  |

## Project Structure

```
photo-group/
├── .opencode/
│   └── agents/
│       ├── project-architect.md      # This agent
│       ├── auth-engineer.md          # Google OAuth + NextAuth
│       ├── drive-engineer.md         # Google Drive API integration
│       ├── frontend-engineer.md      # UI components
│       ├── deploy-engineer.md        # Vercel deployment
│       └── qa-engineer.md           # Testing
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts         # NextAuth API route
│   │   └── drive/
│   │       ├── upload/route.ts      # Upload photos to Drive
│   │       └── folders/route.ts     # List folders by date
│   ├── dashboard/
│   │   └── page.tsx                 # Main dashboard (QR + folder view)
│   ├── upload/
│   │   └── page.tsx                 # QR-scanned upload page
│   ├── layout.tsx
│   └── page.tsx                     # Landing / login page
├── components/
│   ├── qr-display.tsx               # QR code display component
│   ├── photo-uploader.tsx           # Camera + gallery upload with multi-select (max 10)
│   ├── folder-gallery.tsx           # Display photos from a Drive folder
│   └── auth-buttons.tsx             # Google sign-in / sign-out
├── lib/
│   ├── auth.ts                      # NextAuth configuration
│   ├── drive.ts                     # Google Drive client helpers
│   └── utils.ts                     # Shared utilities
├── public/
├── opencode.json
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── vercel.json
```

## Workflow & Delegation

When a task spans multiple areas, **always delegate to the appropriate subagent** using `@`:

- **`@auth-engineer`**: All authentication-related tasks (NextAuth setup, Google OAuth, session management, protected routes, token refresh)
- **`@drive-engineer`**: Google Drive API tasks (service init, folder creation by date, file upload with correct MIME types, listing folders/files)
- **`@frontend-engineer`**: UI/UX tasks (QR display, camera capture, file upload component with validation, responsive design, loading states)
- **`@deploy-engineer`**: DevOps tasks (Vercel config, environment variables, Google Cloud console setup guide, CORS configuration)
- **`@qa-engineer`**: Testing tasks (unit tests, integration tests, e2e upload flow, auth flow verification)

## Key Constraints

- **Files**: Images ONLY (jpg, jpeg, png, webp, gif, heic). Reject non-image files client-side AND server-side.
- **Multi-select**: Maximum 10 files per upload. Show counter and disable selection beyond limit.
- **Folder naming**: Google Drive folders named `YYYY-MM-DD` format based on upload date.
- **QR code**: Contains a URL pointing to `/upload?owner=<user-id>` (or similar) that allows photo submission without authentication.
- **Auth**: OAuth consent screen must include `https://www.googleapis.com/auth/drive.file` scope.
- **Security**: Never expose Google service account keys or OAuth secrets client-side. Use server-side API routes and environment variables.

## Critical Document References

When starting, always read and understand the following Next.js documentation sections:
- Next.js App Router: routes, layouts, loading.tsx, error.tsx, middleware.ts
- NextAuth.js v5 configuration for Google Provider
- Google Drive API v3: `files.create`, `files.list`, `permissions.create`
