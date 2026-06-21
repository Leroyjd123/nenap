-- Note attachments (images + files).
CREATE TYPE "AttachmentKind" AS ENUM ('image', 'file');

CREATE TABLE "attachments" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "noteId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "kind" "AttachmentKind" NOT NULL,
  "storagePath" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "sizeBytes" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "attachments_noteId_idx" ON "attachments" ("noteId");
CREATE INDEX "attachments_userId_idx" ON "attachments" ("userId");

ALTER TABLE "attachments" ADD CONSTRAINT "attachments_noteId_fkey"
  FOREIGN KEY ("noteId") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
