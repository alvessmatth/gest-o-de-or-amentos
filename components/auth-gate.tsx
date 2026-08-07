"use client"

import * as React from "react"

import { AppShell } from "@/components/app-shell"
import { LoginView } from "@/components/login-view"
import { supabase } from "@/lib/supabase"

export function AuthGate() {
  const [autenticado, setAutenticado] = React.useState(false)
  const [carregando, setCarregando] = React.useState(true)

  React.useEffect(() => {
    let ativo = true

    supabase.auth.getSession().then(({ data }) => {
      if (!ativo) return
      setAutenticado(Boolean(data.session))
      setCarregando(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAutenticado(Boolean(session))
    })

    return () => {
      ativo = false
      listener.subscription.unsubscribe()
    }
  }, [])

  if (carregando) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Carregando…</span>
      </div>
    )
  }

  if (!autenticado) {
    return <LoginView onAuthenticated={() => setAutenticado(true)} />
  }

  return <AppShell />
}
