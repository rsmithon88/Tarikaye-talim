# পাঠশালা — Book Reading App

## Overview
A mobile book reading app (Expo React Native) with a web-based admin panel for content management.

## Architecture
- **Frontend (Mobile)**: Expo React Native with Expo Router file-based routing (port 8081)
- **Backend**: Express.js API server (port 5000)
- **Database**: PostgreSQL via `pg` library
- **Admin Panel**: Web-based HTML/JS served at `/admin` route

## Key Files

### Mobile App
- `app/_layout.tsx` - Root layout with Stack navigation
- `app/(tabs)/_layout.tsx` - Tab layout (single tab)
- `app/(tabs)/index.tsx` - Home screen: books list with gradient cards
- `app/book/[id].tsx` - Book detail: chapters list with gradient cards
- `app/chapter/[id].tsx` - Chapter reader: clean reading experience with font size controls
- `constants/colors.ts` - Theme colors (navy/gold/cream)
- `lib/query-client.ts` - React Query setup for API calls

### Backend
- `server/index.ts` - Express server setup with CORS, static files
- `server/routes.ts` - API routes (public + admin)
- `server/storage.ts` - Database operations (books/chapters CRUD)
- `server/templates/admin.html` - Admin panel HTML
- `server/templates/landing-page.html` - Landing page

### Database
- `books` table: id, title, description, author, cover_color, cover_accent, published, sort_order
- `chapters` table: id, book_id, title, content, sort_order

## API Routes
### Public
- `GET /api/books` - List published books
- `GET /api/books/:id` - Book detail
- `GET /api/books/:id/chapters` - Chapters of a book
- `GET /api/chapters/:id` - Chapter detail

### Admin (requires X-Admin-Token header)
- `POST /api/admin/login` - Login with password
- `GET/POST/PUT/DELETE /api/admin/books` - Books CRUD
- `GET/POST /api/admin/books/:id/chapters` - Chapter management
- `PUT/DELETE /api/admin/chapters/:id` - Chapter update/delete

## Admin Panel
- URL: `/admin`
- Default password: `admin123` (change via ADMIN_PASSWORD env var)
- Features: Create/edit/delete books and chapters

## User Preferences
- Language: Bengali (বাংলা)
- Design style: Gradient cards, clean mobile UI
