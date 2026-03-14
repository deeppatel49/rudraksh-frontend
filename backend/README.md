# Rudraksh Backend (Express + Supabase)

Separate backend service for the Rudraksh e-commerce frontend.

## Features
- Product (medicine) APIs with pagination and filtering
- Product/home review APIs
- Contact form submission API
- Home/About CMS content APIs
- SEO metadata API endpoint
- Backend auth APIs (sign-up, sign-in, me, sign-out)
- Authenticated admin profile APIs (view/update own profile + recent login sessions)
- Protected backend dashboard summary API
- Supabase-backed persistence

## Setup
1. Copy `.env.example` to `.env`.
2. Fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
3. Optional: set `AUTH_SESSION_HOURS` (defaults to `24`).
4. Install dependencies:
   - `npm install`
5. Run development server:
   - `npm run dev`
   - On Windows PowerShell, if script execution blocks `npm.ps1`, use `npm.cmd run dev`
   - On Windows, you can also run `backend\start-dev-server.bat`

## API Base
- `http://localhost:5000/api/v1`

## Main Endpoints
- `GET /products?cat=All&q=paracetamol&page=1&limit=50`
- `GET /products/:id`
- `GET /reviews/home`
- `POST /reviews/home`
- `GET /reviews/:productId`
- `POST /reviews/:productId`
- `POST /contact`
- `GET /content/home`
- `GET /content/about`
- `GET /content/seo/:pageSlug`
- `POST /auth/sign-up`
- `POST /auth/sign-in`
- `GET /auth/me` (requires `Authorization: Bearer <token>`)
- `POST /auth/sign-out` (requires `Authorization: Bearer <token>`)
- `GET /profile/me` (requires `Authorization: Bearer <token>`)
- `PATCH /profile/me` (requires `Authorization: Bearer <token>`)
- `GET /dashboard/summary` (requires `Authorization: Bearer <token>`)
- `GET /message-status?ids=<id1,id2>`
- `POST /message-status` (single or bulk upsert)
- `PATCH /message-status/:messageId`

## Legacy Message Status Migration

If you have legacy data in `backend/data/message-status.json`, run:

- `npm run migrate:message-status`

This migrates the `messages` map into Supabase table `message_statuses`.
