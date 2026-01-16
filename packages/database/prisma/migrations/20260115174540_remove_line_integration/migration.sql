/*
  Warnings:

  - You are about to drop the column `lineBroadcastCount` on the `alerts` table. All the data in the column will be lost.
  - You are about to drop the column `lineMessageId` on the `alerts` table. All the data in the column will be lost.
  - You are about to drop the column `lineChannelAccessToken` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `lineChannelSecret` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `lineLiffId` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the `line_users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "line_users" DROP CONSTRAINT "line_users_tenantId_fkey";

-- AlterTable
ALTER TABLE "alerts" DROP COLUMN "lineBroadcastCount",
DROP COLUMN "lineMessageId";

-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "lineChannelAccessToken",
DROP COLUMN "lineChannelSecret",
DROP COLUMN "lineLiffId";

-- DropTable
DROP TABLE "line_users";
