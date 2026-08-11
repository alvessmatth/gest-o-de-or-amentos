// Persistência local (fallback) — substitui o Supabase enquanto não há backend/auth.
// Mantém os dados salvos no navegador do usuário via localStorage.

export function lerLista<T>(chave: string): T[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(chave)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

export function gravarLista<T>(chave: string, valor: T[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    // ignore quota / serialization errors
  }
}

export function novoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
}
