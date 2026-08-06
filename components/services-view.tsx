"use client"

import * as React from "react"
import { toast } from "sonner"
import { PencilIcon, PlusIcon, SaveIcon, SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
import { SERVICOS, UNIDADES, formatBRL, type Servico, type Unidade } from "@/lib/data"

const ORDENS = [
  { value: "nenhum", label: "Ordem padrão" },
  { value: "asc", label: "Preço: menor primeiro" },
  { value: "desc", label: "Preço: maior primeiro" },
]

function formularioInicial() {
  return {
    nome: "",
    unidade: "palavra" as Unidade,
    preco: "",
    prazo: "",
  }
}

export function ServicesView() {
  const [servicos, setServicos] = React.useState<Servico[]>(SERVICOS)
  const [busca, setBusca] = React.useState("")
  const [unidadeFiltro, setUnidadeFiltro] = React.useState<string>("todas")
  const [ordem, setOrdem] = React.useState<string>("nenhum")
  const [drawerAberto, setDrawerAberto] = React.useState(false)
  const [form, setForm] = React.useState(formularioInicial)

  const linhas = servicos
    .filter((servico) => {
      const termo = busca.trim().toLowerCase()
      const buscaOk = termo === "" || servico.nome.toLowerCase().includes(termo)
      const unidadeOk = unidadeFiltro === "todas" || servico.unidade === unidadeFiltro
      return buscaOk && unidadeOk
    })
    .sort((a, b) => {
      if (ordem === "asc") return a.preco - b.preco
      if (ordem === "desc") return b.preco - a.preco
      return 0
    })

  function salvar() {
    if (form.nome.trim() === "") {
      toast.error("Informe o nome do serviço")
      return
    }
    const novo: Servico = {
      id: crypto.randomUUID(),
      nome: form.nome.trim(),
      unidade: form.unidade,
      preco: Number(form.preco) || 0,
      prazo: form.prazo.trim() || "sob demanda",
    }
    setServicos((atual) => [novo, ...atual])
    toast.success(`Serviço "${novo.nome}" adicionado`)
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
              placeholder="Buscar serviço"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label="Busca rápida de serviços"
            />
          </InputGroup>
          <Select value={unidadeFiltro} onValueChange={(v) => setUnidadeFiltro(v as string)}>
            <SelectTrigger className="bg-card sm:w-48" aria-label="Filtrar por unidade">
              <SelectValue>
                {(value: string) =>
                  value === "todas"
                    ? "Todas as unidades"
                    : UNIDADES.find((u) => u.value === value)?.label ?? "Unidade"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="todas">Todas as unidades</SelectItem>
                {UNIDADES.map((unidade) => (
                  <SelectItem key={unidade.value} value={unidade.value}>
                    {unidade.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={ordem} onValueChange={(v) => setOrdem(v as string)}>
            <SelectTrigger className="bg-card sm:w-48" aria-label="Ordenar por preço">
              <SelectValue>
                {(value: string) => ORDENS.find((o) => o.value === value)?.label ?? "Ordenar"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {ORDENS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setDrawerAberto(true)}>
          <PlusIcon data-icon="inline-start" />
          Adicionar serviço
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table className="min-w-2xl">
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60">
              <TableHead className="min-w-56">Serviço</TableHead>
              <TableHead className="w-44">Unidade de medida</TableHead>
              <TableHead className="w-40 text-right">Preço de tabela</TableHead>
              <TableHead className="w-40">Prazo médio</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map((servico) => {
              const unidade = UNIDADES.find((u) => u.value === servico.unidade)
              return (
                <TableRow key={servico.id} className="h-14">
                  <TableCell className="font-medium">{servico.nome}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {unidade?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold tabular-nums">
                      {formatBRL(servico.preco)}
                    </span>
                    <span className="text-xs text-muted-foreground"> {unidade?.abrev}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{servico.prazo}</TableCell>
                  <TableCell className="text-right">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Editar ${servico.nome}`}
                            onClick={() => toast.info(`Editar ${servico.nome}`)}
                          />
                        }
                      >
                        <PencilIcon />
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {linhas.length === 0 && (
          <Empty className="border-t">
            <EmptyHeader>
              <EmptyTitle>Nenhum serviço encontrado</EmptyTitle>
              <EmptyDescription>
                Ajuste a busca ou o filtro para ver outros serviços da tabela de preços.
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
            <SheetTitle className="text-base">Novo serviço</SheetTitle>
            <SheetDescription>
              Adicione um item à sua tabela de preços.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="servico-nome">Nome do serviço</FieldLabel>
                <Input
                  id="servico-nome"
                  placeholder="Normalização ABNT"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="servico-unidade">Unidade de medida</FieldLabel>
                <Select
                  value={form.unidade}
                  onValueChange={(v) => setForm((f) => ({ ...f, unidade: v as Unidade }))}
                >
                  <SelectTrigger id="servico-unidade">
                    <SelectValue>
                      {(value: string) =>
                        UNIDADES.find((u) => u.value === value)?.label ?? "Unidade"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {UNIDADES.map((unidade) => (
                        <SelectItem key={unidade.value} value={unidade.value}>
                          {unidade.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="servico-preco">Preço de tabela (R$)</FieldLabel>
                  <Input
                    id="servico-preco"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0,00"
                    value={form.preco}
                    onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value }))}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="servico-prazo">Prazo médio</FieldLabel>
                  <Input
                    id="servico-prazo"
                    placeholder="3 a 5 dias"
                    value={form.prazo}
                    onChange={(e) => setForm((f) => ({ ...f, prazo: e.target.value }))}
                  />
                </Field>
              </div>
            </FieldGroup>
          </div>

          <SheetFooter className="border-t bg-card px-5 py-4">
            <Button onClick={salvar}>
              <SaveIcon data-icon="inline-start" />
              Salvar serviço
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
