export type StatusOrcamento =
  | "rascunho"
  | "enviado"
  | "execucao"
  | "concluido"
  | "pago"

export type Unidade =
  | "palavra"
  | "pagina"
  | "referencia"
  | "hora"
  | "fixo"

export const UNIDADES: { value: Unidade; label: string; abrev: string }[] = [
  { value: "palavra", label: "Por palavra", abrev: "/palavra" },
  { value: "pagina", label: "Por página", abrev: "/página" },
  { value: "referencia", label: "Por referência", abrev: "/ref." },
  { value: "hora", label: "Por hora", abrev: "/hora" },
  { value: "fixo", label: "Valor fixo / capa", abrev: "fixo" },
]

export const STATUS_LABEL: Record<StatusOrcamento, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  execucao: "Em execução",
  concluido: "Concluído",
  pago: "Pago",
}

export type TipoCliente = "universidade" | "instituto" | "editora" | "pessoa"

export type Cliente = {
  id: string
  nome: string
  sigla: string
  tipo: TipoCliente
  cidade: string
  contato: string
  orcamentos: number
}

export const CLIENTES: Cliente[] = [
  {
    id: "cli-1",
    nome: "Universidade Federal do Paraná",
    sigla: "UFPR",
    tipo: "universidade",
    cidade: "Curitiba / PR",
    contato: "compras@ufpr.br",
    orcamentos: 14,
  },
  {
    id: "cli-2",
    nome: "Instituto Federal de Santa Catarina",
    sigla: "IFSC",
    tipo: "instituto",
    cidade: "Florianópolis / SC",
    contato: "licitacao@ifsc.edu.br",
    orcamentos: 9,
  },
  {
    id: "cli-3",
    nome: "Universidade de São Paulo",
    sigla: "USP",
    tipo: "universidade",
    cidade: "São Paulo / SP",
    contato: "pos.fflch@usp.br",
    orcamentos: 21,
  },
  {
    id: "cli-4",
    nome: "Editora Ciência Aberta",
    sigla: "ECA",
    tipo: "editora",
    cidade: "Belo Horizonte / MG",
    contato: "editorial@cienciaaberta.com.br",
    orcamentos: 6,
  },
  {
    id: "cli-5",
    nome: "Fundação Oswaldo Cruz",
    sigla: "FIOCRUZ",
    tipo: "instituto",
    cidade: "Rio de Janeiro / RJ",
    contato: "publicacoes@fiocruz.br",
    orcamentos: 11,
  },
  {
    id: "cli-6",
    nome: "Dra. Helena Vasconcelos",
    sigla: "HV",
    tipo: "pessoa",
    cidade: "Recife / PE",
    contato: "helena.vasconcelos@gmail.com",
    orcamentos: 3,
  },
]

export type Servico = {
  id: string
  nome: string
  unidade: Unidade
  preco: number
  prazo: string
}

export const SERVICOS: Servico[] = [
  { id: "srv-1", nome: "Normalização ABNT", unidade: "pagina", preco: 9.5, prazo: "3 a 5 dias" },
  { id: "srv-2", nome: "Revisão PT", unidade: "palavra", preco: 0.06, prazo: "4 a 7 dias" },
  { id: "srv-3", nome: "Tradução EN", unidade: "palavra", preco: 0.24, prazo: "7 a 12 dias" },
  { id: "srv-4", nome: "Tradução ES", unidade: "palavra", preco: 0.19, prazo: "7 a 12 dias" },
  { id: "srv-5", nome: "Revisão de referências", unidade: "referencia", preco: 3.2, prazo: "2 dias" },
  { id: "srv-6", nome: "Formatação de periódico", unidade: "hora", preco: 85, prazo: "sob demanda" },
  { id: "srv-7", nome: "Projeto de capa", unidade: "fixo", preco: 420, prazo: "5 dias" },
  { id: "srv-8", nome: "Diagramação de e-book", unidade: "pagina", preco: 7.8, prazo: "6 a 10 dias" },
  { id: "srv-9", nome: "Ficha catalográfica", unidade: "fixo", preco: 180, prazo: "2 dias" },
]

export type Parceiro = {
  id: string
  nome: string
  especialidade: string
  repasseMedio: number
  trabalhos: number
}

