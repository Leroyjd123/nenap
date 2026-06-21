-- Add opt-in AI auto-organise flag to notes.
ALTER TABLE "notes" ADD COLUMN "autoOrganise" BOOLEAN NOT NULL DEFAULT false;
