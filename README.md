# Rudraksh Pharmacy

Rudraksh Pharmacy is a full-stack e-commerce platform for medicines and healthcare products.

It includes:
- A modern customer-facing storefront built with Next.js
- A dedicated Express backend for APIs and admin operations
- Supabase as the primary database and storage layer
- Admin dashboard capabilities for products, orders, reviews, and content workflows

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Supabase JS client

### Backend
- Node.js + Express 4
- Supabase (service role) integration
- EJS-based admin views
- Zod validation

## Repository Structure

```text
.
|-- app/
|   |-- about/
|   |-- admin/
|   |   |-- dashboard/
|   |   |-- login/
|   |   |-- signup/
|   |   `-- layout.js
|   |-- api/
|   |   |-- about/
|   |   |-- auth/otp/send/
|   |   |-- auth/otp/verify/
|   |   |-- contact/
|   |   |-- customer-chat/
|   |   |-- home/
|   |   |-- login-activity/
|   |   |-- media/[...path]/
|   |   |-- medicines/
|   |   |-- prescriptions/
|   |   |   `-- share/resolve/
|   |   `-- reviews/
|   |       |-- home/
|   |       `-- [productId]/
|   |-- blog/
|   |   `-- [id]/
|   |-- cart/
|   |-- checkout/
|   |-- components/
|   |   |-- cart-sidebar.jsx
|   |   |-- cart-view.jsx
|   |   |-- checkout-view.jsx
|   |   |-- conditional-layout.jsx
|   |   |-- contact-inquiry-form.jsx
|   |   |-- create-review-form.jsx
|   |   |-- customer-profile-view.jsx
|   |   |-- forgot-password-flow.jsx
|   |   |-- home-campaign-carousel.jsx
|   |   |-- home-featured-brands.jsx
|   |   |-- home-personal-care-grid.jsx
|   |   |-- home-reviews-marquee.jsx
|   |   |-- home-reviews-section.jsx
|   |   |-- home-search-strip.jsx
|   |   |-- login-form.jsx
|   |   |-- map-component.jsx
|   |   |-- product-detail-actions.jsx
|   |   |-- product-detail-image.jsx
|   |   |-- product-detail-view.jsx
|   |   |-- product-grid.jsx
|   |   |-- product-reviews-view.jsx
|   |   |-- profile-setup-view.jsx
|   |   |-- quick-order-processing-view.jsx
|   |   |-- quick-order-view.jsx
|   |   |-- site-footer.jsx
|   |   |-- site-header.jsx
|   |   |-- store-locator-view.jsx
|   |   `-- whatsapp-float.jsx
|   |-- contact/
|   |-- context/
|   |   |-- admin-auth-context.jsx
|   |   |-- auth-context.jsx
|   |   `-- cart-context.jsx
|   |-- data/
|   |-- forgot-password/
|   |-- hooks/
|   |-- img/
|   |-- lib/
|   |   |-- services/
|   |   |-- utils/
|   |   |-- admin-api.js
|   |   |-- backend-api.js
|   |   |-- csv-parser.js
|   |   |-- order-client.js
|   |   |-- otp-store.js
|   |   |-- prescription-share.js
|   |   |-- reviews-db.js
|   |   `-- supabase-client.js
|   |-- login/
|   |-- medicine/
|   |-- orders/
|   |-- privacy/
|   |-- products/
|   |   `-- [id]/
|   |       |-- review/
|   |       `-- reviews/
|   |-- products-list/
|   |-- profile/
|   |   `-- setup/
|   |-- quick-order/
|   |   `-- process/
|   |-- reviews/
|   |-- store-locator/
|   |-- terms/
|   |-- globals.css
|   |-- layout.js
|   |-- page.js
|   |-- robots.js
|   `-- sitemap.js
|-- backend/
|   |-- backend/data/
|   |-- data/
|   |-- public/
|   |   `-- uploads/
|   |       |-- images/
|   |       `-- videos/
|   |-- scripts/
|   |   `-- dev-runner.js
|   |-- sql/
|   |   |-- complete-schema.sql
|   |   |-- data-migration.sql
|   |   |-- MIGRATION_GUIDE.md
|   |   `-- orders-schema.sql
|   |-- src/
|   |   |-- config/
|   |   |   |-- env.js
|   |   |   |-- multer.js
|   |   |   `-- supabase.js
|   |   |-- constants/
|   |   |-- controllers/
|   |   |   |-- admin-panel.controller.js
|   |   |   |-- auth.controller.js
|   |   |   |-- contact.controller.js
|   |   |   |-- content.controller.js
|   |   |   |-- dashboard.controller.js
|   |   |   |-- orders.controller.js
|   |   |   |-- products.controller.js
|   |   |   |-- profile.controller.js
|   |   |   `-- reviews.controller.js
|   |   |-- middleware/
|   |   |   |-- error-handler.js
|   |   |   |-- not-found.js
|   |   |   |-- require-admin-auth.js
|   |   |   `-- session.middleware.js
|   |   |-- repositories/
|   |   |   |-- auth.repository.js
|   |   |   |-- banners.repository.js
|   |   |   |-- contact.repository.js
|   |   |   |-- content.repository.js
|   |   |   |-- dashboard.repository.js
|   |   |   |-- message-status.repository.js
|   |   |   |-- orders.repository.js
|   |   |   |-- prescription.repository.js
|   |   |   |-- products.repository.js
|   |   |   |-- profile.repository.js
|   |   |   `-- reviews.repository.js
|   |   |-- routes/
|   |   |   |-- admin-panel.routes.js
|   |   |   |-- auth.routes.js
|   |   |   |-- banners.routes.js
|   |   |   |-- contact.routes.js
|   |   |   |-- content.routes.js
|   |   |   |-- customer-chat.routes.js
|   |   |   |-- customer-profiles.routes.js
|   |   |   |-- dashboard.routes.js
|   |   |   |-- orders.routes.js
|   |   |   |-- products.routes.js
|   |   |   |-- profile.routes.js
|   |   |   `-- reviews.routes.js
|   |   |-- services/
|   |   |   |-- auth.service.js
|   |   |   |-- banners.service.js
|   |   |   |-- contact.service.js
|   |   |   |-- content.service.js
|   |   |   |-- customer-chat-events.js
|   |   |   |-- dashboard.service.js
|   |   |   |-- orders.service.js
|   |   |   |-- products.service.js
|   |   |   |-- profile.service.js
|   |   |   `-- reviews.service.js
|   |   |-- utils/
|   |   |   |-- crypto.js
|   |   |   `-- http.js
|   |   |-- views/admin/
|   |   |   `-- partials/
|   |   |-- app.js
|   |   `-- server.js
|   |-- supabase/
|   |   |-- migrations/
|   |   |-- admin-auth-schema.sql
|   |   |-- create-profile-table.sql
|   |   `-- schema.sql
|   |-- .env.example
|   |-- package.json
|   `-- README.md
|-- data/
|   |-- customer-chat-messages.json
|   |-- customer-profiles.json
|   `-- login-activities.json
|-- public/
|   |-- brands/
|   |-- prescriptions/
|   `-- products/
|-- scripts/
|   `-- import-products-to-supabase.js
|-- shared/
|   |-- customer-chat-store.js
|   |-- customer-profile-store.js
|   |-- login-activity-store.js
|   `-- package.json
|-- eslint.config.mjs
|-- generate-medicines-data.js
|-- jsconfig.json
|-- next.config.mjs
|-- package.json
|-- postcss.config.js
|-- README.md
`-- tailwind.config.js
```

## Features

- Product catalog with large dataset pagination (79k+ products)
- Product detail pages fetched via backend APIs
- Product reviews (home + product-level)
- Secure prescription upload and seller share-token flow
- Contact form submission API
- Customer profile and login activity tracking
- Customer support chat data handling
- Orders API for admin and user order history
- Admin authentication, sessions, and profile management
- CMS-like content endpoints for pages and SEO metadata

## Prerequisites

- Node.js 18+
- npm 9+
- Supabase project (URL + keys)

## Environment Variables

### Frontend (`.env.local`)

Required/commonly used:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=
MAIL_FROM=

SELLER_WEBSITE_URL=
PRESCRIPTION_SHARE_SECRET=
```

