-- ============================================================================
-- DATA MIGRATION SCRIPT
-- ============================================================================
-- This script migrates data from JSON files to Supabase tables
-- Run this AFTER running complete-schema.sql
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: Customer Profiles (from data/customer-profiles.json)
-- ============================================================================
-- Source: data/customer-profiles.json
-- Fields: id, userId, fullName, gender, mobileNumber, whatsappNumber, email, address, city, pincode, createdAt, updatedAt

INSERT INTO customer_profiles (id, user_id, full_name, gender, mobile_number, whatsapp_number, email, address, city, pincode, created_at, updated_at)
VALUES 
  -- Example from data/customer-profiles.json:
  ('32406520-fd8d-4f43-98ab-cb2a26d2c334'::uuid, 'user_vaghasiyadev84@gmail.com', 'VAGHASIYA DEV', 'Male', '6353628633', '6353628633', 'vaghasiyadev84@gmail.com', '49, SHREEJI NAGAR 2, DABHOLI CHAAR RASTA, KATARGAM, SURAT.', 'Surat', '395004', '2026-03-10T15:56:26.348Z', '2026-03-10T15:56:26.348Z')
ON CONFLICT (user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  updated_at = EXCLUDED.updated_at;

-- ============================================================================
-- MIGRATION 2: Customer Chat Messages (from data/customer-chat-messages.json)
-- ============================================================================
-- Source: data/customer-chat-messages.json
-- Fields: id, userId, name, email, phone, senderRole, senderName, message, attachment, status, createdAt

WITH source_messages AS (
  SELECT *
  FROM (
    VALUES
      -- Example from data/customer-chat-messages.json:
      ('35ef47d7-5361-4d0d-b08c-5705194e9c85'::uuid, 'user_deeppatel172002@gmail.com', 'Deep Patel', 'deeppatel172002@gmail.com', '919510621217', 'customer', 'Deep Patel', 'ok the deliverly given tommorew', NULL::jsonb, 'received', '2026-03-09T13:27:30.435Z'::timestamptz),
      ('27d17e37-f6df-409e-8e70-32084a484f43'::uuid, 'user_deeppatel172002@gmail.com', 'Deep Patel', 'deeppatel172002@gmail.com', '919510621217', 'seller', 'rudraksh pharmacy', 'dccdcd', NULL::jsonb, 'read', '2026-03-10T08:58:23.898Z'::timestamptz)
  ) AS v(id, user_id, name, email, phone, sender_role, sender_name, message, attachment, status, created_at)
),
insert_threads AS (
  INSERT INTO customer_chat_threads (user_id, name, email, phone, last_message_at)
  SELECT DISTINCT
    NULLIF(TRIM(sm.user_id), ''),
    NULLIF(TRIM(sm.name), ''),
    NULLIF(TRIM(sm.email), ''),
    NULLIF(TRIM(sm.phone), ''),
    sm.created_at
  FROM source_messages sm
  WHERE COALESCE(NULLIF(TRIM(sm.user_id), ''), NULLIF(TRIM(sm.email), ''), NULLIF(TRIM(sm.phone), '')) IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM customer_chat_threads t
      WHERE COALESCE(NULLIF(TRIM(t.user_id), ''), '') = COALESCE(NULLIF(TRIM(sm.user_id), ''), '')
        AND COALESCE(NULLIF(LOWER(TRIM(t.email)), ''), '') = COALESCE(NULLIF(LOWER(TRIM(sm.email)), ''), '')
        AND COALESCE(NULLIF(TRIM(t.phone), ''), '') = COALESCE(NULLIF(TRIM(sm.phone), ''), '')
    )
)
INSERT INTO customer_chat_messages (
  id,
  thread_id,
  user_id,
  name,
  email,
  phone,
  sender_role,
  sender_name,
  message,
  attachment,
  status,
  created_at
)
SELECT
  sm.id,
  thread_ref.id AS thread_id,
  sm.user_id,
  sm.name,
  sm.email,
  sm.phone,
  sm.sender_role,
  sm.sender_name,
  sm.message,
  sm.attachment,
  sm.status,
  sm.created_at
FROM source_messages sm
JOIN LATERAL (
  SELECT t.id
  FROM customer_chat_threads t
  WHERE (
    NULLIF(TRIM(sm.user_id), '') IS NOT NULL
    AND t.user_id = NULLIF(TRIM(sm.user_id), '')
  )
  OR (
    NULLIF(TRIM(sm.email), '') IS NOT NULL
    AND LOWER(t.email) = LOWER(NULLIF(TRIM(sm.email), ''))
  )
  OR (
    NULLIF(TRIM(sm.phone), '') IS NOT NULL
    AND t.phone = NULLIF(TRIM(sm.phone), '')
  )
  ORDER BY t.updated_at DESC, t.created_at DESC
  LIMIT 1
) thread_ref ON TRUE
ON CONFLICT (id) DO UPDATE SET
  thread_id = EXCLUDED.thread_id,
  user_id = EXCLUDED.user_id,
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  sender_role = EXCLUDED.sender_role,
  sender_name = EXCLUDED.sender_name,
  message = EXCLUDED.message,
  attachment = EXCLUDED.attachment,
  status = EXCLUDED.status,
  created_at = EXCLUDED.created_at;

