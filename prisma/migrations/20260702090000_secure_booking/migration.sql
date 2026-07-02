ALTER TYPE "RouteType" ADD VALUE IF NOT EXISTS 'INTERNATIONAL';

ALTER TABLE "User"
  ALTER COLUMN "passwordHash" DROP NOT NULL,
  ADD COLUMN "emailVerified" TIMESTAMP(3),
  ADD COLUMN "image" TEXT;

CREATE TABLE "State" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "isoCode" TEXT NOT NULL,
  "countryId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "State_countryId_isoCode_key" ON "State"("countryId", "isoCode");
ALTER TABLE "State" ADD CONSTRAINT "State_countryId_fkey"
  FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "City" ADD COLUMN "stateId" TEXT;
ALTER TABLE "City" ADD CONSTRAINT "City_stateId_fkey"
  FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Address"
  ADD COLUMN "countryCode" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "stateCode" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "cityName" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "postalCode" TEXT NOT NULL DEFAULT '';

UPDATE "Address" AS address
SET
  "countryCode" = country."isoCode",
  "cityName" = city."name",
  "postalCode" = COALESCE(area."pincode", '')
FROM "Area" AS area
JOIN "City" AS city ON city."id" = area."cityId"
JOIN "Country" AS country ON country."id" = city."countryId"
WHERE address."areaId" = area."id";

CREATE TABLE "InternationalRateCard" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "originCountryCode" TEXT NOT NULL,
  "destinationCountryCode" TEXT NOT NULL,
  "orderType" "OrderType" NOT NULL,
  "pricePerKg" DECIMAL(10,2) NOT NULL,
  "minimumCharge" DECIMAL(10,2) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InternationalRateCard_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "IntlRate_country_pair_order_key"
  ON "InternationalRateCard"("originCountryCode", "destinationCountryCode", "orderType");
CREATE INDEX "IntlRate_country_pair_active_idx"
  ON "InternationalRateCard"("originCountryCode", "destinationCountryCode", "orderType", "isActive");

CREATE UNIQUE INDEX "Payment_providerOrderId_key" ON "Payment"("providerOrderId");

CREATE TABLE "Account" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

CREATE TABLE "EmailVerificationCode" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailVerificationCode_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EmailVerificationCode_userId_createdAt_idx" ON "EmailVerificationCode"("userId", "createdAt");
ALTER TABLE "EmailVerificationCode" ADD CONSTRAINT "EmailVerificationCode_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
