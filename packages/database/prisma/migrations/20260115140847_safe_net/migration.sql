-- CreateEnum
CREATE TYPE "ElderStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'HOSPITALIZED', 'DECEASED', 'MOVED_OUT');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('IBEACON', 'EDDYSTONE', 'GENERIC_BLE');

-- CreateEnum
CREATE TYPE "GatewayType" AS ENUM ('GENERAL', 'BOUNDARY', 'MOBILE');

-- CreateEnum
CREATE TYPE "Proximity" AS ENUM ('IMMEDIATE', 'NEAR', 'FAR', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('BOUNDARY', 'INACTIVE', 'FIRST_ACTIVITY', 'LOW_BATTERY', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('PENDING', 'NOTIFIED', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'TENANT_ADMIN', 'STAFF');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "contactPerson" TEXT,
    "contactPhone" TEXT,
    "lineNotifyToken" TEXT,
    "settings" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "photo" TEXT,
    "notes" TEXT,
    "status" "ElderStatus" NOT NULL DEFAULT 'ACTIVE',
    "inactiveThresholdHours" INTEGER NOT NULL DEFAULT 24,
    "lastActivityAt" TIMESTAMP(3),
    "lastSeenLocation" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "elders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "elderId" TEXT NOT NULL,
    "macAddress" TEXT NOT NULL,
    "uuid" TEXT,
    "major" INTEGER,
    "minor" INTEGER,
    "deviceName" TEXT,
    "type" "DeviceType" NOT NULL DEFAULT 'IBEACON',
    "batteryLevel" INTEGER,
    "lastSeen" TIMESTAMP(3),
    "lastRssi" INTEGER,
    "lastGatewayId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gateways" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "type" "GatewayType" NOT NULL DEFAULT 'GENERAL',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "deviceInfo" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gateways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "gatewayId" TEXT NOT NULL,
    "macAddress" TEXT NOT NULL,
    "rssi" INTEGER NOT NULL,
    "distance" DOUBLE PRECISION,
    "proximity" "Proximity",
    "uuid" TEXT,
    "major" INTEGER,
    "minor" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "altitude" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_logs" (
    "id" TEXT NOT NULL,
    "elderId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "altitude" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "activity" TEXT,
    "address" TEXT,
    "sourceType" TEXT,
    "sourceLogId" TEXT,
    "sourceGatewayId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "elderId" TEXT NOT NULL,
    "gatewayId" TEXT,
    "type" "AlertType" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'PENDING',
    "severity" "AlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "location" TEXT,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolution" TEXT,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "notificationSentAt" TIMESTAMP(3),
    "notificationError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "phone" TEXT,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_code_key" ON "tenants"("code");

-- CreateIndex
CREATE INDEX "elders_tenantId_idx" ON "elders"("tenantId");

-- CreateIndex
CREATE INDEX "elders_status_idx" ON "elders"("status");

-- CreateIndex
CREATE INDEX "elders_lastActivityAt_idx" ON "elders"("lastActivityAt");

-- CreateIndex
CREATE UNIQUE INDEX "devices_elderId_key" ON "devices"("elderId");

-- CreateIndex
CREATE UNIQUE INDEX "devices_macAddress_key" ON "devices"("macAddress");

-- CreateIndex
CREATE INDEX "devices_macAddress_idx" ON "devices"("macAddress");

-- CreateIndex
CREATE INDEX "devices_uuid_major_minor_idx" ON "devices"("uuid", "major", "minor");

-- CreateIndex
CREATE INDEX "devices_lastSeen_idx" ON "devices"("lastSeen");

-- CreateIndex
CREATE UNIQUE INDEX "gateways_serialNumber_key" ON "gateways"("serialNumber");

-- CreateIndex
CREATE INDEX "gateways_tenantId_idx" ON "gateways"("tenantId");

-- CreateIndex
CREATE INDEX "gateways_type_idx" ON "gateways"("type");

-- CreateIndex
CREATE INDEX "gateways_serialNumber_idx" ON "gateways"("serialNumber");

-- CreateIndex
CREATE INDEX "logs_deviceId_idx" ON "logs"("deviceId");

-- CreateIndex
CREATE INDEX "logs_gatewayId_idx" ON "logs"("gatewayId");

-- CreateIndex
CREATE INDEX "logs_macAddress_idx" ON "logs"("macAddress");

-- CreateIndex
CREATE INDEX "logs_timestamp_idx" ON "logs"("timestamp");

-- CreateIndex
CREATE INDEX "logs_deviceId_timestamp_idx" ON "logs"("deviceId", "timestamp");

-- CreateIndex
CREATE INDEX "logs_gatewayId_timestamp_idx" ON "logs"("gatewayId", "timestamp");

-- CreateIndex
CREATE INDEX "location_logs_elderId_idx" ON "location_logs"("elderId");

-- CreateIndex
CREATE INDEX "location_logs_timestamp_idx" ON "location_logs"("timestamp");

-- CreateIndex
CREATE INDEX "location_logs_elderId_timestamp_idx" ON "location_logs"("elderId", "timestamp");

-- CreateIndex
CREATE INDEX "alerts_tenantId_idx" ON "alerts"("tenantId");

-- CreateIndex
CREATE INDEX "alerts_elderId_idx" ON "alerts"("elderId");

-- CreateIndex
CREATE INDEX "alerts_type_idx" ON "alerts"("type");

-- CreateIndex
CREATE INDEX "alerts_status_idx" ON "alerts"("status");

-- CreateIndex
CREATE INDEX "alerts_triggeredAt_idx" ON "alerts"("triggeredAt");

-- CreateIndex
CREATE INDEX "alerts_elderId_triggeredAt_idx" ON "alerts"("elderId", "triggeredAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- AddForeignKey
ALTER TABLE "elders" ADD CONSTRAINT "elders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "elders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_lastGatewayId_fkey" FOREIGN KEY ("lastGatewayId") REFERENCES "gateways"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gateways" ADD CONSTRAINT "gateways_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "gateways"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_logs" ADD CONSTRAINT "location_logs_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "elders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "elders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "gateways"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
