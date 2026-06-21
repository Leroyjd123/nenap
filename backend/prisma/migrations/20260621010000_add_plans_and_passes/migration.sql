-- Subscription plans + time-boxed booster passes.
CREATE TYPE "Plan" AS ENUM ('free', 'basic', 'pro');

ALTER TABLE "users" ADD COLUMN "plan" "Plan" NOT NULL DEFAULT 'free';

CREATE TABLE "user_passes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "level" "Plan" NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'grant',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_passes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "user_passes_userId_expiresAt_idx" ON "user_passes" ("userId", "expiresAt");

ALTER TABLE "user_passes" ADD CONSTRAINT "user_passes_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
