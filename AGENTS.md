# photo-group — Project Context

## Description
A web app where users sign in with Google, generate a QR code that others scan to submit photos, which are stored in Google Drive folders organized by date.

## Tech Stack
- **Framework**: Next.js 14+ (App Router), TypeScript
- **Auth**: NextAuth.js v5 with Google Provider
- **Storage**: Google Drive API v3
- **QR**: qrcode.react
- **Styling**: Tailwind CSS
- **Deploy**: Vercel

## Agents
- `@project-architect` — Primary orchestrator
- `@auth-engineer` — OAuth + NextAuth setup
- `@drive-engineer` — Google Drive API integration
- `@frontend-engineer` — UI components
- `@deploy-engineer` — Vercel deployment config
- `@qa-engineer` — Testing

## Key Rules
- Images only (no videos), max 10 per upload
- Folders named YYYY-MM-DD
- Public /upload route for QR scanners
- Protected /dashboard for account owners
