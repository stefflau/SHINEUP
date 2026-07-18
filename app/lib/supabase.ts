import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─── Lazy Supabase client ────────────────────────────────────────────────────
// On utilise une factory lazy pour éviter le crash au prerendering Next.js
// (Next essaie de prerendre les pages avec des vars d'env vides en build)
//
// ACTION REQUISE dans ton .env.local ET sur Vercel, renomme :
//   SUPABASE_URL      → NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_ANON_KEY → NEXT_PUBLIC_SUPABASE_ANON_KEY
//   SUPABASE_SERVICE_ROLE_KEY → garder tel quel (serveur uniquement)

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    _client = createClient(
      url || "https://placeholder.supabase.co",
      key || "placeholder-key"
    );
  }
  return _client;
}

// Proxy lazy — tous les imports existants continuent de fonctionner sans changement
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
