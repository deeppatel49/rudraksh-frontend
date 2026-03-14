# DATABASE MIGRATION CHECKLIST

## Complete Schema Overview

### Tables to Create (13 Total)

#### 🟢 **Core Product Tables**
- [x] **products** - 79,057+ medicines (ALREADY EXISTS in Supabase)
  - Columns: SrNo, Item_Name, Company, Generic, ItemType, Category, Pack, Mrp
  - Status: ✅ Already in Supabase

- [x] **reviews** - Customer product reviews
  - Source: Product detail page ratings
  - Columns: id, product_id, customer_id, rating, review_text, created_at
  - Status: ⏳ Table created, data populated when users submit reviews

#### 🔐 **Authentication & Admin Tables**
- [x] **admin_users** - Admin account credentials
  - Columns: id, full_name, email, password_hash, password_salt, is_active, created_at
  - Status: ⏳ Created via /admin/signup endpoint

- [x] **admin_sessions** - Active admin login sessions
  - Columns: id, user_id, expires_at, created_at
  - Status: ⏳ Created automatically when admin logs in

- [x] **admin_user_profiles** - Detailed admin profile info
  - Columns: id, user_id, full_name, mobile_number, gender, address, city, pincode
  - Status: ⏳ Created via admin profile update

#### 👥 **Customer Tables**
- [x] **customer_profiles** - Customer profile info
  - Source: **data/customer-profiles.json** (1 record)
  - Columns: id, user_id, full_name, gender, mobile_number, email, address, city, pincode
  - Status: 📝 Ready for migration

- [x] **customer_chat_messages** - Support chat conversations
  - Source: **data/customer-chat-messages.json** (5+ messages)
  - Columns: id, user_id, name, email, phone, sender_role, sender_name, message, status, created_at
  - Status: 📝 Ready for migration

- [x] **login_activities** - Login history tracking
  - Source: **data/login-activities.json** (2+ records)
  - Columns: id, user_id, login_method, name, email, phone, user_agent, ip_address, logged_in_at
  - Status: 📝 Ready for migration

#### 💳 **Transactional Tables**
- [x] **orders** - Customer orders
  - Columns: id, user_id, created_at, total_amount, item_count, items (JSONB), delivery_status, currency, notes
  - Status: ✅ Schema already created, ready for checkout integration

- [x] **contact_submissions** - Contact form data
  - Columns: id, name, email, phone, subject, message, status, created_at
  - Status: ⏳ Table created, populated by contact form submissions

#### 📄 **Content & Admin Tables**
- [x] **banners** - Homepage promotional banners
  - Columns: id, title, description, image_url, link_url, is_active, start_date, end_date
  - Status: ⏳ Create via admin panel

- [x] **page_content** - Dynamic page content (About, Privacy, Terms)
  - Columns: id, slug, title, description, sections (JSONB), seo_meta (JSONB), is_published
  - Status: ⏳ Create via admin panel

- [x] **prescriptions** - Customer prescription uploads (OPTIONAL)
  - Source: **backend/data/prescriptions.json**
  - Columns: id, reference_id, customer_name, mobile_number, file_name, file_url, is_verified
  - Status: 📝 Optional - currently file-based storage

---

## Step-by-Step Migration Guide

### **STEP 1: Create All Tables**
```bash
# In Supabase SQL Editor:
1. Open: https://supabase.com/dashboard
2. Go to: SQL Editor → New Query
3. Copy entire content from: backend/sql/complete-schema.sql
4. Click: RUN
5. Wait for completion (should show 13+ tables created)
```

### **STEP 2: Verify Tables Created**
```sql
-- Run in Supabase SQL Editor to verify:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Expected output (13 tables):
-- admin_sessions
-- admin_user_profiles
-- admin_users
-- banners
-- contact_submissions
-- customer_chat_messages
-- customer_profiles
-- login_activities
-- orders
-- page_content
-- prescriptions
-- products (already exists)
-- reviews
```

### **STEP 3: Migrate Existing JSON Data**
```bash
# In Supabase SQL Editor:
1. Copy entire content from: backend/sql/data-migration.sql
2. Click: RUN
3. This will migrate:
   - ✅ customer_profiles (1 record)
   - ✅ customer_chat_messages (5+ messages)
   - ✅ login_activities (2+ records)
```

### **STEP 4: Verify Data Migration**
```sql
-- Run these queries to verify data:
SELECT COUNT(*) as profile_count FROM customer_profiles;
-- Expected: 1 (currently)

SELECT COUNT(*) as message_count FROM customer_chat_messages;
-- Expected: 5+ (depending on data)

SELECT COUNT(*) as login_count FROM login_activities;
-- Expected: 2+ (depending on history)

SELECT COUNT(*) as products FROM products;
-- Expected: 79057+

SELECT COUNT(*) as reviews FROM reviews;
-- Expected: 0 (until users submit reviews)
```

### **STEP 5: Start Backend Server**
```bash
# In terminal (workspace root):
cd backend
npm run dev
# or
npm start
```

### **STEP 6: Test API Endpoints**

