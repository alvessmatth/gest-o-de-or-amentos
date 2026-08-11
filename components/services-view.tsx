"use client"

import * as React from "react"
import { toast } from "sonner"
import { PencilIcon, PlusIcon, SaveIcon, SearchIcon, Trash2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { UNIDADES, formatBRL } from "@/lib/data"
import {
  listarServicosDB,
  salvarServicoDB,
  excluirServicoDB,
  type ServicoDB,
} from "@/lib/cadastros-api"

export function ServicesView() {
  const [servicos, setServicos] = React.useState<ServicoDB[]>([])
  const [busca, setBusca] = React.useState("")
  const [unidadeFiltro, setUnidadeFiltro] = React.useState<string>("todas")
  const [drawerAberto, setDrawerAberto] = React.useState(false)
  const [servicoEditando, setServicoEditando] = React.useState<ServicoDB | null>(null)
  const [salvando, setSalvando] = React.useState(false)

  const [form, setForm] = React.useState({
    nome: "",
    unidade: "palavra",
    preco: "",
  })

  const carregar = React.useCallback(async () => {
    try {
      const dados = await listarServicosDB()
      setServicos(dados)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar catálogo de serviços"
      toast.error(msg)
    }
  }, [])

  React.useEffect(() => {
    void carregar()
  }, [carregar])

  function handleAbrirCriar() {
    setServicoEditando(null)
    setForm({ nome: "", unidade: "palavra", preco: "" })
    setDrawerAberto(true)
  }

  function handleAbrirEditar(s: ServicoDB) {
    setServicoEditando(s)
    setForm({
      nome: s.nome || "",
      unidade: s.unidade_medida || "palavra",
      preco: s.preco_padrao !== undefined && s.preco_padrao !== null ? String(s.preco_padrao) : "",
    })
    setDrawerAberto(true)
  }

  async function handleSalvar() {
    if (!form.nome.trim()) {
      toast.error("Informe o nome do serviço")
      return
    }

    const valorPreco = Number(form.preco.replace(",", "."))
    if (isNaN(valorPreco) || valorPreco < 0) {
      toast.error("Informe um preço válido (ex: 15.00)")
      return
    }

    setSalvando(true)
    try {
      await salvarServicoDB({
        id: servicoEditando?.id,
        nome: form.nome.trim(),
        unidade_medida: form.unidade,
        preco_padrao: valorPreco,
      })
      toast.success(servicoEditando ? "Serviço atualizado com sucesso!" : "Serviço adicionado com sucesso!")
      setDrawerAberto(false)
      await carregar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar serviço"
      toast.error(msg)
    } finally {
      setSalvando(false)
    }
  }

  async function handleExcluir(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja remover o serviço "${nome}"?`)) return
    try {
      await excluirServicoDB(id)
      toast.success("Serviço removido com sucesso!")
      await carregar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao excluir serviço"
      toast.error(msg)
    }
  }

  const linhas = servicos.filter((s) => {
    const termo = busca.trim().toLowerCase()
    const buscaOk = termo === "" || s.nome.toLowerCase().includes(termo)
    const unidadeOk = unidadeFiltro === "todas" || s.unidade_medida === unidadeFiltro
    return buscaOk && unidadeOk
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de Busca e Botão Adicionar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <InputGroup className="bg-card sm:max-w-xs">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar serviço no catálogo"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </InputGroup>
          <Select value={unidadeFiltro} onValueChange={(v) => setUnidadeFiltro(v as string)}>
            <SelectTrigger className="bg-card sm:w-48">
              <SelectValue>
                {(value: string) =>
                  value === "todas"
                    ? "Todas as unidades"
                    : UNIDADES.find((u) => u.value === value)?.label ?? "Unidade"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="todas">Todas as unidades</SelectItem>
                {UNIDADES.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAbrirCriar}>
          <PlusIcon data-icon="inline-start" />
          Adicionar serviço
        </Button>
      </div>

      {/* Tabela de Serviços */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table className="min-w-2xl">
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60">
              <TableHead className="min-w-56">Serviço</TableHead>
              <TableHead className="w-44">Unidade de medida</TableHead>
              <TableHead className="w-40 text-right">Preço de tabela</TableHead>
              <TableHead className="w-32 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map((s) => {
              const unidadeObj = UNIDADES.find((u) => u.value === s.unidade_medida)
              return (
                <TableRow key={s.id} className="h-14">
                  <TableCell className="font-medium text-sm">{s.nome}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal text-xs">
                      {unidadeObj?.label || s.unidade_medida}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold tabular-nums text-sm">
                      {formatBRL(s.preco_padrao)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Editar ${s.nome}`}
                              onClick={() => handleAbrirEditar(s)}
                            />
                          }
                        >
                          <PencilIcon />
                        </TooltipTrigger>
                        <TooltipContent>Editar serviço</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:bg-destructive/10"
                              aria-label={`Excluir ${s.nome}`}
                              onClick={() => s.id && handleExcluir(s.id, s.nome)}
                            />
                          }
                        >
                          <Trash2Icon />
                        </TooltipTrigger>
                        <TooltipContent>Excluir serviço</TooltipContent>
                      </Tooltip>
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
              <EmptyTitle>Nenhum serviço encontrado</EmptyTitle>
              <EmptyDescription>
                Ajuste os filtros da busca ou cadastre um novo item na sua tabela de preços.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      {/* Drawer de Cadastro/Edição */}
      <Sheet open={drawerAberto} onOpenChange={setDrawerAberto}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b bg-card px-5 py-4">
            <SheetTitle className="text-base">
              {servicoEditando ? "Editar serviço" : "Novo serviço"}
            </SheetTitle>
            <SheetDescription>
              Adicione ou atualize um item na sua tabela de preços padrão.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="servico-nome">Nome do serviço</FieldLabel>
                <Input
                  id="servico-nome"
                  placeholder="Ex: Normalização ABNT ou Tradução Acadêmica"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="servico-unidade">Unidade de medida</FieldLabel>
                <Select
                  value={form.unidade}
                  onValueChange={(v) => setForm((f) => ({ ...f, unidade: (v as string) ?? "" }))}
                >
                  <SelectTrigger id="servico-unidade">
                    <SelectValue>
                      {(value: string) =>
                        UNIDADES.find((u) => u.value === value)?.label ?? "Unidade"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {UNIDADES.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="servico-preco">Preço de tabela (R$)</FieldLabel>
                <Input
                  id="servico-preco"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0,00"
                  value={form.preco}
                  onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value }))}
                />
              </Field>
            </FieldGroup>
          </div>

          <SheetFooter className="border-t bg-card px-5 py-4">
            <Button onClick={handleSalvar} disabled={salvando} className="w-full sm:w-auto">
              <SaveIcon data-icon="inline-start" />
              {salvando ? "Salvando..." : "Salvar serviço"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
