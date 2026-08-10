import { supabase } from "@/lib/supabase"

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

export async function listarClientesDB(): Promise<ClienteDB[]> {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function salvarClienteDB(cliente: ClienteDB) {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData?.user) {
    throw new Error("Usuário não autenticado. Faça login novamente.")
  }
  const userId = userData.user.id

  if (cliente.id) {
    const { error } = await supabase
      .from("clientes")
      .update({
        nome: cliente.nome,
        email: cliente.email || null,
        telefone: cliente.telefone || null,
        cpf_cnpj: cliente.cpf_cnpj || null,
        instituicao: cliente.instituicao || null,
        eh_universidade: cliente.eh_universidade,
      })
      .eq("id", cliente.id)

    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from("clientes").insert({
      user_id: userId,
      nome: cliente.nome,
      email: cliente.email || null,
      telefone: cliente.telefone || null,
      cpf_cnpj: cliente.cpf_cnpj || null,
      instituicao: cliente.instituicao || null,
      eh_universidade: cliente.eh_universidade,
    })

    if (error) throw new Error(error.message)
  }
}

export async function excluirClienteDB(id: string) {
  const { error } = await supabase.from("clientes").delete().eq("id", id)
  if (error) throw new Error(error.message)
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

export async function listarServicosDB(): Promise<ServicoDB[]> {
  const { data, error } = await supabase
    .from("servicos")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function salvarServicoDB(servico: ServicoDB) {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData?.user) {
    throw new Error("Usuário não autenticado. Faça login novamente.")
  }
  const userId = userData.user.id

  if (servico.id) {
    const { error } = await supabase
      .from("servicos")
      .update({
        nome: servico.nome,
        unidade_medida: servico.unidade_medida,
        preco_padrao: servico.preco_padrao,
      })
      .eq("id", servico.id)

    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from("servicos").insert({
      user_id: userId,
      nome: servico.nome,
      unidade_medida: servico.unidade_medida,
      preco_padrao: servico.preco_padrao,
    })

    if (error) throw new Error(error.message)
  }
}

export async function excluirServicoDB(id: string) {
  const { error } = await supabase.from("servicos").delete().eq("id", id)
  if (error) throw new Error(error.message)
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

export async function listarTerceirizadosDB(): Promise<TerceirizadoDB[]> {
  const { data, error } = await supabase
    .from("terceirizados")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function salvarTerceirizadoDB(terceirizado: TerceirizadoDB) {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData?.user) {
    throw new Error("Usuário não autenticado. Faça login novamente.")
  }
  const userId = userData.user.id

  if (terceirizado.id) {
    const { error } = await supabase
      .from("terceirizados")
      .update({
        nome: terceirizado.nome,
        especialidade: terceirizado.especialidade || null,
        chave_pix: terceirizado.chave_pix || null,
        telefone: terceirizado.telefone || null,
      })
      .eq("id", terceirizado.id)

    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from("terceirizados").insert({
      user_id: userId,
      nome: terceirizado.nome,
      especialidade: terceirizado.especialidade || null,
      chave_pix: terceirizado.chave_pix || null,
      telefone: terceirizado.telefone || null,
    })

    if (error) throw new Error(error.message)
  }
}

export async function excluirTerceirizadoDB(id: string) {
  const { error } = await supabase.from("terceirizados").delete().eq("id", id)
  if (error) throw new Error(error.message)
}