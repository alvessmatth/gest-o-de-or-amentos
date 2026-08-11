import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    const faltando = [
      !supabaseUrl && "NEXT_PUBLIC_SUPABASE_URL",
      !supabaseAnonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ]
      .filter(Boolean)
      .join(", ")

    throw new Error(
      `Configuração do Supabase ausente. Defina ${faltando} nas variáveis de ambiente do projeto.`,
    )
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

// Singleton: evita recriar o client em cada import / hot reload
declare global {
  // eslint-disable-next-line no-var
  var __supabaseClient: SupabaseClient | undefined
}

export const supabase: SupabaseClient =
  globalThis.__supabaseClient ?? createSupabaseClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.__supabaseClient = supabase
}
