"use client"

import * as React from "react"
import { toast } from "sonner"
import { PencilIcon, PlusIcon, SaveIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
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
import { BALANCO, formatBRL, type MesBalanco } from "@/lib/data"

function formularioInicial() {
  return {
    mes: "",
    orcamentos: "",
    faturamento: "",
    repasses: "",
    recebido: "",
  }
}

export function BalanceView() {
  const [balanco, setBalanco] = React.useState<MesBalanco[]>(BALANCO)
  const [busca, setBusca] = React.useState("")
  const [drawerAberto, setDrawerAberto] = React.useState(false)
  const [form, setForm] = React.useState(formularioInicial)

  const mesAtual = balanco[0]
  const lucroAtual = mesAtual ? mesAtual.faturamento - mesAtual.repasses : 0

  const indicadores = mesAtual
    ? [
        { titulo: "Faturamento do mês", valor: formatBRL(mesAtual.faturamento), nota: mesAtual.mes },
        { titulo: "Repasses a parceiros", valor: formatBRL(mesAtual.repasses), nota: "a pagar / pago" },
        { titulo: "Lucro líquido", valor: formatBRL(lucroAtual), nota: "após repasses", destaque: true },
      ]
    : []

  const linhas = balanco.filter((mes) => {
    const termo = busca.trim().toLowerCase()
    return termo === "" || mes.mes.toLowerCase().includes(termo)
  })

  function salvar() {
    if (form.mes.trim() === "") {
      toast.error("Informe o mês de referência")
      return
    }
    const novo: MesBalanco = {
      mes: form.mes.trim(),
      orcamentos: Number(form.orcamentos) || 0,
      faturamento: Number(form.faturamento) || 0,
      repasses: Number(form.repasses) || 0,
      recebido: Number(form.recebido) || 0,
    }
    setBalanco((atual) => [novo, ...atual])
    toast.success(`Lançamento de ${novo.mes} adicionado`)
    setForm(formularioInicial())
    setDrawerAberto(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {indicadores.map((indicador) => (
          <Card key={indicador.titulo} className="shadow-xs">
            <CardHeader>
              <CardDescription>{indicador.titulo}</CardDescription>
              <CardTitle
                className={
                  indicador.destaque
                    ? "text-2xl tabular-nums text-success"
                    : "text-2xl tabular-nums"
                }
              >
                {indicador.valor}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {indicador.nota}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <InputGroup className="bg-card sm:max-w-xs">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar mês"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Busca rápida no balanço mensal"
          />
        </InputGroup>
        <Button onClick={() => setDrawerAberto(true)}>
          <PlusIcon data-icon="inline-start" />
          Adicionar lançamento
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table className="min-w-3xl">
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60">
              <TableHead className="min-w-40">Mês</TableHead>
              <TableHead className="w-28 text-right">Propostas</TableHead>
              <TableHead className="w-40 text-right">Faturamento</TableHead>
              <TableHead className="w-40 text-right">Repasses</TableHead>
              <TableHead className="w-40 text-right">Lucro líquido</TableHead>
              <TableHead className="w-40 text-right">Recebido</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map((mes) => (
              <TableRow key={mes.mes} className="h-14">
                <TableCell className="font-medium">{mes.mes}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {mes.orcamentos}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatBRL(mes.faturamento)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatBRL(mes.repasses)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums text-success">
                  {formatBRL(mes.faturamento - mes.repasses)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatBRL(mes.recebido)}
                </TableCell>
                <TableCell className="text-right">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Editar ${mes.mes}`}
                          onClick={() => toast.info(`Editar ${mes.mes}`)}
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
              <EmptyTitle>Nenhum mês encontrado</EmptyTitle>
              <EmptyDescription>
                Ajuste a busca para ver outros períodos do balanço.
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
            <SheetTitle className="text-base">Novo lançamento mensal</SheetTitle>
            <SheetDescription>
              Registre o resultado de um período no balanço.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="balanco-mes">Mês de referência</FieldLabel>
                <Input
                  id="balanco-mes"
                  placeholder="Agosto 2026"
                  value={form.mes}
                  onChange={(e) => setForm((f) => ({ ...f, mes: e.target.value }))}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="balanco-orc">Propostas</FieldLabel>
                  <Input
                    id="balanco-orc"
                    type="number"
                    min={0}
                    step="1"
                    placeholder="0"
                    value={form.orcamentos}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, orcamentos: e.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="balanco-fat">Faturamento (R$)</FieldLabel>
                  <Input
                    id="balanco-fat"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0,00"
                    value={form.faturamento}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, faturamento: e.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="balanco-rep">Repasses (R$)</FieldLabel>
                  <Input
                    id="balanco-rep"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0,00"
                    value={form.repasses}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, repasses: e.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="balanco-receb">Recebido (R$)</FieldLabel>
                  <Input
                    id="balanco-receb"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0,00"
                    value={form.recebido}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, recebido: e.target.value }))
                    }
                  />
                </Field>
              </div>
            </FieldGroup>
          </div>

          <SheetFooter className="border-t bg-card px-5 py-4">
            <Button onClick={salvar}>
              <SaveIcon data-icon="inline-start" />
              Salvar lançamento
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
