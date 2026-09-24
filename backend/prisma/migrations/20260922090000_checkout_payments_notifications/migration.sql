-- Cette migration suppose une base de développement (seed rejouable).
-- En dev : `npx prisma migrate reset` est recommandé plutôt qu'un migrate deploy
-- sur des données existantes, car les anciens statuts de commande n'ont pas
-- d'équivalent univoque dans le nouveau cycle de vie (voir README).

-- CreateEnum
CREATE TYPE "FulfillmentMethod" AS ENUM ('DELIVERY', 'PICKUP');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ORANGE_MONEY', 'MTN_MOBILE_MONEY', 'CARD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PAYMENT_SUCCESS', 'NEW_ORDER', 'ORDER_STATUS_CHANGED', 'LOW_STOCK', 'SYSTEM');

-- AlterEnum: OrderStatus (Postgres ne permet pas de retirer des valeurs d'un enum existant,
-- on recrée donc le type et on migre la colonne avec un mapping explicite).
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING_PAYMENT', 'PAID', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PICKED_UP', 'CANCELLED');

ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders"
  ALTER COLUMN "status" TYPE "OrderStatus_new"
  USING (
    CASE "status"::text
      WHEN 'PENDING' THEN 'PENDING_PAYMENT'
      WHEN 'CONFIRMED' THEN 'CONFIRMED'
      WHEN 'SHIPPED' THEN 'OUT_FOR_DELIVERY'
      WHEN 'DELIVERED' THEN 'DELIVERED'
      WHEN 'CANCELLED' THEN 'CANCELLED'
      ELSE 'PENDING_PAYMENT'
    END
  )::"OrderStatus_new";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT';
DROP TYPE "OrderStatus";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";

-- AlterTable: users
ALTER TABLE "users" ADD COLUMN "phone" TEXT;

-- AlterTable: products
ALTER TABLE "products" ADD COLUMN "brand" TEXT;

-- AlterTable: orders (nouvelles colonnes du checkout)
ALTER TABLE "orders" ADD COLUMN "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN "fulfillmentMethod" "FulfillmentMethod" NOT NULL DEFAULT 'PICKUP';
ALTER TABLE "orders" ADD COLUMN "deliveryCity" TEXT;
ALTER TABLE "orders" ADD COLUMN "deliveryNeighborhood" TEXT;
ALTER TABLE "orders" ADD COLUMN "deliveryAddress" TEXT;
ALTER TABLE "orders" ADD COLUMN "deliveryNotes" TEXT;
ALTER TABLE "orders" ADD COLUMN "customerName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "orders" ADD COLUMN "customerPhone" TEXT NOT NULL DEFAULT '';

-- Rétro-remplissage des commandes existantes à partir du sous-total connu
UPDATE "orders" SET "subtotal" = "total" WHERE "subtotal" = 0;
UPDATE "orders" o SET "customerName" = u."name", "customerPhone" = COALESCE(u."phone", '')
FROM "users" u WHERE u."id" = o."userId" AND o."customerName" = '';

ALTER TABLE "orders" ALTER COLUMN "subtotal" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "deliveryFee" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "customerName" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "customerPhone" DROP DEFAULT;

-- CreateTable: payments
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XAF',
    "transactionReference" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "customerPhone" TEXT,
    "cardLast4" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: notifications
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "userId" TEXT,
    "orderId" TEXT,
    "paymentId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable: store_settings (singleton)
CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "storeName" TEXT NOT NULL DEFAULT 'BeautyShop',
    "storeCity" TEXT NOT NULL DEFAULT 'Douala',
    "storeAddress" TEXT NOT NULL DEFAULT '',
    "storePhone" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT 'XAF',
    "deliveryEnabled" BOOLEAN NOT NULL DEFAULT true,
    "minDeliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 1000,
    "maxDeliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 2500,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable: delivery_zones
CREATE TABLE "delivery_zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fee" DECIMAL(10,2) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_zones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_orderId_key" ON "payments"("orderId");
CREATE UNIQUE INDEX "payments_transactionReference_key" ON "payments"("transactionReference");
CREATE UNIQUE INDEX "payments_idempotencyKey_key" ON "payments"("idempotencyKey");
CREATE INDEX "payments_status_idx" ON "payments"("status");
CREATE INDEX "payments_method_idx" ON "payments"("method");
CREATE INDEX "payments_createdAt_idx" ON "payments"("createdAt");

CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

CREATE UNIQUE INDEX "delivery_zones_name_key" ON "delivery_zones"("name");

CREATE INDEX "products_isActive_idx" ON "products"("isActive");
CREATE INDEX "products_stock_idx" ON "products"("stock");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
