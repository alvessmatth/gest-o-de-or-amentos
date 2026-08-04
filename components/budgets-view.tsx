"use client"

import * as React from "react"
import { gerarPDFOrcamento } from '@/lib/pdf'
import { toast } from "sonner"
import {
  FileTextIcon,
  MessageCircleIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SlidersHorizontalIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { ClienteIcon, ServicoPill, StatusBadge } from "@/components/atoms"
import { BudgetDrawer } from "@/components/budget-drawer"
import {
  ORCAMENTOS,
  STATUS_LABEL,
  formatBRL,
  formatData,
  getCliente,
  type Orcamento,
  type StatusOrcamento,
} from "@/lib/data"
import { listarOrcamentos, type OrcamentoListado } from "@/lib/orcamentos-api"

const ACOES = [
  { label: "Gerar PDF", icon: FileTextIcon, mensagem: "PDF gerado" },
  { label: "WhatsApp", icon: MessageCircleIcon, mensagem: "Enviado por WhatsApp" },
  { label: "Editar", icon: PencilIcon, mensagem: "Abrindo edição" },
]

function paraOrcamento(row: OrcamentoListado): Orcamento {
  return {
    id: row.id,
    codigo: row.codigo,
    clienteId: row.clienteId,
    data: row.data,
    validade: row.validade,
    servicos: row.servicos,
    valorTotal: row.valorTotal,
    repasses: row.repasses,
    status: row.status,
    licitacao: row.licitacao,
  }
}

export function BudgetsView() {
  const [busca, setBusca] = React.useState("")
  const [status, setStatus] = React.useState<string>("todos")
  const [drawerAberto, setDrawerAberto] = React.useState(false)
  const [orcamentos, setOrcamentos] = React.useState<Orcamento[]>(ORCAMENTOS)
  const [carregando, setCarregando] = React.useState(true)

  const carregarOrcamentos = React.useCallback(async () => {
    setCarregando(true)
    try {
      const dados = await listarOrcamentos()
      if (dados.length > 0) {
        setOrcamentos(dados.map(paraOrcamento))
      } else {
        setOrcamentos(ORCAMENTOS)
      }
    } catch {
      toast.error("Não foi possível carregar orçamentos do Supabase")
      setOrcamentos(ORCAMENTOS)
    } finally {
      setCarregando(false)
    }
  }, [])

  React.useEffect(() => {
    void carregarOrcamentos()
  }, [carregarOrcamentos])

  const linhas = orcamentos.filter((orcamento) => {
    const cliente = getCliente(orcamento.clienteId)
    const termo = busca.trim().toLowerCase()
    const combinaBusca =
      termo === "" ||
      orcamento.codigo.toLowerCase().includes(termo) ||
      cliente?.nome.toLowerCase().includes(termo) ||
      cliente?.sigla.toLowerCase().includes(termo) ||
      orcamento.servicos.some((s) => s.toLowerCase().includes(termo))
    const combinaStatus = status === "todos" || orcamento.status === status
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
          <Select value={status} onValueChange={(v) => setStatus(v as string)}>
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
        <Button onClick={() => setDrawerAberto(true)}>
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
              <TableHead className="w-36">Status</TableHead>
              <TableHead className="w-32 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map((orcamento) => {
              const cliente = getCliente(orcamento.clienteId)
              return (
                <TableRow key={orcamento.id} className="h-16">
                  <TableCell className="font-mono text-xs font-medium">
                    {orcamento.codigo}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {cliente && <ClienteIcon tipo={cliente.tipo} />}
                      <div className="flex flex-col">
                        <span className="font-medium">{cliente?.sigla}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {cliente?.nome}
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
                      {orcamento.servicos.map((servico) => (
                        <ServicoPill key={servico} nome={servico} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold tabular-nums">
                      {formatBRL(orcamento.valorTotal)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={orcamento.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-0.5">
                      {ACOES.map((acao) => (
                        <Tooltip key={acao.label}>
                          <TooltipTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`${acao.label} — ${orcamento.codigo}`}
                                onClick={() => {
                                  if (acao.label === "Gerar PDF") {
                                    const clienteObj = getCliente(orcamento.clienteId)
                                    gerarPDFOrcamento({
                                      codigo_proposta: orcamento.codigo,
                                      cliente_nome: clienteObj ? `${clienteObj.sigla} - ${clienteObj.nome}` : "Cliente",
                                      servicos_resumo: orcamento.servicos.join(", "),
                                      valor_total: orcamento.valorTotal,
                                      validade_dias: 30,
                                      titulo_artigo: orcamento.licitacao?.titulo,
                                      docente_responsavel: orcamento.licitacao?.docente,
                                      numero_processo: orcamento.licitacao?.processo,
                                    })
                                    toast.success(`Gerando PDF: ${orcamento.codigo}`)
                                  } else {
                                    toast.success(`${acao.mensagem}: ${orcamento.codigo}`)
                                  }
                                }}
                              />
                            }
                          >
                            <acao.icon />
                          </TooltipTrigger>
                          <TooltipContent>{acao.label}</TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {linhas.length === 0 && (
          <Empty className="border-t">
            <EmptyHeader>
              <EmptyTitle>Nenhum orçamento encontrado</EmptyTitle>
              <EmptyDescription>
                Ajuste a busca ou o filtro de status para ver outras propostas.
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
        onSaved={() => void carregarOrcamentos()}
      />
    </div>
  )
}
