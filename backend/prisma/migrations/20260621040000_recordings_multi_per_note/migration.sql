-- Allow many recordings per note; move transcripts from per-note to per-recording.
-- Prisma's @unique created these as unique INDEXES, so drop the index (not a constraint).
DROP INDEX IF EXISTS "recordings_noteId_key";
CREATE INDEX IF NOT EXISTS "recordings_noteId_idx" ON "recordings" ("noteId");

ALTER TABLE "transcripts" ADD COLUMN "recordingId" UUID;
UPDATE "transcripts" t SET "recordingId" = r.id FROM "recordings" r
  WHERE r."noteId" = t."noteId" AND t."recordingId" IS NULL;
DELETE FROM "transcripts" WHERE "recordingId" IS NULL;
DROP INDEX IF EXISTS "transcripts_noteId_key";
ALTER TABLE "transcripts" ALTER COLUMN "recordingId" SET NOT NULL;
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_recordingId_key" UNIQUE ("recordingId");
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_recordingId_fkey"
  FOREIGN KEY ("recordingId") REFERENCES "recordings" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "transcripts_noteId_idx" ON "transcripts" ("noteId");
