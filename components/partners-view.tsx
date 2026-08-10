"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  PencilIcon,
  PlusIcon,
  SaveIcon,
  SearchIcon,
  Trash2Icon,
  HandshakeIcon,
  PhoneIcon,
  KeyIcon,
} from "lucide-react"

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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  listarTerceirizadosDB,
  salvarTerceirizadoDB,
  excluirTerceirizadoDB,
  type TerceirizadoDB,
} from "@/lib/cadastros-api"

export function PartnersView() {
  const [parceiros, setParceiros] = React.useState<TerceirizadoDB[]>([])
  const [busca, setBusca] = React.useState("")
  const [drawerAberto, setDrawerAberto] = React.useState(false)
  const [parceiroEditando, setParceiroEditando] = React.useState<TerceirizadoDB | null>(null)
  const [salvando, setSalvando] = React.useState(false)

  const [form, setForm] = React.useState({
    nome: "",
    especialidade: "",
    chave_pix: "",
    telefone: "",
  })

  const carregar = React.useCallback(async () => {
    try {
      const dados = await listarTerceirizadosDB()
      setParceiros(dados)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar parceiros do banco"
      toast.error(msg)
    }
  }, [])

  React.useEffect(() => {
    void carregar()
  }, [carregar])

  function handleAbrirCriar() {
    setParceiroEditando(null)
    setForm({
      nome: "",
      especialidade: "",
      chave_pix: "",
      telefone: "",
    })
    setDrawerAberto(true)
  }

  function handleAbrirEditar(p: TerceirizadoDB) {
    setParceiroEditando(p)
    setForm({
      nome: p.nome || "",
      especialidade: p.especialidade || "",
      chave_pix: p.chave_pix || "",
      telefone: p.telefone || "",
    })
    setDrawerAberto(true)
  }

  async function handleSalvar() {
    if (!form.nome.trim()) {
      toast.error("Preencha o nome do parceiro")
      return
    }

    setSalvando(true)
    try {
      await salvarTerceirizadoDB({
        id: parceiroEditando?.id,
        nome: form.nome.trim(),
        especialidade: form.especialidade.trim() || undefined,
        chave_pix: form.chave_pix.trim() || undefined,
        telefone: form.telefone.trim() || undefined,
      })
      toast.success(
        parceiroEditando
          ? "Parceiro atualizado com sucesso!"
          : "Parceiro cadastrado com sucesso!"
      )
      setDrawerAberto(false)
      await carregar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar parceiro"
      toast.error(msg)
    } finally {
      setSalvando(false)
    }
  }

  async function handleExcluir(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja remover o parceiro "${nome}"?`)) return
    try {
      await excluirTerceirizadoDB(id)
      toast.success("Parceiro removido com sucesso!")
      await carregar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao excluir parceiro"
      toast.error(msg)
    }
  }

  const linhas = parceiros.filter((p) => {
    const termo = busca.trim().toLowerCase()
    return (
      termo === "" ||
      p.nome.toLowerCase().includes(termo) ||
      (p.especialidade && p.especialidade.toLowerCase().includes(termo)) ||
      (p.chave_pix && p.chave_pix.toLowerCase().includes(termo)) ||
      (p.telefone && p.telefone.toLowerCase().includes(termo))
    )
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de Filtro e Botão */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <InputGroup className="bg-card sm:max-w-xs">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar por nome, especialidade ou PIX"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </InputGroup>
        <Button onClick={handleAbrirCriar}>
          <PlusIcon data-icon="inline-start" />
          Adicionar parceiro
        </Button>
      </div>

      {/* Lista de Cards */}
      {linhas.length === 0 ? (
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Nenhum parceiro terceirizado encontrado</EmptyTitle>
              <EmptyDescription>
                Ajuste os filtros de busca ou cadastre um novo colaborador.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {linhas.map((p) => (
            <Card key={p.id} className="flex flex-col justify-between shadow-xs">
              <CardHeader className="flex flex-row items-start gap-3 pb-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold">
                  <HandshakeIcon className="size-5" />
                </div>
                <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                  <CardTitle className="truncate text-sm font-semibold">
                    {p.nome}
                  </CardTitle>
                  {p.especialidade && (
                    <CardDescription className="truncate text-xs">
                      {p.especialidade}
                    </CardDescription>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-1.5 text-xs text-muted-foreground pt-0">
                {p.telefone && (
                  <div className="flex items-center gap-2 truncate">
                    <PhoneIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{p.telefone}</span>
                  </div>
                )}
                {p.chave_pix && (
                  <div className="flex items-center gap-2 truncate">
                    <KeyIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">PIX: {p.chave_pix}</span>
                  </div>
                )}
                {!p.telefone && !p.chave_pix && (
                  <span className="italic text-muted-foreground/60">
                    Sem dados de contato/PIX
                  </span>
                )}
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t pt-3">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => p.id && handleExcluir(p.id, p.nome)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAbrirEditar(p)}
                >
                  <PencilIcon data-icon="inline-start" />
                  Editar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Drawer Lateral de Cadastro/Edição */}
      <Sheet open={drawerAberto} onOpenChange={setDrawerAberto}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b bg-card px-5 py-4">
            <SheetTitle className="text-base">
              {parceiroEditando ? "Editar parceiro" : "Novo parceiro terceirizado"}
            </SheetTitle>
            <SheetDescription>
              Cadastre tradutores, revisores ou diagramadores colaboradores.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="parceiro-nome">Nome completo</FieldLabel>
                <Input
                  id="parceiro-nome"
                  placeholder="Ex: Dra. Ana Luíza ou Marcos Diagramador"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="parceiro-esp">Especialidade / Função</FieldLabel>
                <Input
                  id="parceiro-esp"
                  placeholder="Ex: Tradução Inglês Médico / Diagramação"
                  value={form.especialidade}
                  onChange={(e) => setForm((f) => ({ ...f, especialidade: e.target.value }))}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="parceiro-pix">Chave PIX (para repasses)</FieldLabel>
                <Input
                  id="parceiro-pix"
                  placeholder="E-mail, CPF, telefone ou chave aleatória"
                  value={form.chave_pix}
                  onChange={(e) => setForm((f) => ({ ...f, chave_pix: e.target.value }))}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="parceiro-tel">Telefone / WhatsApp</FieldLabel>
                <Input
                  id="parceiro-tel"
                  placeholder="(11) 98888-7777"
                  value={form.telefone}
                  onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                />
              </Field>
            </FieldGroup>
          </div>

          <SheetFooter className="border-t bg-card px-5 py-4">
            <Button onClick={handleSalvar} disabled={salvando} className="w-full sm:w-auto">
              <SaveIcon data-icon="inline-start" />
              {salvando ? "Salvando..." : "Salvar parceiro"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}