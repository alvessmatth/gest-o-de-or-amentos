"use client"

import * as React from "react"
import { toast } from "sonner"
import { PencilIcon, PlusIcon, SaveIcon, SearchIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
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
import {
  listarTerceirizadosDB,
  salvarTerceirizadoDB,
  type TerceirizadoDB,
} from "@/lib/cadastros-api"

function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter((parte) => parte.length > 2)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase()
}

export function PartnersView() {
  const [parceiros, setParceiros] = React.useState<TerceirizadoDB[]>([])
  const [busca, setBusca] = React.useState("")
  const [drawerAberto, setDrawerAberto] = React.useState(false)
  const [parceiroEditando, setParceiroEditando] = React.useState<TerceirizadoDB | null>(null)
  const [salvando, setSalvando] = React.useState(false)

  const [form, setForm] = React.useState({
    nome: "",
    especialidade: "",
    chavePix: "",
    telefone: "",
  })

  const carregar = React.useCallback(async () => {
    try {
      const dados = await listarTerceirizadosDB()
      setParceiros(dados)
    } catch {
      toast.error("Erro ao carregar parceiros")
    }
  }, [])

  React.useEffect(() => {
    void carregar()
  }, [carregar])

  function handleAbrirCriar() {
    setParceiroEditando(null)
    setForm({ nome: "", especialidade: "", chavePix: "", telefone: "" })
    setDrawerAberto(true)
  }

  function handleAbrirEditar(p: TerceirizadoDB) {
    setParceiroEditando(p)
    setForm({
      nome: p.nome,
      especialidade: p.especialidade || "",
      chavePix: p.chave_pix || "",
      telefone: p.telefone || "",
    })
    setDrawerAberto(true)
  }

  async function handleSalvar() {
    if (!form.nome.trim()) {
      toast.error("Informe o nome do parceiro")
      return
    }

    setSalvando(true)
    try {
      await salvarTerceirizadoDB({
        id: parceiroEditando?.id,
        nome: form.nome.trim(),
        especialidade: form.especialidade.trim(),
        chave_pix: form.chavePix.trim(),
        telefone: form.telefone.trim(),
      })
      toast.success(parceiroEditando ? "Parceiro atualizado!" : "Parceiro adicionado!")
      setDrawerAberto(false)
      await carregar()
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar parceiro")
    } finally {
      setSalvando(false)
    }
  }

  const linhas = parceiros.filter((p) => {
    const termo = busca.trim().toLowerCase()
    return (
      termo === "" ||
      p.nome.toLowerCase().includes(termo) ||
      (p.especialidade && p.especialidade.toLowerCase().includes(termo))
    )
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <InputGroup className="bg-card sm:max-w-xs">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar parceiro ou especialidade"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </InputGroup>
        <Button onClick={handleAbrirCriar}>
          <PlusIcon data-icon="inline-start" />
          Adicionar parceiro
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table className="min-w-2xl">
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60">
              <TableHead className="min-w-56">Parceiro</TableHead>
              <TableHead className="min-w-56">Especialidade</TableHead>
              <TableHead className="w-44">Chave PIX</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map((p) => (
              <TableRow key={p.id} className="h-16">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {iniciais(p.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{p.nome}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.especialidade || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">
                  {p.chave_pix || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Editar ${p.nome}`}
                          onClick={() => handleAbrirEditar(p)}
                        />
                      }
                    >
                      <PencilIcon />
                    </TooltipTrigger>
                    <TooltipContent>Editar</TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {linhas.length === 0 && (
          <Empty className="border-t">
            <EmptyHeader>
              <EmptyTitle>Nenhum parceiro encontrado</EmptyTitle>
              <EmptyDescription>
                Ajuste a busca ou adicione um novo profissional terceirizado.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <Sheet open={drawerAberto} onOpenChange={setDrawerAberto}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b bg-card px-5 py-4">
            <SheetTitle className="text-base">
              {parceiroEditando ? "Editar parceiro" : "Novo parceiro"}
            </SheetTitle>
            <SheetDescription>
              Cadastre ou edite um profissional terceirizado.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="parceiro-nome">Nome completo</FieldLabel>
                <Input
                  id="parceiro-nome"
                  placeholder="Marina Toledo"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="parceiro-esp">Especialidade</FieldLabel>
                <Input
                  id="parceiro-esp"
                  placeholder="Tradução EN acadêmica"
                  value={form.especialidade}
                  onChange={(e) => setForm((f) => ({ ...f, especialidade: e.target.value }))}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="parceiro-pix">Chave PIX</FieldLabel>
                <Input
                  id="parceiro-pix"
                  placeholder="marina@pix.com"
                  value={form.chavePix}
                  onChange={(e) => setForm((f) => ({ ...f, chavePix: e.target.value }))}
                />
              </Field>
            </FieldGroup>
          </div>

          <SheetFooter className="border-t bg-card px-5 py-4">
            <Button onClick={handleSalvar} disabled={salvando}>
              <SaveIcon data-icon="inline-start" />
              {salvando ? "Salvando..." : "Salvar parceiro"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}