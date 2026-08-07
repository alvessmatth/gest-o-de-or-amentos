"use client"

import * as React from "react"
import { toast } from "sonner"
import { PencilIcon, PlusIcon, SaveIcon, SearchIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { PARCEIROS, formatBRL, type Parceiro } from "@/lib/data"

function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter((parte) => parte.length > 2)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase()
}

function formularioInicial() {
  return {
    nome: "",
    especialidade: "",
    repasseMedio: "",
    trabalhos: "",
  }
}

export function PartnersView() {
  const [parceiros, setParceiros] = React.useState<Parceiro[]>(PARCEIROS)
  const [busca, setBusca] = React.useState("")
  const [especialidadeFiltro, setEspecialidadeFiltro] = React.useState<string>("todas")
  const [drawerAberto, setDrawerAberto] = React.useState(false)
  const [form, setForm] = React.useState(formularioInicial)

  const especialidades = React.useMemo(
    () => Array.from(new Set(parceiros.map((p) => p.especialidade))).sort(),
    [parceiros]
  )

  const linhas = parceiros.filter((parceiro) => {
    const termo = busca.trim().toLowerCase()
    const buscaOk =
      termo === "" ||
      parceiro.nome.toLowerCase().includes(termo) ||
      parceiro.especialidade.toLowerCase().includes(termo)
    const especialidadeOk =
      especialidadeFiltro === "todas" || parceiro.especialidade === especialidadeFiltro
    return buscaOk && especialidadeOk
  })

  function salvar() {
    if (form.nome.trim() === "" || form.especialidade.trim() === "") {
      toast.error("Informe o nome e a especialidade")
      return
    }
    const novo: Parceiro = {
      id: crypto.randomUUID(),
      nome: form.nome.trim(),
      especialidade: form.especialidade.trim(),
      repasseMedio: Number(form.repasseMedio) || 0,
      trabalhos: Number(form.trabalhos) || 0,
    }
    setParceiros((atual) => [novo, ...atual])
    toast.success(`Parceiro ${novo.nome} adicionado`)
    setForm(formularioInicial())
    setDrawerAberto(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <InputGroup className="bg-card sm:max-w-xs">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar parceiro ou especialidade"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label="Busca rápida de parceiros"
            />
          </InputGroup>
          <Select
            value={especialidadeFiltro}
            onValueChange={(v) => setEspecialidadeFiltro(v as string)}
          >
            <SelectTrigger className="bg-card sm:w-60" aria-label="Filtrar por especialidade">
              <SelectValue>
                {(value: string) =>
                  value === "todas" ? "Todas as especialidades" : value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="todas">Todas as especialidades</SelectItem>
                {especialidades.map((esp) => (
                  <SelectItem key={esp} value={esp}>
                    {esp}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setDrawerAberto(true)}>
          <PlusIcon data-icon="inline-start" />
          Adicionar parceiro
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table className="min-w-2xl">
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60">
              <TableHead className="min-w-56">Parceiro</TableHead>
              <TableHead className="min-w-56">Especialidade</TableHead>
              <TableHead className="w-44 text-right">Repasse médio</TableHead>
              <TableHead className="w-32 text-right">Trabalhos</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map((parceiro) => (
              <TableRow key={parceiro.id} className="h-16">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {iniciais(parceiro.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{parceiro.nome}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {parceiro.especialidade}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatBRL(parceiro.repasseMedio)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {parceiro.trabalhos}
                </TableCell>
                <TableCell className="text-right">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Editar ${parceiro.nome}`}
                          onClick={() => toast.info(`Editar ${parceiro.nome}`)}
                        />
                      }
                    >
                      <PencilIcon />
                    </TooltipTrigger>
                    <TooltipContent>Editar</TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {linhas.length === 0 && (
          <Empty className="border-t">
            <EmptyHeader>
              <EmptyTitle>Nenhum parceiro encontrado</EmptyTitle>
              <EmptyDescription>
                Ajuste a busca ou o filtro para ver outros parceiros terceirizados.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <Sheet open={drawerAberto} onOpenChange={setDrawerAberto}>
        <SheetContent
          side="right"
          className="w-full gap-0 p-0 sm:max-w-md data-[side=right]:sm:max-w-md"
        >
          <SheetHeader className="border-b bg-card px-5 py-4">
            <SheetTitle className="text-base">Novo parceiro</SheetTitle>
            <SheetDescription>
              Cadastre um profissional ou estúdio terceirizado.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="parceiro-nome">Nome</FieldLabel>
                <Input
                  id="parceiro-nome"
                  placeholder="Marina Toledo"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="parceiro-esp">Especialidade</FieldLabel>
                <Input
                  id="parceiro-esp"
                  placeholder="Tradução EN acadêmica"
                  value={form.especialidade}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, especialidade: e.target.value }))
                  }
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="parceiro-repasse">Repasse médio (R$)</FieldLabel>
                  <Input
                    id="parceiro-repasse"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0,00"
                    value={form.repasseMedio}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, repasseMedio: e.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="parceiro-trab">Trabalhos</FieldLabel>
                  <Input
                    id="parceiro-trab"
                    type="number"
                    min={0}
                    step="1"
                    placeholder="0"
                    value={form.trabalhos}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, trabalhos: e.target.value }))
                    }
                  />
                </Field>
              </div>
            </FieldGroup>
          </div>

          <SheetFooter className="border-t bg-card px-5 py-4">
            <Button onClick={salvar}>
              <SaveIcon data-icon="inline-start" />
              Salvar parceiro
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
