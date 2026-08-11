"use client"

import * as React from "react"
import { gerarPDFOrcamento } from "@/lib/pdf"
import { toast } from "sonner"
import { CircleCheck as CheckCircle2Icon, FileText as FileTextIcon, Pencil as PencilIcon, Plus as PlusIcon, Search as SearchIcon, SlidersHorizontal as SlidersHorizontalIcon, Building2 as Building2Icon, User as UserIcon, Trash2 as Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { ServicoPill } from "@/components/atoms"
import { BudgetDrawer } from "@/components/budget-drawer"
import {
  STATUS_LABEL,
  formatBRL,
  formatData,
  type Orcamento,
  type StatusOrcamento,
} from "@/lib/data"
import {
  atualizarStatusOrcamento,
  excluirOrcamento,
  listarOrcamentos,
} from "@/lib/orcamentos-api"

type OrcamentoExibicao = Orcamento & {
  clienteNome: string
  clienteSigla: string
  ehUniversidade: boolean
  rawItens?: any[]
}

const BADGE_STATUS_STYLE: Record<StatusOrcamento, string> = {
  rascunho: "bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-zinc-200",
  enviado: "bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200",
  execucao: "bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200",
  concluido: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200",
  pago: "bg-purple-50 text-purple-700 hover:bg-purple-50 border-purple-200",
}

export function BudgetsView() {
  const [busca, setBusca] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("todos")
  const [drawerAberto, setDrawerAberto] = React.useState(false)
  const [orcamentoParaEditar, setOrcamentoParaEditar] = React.useState<OrcamentoExibicao | null>(null)
  const [orcamentos, setOrcamentos] = React.useState<OrcamentoExibicao[]>([])
  const [carregando, setCarregando] = React.useState(true)

  const carregarOrcamentos = React.useCallback(async () => {
    setCarregando(true)
    try {
      const dados = await listarOrcamentos()
      setOrcamentos(
        dados.map((d) => ({
          id: d.id,
          codigo: d.codigo,
          clienteId: d.clienteId,
          clienteNome: d.clienteNome,
          clienteSigla: d.clienteSigla,
          ehUniversidade: d.ehUniversidade,
          data: d.data,
          validade: d.validade,
          servicos: d.servicos,
          valorTotal: d.valorTotal,
          repasses: d.repasses,
          status: d.status,
          licitacao: d.licitacao,
          rawItens: d.rawItens,
        }))
      )
    } catch (err) {
      console.error(err)
      toast.error("Erro ao carregar orçamentos do banco de dados")
    } finally {
      setCarregando(false)
    }
  }, [])

  React.useEffect(() => {
    void carregarOrcamentos()
  }, [carregarOrcamentos])

  async function handleMudarStatus(id: string, novoStatus: StatusOrcamento) {
    setOrcamentos((atual) =>
      atual.map((o) => (o.id === id ? { ...o, status: novoStatus } : o))
    )
    try {
      await atualizarStatusOrcamento(id, novoStatus)
      toast.success(`Status alterado para: ${STATUS_LABEL[novoStatus]}`)
    } catch {
      toast.error("Erro ao atualizar status no banco")
    }
  }

  function handleConcluir(orcamento: OrcamentoExibicao) {
    void handleMudarStatus(orcamento.id, "concluido")
  }

  async function handleExcluir(orcamento: OrcamentoExibicao) {
    if (!confirm(`Tem certeza que deseja excluir o orçamento "${orcamento.codigo}"? Esta ação não pode ser desfeita.`)) return
    setOrcamentos((atual) => atual.filter((o) => o.id !== orcamento.id))
    try {
      await excluirOrcamento(orcamento.id)
      toast.success(`Orçamento ${orcamento.codigo} excluído com sucesso!`)
    } catch {
      toast.error("Erro ao excluir orçamento no banco")
      void carregarOrcamentos()
    }
  }

  function handleAbrirEdicao(orcamento: OrcamentoExibicao) {
    setOrcamentoParaEditar(orcamento)
    setDrawerAberto(true)
  }

  function handleCriarNovo() {
    setOrcamentoParaEditar(null)
    setDrawerAberto(true)
  }

  const linhas = orcamentos.filter((orcamento) => {
    const termo = busca.trim().toLowerCase()
    const combinaBusca =
      termo === "" ||
      orcamento.codigo.toLowerCase().includes(termo) ||
      orcamento.clienteNome.toLowerCase().includes(termo) ||
      orcamento.clienteSigla.toLowerCase().includes(termo) ||
      orcamento.servicos.some((s) => s.toLowerCase().includes(termo))
    const combinaStatus = statusFilter === "todos" || orcamento.status === statusFilter
    return combinaBusca && combinaStatus
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <InputGroup className="bg-card sm:max-w-xs">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar código, cliente ou serviço"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label="Busca rápida de orçamentos"
            />
          </InputGroup>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as string)}>
            <SelectTrigger className="bg-card sm:w-48" aria-label="Filtrar por status">
              <SlidersHorizontalIcon className="size-4 text-muted-foreground" />
              <SelectValue>
                {(value: string) =>
                  value === "todos"
                    ? "Todos os status"
                    : STATUS_LABEL[value as StatusOrcamento]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="todos">Todos os status</SelectItem>
                {(Object.keys(STATUS_LABEL) as StatusOrcamento[]).map((chave) => (
                  <SelectItem key={chave} value={chave}>
                    {STATUS_LABEL[chave]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCriarNovo}>
          <PlusIcon data-icon="inline-start" />
          Criar novo orçamento
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table className="min-w-4xl">
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60">
              <TableHead className="w-36">Cód. proposta</TableHead>
              <TableHead className="min-w-56">Cliente</TableHead>
              <TableHead className="w-40">Data &amp; validade</TableHead>
              <TableHead className="min-w-64">Serviços contratados</TableHead>
              <TableHead className="w-36 text-right">Valor total</TableHead>
              <TableHead className="w-44">Status</TableHead>
              <TableHead className="w-36 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map((orcamento) => (
              <TableRow key={orcamento.id} className="h-16">
                <TableCell className="font-mono text-xs font-semibold">
                  {orcamento.codigo}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      {orcamento.ehUniversidade ? (
                        <Building2Icon className="size-4" />
                      ) : (
                        <UserIcon className="size-4" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm leading-tight">
                        {orcamento.clienteSigla}
                      </span>
                      <span className="truncate text-xs text-muted-foreground max-w-[200px]">
                        {orcamento.clienteNome}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col text-xs">
                    <span>{formatData(orcamento.data)}</span>
                    <span className="text-muted-foreground">
                      válido até {formatData(orcamento.validade)}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {orcamento.servicos.map((servico, i) => (
                      <ServicoPill key={`${servico}-${i}`} nome={servico} />
                    ))}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <span className="font-semibold tabular-nums">
                    {formatBRL(orcamento.valorTotal)}
                  </span>
                </TableCell>

                <TableCell>
                  {orcamento.status === "concluido" ? (
                    <Badge variant="outline" className={BADGE_STATUS_STYLE["concluido"]}>
                      {STATUS_LABEL["concluido"]}
                    </Badge>
                  ) : (
                    <Select
                      value={orcamento.status}
                      onValueChange={(v) =>
                        void handleMudarStatus(orcamento.id, v as StatusOrcamento)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs bg-background border">
                        <SelectValue>
                          {(value: string) => (
                            <Badge variant="outline" className={BADGE_STATUS_STYLE[value as StatusOrcamento] || ""}>
                              {STATUS_LABEL[value as StatusOrcamento] || value}
                            </Badge>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {(Object.keys(STATUS_LABEL) as StatusOrcamento[])
                            .filter((st) => st !== "concluido")
                            .map((st) => (
                              <SelectItem key={st} value={st} className="text-xs">
                                {STATUS_LABEL[st]}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Gerar PDF — ${orcamento.codigo}`}
                            onClick={() => {
                              gerarPDFOrcamento({
                                codigo_proposta: orcamento.codigo,
                                cliente_nome: `${orcamento.clienteSigla} - ${orcamento.clienteNome}`,
                                servicos_resumo: orcamento.servicos.join(", "),
                                valor_total: orcamento.valorTotal,
                                validade_dias: 30,
                                titulo_artigo: orcamento.licitacao?.titulo,
                                docente_responsavel: orcamento.licitacao?.docente,
                                numero_processo: orcamento.licitacao?.processo,
                              })
                              toast.success(`Gerando PDF: ${orcamento.codigo}`)
                            }}
                          />
                        }
                      >
                        <FileTextIcon />
                      </TooltipTrigger>
                      <TooltipContent>Gerar PDF</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Editar — ${orcamento.codigo}`}
                            onClick={() => handleAbrirEdicao(orcamento)}
                          />
                        }
                      >
                        <PencilIcon />
                      </TooltipTrigger>
                      <TooltipContent>Editar orçamento</TooltipContent>
                    </Tooltip>

                    {orcamento.status !== "concluido" && (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              aria-label={`Concluir orçamento — ${orcamento.codigo}`}
                              onClick={() => handleConcluir(orcamento)}
                            />
                          }
                        >
                          <CheckCircle2Icon />
                        </TooltipTrigger>
                        <TooltipContent>Concluir e encerrar</TooltipContent>
                      </Tooltip>
                    )}

                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:bg-destructive/10"
                            aria-label={`Excluir orçamento — ${orcamento.codigo}`}
                            onClick={() => handleExcluir(orcamento)}
                          />
                        }
                      >
                        <Trash2Icon />
                      </TooltipTrigger>
                      <TooltipContent>Excluir orçamento</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {linhas.length === 0 && (
          <Empty className="border-t">
            <EmptyHeader>
              <EmptyTitle>Nenhum orçamento encontrado</EmptyTitle>
              <EmptyDescription>
                Ajuste a busca ou o filtro para visualizar outras propostas.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {carregando
          ? "Carregando propostas…"
          : `${linhas.length} de ${orcamentos.length} propostas`}
      </p>

      <BudgetDrawer
        open={drawerAberto}
        onOpenChange={setDrawerAberto}
        orcamentoParaEditar={orcamentoParaEditar}
        onSaved={() => void carregarOrcamentos()}
      />
    </div>
  )
}
