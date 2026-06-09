-- ============================================================
-- GAYTONS BAKERY — Supabase SQL
-- Paste this entire file into Supabase → SQL Editor → Run
-- ============================================================

-- ENUMS
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CUSTOMER');

CREATE TYPE "ProductCategory" AS ENUM (
  'BREADS_WHITE', 'BREADS_BROWN', 'BREADS_MALTED', 'BREADS_SOURDOUGH',
  'ROLLS_BATCHES', 'ROLLS_BURGERS', 'ROLLS_SUBS',
  'CAKES_INDIVIDUAL', 'CAKES_TRAYBAKE', 'CAKES_CATERER',
  'PASTRIES_SWEET', 'PASTRIES_SAVOURY', 'PIES', 'SCONES_TEACAKES'
);

CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PICKED', 'CANCELLED');

-- TABLES

CREATE TABLE "User" (
  "id"                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email"               TEXT UNIQUE NOT NULL,
  "passwordHash"        TEXT NOT NULL,
  "role"                "Role" NOT NULL DEFAULT 'CUSTOMER',
  "businessName"        TEXT NOT NULL,
  "contactName"         TEXT NOT NULL,
  "phone"               TEXT NOT NULL,
  "isActive"            BOOLEAN NOT NULL DEFAULT true,
  "isLocked"            BOOLEAN NOT NULL DEFAULT false,
  "lockedUntil"         TIMESTAMPTZ,
  "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
  "mustChangePassword"  BOOLEAN NOT NULL DEFAULT false,
  "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "RefreshToken" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "token"     TEXT UNIQUE NOT NULL,
  "userId"    TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Product" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "productCode" TEXT UNIQUE NOT NULL,
  "productName" TEXT NOT NULL,
  "price"       DECIMAL(10,2) NOT NULL,
  "category"    "ProductCategory" NOT NULL,
  "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Order" (
  "id"           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "orderNumber"  TEXT UNIQUE NOT NULL,
  "customerId"   TEXT NOT NULL REFERENCES "User"("id"),
  "status"       "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "deliveryDate" TIMESTAMPTZ NOT NULL,
  "totalValue"   DECIMAL(10,2) NOT NULL,
  "submittedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "notes"        TEXT,
  "adminNotes"   TEXT,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "OrderItem" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "orderId"   TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "Product"("id"),
  "quantity"  INTEGER NOT NULL,
  "unitPrice" DECIMAL(10,2) NOT NULL,
  "lineTotal" DECIMAL(10,2) NOT NULL
);

CREATE TABLE "OrderTemplate" (
  "id"         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "customerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name"       TEXT NOT NULL,
  "items"      JSONB NOT NULL,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "AuditLog" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "action"    TEXT NOT NULL,
  "ipAddress" TEXT NOT NULL,
  "metadata"  JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "OrderSequence" (
  "id"      INTEGER PRIMARY KEY DEFAULT 1,
  "nextVal" INTEGER NOT NULL DEFAULT 1
);

-- Seed the sequence row
INSERT INTO "OrderSequence" ("id", "nextVal") VALUES (1, 1);

-- Auto-update updatedAt trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW."updatedAt" = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_updated BEFORE UPDATE ON "User"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_product_updated BEFORE UPDATE ON "Product"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_order_updated BEFORE UPDATE ON "Order"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_template_updated BEFORE UPDATE ON "OrderTemplate"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes for performance
CREATE INDEX idx_order_customer ON "Order"("customerId");
CREATE INDEX idx_order_submitted ON "Order"("submittedAt");
CREATE INDEX idx_order_status ON "Order"("status");
CREATE INDEX idx_orderitem_order ON "OrderItem"("orderId");
CREATE INDEX idx_orderitem_product ON "OrderItem"("productId");
CREATE INDEX idx_auditlog_user ON "AuditLog"("userId");
CREATE INDEX idx_auditlog_created ON "AuditLog"("createdAt");
CREATE INDEX idx_refreshtoken_user ON "RefreshToken"("userId");
