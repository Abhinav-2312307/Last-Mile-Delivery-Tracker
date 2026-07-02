-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('CUSTOMER', 'AGENT', 'MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."OrderType" AS ENUM ('B2B', 'B2C');

-- CreateEnum
CREATE TYPE "public"."PaymentType" AS ENUM ('PREPAID', 'COD');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'PAYMENT_PENDING', 'PAID', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RESCHEDULE_REQUESTED', 'PENDING_REASSIGNMENT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."RouteType" AS ENUM ('INTRA_ZONE', 'INTER_ZONE');

-- CreateEnum
CREATE TYPE "public"."AgentAvailability" AS ENUM ('AVAILABLE', 'BUSY', 'OFFLINE');

-- CreateEnum
CREATE TYPE "public"."NotificationChannel" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('PENDING', 'SENT', 'SKIPPED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."RescheduleStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'CUSTOMER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isoCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Zone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pincode" TEXT,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "cityId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Address" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "userId" TEXT,
    "areaId" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RateCard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orderType" "public"."OrderType" NOT NULL,
    "routeType" "public"."RouteType" NOT NULL,
    "pricePerKg" DECIMAL(10,2) NOT NULL,
    "minimumCharge" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CodSurcharge" (
    "id" TEXT NOT NULL,
    "orderType" "public"."OrderType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodSurcharge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "availability" "public"."AgentAvailability" NOT NULL DEFAULT 'OFFLINE',
    "currentLatitude" DECIMAL(10,7),
    "currentLongitude" DECIMAL(10,7),
    "maxActiveOrders" INTEGER NOT NULL DEFAULT 8,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ZoneAgent" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "agentProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZoneAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "assignedAgentId" TEXT,
    "pickupAddressId" TEXT NOT NULL,
    "dropAddressId" TEXT NOT NULL,
    "pickupZoneId" TEXT NOT NULL,
    "dropZoneId" TEXT NOT NULL,
    "orderType" "public"."OrderType" NOT NULL,
    "paymentType" "public"."PaymentType" NOT NULL,
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'CONFIRMED',
    "lengthCm" DECIMAL(10,2) NOT NULL,
    "breadthCm" DECIMAL(10,2) NOT NULL,
    "heightCm" DECIMAL(10,2) NOT NULL,
    "actualWeightKg" DECIMAL(10,3) NOT NULL,
    "volumetricWeightKg" DECIMAL(10,3) NOT NULL,
    "billableWeightKg" DECIMAL(10,3) NOT NULL,
    "routeType" "public"."RouteType" NOT NULL,
    "baseCharge" DECIMAL(10,2) NOT NULL,
    "codSurcharge" DECIMAL(10,2) NOT NULL,
    "totalCharge" DECIMAL(10,2) NOT NULL,
    "rateCardSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrackingEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "public"."OrderStatus" NOT NULL,
    "note" TEXT,
    "actorId" TEXT NOT NULL,
    "actorRole" "public"."Role" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerOrderId" TEXT,
    "providerPaymentId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RescheduleRequest" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedDate" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "status" "public"."RescheduleStatus" NOT NULL DEFAULT 'REQUESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RescheduleRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "recipientUserId" TEXT,
    "channel" "public"."NotificationChannel" NOT NULL,
    "status" "public"."NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "provider" TEXT,
    "providerMessageId" TEXT,
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Country_isoCode_key" ON "public"."Country"("isoCode");

-- CreateIndex
CREATE UNIQUE INDEX "City_countryId_name_key" ON "public"."City"("countryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Zone_code_key" ON "public"."Zone"("code");

-- CreateIndex
CREATE INDEX "Area_zoneId_idx" ON "public"."Area"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "Area_cityId_name_key" ON "public"."Area"("cityId", "name");

-- CreateIndex
CREATE INDEX "RateCard_orderType_routeType_isActive_idx" ON "public"."RateCard"("orderType", "routeType", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "RateCard_orderType_routeType_name_key" ON "public"."RateCard"("orderType", "routeType", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CodSurcharge_orderType_key" ON "public"."CodSurcharge"("orderType");

-- CreateIndex
CREATE UNIQUE INDEX "AgentProfile_userId_key" ON "public"."AgentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentProfile_employeeCode_key" ON "public"."AgentProfile"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "ZoneAgent_zoneId_agentProfileId_key" ON "public"."ZoneAgent"("zoneId", "agentProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "public"."Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "public"."Order"("status");

-- CreateIndex
CREATE INDEX "Order_pickupZoneId_idx" ON "public"."Order"("pickupZoneId");

-- CreateIndex
CREATE INDEX "Order_dropZoneId_idx" ON "public"."Order"("dropZoneId");

-- CreateIndex
CREATE INDEX "Order_assignedAgentId_idx" ON "public"."Order"("assignedAgentId");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "public"."Order"("createdAt");

-- CreateIndex
CREATE INDEX "TrackingEvent_orderId_createdAt_idx" ON "public"."TrackingEvent"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "public"."Payment"("orderId");

-- CreateIndex
CREATE INDEX "RescheduleRequest_orderId_idx" ON "public"."RescheduleRequest"("orderId");

-- CreateIndex
CREATE INDEX "Notification_orderId_idx" ON "public"."Notification"("orderId");

-- CreateIndex
CREATE INDEX "Notification_recipientUserId_idx" ON "public"."Notification"("recipientUserId");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "public"."Notification"("status");

-- AddForeignKey
ALTER TABLE "public"."City" ADD CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Zone" ADD CONSTRAINT "Zone_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Area" ADD CONSTRAINT "Area_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Area" ADD CONSTRAINT "Area_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "public"."Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "public"."Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentProfile" ADD CONSTRAINT "AgentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ZoneAgent" ADD CONSTRAINT "ZoneAgent_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "public"."Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ZoneAgent" ADD CONSTRAINT "ZoneAgent_agentProfileId_fkey" FOREIGN KEY ("agentProfileId") REFERENCES "public"."AgentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_pickupAddressId_fkey" FOREIGN KEY ("pickupAddressId") REFERENCES "public"."Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_dropAddressId_fkey" FOREIGN KEY ("dropAddressId") REFERENCES "public"."Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_pickupZoneId_fkey" FOREIGN KEY ("pickupZoneId") REFERENCES "public"."Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_dropZoneId_fkey" FOREIGN KEY ("dropZoneId") REFERENCES "public"."Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrackingEvent" ADD CONSTRAINT "TrackingEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrackingEvent" ADD CONSTRAINT "TrackingEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RescheduleRequest" ADD CONSTRAINT "RescheduleRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RescheduleRequest" ADD CONSTRAINT "RescheduleRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
