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

  const STATUS_CORES: Record<string, { label: string; cor: string }> = {
    rascunho: { label: "Rascunho", cor: "#a1a1aa" },
    enviado: { label: "Enviado", cor: "#3b82f6" },
    execucao: { label: "Em execução", cor: "#f59e0b" },
    concluido: { label: "Concluído", cor: "#10b981" },
    pago: { label: "Pago", cor: "#8b5cf6" },
  }

  const segmentos = Object.entries(STATUS_CORES)
    .map(([chave, info]) => ({
      ...info,
      quantidade: orcamentos.filter((o) => o.status === chave).length,
    }))
    .filter((s) => s.quantidade > 0)

  const totalSegmentos = segmentos.reduce((acc, s) => acc + s.quantidade, 0)

  let acumulado = 0
  const gradientStops = segmentos
    .map((s) => {
      const inicio = (acumulado / totalSegmentos) * 100
      acumulado += s.quantidade
      const fim = (acumulado / totalSegmentos) * 100
      return `${s.cor} ${inicio}% ${fim}%`
    })
    .join(", ")

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
          <CardContent>
            {totalSegmentos === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum orçamento cadastrado ainda.
              </p>
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
                <div className="relative flex size-40 shrink-0 items-center justify-center">
                  <div
                    className="size-40 rounded-full"
                    style={{ background: `conic-gradient(${gradientStops})` }}
                    role="img"
                    aria-label="Gráfico de pizza da distribuição de status dos orçamentos"
                  />
                  <div className="absolute flex size-24 flex-col items-center justify-center rounded-full bg-card">
                    <span className="text-2xl font-bold tabular-nums">{totalSegmentos}</span>
                    <span className="text-[10px] text-muted-foreground">propostas</span>
                  </div>
                </div>

                <ul className="flex flex-col gap-2">
                  {segmentos.map((s) => (
                    <li key={s.label} className="flex items-center gap-2 text-sm">
                      <span
                        className="size-3 shrink-0 rounded-sm"
                        style={{ backgroundColor: s.cor }}
                        aria-hidden="true"
                      />
                      <span className="flex-1 text-muted-foreground">{s.label}</span>
                      <span className="font-medium tabular-nums">
                        {s.quantidade}
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({((s.quantidade / totalSegmentos) * 100).toFixed(0)}%)
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
