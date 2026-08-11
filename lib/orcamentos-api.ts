import { supabase } from "@/lib/supabase"
import type { StatusOrcamento, Unidade } from "@/lib/data"

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
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    throw new Error("Usuário não autenticado no Supabase. Faça login para salvar.")
  }
  const userId = userData.user.id

  // 1. EDIÇÃO DE ORÇAMENTO EXISTENTE (UPDATE)
  if (input.id) {
    const { error: updateError } = await supabase
      .from("orcamentos")
      .update({
        cliente_id: input.clienteId,
        valor_total: input.valorTotal,
        titulo_artigo: input.exigencia ? input.tituloArtigo || null : null,
        docente_responsavel: input.exigencia ? input.docente || null : null,
        cpf_professor: input.exigencia ? input.cpfProfessor || null : null,
        numero_processo: input.exigencia ? input.numeroProcesso || null : null,
      })
      .eq("id", input.id)

    if (updateError) {
      throw new Error(`Erro ao atualizar orçamento: ${updateError.message}`)
    }

    // Apaga os itens antigos para re-inserir os atualizados
    await supabase.from("orcamento_itens").delete().eq("orcamento_id", input.id)

    const novasLinhas = input.itens.map((item) => ({
      orcamento_id: input.id,
      servico_id: item.servicoId,
      quantidade: item.quantidade,
      preco_unitario: item.valorUnitario,
      eh_terceirizado: item.terceirizado,
      terceirizado_id: item.terceirizado && item.parceiroId ? item.parceiroId : null,
      valor_repasse: item.terceirizado ? item.repasse : 0,
    }))

    if (novasLinhas.length > 0) {
      const { error: itensError } = await supabase.from("orcamento_itens").insert(novasLinhas)
      if (itensError) {
        throw new Error(`Erro ao atualizar itens: ${itensError.message}`)
      }
    }

    return { id: input.id, codigo: "Atualizado" }
  }

  // 2. CRIAÇÃO DE NOVO ORÇAMENTO (INSERT)
  const codigo = gerarCodigo(input.exigencia)

  const { data: orcamento, error: orcamentoError } = await supabase
    .from("orcamentos")
    .insert({
      user_id: userId,
      codigo_proposta: codigo,
      cliente_id: input.clienteId,
      valor_total: input.valorTotal,
      status: input.status ?? "rascunho",
      validade_dias: 30,
      titulo_artigo: input.exigencia ? input.tituloArtigo || null : null,
      docente_responsavel: input.exigencia ? input.docente || null : null,
      cpf_professor: input.exigencia ? input.cpfProfessor || null : null,
      numero_processo: input.exigencia ? input.numeroProcesso || null : null,
    })
    .select("id, codigo_proposta")
    .single()

  if (orcamentoError) {
    throw new Error(`Erro ao salvar orçamento: ${orcamentoError.message}`)
  }

  const linhas = input.itens.map((item) => ({
    orcamento_id: orcamento.id,
    servico_id: item.servicoId,
    quantidade: item.quantidade,
    preco_unitario: item.valorUnitario,
    eh_terceirizado: item.terceirizado,
    terceirizado_id: item.terceirizado && item.parceiroId ? item.parceiroId : null,
    valor_repasse: item.terceirizado ? item.repasse : 0,
  }))

  if (linhas.length > 0) {
    const { error: itensError } = await supabase.from("orcamento_itens").insert(linhas)

    if (itensError) {
      await supabase.from("orcamentos").delete().eq("id", orcamento.id)
      throw new Error(`Erro ao salvar itens do orçamento: ${itensError.message}`)
    }
  }

  return { id: orcamento.id, codigo: orcamento.codigo_proposta }
}

export async function atualizarStatusOrcamento(id: string, status: StatusOrcamento) {
  const { error } = await supabase
    .from("orcamentos")
    .update({ status })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function excluirOrcamento(id: string) {
  const { error: errorItens } = await supabase
    .from("orcamento_itens")
    .delete()
    .eq("orcamento_id", id)

  if (errorItens) {
    throw new Error(errorItens.message)
  }

  const { error } = await supabase
    .from("orcamentos")
    .delete()
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function listarOrcamentos(): Promise<OrcamentoListado[]> {
  const { data, error } = await supabase
    .from("orcamentos")
    .select(
      `
      id,
      codigo_proposta,
      cliente_id,
      created_at,
      validade_dias,
      valor_total,
      status,
      titulo_artigo,
      docente_responsavel,
      cpf_professor,
      numero_processo,
      clientes (
        nome,
        instituicao,
        eh_universidade
      ),
      orcamento_itens (
        id,
        servico_id,
        quantidade,
        preco_unitario,
        eh_terceirizado,
        terceirizado_id,
        valor_repasse,
        servicos ( nome )
      )
    `
    )
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map((row: any) => {
    const dataIso = row.created_at ? row.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10)
    const validade = addDays(dataIso, row.validade_dias || 30)

    const itens = row.orcamento_itens || []

    const repassesTotais = itens.reduce(
      (acc: number, it: any) => acc + (it.eh_terceirizado ? Number(it.valor_repasse || 0) : 0),
      0
    )

    const servicosNomes = itens.map((it: any) => {
      if (it.servicos) {
        if (Array.isArray(it.servicos)) {
          return it.servicos[0]?.nome || "Serviço"
        }
        return it.servicos.nome || "Serviço"
      }
      return "Serviço"
    })

    const rawItens = itens.map((it: any) => ({
      id: it.id || crypto.randomUUID(),
      servicoId: it.servico_id,
      unidade: "palavra" as Unidade,
      quantidade: Number(it.quantidade),
      valorUnitario: Number(it.preco_unitario),
      terceirizado: Boolean(it.eh_terceirizado),
      parceiroId: it.terceirizado_id || "",
      repasse: Number(it.valor_repasse || 0),
    }))

    const clienteObj = row.clientes
    const clienteNome = clienteObj?.nome || "Cliente sem nome"
    const clienteSigla = clienteObj?.instituicao || clienteNome.substring(0, 4).toUpperCase()
    const ehUniversidade = Boolean(clienteObj?.eh_universidade)

    const licitacao = row.titulo_artigo
      ? {
          titulo: row.titulo_artigo,
          docente: row.docente_responsavel || "",
          cpf: row.cpf_professor || "",
          processo: row.numero_processo || "",
        }
      : undefined

    let stNorm = (row.status || "rascunho").toLowerCase()
    if (stNorm === "em execução" || stNorm === "em execucao") stNorm = "execucao"
    if (stNorm === "concluído") stNorm = "concluido"

    return {
      id: row.id,
      codigo: row.codigo_proposta,
      clienteId: row.cliente_id,
      clienteNome,
      clienteSigla,
      ehUniversidade,
      data: dataIso,
      validade,
      servicos: servicosNomes,
      valorTotal: Number(row.valor_total || 0),
      repasses: repassesTotais,
      status: stNorm as StatusOrcamento,
      licitacao,
      rawItens,
    }
  })
}