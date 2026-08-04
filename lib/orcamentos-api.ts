import { SERVICOS, type StatusOrcamento, type Unidade } from "@/lib/data"
import { supabase } from "@/lib/supabase"

export type OrcamentoItemInput = {
  servicoId: string
  unidade: Unidade
  quantidade: number
  valorUnitario: number
  terceirizado: boolean
  parceiroId: string
  repasse: number
}

export type SalvarOrcamentoInput = {
  clienteId: string
  exigencia: boolean
  tituloArtigo?: string
  docente?: string
  cpfProfessor?: string
  numeroProcesso?: string
  valorTotal: number
  repasses: number
  status?: StatusOrcamento
  itens: OrcamentoItemInput[]
}

type OrcamentoRow = {
  id: string
  codigo: string
  cliente_id: string
  data: string
  validade: string
  valor_total: number
  repasses: number
  status: StatusOrcamento
  exigencia: boolean
  titulo_artigo: string | null
  docente: string | null
  cpf_professor: string | null
  numero_processo: string | null
}

type OrcamentoItemRow = {
  servico_id: string
  servicos: { nome: string } | { nome: string }[] | null
}

function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T12:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function gerarCodigo(exigencia: boolean) {
  const prefixo = exigencia ? "LIC" : "ORC"
  const agora = new Date()
  const stamp =
    String(agora.getFullYear()).slice(-2) +
    String(agora.getMonth() + 1).padStart(2, "0") +
    String(agora.getDate()).padStart(2, "0")
  const seq = String(Math.floor(Math.random() * 9000) + 1000)
  return `${prefixo}-${stamp}${seq.slice(-4)}`
}

export async function salvarOrcamento(input: SalvarOrcamentoInput) {
  const hoje = new Date().toISOString().slice(0, 10)
  const validade = addDays(hoje, 30)

  const { data: orcamento, error: orcamentoError } = await supabase
    .from("orcamentos")
    .insert({
      codigo: gerarCodigo(input.exigencia),
      cliente_id: input.clienteId,
      data: hoje,
      validade,
      valor_total: input.valorTotal,
      repasses: input.repasses,
      status: input.status ?? "rascunho",
      exigencia: input.exigencia,
      titulo_artigo: input.exigencia ? input.tituloArtigo || null : null,
      docente: input.exigencia ? input.docente || null : null,
      cpf_professor: input.exigencia ? input.cpfProfessor || null : null,
      numero_processo: input.exigencia ? input.numeroProcesso || null : null,
    })
    .select("id, codigo")
    .single()

  if (orcamentoError) {
    throw new Error(orcamentoError.message)
  }

  const linhas = input.itens.map((item, ordem) => ({
    orcamento_id: orcamento.id,
    servico_id: item.servicoId,
    unidade: item.unidade,
    quantidade: item.quantidade,
    valor_unitario: item.valorUnitario,
    terceirizado: item.terceirizado,
    parceiro_id: item.terceirizado && item.parceiroId ? item.parceiroId : null,
    repasse: item.terceirizado ? item.repasse : 0,
    ordem,
  }))

  const { error: itensError } = await supabase.from("orcamento_itens").insert(linhas)

  if (itensError) {
    await supabase.from("orcamentos").delete().eq("id", orcamento.id)
    throw new Error(itensError.message)
  }

  return orcamento
}

export type OrcamentoListado = {
  id: string
  codigo: string
  clienteId: string
  data: string
  validade: string
  servicos: string[]
  valorTotal: number
  repasses: number
  status: StatusOrcamento
  licitacao?: {
    titulo: string
    docente: string
    cpf: string
    processo: string
  }
}

function nomeServico(item: OrcamentoItemRow) {
  const rel = item.servicos
  if (!rel) {
    return SERVICOS.find((s) => s.id === item.servico_id)?.nome ?? item.servico_id
  }
  if (Array.isArray(rel)) {
    return rel[0]?.nome ?? item.servico_id
  }
  return rel.nome
}

export async function listarOrcamentos(): Promise<OrcamentoListado[]> {
  const { data, error } = await supabase
    .from("orcamentos")
    .select(
      `
      id,
      codigo,
      cliente_id,
      data,
      validade,
      valor_total,
      repasses,
      status,
      exigencia,
      titulo_artigo,
      docente,
      cpf_professor,
      numero_processo,
      orcamento_itens (
        servico_id,
        servicos ( nome )
      )
    `
    )
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data as (OrcamentoRow & { orcamento_itens: OrcamentoItemRow[] })[]).map(
    (row) => {
      const licitacao =
        row.exigencia &&
        row.titulo_artigo &&
        row.docente &&
        row.cpf_professor &&
        row.numero_processo
          ? {
              titulo: row.titulo_artigo,
              docente: row.docente,
              cpf: row.cpf_professor,
              processo: row.numero_processo,
            }
          : undefined

      return {
        id: row.id,
        codigo: row.codigo,
        clienteId: row.cliente_id,
        data: row.data,
        validade: row.validade,
        servicos: row.orcamento_itens.map((item) => nomeServico(item)),
        valorTotal: Number(row.valor_total),
        repasses: Number(row.repasses),
        status: row.status,
        licitacao,
      }
    }
  )
}
