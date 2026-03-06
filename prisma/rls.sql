-- Row Level Security for WatchScout
--
-- Run this once in the Supabase SQL Editor.
-- The Prisma connection (postgres/service role) bypasses RLS automatically,
-- so no application code changes are needed.
--
-- These policies restrict direct PostgREST API access to each user's own data.

-- ─── Search ──────────────────────────────────────────────────────────────────

ALTER TABLE "Search" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own searches"
  ON "Search"
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- ─── Listing ─────────────────────────────────────────────────────────────────

ALTER TABLE "Listing" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access listings in own searches"
  ON "Listing"
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "Search"
      WHERE "Search"."id" = "Listing"."searchId"
        AND "Search"."userId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Search"
      WHERE "Search"."id" = "Listing"."searchId"
        AND "Search"."userId" = auth.uid()::text
    )
  );