### Backend (`backend/.env`)

```env
PORT=5000
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
AUTH_SESSION_HOURS=24
FRONTEND_URL=http://localhost:3000
```

## Local Development

### 1. Install Frontend Dependencies

```bash
npm install
npm run dev
```




### 2. Run Database Schema Migration (Supabase)

In Supabase SQL Editor, run:

1. `backend/sql/complete-schema.sql`
2. `backend/sql/data-migration.sql` (optional but recommended for existing JSON data)

### 3. Start Backend

```bash
cd backend
npm run dev
```

Backend base URL:

```text
http://localhost:5000/api/v1
```

### 4. Start Frontend

In a new terminal (project root):

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

## Scripts

### Root

```bash
npm run dev            # Start Next.js dev server
npm run build          # Build frontend
npm run start          # Start frontend in production mode
npm run lint           # Lint frontend
npm run import-products # Import product catalog to Supabase
```

### Backend

```bash
cd backend
npm run dev            # Start backend (dev runner)
npm run start          # Start backend (production)
```

## Key API Endpoints

### Products
- `GET /products`
- `GET /products/:id`

### Reviews
- `GET /reviews/home`
- `POST /reviews/home`
- `GET /reviews/:productId`
- `POST /reviews/:productId`

### Orders
- `GET /orders`
- `GET /orders/:id`
- `GET /orders/user/:userId`

### Contact & Content
- `POST /contact`
- `GET /content/home`
- `GET /content/about`
- `GET /content/seo/:pageSlug`

### Auth & Admin
- `POST /auth/sign-up`
- `POST /auth/sign-in`
- `GET /auth/me`
- `POST /auth/sign-out`
- `GET /profile/me`
- `PATCH /profile/me`
- `GET /dashboard/summary`

## Prescription Share Token Flow

After a customer uploads prescription files, the app redirects to the seller website with a signed, short-lived `shareToken`.

Seller-side verification endpoint:

```http
GET /api/prescriptions/share/resolve?token=<shareToken>
```

Response includes:
- `files`
- `expiresAt`
- `source`

## Deployment Notes

- Use environment-specific `.env` values for frontend and backend
- Keep `SUPABASE_SERVICE_ROLE_KEY` strictly server-side
- Run migrations before first deployment
- Configure CORS and session settings for your production domain

## Contributing

1. Create a feature branch
2. Make focused changes
3. Run lint/tests locally
4. Open a pull request with a clear summary

## License

Private repository. All rights reserved unless explicitly stated otherwise.
