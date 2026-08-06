"use client"

import * as React from "react"
import { toast } from "sonner"
import { PencilIcon, PlusIcon, SearchIcon } from "lucide-react"

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
import { BALANCO, formatBRL } from "@/lib/data"

export function BalanceView() {
  const [busca, setBusca] = React.useState("")

  const mesAtual = BALANCO[0]
  const lucroAtual = mesAtual.faturamento - mesAtual.repasses

  const indicadores = [
    { titulo: "Faturamento do mês", valor: formatBRL(mesAtual.faturamento), nota: mesAtual.mes },
    { titulo: "Repasses a parceiros", valor: formatBRL(mesAtual.repasses), nota: "a pagar / pago" },
    { titulo: "Lucro líquido", valor: formatBRL(lucroAtual), nota: "após repasses", destaque: true },
  ]

  const linhas = BALANCO.filter((mes) => {
    const termo = busca.trim().toLowerCase()
    return termo === "" || mes.mes.toLowerCase().includes(termo)
  })

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
        <Button onClick={() => toast.success("Novo lançamento")}>
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
    </div>
  )
}
