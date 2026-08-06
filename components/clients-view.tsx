"use client"

import * as React from "react"
import { toast } from "sonner"
import { PencilIcon, PlusIcon, SaveIcon, SearchIcon } from "lucide-react"

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
import { CLIENTES, type Cliente, type TipoCliente } from "@/lib/data"

const TIPO_LABEL: Record<TipoCliente, string> = {
  universidade: "Universidade",
  instituto: "Instituto",
  editora: "Editora",
  pessoa: "Pessoa física",
}

const TIPOS: TipoCliente[] = ["universidade", "instituto", "editora", "pessoa"]

function formularioInicial() {
  return {
    nome: "",
    sigla: "",
    tipo: "universidade" as TipoCliente,
    cidade: "",
    contato: "",
  }
}

export function ClientsView() {
  const [clientes, setClientes] = React.useState<Cliente[]>(CLIENTES)
  const [busca, setBusca] = React.useState("")
  const [tipoFiltro, setTipoFiltro] = React.useState<string>("todos")
  const [drawerAberto, setDrawerAberto] = React.useState(false)
  const [form, setForm] = React.useState(formularioInicial)

  const linhas = clientes.filter((cliente) => {
    const termo = busca.trim().toLowerCase()
    const buscaOk =
      termo === "" ||
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.sigla.toLowerCase().includes(termo) ||
      cliente.cidade.toLowerCase().includes(termo)
    const tipoOk = tipoFiltro === "todos" || cliente.tipo === tipoFiltro
    return buscaOk && tipoOk
  })

  function salvar() {
    if (form.nome.trim() === "" || form.sigla.trim() === "") {
      toast.error("Preencha ao menos o nome e a sigla")
      return
    }
    const novo: Cliente = {
      id: crypto.randomUUID(),
      nome: form.nome.trim(),
      sigla: form.sigla.trim().toUpperCase(),
      tipo: form.tipo,
      cidade: form.cidade.trim(),
      contato: form.contato.trim(),
      orcamentos: 0,
    }
    setClientes((atual) => [novo, ...atual])
    toast.success(`Cliente ${novo.sigla} adicionado`)
    setForm(formularioInicial())
    setDrawerAberto(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <InputGroup className="bg-card sm:max-w-xs">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar nome, sigla ou cidade"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label="Busca rápida de clientes"
            />
          </InputGroup>
          <Select value={tipoFiltro} onValueChange={(v) => setTipoFiltro(v as string)}>
            <SelectTrigger className="bg-card sm:w-52" aria-label="Filtrar por tipo">
              <SelectValue>
                {(value: string) =>
                  value === "todos"
                    ? "Todos os tipos"
                    : TIPO_LABEL[value as TipoCliente]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {TIPOS.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {TIPO_LABEL[tipo]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setDrawerAberto(true)}>
          <PlusIcon data-icon="inline-start" />
          Adicionar cliente
        </Button>
      </div>

      {linhas.length === 0 ? (
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Nenhum cliente encontrado</EmptyTitle>
              <EmptyDescription>
                Ajuste a busca ou o filtro para ver outros clientes ou instituições.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {linhas.map((cliente) => (
            <Card key={cliente.id} className="shadow-xs">
              <CardHeader className="flex flex-row items-start gap-3">
                <ClienteIcon tipo={cliente.tipo} className="size-9" />
                <div className="flex flex-1 flex-col gap-1">
                  <CardTitle className="text-sm">{cliente.sigla}</CardTitle>
                  <CardDescription className="text-pretty">{cliente.nome}</CardDescription>
                </div>
                <Badge variant="outline" className="font-normal">
                  {TIPO_LABEL[cliente.tipo]}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Cidade</span>
                  <span>{cliente.cidade || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Contato</span>
                  <span className="truncate">{cliente.contato || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Orçamentos</span>
                  <span className="font-semibold tabular-nums">{cliente.orcamentos}</span>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info(`Editar ${cliente.sigla}`)}
                >
                  <PencilIcon data-icon="inline-start" />
                  Editar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={drawerAberto} onOpenChange={setDrawerAberto}>
        <SheetContent
          side="right"
          className="w-full gap-0 p-0 sm:max-w-md data-[side=right]:sm:max-w-md"
        >
          <SheetHeader className="border-b bg-card px-5 py-4">
            <SheetTitle className="text-base">Novo cliente</SheetTitle>
            <SheetDescription>
              Cadastre uma instituição ou pessoa física.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="cliente-nome">Nome</FieldLabel>
                <Input
                  id="cliente-nome"
                  placeholder="Universidade Federal do Paraná"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="cliente-sigla">Sigla</FieldLabel>
                  <Input
                    id="cliente-sigla"
                    placeholder="UFPR"
                    value={form.sigla}
                    onChange={(e) => setForm((f) => ({ ...f, sigla: e.target.value }))}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="cliente-tipo">Tipo</FieldLabel>
                  <Select
                    value={form.tipo}
                    onValueChange={(v) => setForm((f) => ({ ...f, tipo: v as TipoCliente }))}
                  >
                    <SelectTrigger id="cliente-tipo">
                      <SelectValue>
                        {(value: string) => TIPO_LABEL[value as TipoCliente]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {TIPOS.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {TIPO_LABEL[tipo]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="cliente-cidade">Cidade / UF</FieldLabel>
                <Input
                  id="cliente-cidade"
                  placeholder="Curitiba / PR"
                  value={form.cidade}
                  onChange={(e) => setForm((f) => ({ ...f, cidade: e.target.value }))}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="cliente-contato">Contato</FieldLabel>
                <Input
                  id="cliente-contato"
                  placeholder="compras@instituicao.br"
                  value={form.contato}
                  onChange={(e) => setForm((f) => ({ ...f, contato: e.target.value }))}
                />
              </Field>
            </FieldGroup>
          </div>

          <SheetFooter className="border-t bg-card px-5 py-4">
            <Button onClick={salvar}>
              <SaveIcon data-icon="inline-start" />
              Salvar cliente
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
