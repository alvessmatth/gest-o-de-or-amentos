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
      `Configuração do Supabase ausente. Defina ${faltando} nas variáveis de ambiente do projeto (ex.: arquivo .env.local).`,
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

function getSupabaseClient(): SupabaseClient {
  if (!globalThis.__supabaseClient) {
    globalThis.__supabaseClient = createSupabaseClient()
  }
  return globalThis.__supabaseClient
}

/**
 * Client do Supabase com inicialização preguiçosa (lazy).
 *
 * O client só é criado no primeiro acesso a uma propriedade, e não no momento
 * da importação do módulo. Isso evita que o build/prerender do Next.js quebre
 * quando as variáveis de ambiente ainda não estão disponíveis, já que o
 * Supabase só é realmente usado no lado do cliente (dentro de efeitos e
 * handlers), onde as variáveis NEXT_PUBLIC_* estão presentes.
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseClient()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === "function" ? value.bind(client) : value
  },
})
