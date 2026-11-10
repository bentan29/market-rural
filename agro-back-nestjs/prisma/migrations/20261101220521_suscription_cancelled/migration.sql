-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "cancelledAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Seller_deletedAt_idx" ON "Seller"("deletedAt");
