    -- ============================================================================
    -- RUDRAKSH PHARMACY - COMPLETE DATABASE SCHEMA MIGRATION
    -- ============================================================================
    -- This script creates all necessary tables for the Rudraksh Pharmacy application
    -- Run this in Supabase SQL Editor
    -- ============================================================================

    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- ============================================================================
    -- 1. PRODUCTS TABLE (79,057+ medicines)
    -- ============================================================================
    -- Status: ALREADY EXISTS in Supabase
    -- Source: Backend medicines database
    -- Note: Contains medicine information from backend/data/medicines/
    CREATE TABLE IF NOT EXISTS products (
    "SrNo" SERIAL PRIMARY KEY,
    "Item_Name" TEXT NOT NULL,
    "Company" TEXT,
    "Generic" TEXT,
    "ItemType" TEXT,
    "Category" TEXT,
    "Pack" TEXT,
    "Mrp" DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_products_item_name ON products("Item_Name");
    CREATE INDEX IF NOT EXISTS idx_products_category ON products("Category");
    CREATE INDEX IF NOT EXISTS idx_products_company ON products("Company");

    -- ============================================================================
    -- 2. REVIEWS TABLE
    -- ============================================================================
    -- Purpose: Store customer reviews for products
    -- Source: Frontend product-reviews component
    CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id INTEGER REFERENCES products("SrNo") ON DELETE CASCADE,
    customer_id TEXT,
    customer_name TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    helpful_count INTEGER DEFAULT 0,
    unhelpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

    -- ============================================================================
    -- 3. ADMIN USERS TABLE
    -- ============================================================================
    -- Purpose: Store admin user credentials and account info
    -- Source: Backend admin authentication
    CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

    -- ============================================================================
    -- 4. ADMIN SESSIONS TABLE
    -- ============================================================================
    -- Purpose: Store active admin login sessions
    -- Source: Backend session management
    CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

    -- ============================================================================
    -- 5. ADMIN USER PROFILES TABLE
    -- ============================================================================
    -- Purpose: Store detailed profile information for admin users
    -- Source: Backend admin profile management
    CREATE TABLE IF NOT EXISTS admin_user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES admin_users(id) ON DELETE CASCADE,
    full_name TEXT,
    mobile_number TEXT,
    gender TEXT,
    address TEXT,
    city TEXT,
    pincode TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_admin_user_profiles_user_id ON admin_user_profiles(user_id);

    -- ============================================================================
    -- 6. CUSTOMER PROFILES TABLE
    -- ============================================================================
    -- Purpose: Store customer profile information
    -- Source: data/customer-profiles.json
    -- Columns: id, userId, fullName, gender, mobileNumber, whatsappNumber, email, address, city, pincode
    CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    gender TEXT,
    mobile_number TEXT,
    whatsapp_number TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    pincode TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_customer_profiles_user_id ON customer_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON customer_profiles(email);

        -- ============================================================================
        -- 7. CUSTOMER CHAT THREADS + MESSAGES TABLES
        -- ============================================================================
        -- Purpose: Store customer-seller chat conversations in Supabase
        -- Source: data/customer-chat-messages.json and Seller Chat Box
        CREATE TABLE IF NOT EXISTS customer_chat_threads (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT,
        name TEXT,
        email TEXT,
        phone TEXT,
        last_message_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT customer_chat_threads_has_identifier CHECK (
            COALESCE(NULLIF(TRIM(user_id), ''), NULLIF(TRIM(email), ''), NULLIF(TRIM(phone), '')) IS NOT NULL
        )
        );

        CREATE TABLE IF NOT EXISTS customer_chat_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        thread_id UUID NOT NULL REFERENCES customer_chat_threads(id) ON DELETE CASCADE,
        user_id TEXT,
        name TEXT,
        email TEXT,
        phone TEXT,
        sender_role TEXT NOT NULL DEFAULT 'seller' CHECK (sender_role IN ('customer', 'seller', 'system')),
        sender_name TEXT NOT NULL DEFAULT 'Seller',
        message TEXT NOT NULL DEFAULT '(no text)',
        attachment JSONB,
        status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'received', 'read')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_customer_chat_threads_user_id ON customer_chat_threads(user_id);
        CREATE INDEX IF NOT EXISTS idx_customer_chat_threads_email ON customer_chat_threads(LOWER(email));
        CREATE INDEX IF NOT EXISTS idx_customer_chat_threads_phone ON customer_chat_threads(phone);
        CREATE INDEX IF NOT EXISTS idx_customer_chat_threads_last_message_at ON customer_chat_threads(last_message_at DESC);

        CREATE INDEX IF NOT EXISTS idx_customer_chat_messages_thread_id ON customer_chat_messages(thread_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_customer_chat_messages_user_id ON customer_chat_messages(user_id);
        CREATE INDEX IF NOT EXISTS idx_customer_chat_messages_email ON customer_chat_messages(LOWER(email));
        CREATE INDEX IF NOT EXISTS idx_customer_chat_messages_phone ON customer_chat_messages(phone);
        CREATE INDEX IF NOT EXISTS idx_customer_chat_messages_sender_role ON customer_chat_messages(sender_role);
        CREATE INDEX IF NOT EXISTS idx_customer_chat_messages_status ON customer_chat_messages(status);

    -- ============================================================================
    -- 8. LOGIN ACTIVITIES TABLE
    -- ============================================================================
    -- Purpose: Track customer login history and activity
    -- Source: data/login-activities.json
    -- Columns: id, userId, loginMethod, name, email, identifier, phone, address, city, pincode, imageUrl, providerImageUrl, userAgent, ipAddress, loggedInAt
    CREATE TABLE IF NOT EXISTS login_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    login_method TEXT,
    name TEXT,
    email TEXT,
    identifier TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    pincode TEXT,
    image_url TEXT,
    provider_image_url TEXT,
    user_agent TEXT,
    ip_address TEXT,
    logged_in_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_login_activities_user_id ON login_activities(user_id);
    CREATE INDEX IF NOT EXISTS idx_login_activities_logged_in_at ON login_activities(logged_in_at DESC);
    CREATE INDEX IF NOT EXISTS idx_login_activities_login_method ON login_activities(login_method);

    -- ============================================================================
    -- 9. ORDERS TABLE
    -- ============================================================================
    -- Purpose: Store customer orders and delivery tracking
    -- Source: Checkout and order management system
    CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "totalAmount" DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    items JSONB DEFAULT '[]',
    "deliveryStatus" TEXT NOT NULL DEFAULT 'pending',
    currency TEXT NOT NULL DEFAULT 'INR',
    notes TEXT DEFAULT ''
    );

    DO $$
    BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'userId'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_userId ON orders("userId")';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'user_id'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'deliveryStatus'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_deliveryStatus ON orders("deliveryStatus")';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'delivery_status'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_delivery_status ON orders(delivery_status)';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'createdAt'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_createdAt ON orders("createdAt" DESC)';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'created_at'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)';
    END IF;
    END $$;

    -- ============================================================================
    -- 10. CONTACT SUBMISSIONS TABLE
    -- ============================================================================
    -- Purpose: Store contact form submissions from /contact page
    -- Source: Frontend contact inquiry form
    CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

    -- ============================================================================
    -- 11. MESSAGE STATUSES TABLE
    -- ============================================================================
    -- Purpose: Store read/not-read status for contact/chat messages
    -- Source: backend/data/message-status.json (legacy), admin status selector
    CREATE TABLE IF NOT EXISTS message_statuses (
    message_id TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'not-read' CHECK (status IN ('read', 'not-read')),
    source TEXT NOT NULL DEFAULT 'contact_submissions',
    updated_by TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_message_statuses_source ON message_statuses(source);
    CREATE INDEX IF NOT EXISTS idx_message_statuses_updated_at ON message_statuses(updated_at DESC);

    -- ============================================================================
    -- 11. BANNERS TABLE
    -- ============================================================================
    -- Purpose: Store promotional banners displayed on homepage
    -- Source: Admin panel banner management
    CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    link_url TEXT,
    alt_text TEXT,
    position INTEGER,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

        ALTER TABLE banners ADD COLUMN IF NOT EXISTS position INTEGER;
        ALTER TABLE banners ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'banners' AND column_name = 'is_active'
            ) THEN
                EXECUTE 'CREATE INDEX IF NOT EXISTS idx_banners_is_active ON banners(is_active)';
            END IF;

            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'banners' AND column_name = 'position'
            ) THEN
                EXECUTE 'CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position)';
            END IF;
        END $$;

    -- ============================================================================
    -- 12. PAGE CONTENT TABLE
    -- ============================================================================
    -- Purpose: Store dynamic page content (About, Privacy, Terms, etc.)
    -- Source: Backend content management system
    CREATE TABLE IF NOT EXISTS page_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    sections JSONB DEFAULT '[]',
    seo_meta JSONB,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

        ALTER TABLE page_content ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
        ALTER TABLE page_content ADD COLUMN IF NOT EXISTS slug TEXT;

        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'page_content' AND column_name = 'slug'
            ) THEN
                EXECUTE 'CREATE INDEX IF NOT EXISTS idx_page_content_slug ON page_content(slug)';
            END IF;

            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'page_content' AND column_name = 'is_published'
            ) THEN
                EXECUTE 'CREATE INDEX IF NOT EXISTS idx_page_content_is_published ON page_content(is_published)';
            END IF;
        END $$;

    -- ============================================================================
    -- 13. PRESCRIPTIONS TABLE (FILE-BASED, optional to migrate)
    -- ============================================================================
    -- Purpose: Customer prescription uploads
    -- Note: Currently stored in backend/data/prescriptions.json
    -- Can be migrated if file storage is needed in database
    CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_id TEXT UNIQUE NOT NULL,
    customer_name TEXT,
    mobile_number TEXT,
    file_name TEXT,
    file_url TEXT,
    file_path TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_prescriptions_reference_id ON prescriptions(reference_id);

    -- ============================================================================
    -- ENABLE ROW LEVEL SECURITY (RLS)
    -- ============================================================================

    -- Enable RLS on key tables
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE customer_chat_messages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE login_activities ENABLE ROW LEVEL SECURITY;
    ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

    -- Policy: Users can view their own orders
    DROP POLICY IF EXISTS "users_can_view_own_orders" ON orders;
    CREATE POLICY "users_can_view_own_orders" 
    ON orders FOR SELECT 
    USING (
        auth.uid()::text = COALESCE(to_jsonb(orders)->>'user_id', to_jsonb(orders)->>'userId')
        OR COALESCE(to_jsonb(orders)->>'user_id', to_jsonb(orders)->>'userId') = current_setting('app.current_user_id', true)::text
    );

    -- Policy: Users can view their own profile
    DROP POLICY IF EXISTS "users_can_view_own_profile" ON customer_profiles;
    CREATE POLICY "users_can_view_own_profile" 
    ON customer_profiles FOR SELECT 
    USING (
        auth.uid()::text = COALESCE(to_jsonb(customer_profiles)->>'user_id', to_jsonb(customer_profiles)->>'userId')
        OR COALESCE(to_jsonb(customer_profiles)->>'user_id', to_jsonb(customer_profiles)->>'userId') = current_setting('app.current_user_id', true)::text
    );

    -- Policy: Users can view their chat messages
    DROP POLICY IF EXISTS "users_can_view_own_messages" ON customer_chat_messages;
    CREATE POLICY "users_can_view_own_messages" 
    ON customer_chat_messages FOR SELECT 
    USING (
        auth.uid()::text = COALESCE(to_jsonb(customer_chat_messages)->>'user_id', to_jsonb(customer_chat_messages)->>'userId')
        OR COALESCE(to_jsonb(customer_chat_messages)->>'user_id', to_jsonb(customer_chat_messages)->>'userId') = current_setting('app.current_user_id', true)::text
    );

    -- ============================================================================
    -- MIGRATION INSTRUCTIONS
    -- ============================================================================
    -- 1. Run this entire SQL script in Supabase SQL Editor
    -- 2. Create admin users via /admin/signup or /admin/login
    -- 3. Migrate data from JSON files (see instructions below):
    -- 
    -- DATA MIGRATION SOURCES:
    -- - customer-profiles.json → customer_profiles table
    -- - customer-chat-messages.json → customer_chat_messages table  
    -- - login-activities.json → login_activities table
    -- - backend/data/prescriptions.json → prescriptions table (optional)
    --
    -- 4. Test endpoints:
    --    - GET /api/v1/orders (requires userId)
    --    - GET /api/v1/reviews/{product_id}
    --    - POST /api/contact (accepts form submissions)
    --
    -- ============================================================================
