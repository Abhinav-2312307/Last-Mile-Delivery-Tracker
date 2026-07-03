-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "approvalNote" TEXT,
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT true;
