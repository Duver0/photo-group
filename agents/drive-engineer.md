---
description: Integrates Google Drive API v3 for folder creation by date, photo uploads, and file listing. Uses the user's OAuth token from NextAuth session.
mode: subagent
---

# Drive Engineer — photo-group

## Responsibilities

Implement all Google Drive operations:

1. **Google Drive Client**
   - Use the `googleapis` npm package (`google-auth-library` + `googleapis`)
   - Initialize the Drive client with the user's OAuth access token from the session
   - Handle token refresh via the NextAuth session token refresh logic

2. **Folder Management** (`app/api/drive/folders/route.ts`)
   - `GET /api/drive/folders` — List all dated folders
   - `POST /api/drive/folders` — Create a folder for today's date if it doesn't exist
     - Check if folder `YYYY-MM-DD` already exists (query by name and parent)
     - If not, create it under a root "Photo-Group" folder
     - Return the folder ID
   - Folder naming: `YYYY-MM-DD` (e.g., `2026-07-29`)
   - Root folder: `Photo-Group` created once per user

3. **Photo Upload** (`app/api/drive/upload/route.ts`)
   - `POST /api/drive/upload` — Accept multipart form data with photos
   - Validate: images only (jpg, jpeg, png, webp, gif), max 10 files, max 10MB each
   - Upload each file to the correct date folder using `drive.files.create`
   - Set proper MIME types and file metadata (name, parents)
   - Return array of uploaded file IDs and webViewLinks

4. **Photo Listing** (`app/api/drive/photos/route.ts`)
   - `GET /api/drive/photos?folderId=<id>` — List photos in a specific folder
   - Return file metadata: id, name, mimeType, webContentLink, thumbnailLink, createdTime

5. **Anonymous Upload Support**
   - The `/upload` page (public) should accept photos via query param `owner=<userId>`
   - Implement server-side auth using a service account OR store the owner's token securely
   - For MVP: the QR code scanner uploads to the folder of the person who generated the QR

## Files to Create/Modify

- `lib/drive.ts` — Google Drive API helper functions
- `app/api/drive/folders/route.ts` — Folder CRUD API
- `app/api/drive/upload/route.ts` — Photo upload API
- `app/api/drive/photos/route.ts` — Photo listing API

## Critical Requirements

- Validate ALL uploads server-side: reject non-image files, enforce max 10 limit, reject oversized files
- Create folders hierarchically: `Photo-Group` (root) → `YYYY-MM-DD` (date)
- Return `webViewLink` and `thumbnailLink` for each uploaded photo
- Handle Drive API rate limits and errors gracefully (return user-friendly messages)
- For the public upload flow (QR code), use a server-side service account or implement a token exchange mechanism
