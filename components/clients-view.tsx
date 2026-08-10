"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  PencilIcon,
  PlusIcon,
  SaveIcon,
  SearchIcon,
  MailIcon,
  PhoneIcon,
  FileTextIcon,
  Trash2Icon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { ClienteIcon } from "@/components/atoms"
import {
  listarClientesDB,
  salvarClienteDB,
  excluirClienteDB,
  type ClienteDB,
} from "@/lib/cadastros-api"

export function ClientsView() {
  const [clientes, setClientes] = React.useState<ClienteDB[]>([])
  const [busca, setBusca] = React.useState("")
  const [tipoFiltro, setTipoFiltro] = React.useState<string>("todos")
  const [drawerAberto, setDrawerAberto] = React.useState(false)
  const [clienteEditando, setClienteEditando] = React.useState<ClienteDB | null>(null)
  const [salvando, setSalvando] = React.useState(false)

  const [form, setForm] = React.useState({
    nome: "",
    instituicao: "",
    tipo: "universidade",
    email: "",
    telefone: "",
    cpf_cnpj: "",
  })

  const carregar = React.useCallback(async () => {
    try {
      const dados = await listarClientesDB()
      setClientes(dados)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar clientes do banco"
      toast.error(msg)
    }
  }, [])

  React.useEffect(() => {
    void carregar()
  }, [carregar])

  function handleAbrirCriar() {
    setClienteEditando(null)
    setForm({
      nome: "",
      instituicao: "",
      tipo: "universidade",
      email: "",
      telefone: "",
      cpf_cnpj: "",
    })
    setDrawerAberto(true)
  }

  function handleAbrirEditar(c: ClienteDB) {
    setClienteEditando(c)
    setForm({
      nome: c.nome || "",
      instituicao: c.instituicao || "",
      tipo: c.eh_universidade ? "universidade" : "pessoa",
      email: c.email || "",
      telefone: c.telefone || "",
      cpf_cnpj: c.cpf_cnpj || "",
    })
    setDrawerAberto(true)
  }

  async function handleSalvar() {
    if (!form.nome.trim()) {
      toast.error("Preencha o nome do cliente")
      return
    }

    setSalvando(true)
    try {
      await salvarClienteDB({
        id: clienteEditando?.id,
        nome: form.nome.trim(),
        instituicao: form.instituicao.trim() || undefined,
        eh_universidade: form.tipo === "universidade",
        email: form.email.trim() || undefined,
        telefone: form.telefone.trim() || undefined,
        cpf_cnpj: form.cpf_cnpj.trim() || undefined,
      })
      toast.success(clienteEditando ? "Cliente atualizado com sucesso!" : "Cliente criado com sucesso!")
      setDrawerAberto(false)
      await carregar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar cliente"
      toast.error(msg)
    } finally {
      setSalvando(false)
    }
  }

  async function handleExcluir(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja excluir o cliente "${nome}"?`)) return
    try {
      await excluirClienteDB(id)
      toast.success("Cliente removido com sucesso!")
      await carregar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao excluir cliente"
      toast.error(msg)
    }
  }

  const linhas = clientes.filter((c) => {
    const termo = busca.trim().toLowerCase()
    const combinaBusca =
      termo === "" ||
      c.nome.toLowerCase().includes(termo) ||
      (c.instituicao && c.instituicao.toLowerCase().includes(termo)) ||
      (c.email && c.email.toLowerCase().includes(termo)) ||
      (c.cpf_cnpj && c.cpf_cnpj.toLowerCase().includes(termo))
    const combinaTipo =
      tipoFiltro === "todos" ||
      (tipoFiltro === "universidade" && c.eh_universidade) ||
      (tipoFiltro === "pessoa" && !c.eh_universidade)
    return combinaBusca && combinaTipo
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de Filtros e Botão */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <InputGroup className="bg-card sm:max-w-xs">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar nome, instituição, e-mail ou CPF/CNPJ"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </InputGroup>
          <Select value={tipoFiltro} onValueChange={(v) => setTipoFiltro(v as string)}>
            <SelectTrigger className="bg-card sm:w-52">
              <SelectValue>
                {(value: string) =>
                  value === "todos"
                    ? "Todos os tipos"
                    : value === "universidade"
                    ? "Universidade / Órgão"
                    : "Pessoa Física / Autor"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="universidade">Universidade / Órgão</SelectItem>
                <SelectItem value="pessoa">Pessoa Física / Autor</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAbrirCriar}>
          <PlusIcon data-icon="inline-start" />
          Adicionar cliente
        </Button>
      </div>

      {/* Lista de Cards */}
      {linhas.length === 0 ? (
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Nenhum cliente encontrado</EmptyTitle>
              <EmptyDescription>
                Ajuste os filtros de busca ou cadastre um novo cliente.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {linhas.map((c) => {
            const tituloCard = c.eh_universidade
              ? c.instituicao || c.nome
              : c.nome
            const descCard = c.eh_universidade
              ? c.instituicao ? c.nome : undefined
              : c.instituicao || "Autor Independente"

            return (
              <Card key={c.id} className="flex flex-col justify-between shadow-xs">
                <CardHeader className="flex flex-row items-start gap-3 pb-3">
                  <ClienteIcon tipo={c.eh_universidade ? "universidade" : "pessoa"} className="size-9 shrink-0" />
                  <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                    <CardTitle className="truncate text-sm font-semibold">
                      {tituloCard}
                    </CardTitle>
                    {descCard && (
                      <CardDescription className="truncate text-xs">
                        {descCard}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="outline" className="shrink-0 font-normal text-[11px]">
                    {c.eh_universidade ? "Universidade" : "Pessoa física"}
                  </Badge>
                </CardHeader>

                <CardContent className="flex flex-col gap-1.5 text-xs text-muted-foreground pt-0">
                  {c.email && (
                    <div className="flex items-center gap-2 truncate">
                      <MailIcon className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.telefone && (
                    <div className="flex items-center gap-2 truncate">
                      <PhoneIcon className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{c.telefone}</span>
                    </div>
                  )}
                  {c.cpf_cnpj && (
                    <div className="flex items-center gap-2 truncate">
                      <FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">Doc: {c.cpf_cnpj}</span>
                    </div>
                  )}
                  {!c.email && !c.telefone && !c.cpf_cnpj && (
                    <span className="italic text-muted-foreground/60">Nenhum contato cadastrado</span>
                  )}
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t pt-3">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => c.id && handleExcluir(c.id, c.nome)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAbrirEditar(c)}
                  >
                    <PencilIcon data-icon="inline-start" />
                    Editar
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Drawer Lateral de Cadastro/Edição */}
      <Sheet open={drawerAberto} onOpenChange={setDrawerAberto}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b bg-card px-5 py-4">
            <SheetTitle className="text-base">
              {clienteEditando ? "Editar cliente" : "Novo cliente"}
            </SheetTitle>
            <SheetDescription>
              Cadastre ou atualize as informações do cliente ou instituição.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="cliente-nome">Nome completo / Razão Social</FieldLabel>
                <Input
                  id="cliente-nome"
                  placeholder="Ex: Universidade Federal do Paraná ou Prof. Dr. Carlos"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="cliente-sigla">Sigla / Instituição</FieldLabel>
                  <Input
                    id="cliente-sigla"
                    placeholder="Ex: UFPR, USP, FIOCRUZ"
                    value={form.instituicao}
                    onChange={(e) => setForm((f) => ({ ...f, instituicao: e.target.value }))}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="cliente-tipo">Tipo de cliente</FieldLabel>
                  <Select
                    value={form.tipo}
                    onValueChange={(v) => setForm((f) => ({ ...f, tipo: v }))}
                  >
                    <SelectTrigger id="cliente-tipo">
                      <SelectValue>
                        {(value: string) =>
                          value === "universidade" ? "Universidade / Órgão" : "Pessoa física / Autor"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="universidade">Universidade / Órgão</SelectItem>
                        <SelectItem value="pessoa">Pessoa física / Autor</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="cliente-email">E-mail de contato</FieldLabel>
                <Input
                  id="cliente-email"
                  type="email"
                  placeholder="contato@instituicao.br"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="cliente-tel">Telefone / WhatsApp</FieldLabel>
                  <Input
                    id="cliente-tel"
                    placeholder="(41) 99999-8888"
                    value={form.telefone}
                    onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="cliente-cpf">CPF / CNPJ</FieldLabel>
                  <Input
                    id="cliente-cpf"
                    placeholder="000.000.000-00"
                    value={form.cpf_cnpj}
                    onChange={(e) => setForm((f) => ({ ...f, cpf_cnpj: e.target.value }))}
                  />
                </Field>
              </div>
            </FieldGroup>
          </div>

          <SheetFooter className="border-t bg-card px-5 py-4">
            <Button onClick={handleSalvar} disabled={salvando} className="w-full sm:w-auto">
              <SaveIcon data-icon="inline-start" />
              {salvando ? "Salvando..." : "Salvar cliente"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}