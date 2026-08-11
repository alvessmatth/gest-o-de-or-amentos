"use client"

import * as React from "react"
import { toast } from "sonner"
import { Eye as EyeIcon, EyeOff as EyeOffIcon, Lock as LockIcon, Mail as MailIcon } from "lucide-react"

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

type Modo = "login" | "cadastro"

export function LoginView({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [modo, setModo] = React.useState<Modo>("login")
  const [email, setEmail] = React.useState("")
  const [senha, setSenha] = React.useState("")
  const [mostrarSenha, setMostrarSenha] = React.useState(false)
  const [processando, setProcessando] = React.useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Acesso direto ao dashboard, sem validação de credenciais/sessão.
    onAuthenticated()
  }

  const ehLogin = modo === "login"

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <img
            src="/logo-scriba-coter.png"
            alt="Scriba Coter"
            className="h-14 w-auto"
          />
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold leading-tight text-balance">
              Gestão de Orçamentos
            </h1>
            <p className="text-sm text-muted-foreground text-pretty">
              {ehLogin
                ? "Acesse sua conta para gerenciar propostas, clientes e repasses."
                : "Crie sua conta para começar a gerenciar seus orçamentos."}
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
                  autoComplete={ehLogin ? "current-password" : "new-password"}
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

          <Button type="submit" size="lg" disabled={processando} className="w-full">
            {processando
              ? ehLogin
                ? "Entrando…"
                : "Criando conta…"
              : ehLogin
                ? "Acessar"
                : "Criar conta"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {ehLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
            <button
              type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => setModo(ehLogin ? "cadastro" : "login")}
            >
              {ehLogin ? "Cadastre-se" : "Entrar"}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Edição científica &amp; tradução acadêmica
        </p>
      </div>
    </main>
  )
}