export const PARCEIROS: Parceiro[] = [
  { id: "par-1", nome: "Marina Toledo", especialidade: "Tradução EN acadêmica", repasseMedio: 0.14, trabalhos: 32 },
  { id: "par-2", nome: "Rafael Nunes", especialidade: "Revisão técnica PT", repasseMedio: 0.03, trabalhos: 27 },
  { id: "par-3", nome: "Estúdio Grafo", especialidade: "Capa e diagramação", repasseMedio: 260, trabalhos: 12 },
  { id: "par-4", nome: "Luana Ferraz", especialidade: "Tradução ES", repasseMedio: 0.11, trabalhos: 8 },
  { id: "par-5", nome: "Bibliotecária Ana Reis", especialidade: "Ficha catalográfica / ABNT", repasseMedio: 95, trabalhos: 19 },
]

export type Orcamento = {
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

export const ORCAMENTOS: Orcamento[] = [
  {
    id: "orc-1",
    codigo: "LIC-2608004",
    clienteId: "cli-1",
    data: "2026-07-28",
    validade: "2026-08-27",
    servicos: ["Normalização ABNT", "Revisão PT", "Tradução EN"],
    valorTotal: 8420.5,
    repasses: 2960,
    status: "execucao",
    licitacao: {
      titulo: "Biomarcadores inflamatórios em cardiopatias congênitas",
      docente: "Prof. Dr. Eduardo Salles",
      cpf: "042.118.775-30",
      processo: "23075.041882/2026-11",
    },
  },
  {
    id: "orc-2",
    codigo: "LIC-2608003",
    clienteId: "cli-3",
    data: "2026-07-24",
    validade: "2026-08-23",
    servicos: ["Tradução EN", "Revisão de referências"],
    valorTotal: 5180,
    repasses: 2100,
    status: "enviado",
  },
  {
    id: "orc-3",
    codigo: "ORC-2608002",
    clienteId: "cli-4",
    data: "2026-07-19",
    validade: "2026-08-18",
    servicos: ["Projeto de capa", "Diagramação de e-book"],
    valorTotal: 3260,
    repasses: 1180,
    status: "pago",
  },
  {
    id: "orc-4",
    codigo: "LIC-2607011",
    clienteId: "cli-2",
    data: "2026-07-11",
    validade: "2026-08-10",
    servicos: ["Normalização ABNT", "Ficha catalográfica"],
    valorTotal: 2745.8,
    repasses: 380,
    status: "concluido",
    licitacao: {
      titulo: "Educação técnica e permanência estudantil no litoral catarinense",
      docente: "Profa. Dra. Cristina Amaral",
      cpf: "918.334.220-77",
      processo: "23292.000541/2026-04",
    },
  },
  {
    id: "orc-5",
    codigo: "ORC-2607010",
    clienteId: "cli-6",
    data: "2026-07-09",
    validade: "2026-08-08",
    servicos: ["Revisão PT"],
    valorTotal: 1140,
    repasses: 0,
    status: "rascunho",
  },
  {
    id: "orc-6",
    codigo: "LIC-2607008",
    clienteId: "cli-5",
    data: "2026-07-02",
    validade: "2026-08-01",
    servicos: ["Tradução EN", "Formatação de periódico", "Revisão de referências"],
    valorTotal: 11930.4,
    repasses: 4620,
    status: "pago",
    licitacao: {
      titulo: "Vigilância genômica de arbovírus em capitais brasileiras",
      docente: "Prof. Dr. Márcio Bevilacqua",
      cpf: "377.902.114-58",
      processo: "25380.007719/2026-92",
    },
  },
  {
    id: "orc-7",
    codigo: "ORC-2606007",
    clienteId: "cli-3",
    data: "2026-06-26",
    validade: "2026-07-26",
    servicos: ["Tradução ES", "Revisão PT"],
    valorTotal: 4380,
    repasses: 1720,
    status: "concluido",
  },
]

export type MesBalanco = {
  mes: string
  faturamento: number
  repasses: number
  orcamentos: number
  recebido: number
}

export const BALANCO: MesBalanco[] = [
  { mes: "Julho 2026", faturamento: 32676.7, repasses: 11240, orcamentos: 6, recebido: 21150 },
  { mes: "Junho 2026", faturamento: 28450.9, repasses: 9880, orcamentos: 7, recebido: 28450.9 },
  { mes: "Maio 2026", faturamento: 19870.5, repasses: 6240, orcamentos: 5, recebido: 19870.5 },
  { mes: "Abril 2026", faturamento: 24310, repasses: 8150, orcamentos: 6, recebido: 24310 },
]

export function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  })
}

export function formatData(iso: string) {
  const [ano, mes, dia] = iso.split("-")
  return `${dia}/${mes}/${ano}`
}

export function getCliente(id: string) {
  return CLIENTES.find((c) => c.id === id)
}
