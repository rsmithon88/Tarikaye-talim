# আরবি ও বাংলা তরিকায় তালিম — Book Reading App

## Overview
A Bengali book reading mobile/web app (Expo React Native) for "ইকরা তালিমুল কুরআন বোর্ড বাংলাদেশ, এলেঙ্গা, টাঙ্গাইল". Public users read books/chapters; admin manages content via `/admin` panel.

## Architecture
- **Frontend (Mobile)**: Expo React Native with Expo Router file-based routing (port 8081)
- **Backend**: Express.js API server (port 5000)
- **Database**: PostgreSQL via `pg` library
- **Admin Panel**: Web-based HTML/JS served at `/admin` route
- **Font**: SolaimanLipi (Bengali) loaded via expo-font (mobile) and web CSS

## Key Files

### Mobile App
- `app/_layout.tsx` - Root layout with Stack navigation, SolaimanLipi font loading
- `app/(tabs)/_layout.tsx` - Tab layout (4 tabs: Home, Library, Bookmarks, Settings)
- `app/(tabs)/index.tsx` - Home screen: books list with gradient cards, dynamic org name
- `app/(tabs)/library.tsx` - Library: upcoming/available books list
- `app/(tabs)/bookmarks.tsx` - Bookmarks: saved reading positions
- `app/(tabs)/settings.tsx` - Settings: developer info, refresh, support form
- `app/book/[id].tsx` - Book detail: chapters list
- `app/chapter/[id].tsx` - Chapter reader: font size controls, bookmark button
- `app/developer.tsx` - Developer info screen
- `components/LoadingSpinner.tsx` - Custom animated loading spinner
- `lib/device-id.ts` - Anonymous device ID for bookmarks
- `lib/query-client.ts` - React Query client with API helpers
- `constants/colors.ts` - Theme colors (navy/gold/cream)

### Backend
- `server/index.ts` - Express server entry (registerRoutes before static)
- `server/routes.ts` - All API routes (books, chapters, settings, library, bookmarks, support)
- `server/storage.ts` - Database operations
- `server/templates/admin.html` - Admin panel SPA
- `shared/schema.ts` - Drizzle ORM schema

## Database Tables
- `books` - Published books with chapters
- `chapters` - Chapter content (FK to books)
- `settings` - Key-value settings (org_name, org_subtitle, dev_*)
- `library_books` - Library catalog (upcoming/available books)
- `bookmarks` - User reading bookmarks (device_id based)
- `support_messages` - Support messages from users to admin
- `users` - Admin users (not actively used, password is env-based)

## API Routes
- Public: GET /api/books, /api/books/:id, /api/books/:id/chapters, /api/chapters/:id, /api/settings, /api/library, /api/bookmarks, POST /api/bookmarks, DELETE /api/bookmarks/:id, POST /api/support
- Admin: /api/admin/* (books, chapters, settings, library, support CRUD)
- Admin auth: POST /api/admin/login, X-Admin-Token header

## Config
- Admin password: env ADMIN_PASSWORD or "admin123"
- Production URL: content-manager-rsmithon88.replit.app
- Body size limit: 5MB (base64 photo uploads)
- CORS: Content-Type, x-admin-token headers
- Build: `EXPO_PUBLIC_DOMAIN=$REPLIT_INTERNAL_APP_DOMAIN npx expo export --platform web && npm run expo:static:build && npm run server:build`
