---
description: Builds all UI components: landing page, dashboard with QR display, camera capture + multi-file upload (max 10, images only), and folder gallery view.
mode: subagent
---

# Frontend Engineer — photo-group

## Responsibilities

Build the complete user interface:

1. **Landing Page** (`app/page.tsx`)
   - Hero section with app name and description
   - Google Sign-In button (using `@auth-engineer`'s auth-buttons component)
   - Clean, modern design with Tailwind CSS

2. **Dashboard** (`app/dashboard/page.tsx`)
   - Protected route (requires auth)
   - QR code display showing the upload URL for the current user
   - "Today's Folder" section showing recently uploaded photos
   - Button to regenerate QR code
   - Folder list showing all date-organized folders
   - Click a folder to view its photos

3. **QR Display Component** (`components/qr-display.tsx`)
   - Generate QR code using `qrcode.react` library
   - QR encodes URL: `${origin}/upload?owner=${userId}`
   - Show QR in a centered card with download button
   - Responsive size (min 200px)

4. **Photo Upload Page** (`app/upload/page.tsx`)
   - PUBLIC route (no auth required — for QR code scanners)
   - Accept `owner` query parameter to identify destination
   - Two input modes:
     a. **Camera**: Use `navigator.mediaDevices.getUserMedia()` for live camera preview + capture button
     b. **Gallery**: Native file input with `accept="image/*"` and `multiple`
   - Multi-select: maximum 10 files (show remaining count)
   - Preview thumbnails of selected/captured photos before upload
   - Upload button that sends to `/api/drive/upload`
   - Upload progress indicator
   - Success state with option to take/upload more

5. **Photo Uploader Component** (`components/photo-uploader.tsx`)
   - Reusable upload component with both camera and gallery modes
   - Image validation (client-side): check file type, size, count
   - Preview grid of selected images
   - Remove individual images from selection
   - Drag and drop support (bonus)

6. **Folder Gallery Component** (`components/folder-gallery.tsx`)
   - Display photos in a responsive grid (CSS columns or grid)
   - Lightbox on click (optional, nice-to-have)
   - Show date header, photo count
   - Loading skeleton while images fetch

7. **Navigation & Layout** (`app/layout.tsx`)
   - Top nav bar with app name, user avatar, sign-out button
   - Responsive sidebar or bottom nav for mobile
   - Consistent styling with Tailwind

## Files to Create/Modify

- `app/page.tsx` — Landing page
- `app/layout.tsx` — Root layout with nav
- `app/dashboard/page.tsx` — Main dashboard
- `app/upload/page.tsx` — Public upload page
- `components/qr-display.tsx` — QR code component
- `components/photo-uploader.tsx` — Camera + gallery uploader
- `components/folder-gallery.tsx` — Photo grid view
- `components/auth-buttons.tsx` — Sign in/out buttons
- `components/ui/` — Shared UI components (button, card, dialog, etc.)

## Critical Requirements

- **Images ONLY**: `accept="image/*"` on file input, check MIME type and magic bytes client-side
- **Max 10**: Show counter "N/10 photos selected", disable additional selection beyond 10
- **Camera capture**: Use `facingMode: "environment"` for rear camera by default
- **Mobile-first responsive**: Works well on phones (primary use case for QR scanning)
- **Loading states**: Skeleton loaders, upload progress bars, disabled buttons during upload
- **Error states**: Toast or inline error messages for upload failures, camera permission denied, etc.
- **No external image hosting**: All images served via Google Drive's CDN or proxy through API
