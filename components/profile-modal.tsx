"use client"

import * as React from "react"
import { toast } from "sonner"
import { SaveIcon, UserIcon } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function ProfileModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [nome, setNome] = React.useState("Márcia Maria Palhares")
  const [email, setEmail] = React.useState("marcia@aservos.com.br")
  const [pix, setPix] = React.useState("marcia@aservos.com.br")
  const [salvando, setSalvando] = React.useState(false)

  function handleSalvar() {
    setSalvando(true)
    setTimeout(() => {
      setSalvando(false)
      toast.success("Perfil atualizado com sucesso!")
      onOpenChange(false)
    }, 600)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="border-b bg-card px-5 py-4">
          <SheetTitle className="text-base">Meu Perfil</SheetTitle>
          <SheetDescription>
            Gerencie suas informações pessoais e dados cadastrais.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 p-5">
          <div className="flex items-center gap-4 border-b pb-4">
            <Avatar className="size-14">
              <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                MP
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold">{nome}</span>
              <span className="text-xs text-muted-foreground">
                Edição de Livros & Tradução Acadêmica
              </span>
            </div>
          </div>

          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="prof-nome">Nome completo</FieldLabel>
              <Input
                id="prof-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="prof-email">E-mail de contato</FieldLabel>
              <Input
                id="prof-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="prof-pix">Chave PIX padrão (Exibida no PDF)</FieldLabel>
              <Input
                id="prof-pix"
                value={pix}
                onChange={(e) => setPix(e.target.value)}
              />
            </Field>
          </FieldGroup>
        </div>

        <SheetFooter className="border-t bg-card px-5 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={salvando}>
            <SaveIcon className="mr-2 size-4" />
            {salvando ? "Salvando…" : "Salvar alterações"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}