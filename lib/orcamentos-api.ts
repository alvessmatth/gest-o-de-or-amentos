import type { StatusOrcamento, Unidade } from "@/lib/data"
import { lerLista, gravarLista, novoId } from "@/lib/local-store"
import type { ClienteDB, ServicoDB } from "@/lib/cadastros-api"

export type OrcamentoItemInput = {
  servicoId: string
  quantidade: number
  valorUnitario: number
  terceirizado: boolean
  parceiroId: string
  repasse: number
}

export type SalvarOrcamentoInput = {
  id?: string
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

export type OrcamentoListado = {
  id: string
  codigo: string
  clienteId: string
  clienteNome: string
  clienteSigla: string
  ehUniversidade: boolean
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
  rawItens?: {
    id: string
    servicoId: string
    unidade: Unidade
    quantidade: number
    valorUnitario: number
    terceirizado: boolean
    parceiroId: string
    repasse: number
  }[]
}

type OrcamentoArmazenado = {
  id: string
  codigo: string
  clienteId: string
  data: string
  validadeDias: number
  valorTotal: number
  status: StatusOrcamento
  tituloArtigo?: string
  docente?: string
  cpfProfessor?: string
  numeroProcesso?: string
  itens: {
    id: string
    servicoId: string
    quantidade: number
    valorUnitario: number
    terceirizado: boolean
    parceiroId: string
    repasse: number
  }[]
}

const CHAVE_ORCAMENTOS = "sc:orcamentos"

function lerOrcamentos(): OrcamentoArmazenado[] {
  return lerLista<OrcamentoArmazenado>(CHAVE_ORCAMENTOS)
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
  const lista = lerOrcamentos()

  const itens = input.itens.map((item) => ({
    id: novoId(),
    servicoId: item.servicoId,
    quantidade: item.quantidade,
    valorUnitario: item.valorUnitario,
    terceirizado: item.terceirizado,
    parceiroId: item.terceirizado && item.parceiroId ? item.parceiroId : "",
    repasse: item.terceirizado ? item.repasse : 0,
  }))

  // EDIÇÃO
  if (input.id) {
    const idx = lista.findIndex((o) => o.id === input.id)
    if (idx >= 0) {
      lista[idx] = {
        ...lista[idx],
        clienteId: input.clienteId,
        valorTotal: input.valorTotal,
        tituloArtigo: input.exigencia ? input.tituloArtigo : undefined,
        docente: input.exigencia ? input.docente : undefined,
        cpfProfessor: input.exigencia ? input.cpfProfessor : undefined,
        numeroProcesso: input.exigencia ? input.numeroProcesso : undefined,
        itens,
      }
      gravarLista(CHAVE_ORCAMENTOS, lista)
    }
    return { id: input.id, codigo: "Atualizado" }
  }

  // CRIAÇÃO
  const codigo = gerarCodigo(input.exigencia)
  const novo: OrcamentoArmazenado = {
    id: novoId(),
    codigo,
    clienteId: input.clienteId,
    data: new Date().toISOString().slice(0, 10),
    validadeDias: 30,
    valorTotal: input.valorTotal,
    status: input.status ?? ("rascunho" as StatusOrcamento),
    tituloArtigo: input.exigencia ? input.tituloArtigo : undefined,
    docente: input.exigencia ? input.docente : undefined,
    cpfProfessor: input.exigencia ? input.cpfProfessor : undefined,
    numeroProcesso: input.exigencia ? input.numeroProcesso : undefined,
    itens,
  }
  lista.unshift(novo)
  gravarLista(CHAVE_ORCAMENTOS, lista)
  return { id: novo.id, codigo: novo.codigo }
}

export async function atualizarStatusOrcamento(id: string, status: StatusOrcamento) {
  const lista = lerOrcamentos()
  const idx = lista.findIndex((o) => o.id === id)
  if (idx >= 0) {
    lista[idx].status = status
    gravarLista(CHAVE_ORCAMENTOS, lista)
  }
}

export async function excluirOrcamento(id: string) {
  gravarLista(
    CHAVE_ORCAMENTOS,
    lerOrcamentos().filter((o) => o.id !== id)
  )
}

export async function listarOrcamentos(): Promise<OrcamentoListado[]> {
  const lista = lerOrcamentos()
  const clientes = lerLista<ClienteDB>("sc:clientes")
  const servicos = lerLista<ServicoDB>("sc:servicos")

  return lista.map((row) => {
    const validade = addDays(row.data, row.validadeDias || 30)

    const repassesTotais = row.itens.reduce(
      (acc, it) => acc + (it.terceirizado ? Number(it.repasse || 0) : 0),
      0
    )

    const servicosNomes = row.itens.map(
      (it) => servicos.find((s) => s.id === it.servicoId)?.nome || "Serviço"
    )

    const rawItens = row.itens.map((it) => ({
      id: it.id,
      servicoId: it.servicoId,
      unidade: "palavra" as Unidade,
      quantidade: Number(it.quantidade),
      valorUnitario: Number(it.valorUnitario),
      terceirizado: Boolean(it.terceirizado),
      parceiroId: it.parceiroId || "",
      repasse: Number(it.repasse || 0),
    }))

    const clienteObj = clientes.find((c) => c.id === row.clienteId)
    const clienteNome = clienteObj?.nome || "Cliente sem nome"
    const clienteSigla = clienteObj?.instituicao || clienteNome.substring(0, 4).toUpperCase()
    const ehUniversidade = Boolean(clienteObj?.eh_universidade)

    const licitacao = row.tituloArtigo
      ? {
          titulo: row.tituloArtigo,
          docente: row.docente || "",
          cpf: row.cpfProfessor || "",
          processo: row.numeroProcesso || "",
        }
      : undefined

    let stNorm = (row.status || "rascunho").toString().toLowerCase()
    if (stNorm === "em execução" || stNorm === "em execucao") stNorm = "execucao"
    if (stNorm === "concluído") stNorm = "concluido"

    return {
      id: row.id,
      codigo: row.codigo,
      clienteId: row.clienteId,
      clienteNome,
      clienteSigla,
      ehUniversidade,
      data: row.data,
      validade,
      servicos: servicosNomes,
      valorTotal: Number(row.valorTotal || 0),
      repasses: repassesTotais,
      status: stNorm as StatusOrcamento,
      licitacao,
      rawItens,
    }
  })
}
