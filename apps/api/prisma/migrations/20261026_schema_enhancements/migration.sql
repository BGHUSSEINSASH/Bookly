-- Migration: schema_enhancements
-- الجداول الجديدة: TripSchedule, TourGuide, Event, Wishlist, WishlistItem, PromoRule, GuideReview

-- ─── مواعيد الرحلات ───
CREATE TABLE "TripSchedule" (
    "id"            TEXT NOT NULL,
    "tripId"        TEXT NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "seatsTotal"    INTEGER NOT NULL DEFAULT 20,
    "seatsBooked"   INTEGER NOT NULL DEFAULT 0,
    "priceOverride" DECIMAL(12,2),
    "status"        TEXT NOT NULL DEFAULT 'OPEN',
    "guideId"       TEXT,
    "notes"         TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TripSchedule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TripSchedule_tripId_departureDate_idx" ON "TripSchedule"("tripId", "departureDate");
CREATE INDEX "TripSchedule_status_idx" ON "TripSchedule"("status");
ALTER TABLE "TripSchedule" ADD CONSTRAINT "TripSchedule_tripId_fkey"
    FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── المرشدون السياحيون ───
CREATE TABLE "TourGuide" (
    "id"          TEXT NOT NULL,
    "vendorId"    TEXT NOT NULL,
    "fullName"    TEXT NOT NULL,
    "phone"       TEXT,
    "languages"   TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bio"         TEXT,
    "photoUrl"    TEXT,
    "ratingAvg"   DECIMAL(3,2) NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TourGuide_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TourGuide_vendorId_idx" ON "TourGuide"("vendorId");
ALTER TABLE "TourGuide" ADD CONSTRAINT "TourGuide_vendorId_fkey"
    FOREIGN KEY ("vendorId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TripSchedule" ADD CONSTRAINT "TripSchedule_guideId_fkey"
    FOREIGN KEY ("guideId") REFERENCES "TourGuide"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── الفعاليات ───
CREATE TYPE "EventCategory" AS ENUM ('FESTIVAL','CONCERT','SPORT','CULTURAL','FOOD','EXHIBITION','CONFERENCE','OTHER');
CREATE TABLE "Event" (
    "id"          TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "slug"        TEXT NOT NULL,
    "description" TEXT,
    "category"    "EventCategory" NOT NULL DEFAULT 'OTHER',
    "cityId"      TEXT,
    "venue"       TEXT,
    "latitude"    DOUBLE PRECISION,
    "longitude"   DOUBLE PRECISION,
    "startDate"   TIMESTAMP(3) NOT NULL,
    "endDate"     TIMESTAMP(3),
    "ticketUrl"   TEXT,
    "imageUrl"    TEXT,
    "isFree"      BOOLEAN NOT NULL DEFAULT false,
    "priceFrom"   DECIMAL(12,2),
    "currency"    TEXT NOT NULL DEFAULT 'IQD',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
CREATE INDEX "Event_cityId_startDate_idx" ON "Event"("cityId", "startDate");
CREATE INDEX "Event_isPublished_idx" ON "Event"("isPublished");
ALTER TABLE "Event" ADD CONSTRAINT "Event_cityId_fkey"
    FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── قوائم الأمنيات ───
CREATE TABLE "Wishlist" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "name"      TEXT NOT NULL DEFAULT 'المفضلة',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Wishlist_userId_name_key" ON "Wishlist"("userId", "name");
CREATE INDEX "Wishlist_userId_idx" ON "Wishlist"("userId");
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "WishlistItem" (
    "id"         TEXT NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "propertyId" TEXT,
    "tripId"     TEXT,
    "carId"      TEXT,
    "note"       TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "WishlistItem_wishlistId_idx" ON "WishlistItem"("wishlistId");
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_wishlistId_fkey"
    FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── قواعد الخصم ───
CREATE TYPE "PromoType" AS ENUM ('PERCENT','FIXED','FREE_NIGHT','EARLY_BIRD','LAST_MINUTE');
CREATE TABLE "PromoRule" (
    "id"               TEXT NOT NULL,
    "name"             TEXT NOT NULL,
    "type"             "PromoType" NOT NULL DEFAULT 'PERCENT',
    "value"            DECIMAL(8,2) NOT NULL,
    "minNights"        INTEGER NOT NULL DEFAULT 1,
    "minGuests"        INTEGER NOT NULL DEFAULT 1,
    "advanceDays"      INTEGER,
    "maxDiscountAmount" DECIMAL(12,2),
    "applicableOn"     TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startsAt"         TIMESTAMP(3),
    "endsAt"           TIMESTAMP(3),
    "isActive"         BOOLEAN NOT NULL DEFAULT true,
    "vendorId"         TEXT,
    "usageCount"       INTEGER NOT NULL DEFAULT 0,
    "usageLimit"       INTEGER,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PromoRule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PromoRule_isActive_idx" ON "PromoRule"("isActive");
ALTER TABLE "PromoRule" ADD CONSTRAINT "PromoRule_vendorId_fkey"
    FOREIGN KEY ("vendorId") REFERENCES "VendorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── تقييم المرشد ───
CREATE TABLE "GuideReview" (
    "id"         TEXT NOT NULL,
    "guideId"    TEXT NOT NULL,
    "bookingId"  TEXT,
    "customerId" TEXT NOT NULL,
    "rating"     INTEGER NOT NULL,
    "comment"    TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GuideReview_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "GuideReview_guideId_idx" ON "GuideReview"("guideId");
ALTER TABLE "GuideReview" ADD CONSTRAINT "GuideReview_guideId_fkey"
    FOREIGN KEY ("guideId") REFERENCES "TourGuide"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GuideReview" ADD CONSTRAINT "GuideReview_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── تحسينات على Trip ───
ALTER TABLE "Trip"
    ADD COLUMN IF NOT EXISTS "meetingPointLat"  DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS "meetingPointLng"  DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS "difficultyLevel"  TEXT,
    ADD COLUMN IF NOT EXISTS "minAge"           INTEGER,
    ADD COLUMN IF NOT EXISTS "requiresGuide"    BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "excludes"         TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS "highlights"       TEXT[] DEFAULT ARRAY[]::TEXT[];

-- ─── تحسينات على Property ───
ALTER TABLE "Property"
    ADD COLUMN IF NOT EXISTS "virtualTourUrl"        TEXT,
    ADD COLUMN IF NOT EXISTS "sustainabilityScore"   INTEGER,
    ADD COLUMN IF NOT EXISTS "accessibilityFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[];
