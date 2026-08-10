"use client"

import * as React from "react"
import { toast } from "sonner"
import { SaveIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"

export function SettingsView() {
  const [validadeDias, setValidadeDias] = React.useState("30")
  const [autoArredondar, setAutoArredondar] = React.useState(false)
  const [marcadAgua, setMarcaDagua] = React.useState(true)

  function handleSalvar() {
    toast.success("Configurações salvas com sucesso!")
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações do Sistema</h1>
        <p className="text-sm text-muted-foreground">
          Ajuste as preferências gerais para propostas, documentos PDF e comportamento da plataforma.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Padrões de Orçamento & PDF</CardTitle>
          <CardDescription>
            Defina as preferências que serão aplicadas em novas propostas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-6">
            <Field>
              <FieldLabel htmlFor="validade-dias">Validade padrão da proposta (em dias)</FieldLabel>
              <Input
                id="validade-dias"
                type="number"
                className="max-w-xs"
                value={validadeDias}
                onChange={(e) => setValidadeDias(e.target.value)}
              />
              <FieldDescription>
                Número de dias a partir da criação em que o orçamento será válido.
              </FieldDescription>
            </Field>

            <Field orientation="horizontal" className="justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FieldLabel htmlFor="arredondar-switch">Arredondamento automático de centavos</FieldLabel>
                <FieldDescription>
                  Arredonda o total final automaticamente para o valor inteiro mais próximo.
                </FieldDescription>
              </div>
              <Switch
                id="arredondar-switch"
                checked={autoArredondar}
                onCheckedChange={setAutoArredondar}
              />
            </Field>

            <Field orientation="horizontal" className="justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FieldLabel htmlFor="cabecalho-switch">Exibir cabeçalho padrão no PDF</FieldLabel>
                <FieldDescription>
                  Inclui logomarca e texto de &quot;Edição Científica & Tradução Acadêmica&quot;.
                </FieldDescription>
              </div>
              <Switch
                id="cabecalho-switch"
                checked={marcadAgua}
                onCheckedChange={setMarcaDagua}
              />
            </Field>
          </FieldGroup>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSalvar}>
              <SaveIcon className="mr-2 size-4" />
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}