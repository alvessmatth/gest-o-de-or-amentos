"use client"

import * as React from "react"
import { ArrowUpRight as ArrowUpRightIcon, CircleCheck as CheckCircle2Icon, Clock as ClockIcon, DollarSign as DollarSignIcon, FileText as FileTextIcon, TrendingUp as TrendingUpIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatBRL } from "@/lib/data"
import { listarOrcamentos } from "@/lib/orcamentos-api"
import { listarBalancoDB, type BalancoDB } from "@/lib/cadastros-api"

type OrcamentoResumo = {
  id: string
  valorTotal: number
  repasses: number
  status: string
}

export function DashboardView({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void
}) {
  const [orcamentos, setOrcamentos] = React.useState<OrcamentoResumo[]>([])
  const [balanco, setBalanco] = React.useState<BalancoDB[]>([])

  React.useEffect(() => {
    void (async () => {
      try {
        const [dadosOrc, dadosBal] = await Promise.all([
          listarOrcamentos(),
          listarBalancoDB(),
        ])
        setOrcamentos(
          dadosOrc.map((o) => ({
            id: o.id,
            valorTotal: o.valorTotal,
            repasses: o.repasses,
            status: o.status,
          }))
        )
        setBalanco(dadosBal)
      } catch {
        // silent — dashboard shows zeros on error
      }
    })()
  }, [])

  const totalOrcamentos = orcamentos.length
  const emExecucao = orcamentos.filter((o) => o.status === "execucao").length
  const concluidos = orcamentos.filter(
    (o) => o.status === "concluido" || o.status === "pago"
  ).length
  const emRascunho = orcamentos.filter((o) => o.status === "rascunho").length

  const faturamentoTotal = orcamentos.reduce((acc, o) => acc + o.valorTotal, 0)
  const repassesTotais = orcamentos.reduce((acc, o) => acc + o.repasses, 0)
  const lucroLiquidoTotal = faturamentoTotal - repassesTotais

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel de Controle</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhamento de métricas, status de orçamentos e saúde financeira.
          </p>
        </div>
        <Button onClick={() => onNavigate?.("orcamentos")}>
          <FileTextIcon className="mr-2 size-4" />
          Ver todos os orçamentos
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento Total
            </CardTitle>
            <DollarSignIcon className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {formatBRL(faturamentoTotal)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {totalOrcamentos} propostas geradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro Líquido Acumulado
            </CardTitle>
            <TrendingUpIcon className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums text-emerald-600">
              {formatBRL(lucroLiquidoTotal)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Após repasses ({formatBRL(repassesTotais)})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Execução
            </CardTitle>
            <ClockIcon className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{emExecucao}</div>
            <p className="mt-1 text-xs text-muted-foreground">Propostas em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Concluídos / Pagos
            </CardTitle>
            <CheckCircle2Icon className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{concluidos}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {((concluidos / (totalOrcamentos || 1)) * 100).toFixed(0)}% de taxa de conclusão
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição de Status dos Orçamentos</CardTitle>
            <CardDescription>Resumo situacional de todas as propostas</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Em Execução</span>
                <span className="font-medium">
                  {emExecucao} / {totalOrcamentos}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-amber-500"
                  style={{ width: `${(emExecucao / (totalOrcamentos || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Concluídos e Pagos</span>
                <span className="font-medium">
                  {concluidos} / {totalOrcamentos}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: `${(concluidos / (totalOrcamentos || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rascunhos / Pendentes</span>
                <span className="font-medium">
                  {emRascunho} / {totalOrcamentos}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-zinc-400"
                  style={{ width: `${(emRascunho / (totalOrcamentos || 1)) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Histórico Mensal Recente</CardTitle>
              <CardDescription>Faturamento bruto vs. repasses por mês</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate?.("balanco")}>
              Detalhes <ArrowUpRightIcon className="ml-1 size-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {balanco.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum lançamento mensal cadastrado ainda.
                </p>
              )}
              {balanco.slice(0, 3).map((item) => (
                <div
                  key={item.id || item.mes}
                  className="flex items-center justify-between border-b pb-2.5 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{item.mes}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.orcamentos} orçamentos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatBRL(item.faturamento)}</p>
                    <p className="text-xs text-emerald-600">
                      Lucro: {formatBRL(item.faturamento - item.repasses)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
