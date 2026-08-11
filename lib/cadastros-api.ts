import { lerLista, gravarLista, novoId } from "@/lib/local-store"

// ==========================================
// 1. CLIENTES & INSTITUIÇÕES
// ==========================================
export type ClienteDB = {
  id?: string
  nome: string
  email?: string
  telefone?: string
  cpf_cnpj?: string
  instituicao?: string
  eh_universidade: boolean
}

const CHAVE_CLIENTES = "sc:clientes"

export async function listarClientesDB(): Promise<ClienteDB[]> {
  return lerLista<ClienteDB>(CHAVE_CLIENTES)
}

export async function salvarClienteDB(cliente: ClienteDB) {
  const lista = lerLista<ClienteDB>(CHAVE_CLIENTES)
  if (cliente.id) {
    const idx = lista.findIndex((c) => c.id === cliente.id)
    if (idx >= 0) lista[idx] = { ...lista[idx], ...cliente }
  } else {
    lista.unshift({ ...cliente, id: novoId() })
  }
  gravarLista(CHAVE_CLIENTES, lista)
}

export async function excluirClienteDB(id: string) {
  gravarLista(
    CHAVE_CLIENTES,
    lerLista<ClienteDB>(CHAVE_CLIENTES).filter((c) => c.id !== id)
  )
}

// ==========================================
// 2. CATÁLOGO DE SERVIÇOS
// ==========================================
export type ServicoDB = {
  id?: string
  nome: string
  unidade_medida: string
  preco_padrao: number
}

const CHAVE_SERVICOS = "sc:servicos"

export async function listarServicosDB(): Promise<ServicoDB[]> {
  return lerLista<ServicoDB>(CHAVE_SERVICOS)
}

export async function salvarServicoDB(servico: ServicoDB) {
  const lista = lerLista<ServicoDB>(CHAVE_SERVICOS)
  if (servico.id) {
    const idx = lista.findIndex((s) => s.id === servico.id)
    if (idx >= 0) lista[idx] = { ...lista[idx], ...servico }
  } else {
    lista.unshift({ ...servico, id: novoId() })
  }
  gravarLista(CHAVE_SERVICOS, lista)
}

export async function excluirServicoDB(id: string) {
  gravarLista(
    CHAVE_SERVICOS,
    lerLista<ServicoDB>(CHAVE_SERVICOS).filter((s) => s.id !== id)
  )
}

// ==========================================
// 3. PARCEIROS TERCEIRIZADOS
// ==========================================
export type TerceirizadoDB = {
  id?: string
  nome: string
  especialidade?: string
  chave_pix?: string
  telefone?: string
}

const CHAVE_TERCEIRIZADOS = "sc:terceirizados"

export async function listarTerceirizadosDB(): Promise<TerceirizadoDB[]> {
  return lerLista<TerceirizadoDB>(CHAVE_TERCEIRIZADOS)
}

export async function salvarTerceirizadoDB(terceirizado: TerceirizadoDB) {
  const lista = lerLista<TerceirizadoDB>(CHAVE_TERCEIRIZADOS)
  if (terceirizado.id) {
    const idx = lista.findIndex((t) => t.id === terceirizado.id)
    if (idx >= 0) lista[idx] = { ...lista[idx], ...terceirizado }
  } else {
    lista.unshift({ ...terceirizado, id: novoId() })
  }
  gravarLista(CHAVE_TERCEIRIZADOS, lista)
}

export async function excluirTerceirizadoDB(id: string) {
  gravarLista(
    CHAVE_TERCEIRIZADOS,
    lerLista<TerceirizadoDB>(CHAVE_TERCEIRIZADOS).filter((t) => t.id !== id)
  )
}

// ==========================================
// 4. BALANÇO MENSAL
// ==========================================
export type BalancoDB = {
  id?: string
  mes: string
  faturamento: number
  repasses: number
  orcamentos: number
  recebido: number
}

const CHAVE_BALANCO = "sc:balanco"

export async function listarBalancoDB(): Promise<BalancoDB[]> {
  return lerLista<BalancoDB>(CHAVE_BALANCO)
}

export async function salvarBalancoDB(balanco: BalancoDB) {
  const lista = lerLista<BalancoDB>(CHAVE_BALANCO)
  if (balanco.id) {
    const idx = lista.findIndex((b) => b.id === balanco.id)
    if (idx >= 0) lista[idx] = { ...lista[idx], ...balanco }
  } else {
    lista.unshift({ ...balanco, id: novoId() })
  }
  gravarLista(CHAVE_BALANCO, lista)
}

export async function excluirBalancoDB(id: string) {
  gravarLista(
    CHAVE_BALANCO,
    lerLista<BalancoDB>(CHAVE_BALANCO).filter((b) => b.id !== id)
  )
}
