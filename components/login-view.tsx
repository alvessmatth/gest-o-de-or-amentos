"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  BookMarkedIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { supabase } from "@/lib/supabase"

export function LoginView({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [email, setEmail] = React.useState("")
  const [senha, setSenha] = React.useState("")
  const [mostrarSenha, setMostrarSenha] = React.useState(false)
  const [entrando, setEntrando] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email.trim() || !senha.trim()) {
      toast.error("Informe e-mail e senha para continuar")
      return
    }

    setEntrando(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      })
      if (error) {
        toast.error("Não foi possível entrar. Verifique suas credenciais.")
        return
      }
      toast.success("Acesso liberado")
      onAuthenticated()
    } catch {
      toast.error("Erro inesperado ao entrar")
    } finally {
      setEntrando(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookMarkedIcon className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold leading-tight text-balance">
              Gestão de Orçamentos
            </h1>
            <p className="text-sm text-muted-foreground text-pretty">
              Acesse sua conta para gerenciar propostas, clientes e repasses.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-xs"
        >
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <InputGroup className="h-9 bg-background">
                <InputGroupAddon>
                  <MailIcon />
                </InputGroupAddon>
                <InputGroupInput
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="senha">Senha</FieldLabel>
              <InputGroup className="h-9 bg-background">
                <InputGroupAddon>
                  <LockIcon />
                </InputGroupAddon>
                <InputGroupInput
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setMostrarSenha((v) => !v)}
                  >
                    {mostrarSenha ? <EyeOffIcon /> : <EyeIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </FieldGroup>

          <Button type="submit" size="lg" disabled={entrando} className="w-full">
            {entrando ? "Entrando…" : "Acessar"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Edição científica &amp; tradução acadêmica
        </p>
      </div>
    </main>
  )
}
