-- Create orders table
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Create indexes for better query performance
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

-- Add comments for documentation
COMMENT ON TABLE orders IS 'Stores customer orders with items and delivery tracking';
COMMENT ON COLUMN orders.id IS 'Unique order identifier (UUID)';
COMMENT ON COLUMN orders."userId" IS 'Customer identifier (TEXT)';
COMMENT ON COLUMN orders."createdAt" IS 'Order creation timestamp';
COMMENT ON COLUMN orders."updatedAt" IS 'Last order update timestamp';
COMMENT ON COLUMN orders."totalAmount" IS 'Order total amount (2 decimal places)';
COMMENT ON COLUMN orders."itemCount" IS 'Number of items in the order';
COMMENT ON COLUMN orders.items IS 'JSON array of order items with details';
COMMENT ON COLUMN orders."deliveryStatus" IS 'Order status: pending, delivered, cancelled, etc.';
COMMENT ON COLUMN orders.currency IS 'Currency code (default: INR)';
COMMENT ON COLUMN orders.notes IS 'Additional order notes or special instructions';

-- Enable RLS (Row Level Security) if needed
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own orders
DROP POLICY IF EXISTS "users_can_view_own_orders" ON orders;
CREATE POLICY "users_can_view_own_orders" 
  ON orders FOR SELECT 
  USING (
    auth.uid()::text = COALESCE(to_jsonb(orders)->>'user_id', to_jsonb(orders)->>'userId')
    OR COALESCE(to_jsonb(orders)->>'user_id', to_jsonb(orders)->>'userId') = current_setting('app.current_user_id', true)::text
  );

-- Policy: Admin users can view all orders (modify based on your admin setup)
-- Uncomment and modify based on your admin role setup
-- CREATE POLICY "admin_can_view_all_orders" 
--   ON orders FOR SELECT 
--   USING (auth.jwt() ->> 'role' = 'admin');
