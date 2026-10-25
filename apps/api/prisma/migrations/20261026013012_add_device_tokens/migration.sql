-- AddDeviceTokensTable
-- Migration: add_device_tokens
-- Created: 2026-10-26

CREATE TYPE "DevicePlatform" AS ENUM ('IOS', 'ANDROID', 'WEB');

CREATE TABLE "DeviceToken" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "token"     TEXT NOT NULL,
    "platform"  "DevicePlatform" NOT NULL DEFAULT 'ANDROID',
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DeviceToken_token_key" ON "DeviceToken"("token");
CREATE INDEX "DeviceToken_userId_isActive_idx" ON "DeviceToken"("userId", "isActive");

ALTER TABLE "DeviceToken"
    ADD CONSTRAINT "DeviceToken_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
