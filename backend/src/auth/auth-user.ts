/** The authenticated principal extracted from a verified Supabase JWT. */
export interface AuthUser {
  id: string; // JWT `sub` — Supabase auth user id
  email: string;
}
