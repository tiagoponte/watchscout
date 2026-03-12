-- Enable RLS on User table
-- Safe to apply: Prisma connects as postgres/service_role which bypasses RLS.
-- This only blocks direct PostgREST/Supabase client access to other users' rows.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own record only
CREATE POLICY "users_select_own" ON "User"
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id);

-- Authenticated users can update their own record only
CREATE POLICY "users_update_own" ON "User"
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- INSERT and DELETE are server-side only (Prisma / service_role).
-- No PostgREST policies needed for those operations.
