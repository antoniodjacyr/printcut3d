/** Cookie tuples passed by @supabase/ssr into custom cookie adapters */
export type SupabaseCookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};