#### Test Customer Profiles
```bash
curl http://localhost:5000/api/v1/customer-profile/user_vaghasiyadev84@gmail.com
```

#### Test Orders Endpoint
```bash
curl http://localhost:5000/api/v1/orders
```

#### Test Reviews
```bash
curl "http://localhost:5000/api/v1/reviews?product_id=123"
```

#### Test Chat Messages
```bash
curl "http://localhost:5000/api/v1/customer-chat/user_vaghasiyadev84@gmail.com"
```

#### Test Login Activities
```bash
curl "http://localhost:5000/api/v1/login-activities/user_vaghasiyadev84@gmail.com"
```

### **STEP 7: Verify Admin Panel**
```bash
1. Navigate to: http://localhost:3000/admin/login
2. Enter credentials created via /admin/signup
3. Go to: Admin Dashboard → Orders (should show orders from database)
4. Go to: Admin Dashboard → Contact Submissions (should show contact form entries)
```

---

## Data Flow Diagram

```
Frontend (Next.js)
    ↓
API Endpoints (/api/v1/*)
    ↓
Backend Controllers
    ↓
Backend Services (normalize, validate)
    ↓
Backend Repositories (DB queries)
    ↓
Supabase PostgreSQL ← THIS STEP: Run migration scripts here
    │
    ├── products (79,057 medicines)
    ├── reviews (product ratings)
    ├── orders (checkout → stored here)
    ├── customer_profiles (migrated from JSON)
    ├── customer_chat_messages (migrated from JSON)
    ├── login_activities (migrated from JSON)
    ├── contact_submissions (forms)
    ├── admin_users (auth)
    ├── banners (content)
    └── page_content (SEO pages)
```

---

## File Locations

### Migration Scripts
- `backend/sql/complete-schema.sql` - Main schema with all 13 tables
- `backend/sql/data-migration.sql` - Data migration from JSON files
- `backend/sql/orders-schema.sql` - Orders table only (subset)

### Data Sources
- `data/customer-profiles.json` - 1 customer profile
- `data/customer-chat-messages.json` - 5+ chat messages
- `data/login-activities.json` - 2+ login records
- `backend/data/prescriptions.json` - Prescription uploads (optional)

### Backend Repositories (Row Layer Access)
- `backend/src/repositories/admin_users.js` - Admin auth
- `backend/src/repositories/auth.repository.js` - Sessions
- `backend/src/repositories/profile.repository.js` - Admin profiles
- `backend/src/repositories/orders.repository.js` - Orders ✅ NEW
- `backend/src/repositories/reviews.repository.js` - Reviews
- `backend/src/repositories/contact.repository.js` - Contact submissions
- `backend/src/repositories/banners.repository.js` - Banners
- `backend/src/repositories/products.repository.js` - Products (existing, 79k+)

---

## Troubleshooting

### ❌ Error: "relation 'orders' does not exist"
**Solution:** Run `backend/sql/complete-schema.sql` in Supabase SQL Editor first

### ❌ Error: "duplicate key value violates unique constraint"
**Solution:** Data already exists. Use `ON CONFLICT DO UPDATE` to overwrite

### ❌ Error: "permission denied for schema public"
**Solution:** Ensure you're using service role key with full permissions

### ❌ Backend won't start
**Solution:** 
1. Check `.env.local` has valid SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
2. Verify tables exist: Run count queries in Supabase
3. Check backend logs for detailed error messages

### ❌ Admin panel shows "No orders"
**Solution:**
1. Verify `orders` table exists in Supabase
2. Check if any orders have been created (should be empty initially)
3. Try creating a test order via checkout endpoint

---

## What's Next

After migration, you can:

1. **Test Checkout Flow** → Creates orders in database
2. **Update Frontend** → Call backend APIs instead of localStorage
3. **Setup Admin Panel** → Create admin user, manage orders/content
4. **Enable RLS** → Fine-tune row-level security policies
5. **Create Test Data** → Populate banners, page content, reviews

---

## Quick Reference: Table Relationships

```
admin_users (1) ──→ (many) admin_sessions
           │
           └────→ (one) admin_user_profiles

products (1) ──→ (many) reviews

customer_profiles (1) ──→ (many) orders
                    ├────→ (many) customer_chat_messages
                    └────→ (many) login_activities

contact_submissions (standalone)
banners (standalone)
page_content (standalone)
prescriptions (standalone)
```

---

## Summary

| Step | Task | Status | Command |
|------|------|--------|---------|
| 1 | Create tables | ⏳ Pending | Run `complete-schema.sql` in Supabase |
| 2 | Migrate JSON data | ⏳ Pending | Run `data-migration.sql` in Supabase |
| 3 | Verify data | ⏳ Pending | Run count() queries in Supabase |
| 4 | Start backend | ⏳ Pending | `npm run dev` in backend/ |
| 5 | Test endpoints | ⏳ Pending | `curl` commands above |
| 6 | Verify admin panel | ⏳ Pending | Navigate to /admin/login |

---

**Created:** March 10, 2026  
**Status:** Ready for migration  
**Estimated Time:** 10-15 minutes