-- ============================================================================
-- MIGRATION 3: Login Activities (from data/login-activities.json)
-- ============================================================================
-- Source: data/login-activities.json
-- Fields: id, userId, loginMethod, name, email, identifier, phone, address, city, pincode, userAgent, ipAddress, loggedInAt

INSERT INTO login_activities (id, user_id, login_method, name, email, identifier, phone, address, city, pincode, user_agent, ip_address, logged_in_at)
VALUES
  -- Example from data/login-activities.json:
  ('78000ddf-a7f6-47e5-a6a8-2aa0e68c03f5'::uuid, 'user_vaghasiyadev84@gmail.com', 'manual', 'VAGHASIYA DEV', 'vaghasiyadev84@gmail.com', 'vaghasiyadev84@gmail.com', '916353628633', '', '', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '::1', '2026-03-10T15:55:19.000Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- MIGRATION 4: Orders (Initialize Empty Table)
-- ============================================================================
-- Note: Orders table is empty initially
-- Orders will be created when customers checkout:
-- - POST /checkout endpoint will insert new orders
-- - Admin panel will display orders at /admin/section/orders

-- Example insert (schema-aware: supports both old snake_case and new camelCase columns)
-- Uncomment this whole block to test:
-- DO $$
-- BEGIN
--   IF EXISTS (
--     SELECT 1 FROM information_schema.columns
--     WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'userId'
--   ) THEN
--     EXECUTE $$
--       INSERT INTO orders (id, "userId", "totalAmount", "itemCount", items, "deliveryStatus", currency, notes)
--       VALUES (uuid_generate_v4(), 'user_vaghasiyadev84@gmail.com', 1234.50, 3,
--       '[{"productId": 123, "qty": 2}, {"productId": 456, "qty": 1}]'::jsonb, 'pending', 'INR', 'Express delivery')
--     $$;
--   ELSIF EXISTS (
--     SELECT 1 FROM information_schema.columns
--     WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'user_id'
--   ) THEN
--     EXECUTE $$
--       INSERT INTO orders (id, user_id, total_amount, item_count, items, delivery_status, currency, notes)
--       VALUES (uuid_generate_v4(), 'user_vaghasiyadev84@gmail.com', 1234.50, 3,
--       '[{"productId": 123, "qty": 2}, {"productId": 456, "qty": 1}]'::jsonb, 'pending', 'INR', 'Express delivery')
--     $$;
--   ELSE
--     RAISE NOTICE 'orders table exists but expected user id columns were not found';
--   END IF;
-- END $$;

-- ============================================================================
-- MIGRATION 5: Message Statuses (from backend/data/message-status.json)
-- ============================================================================
-- Source shape:
-- {
--   "messages": {
--     "<message-id>": "read|not-read"
--   }
-- }
--
-- This block shows example inserts. Replace values with your export as needed.
INSERT INTO message_statuses (message_id, status, source, metadata)
VALUES
  ('example-message-id-1', 'read', 'contact_submissions', '{}'::jsonb),
  ('example-message-id-2', 'not-read', 'contact_submissions', '{}'::jsonb)
ON CONFLICT (message_id) DO UPDATE SET
  status = EXCLUDED.status,
  source = EXCLUDED.source,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- SUMMARY OF MIGRATIONS
-- ============================================================================
-- ✅ customer_profiles: Ready for data insert
-- ✅ customer_chat_messages: Ready for data insert  
-- ✅ login_activities: Ready for data insert
-- ✅ orders: Ready for checkout integration
-- ✅ reviews: Will be populated when users submit reviews
-- ✅ contact_submissions: Will be populated from contact form
-- ✅ message_statuses: Stores read/not-read status map in Supabase
-- ✅ banners: Create via admin panel
-- ✅ page_content: Create via admin panel
-- ✅ admin_users: Create via /admin/signup endpoint
-- ✅ prescriptions: Optional - currently file-based

-- ============================================================================
-- NEXT STEPS
-- ============================================================================
-- 1. Run this migration script in Supabase SQL Editor (after complete-schema.sql)
-- 2. Verify data in each table:
--    SELECT COUNT(*) FROM customer_profiles;
--    SELECT COUNT(*) FROM customer_chat_messages;
--    SELECT COUNT(*) FROM login_activities;
-- 3. Test backend endpoints:
--    GET /api/v1/orders/user/:userId
--    GET /api/v1/reviews/{product_id}
--    POST /api/contact
-- 4. Access admin panel at /admin for order management
