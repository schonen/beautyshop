-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "deliveryFee" SET DEFAULT 0,
ALTER COLUMN "fulfillmentMethod" DROP DEFAULT;
