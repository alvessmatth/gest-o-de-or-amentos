"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  ArrowRightLeftIcon,
  FileTextIcon,
  MessageCircleIcon,
  PlusIcon,
  SaveIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CLIENTES,
  PARCEIROS,
  SERVICOS,
  UNIDADES,
  formatBRL,
  type Unidade,
} from "@/lib/data"
import { salvarOrcamento } from "@/lib/orcamentos-api"

type Item = {
  id: string
  servicoId: string
  unidade: Unidade
  quantidade: number
  valorUnitario: number
  terceirizado: boolean
  parceiroId: string
  repasse: number
}

function novoItem(): Item {
  return {
    id: crypto.randomUUID(),
    servicoId: SERVICOS[0].id,
    unidade: SERVICOS[0].unidade,
    quantidade: 1,
    valorUnitario: SERVICOS[0].preco,
    terceirizado: false,
    parceiroId: "",
    repasse: 0,
  }
}

function estadoInicial() {
  return {
    clienteId: CLIENTES[0].id,
    exigencia: false,
    tituloArtigo: "",
    docente: "",
    cpfProfessor: "",
    numeroProcesso: "",
    itens: [novoItem()] as Item[],
    totalAjustado: null as number | null,
    editandoTotal: false,
  }
}

export function BudgetDrawer({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}) {
  const [clienteId, setClienteId] = React.useState<string>(CLIENTES[0].id)
  const [exigencia, setExigencia] = React.useState(false)
  const [tituloArtigo, setTituloArtigo] = React.useState("")
  const [docente, setDocente] = React.useState("")
  const [cpfProfessor, setCpfProfessor] = React.useState("")
  const [numeroProcesso, setNumeroProcesso] = React.useState("")
  const [itens, setItens] = React.useState<Item[]>([novoItem()])
  const [totalAjustado, setTotalAjustado] = React.useState<number | null>(null)
  const [editandoTotal, setEditandoTotal] = React.useState(false)
  const [salvando, setSalvando] = React.useState(false)

  const faturamento = itens.reduce(
    (soma, item) => soma + item.quantidade * item.valorUnitario,
    0
  )
  const repasses = itens.reduce(
    (soma, item) => soma + (item.terceirizado ? item.repasse : 0),
    0
  )
  const totalFinal = totalAjustado ?? faturamento
  const lucro = totalFinal - repasses

  function atualizarItem(id: string, patch: Partial<Item>) {
    setItens((atual) =>
      atual.map((item) => (item.id === id ? { ...item, ...patch } : item))
    )
    setTotalAjustado(null)
  }

  function trocarServico(id: string, servicoId: string) {
    const servico = SERVICOS.find((s) => s.id === servicoId)
    if (!servico) return
    atualizarItem(id, {
      servicoId,
      unidade: servico.unidade,
      valorUnitario: servico.preco,
    })
  }

  function reiniciarFormulario() {
    const inicial = estadoInicial()
    setClienteId(inicial.clienteId)
    setExigencia(inicial.exigencia)
    setTituloArtigo(inicial.tituloArtigo)
    setDocente(inicial.docente)
    setCpfProfessor(inicial.cpfProfessor)
    setNumeroProcesso(inicial.numeroProcesso)
    setItens(inicial.itens)
    setTotalAjustado(inicial.totalAjustado)
    setEditandoTotal(inicial.editandoTotal)
  }

  async function handleSalvarRascunho() {
    if (itens.length === 0) {
      toast.error("Adicione pelo menos um serviço ao orçamento")
      return
    }

    setSalvando(true)
    try {
      const resultado = await salvarOrcamento({
        clienteId,
        exigencia,
        tituloArtigo,
        docente,
        cpfProfessor,
        numeroProcesso,
        valorTotal: totalFinal,
        repasses,
        itens: itens.map((item) => ({
          servicoId: item.servicoId,
          unidade: item.unidade,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          terceirizado: item.terceirizado,
          parceiroId: item.parceiroId,
          repasse: item.repasse,
        })),
      })
      toast.success(`Rascunho salvo: ${resultado.codigo}`)
      reiniciarFormulario()
      onSaved?.()
      onOpenChange(false)
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : "Erro ao salvar"
      toast.error(mensagem)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-xl data-[side=right]:sm:max-w-xl"
      >
        <SheetHeader className="border-b bg-card px-5 py-4">
          <SheetTitle className="text-base">Novo orçamento</SheetTitle>
          <SheetDescription>
            Monte a proposta, calcule repasses e envie ao cliente.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <FieldGroup className="gap-8">
            <FieldSet>
              <FieldLegend variant="label">1. Dados do cliente</FieldLegend>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="cliente">Cliente ou instituição</FieldLabel>
                  <Select value={clienteId} onValueChange={(v) => setClienteId(v as string)}>
                    <SelectTrigger id="cliente">
                      <SelectValue>
                        {(value: string) => {
                          const cliente = CLIENTES.find((c) => c.id === value)
                          return cliente
                            ? `${cliente.sigla} — ${cliente.nome}`
                            : "Selecione o cliente"
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {CLIENTES.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.sigla} — {cliente.nome}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  orientation="horizontal"
                  className="rounded-lg border bg-card px-3 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <FieldTitle>Exigência universitária / licitação</FieldTitle>
                    <FieldDescription>
                      Habilita campos obrigatórios de processo público.
                    </FieldDescription>
                  </div>
                  <Switch
                    checked={exigencia}
                    onCheckedChange={(v) => setExigencia(Boolean(v))}
                    aria-label="Exigência universitária ou licitação"
                  />
                </Field>

                {exigencia && (
                  <FieldGroup className="gap-4 rounded-lg border border-dashed bg-accent/40 p-4">
                    <Field>
                      <FieldLabel htmlFor="titulo">Título do artigo</FieldLabel>
                      <Input
                        id="titulo"
                        placeholder="Ex: Biomarcadores inflamatórios em cardiopatias"
                        value={tituloArtigo}
                        onChange={(e) => setTituloArtigo(e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="docente">Docente responsável</FieldLabel>
                      <Input
                        id="docente"
                        placeholder="Prof. Dr. Nome Completo"
                        value={docente}
                        onChange={(e) => setDocente(e.target.value)}
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="cpf">CPF do professor</FieldLabel>
                        <Input
                          id="cpf"
                          placeholder="000.000.000-00"
                          inputMode="numeric"
                          value={cpfProfessor}
                          onChange={(e) => setCpfProfessor(e.target.value)}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="processo">Nº do processo</FieldLabel>
                        <Input
                          id="processo"
                          placeholder="23075.000000/2026-00"
                          value={numeroProcesso}
                          onChange={(e) => setNumeroProcesso(e.target.value)}
                        />
                      </Field>
                    </div>
                  </FieldGroup>
                )}
              </FieldGroup>
            </FieldSet>

            <Separator />

            <FieldSet>
              <div className="flex items-center justify-between gap-3">
                <FieldLegend variant="label">2. Serviços contratados</FieldLegend>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setItens((atual) => [...atual, novoItem()])}
                >
                  <PlusIcon data-icon="inline-start" />
                  Adicionar linha
                </Button>
              </div>

              <FieldGroup className="gap-3">
                {itens.map((item, index) => {
                  const subtotal = item.quantidade * item.valorUnitario
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Serviço {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remover serviço ${index + 1}`}
                          disabled={itens.length === 1}
                          onClick={() =>
                            setItens((atual) => atual.filter((i) => i.id !== item.id))
                          }
                        >
                          <Trash2Icon />
                        </Button>
                      </div>

                      <Field>
                        <FieldLabel htmlFor={`servico-${item.id}`}>Serviço</FieldLabel>
                        <Select
                          value={item.servicoId}
                          onValueChange={(v) => trocarServico(item.id, v as string)}
                        >
                          <SelectTrigger id={`servico-${item.id}`}>
                            <SelectValue>
                              {(value: string) =>
                                SERVICOS.find((s) => s.id === value)?.nome ??
                                "Selecione o serviço"
                              }
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {SERVICOS.map((servico) => (
                                <SelectItem key={servico.id} value={servico.id}>
                                  {servico.nome}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <Field>
                          <FieldLabel htmlFor={`unidade-${item.id}`}>Unidade</FieldLabel>
                          <Select
                            value={item.unidade}
                            onValueChange={(v) =>
                              atualizarItem(item.id, { unidade: v as Unidade })
                            }
                          >
                            <SelectTrigger id={`unidade-${item.id}`}>
                              <SelectValue>
                                {(value: string) =>
                                  UNIDADES.find((u) => u.value === value)?.label ??
                                  "Unidade"
                                }
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {UNIDADES.map((unidade) => (
                                  <SelectItem key={unidade.value} value={unidade.value}>
                                    {unidade.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field>
                          <FieldLabel htmlFor={`qtd-${item.id}`}>Quantidade</FieldLabel>
                          <Input
                            id={`qtd-${item.id}`}
                            type="number"
                            min={0}
                            step="1"
                            value={item.quantidade}
                            onChange={(e) =>
                              atualizarItem(item.id, {
                                quantidade: Number(e.target.value) || 0,
                              })
                            }
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor={`valor-${item.id}`}>Valor unit. (R$)</FieldLabel>
                          <Input
                            id={`valor-${item.id}`}
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.valorUnitario}
                            onChange={(e) =>
                              atualizarItem(item.id, {
                                valorUnitario: Number(e.target.value) || 0,
                              })
                            }
                          />
                        </Field>
                      </div>

                      <Field orientation="horizontal">
                        <Checkbox
                          id={`terceiro-${item.id}`}
                          checked={item.terceirizado}
                          onCheckedChange={(v) =>
                            atualizarItem(item.id, { terceirizado: Boolean(v) })
                          }
                        />
                        <FieldLabel
                          htmlFor={`terceiro-${item.id}`}
                          className="font-normal"
                        >
                          Serviço terceirizado
                        </FieldLabel>
                      </Field>

                      {item.terceirizado && (
                        <div className="grid gap-3 rounded-md bg-secondary/60 p-3 sm:grid-cols-2">
                          <Field>
                            <FieldLabel htmlFor={`parceiro-${item.id}`}>Parceiro</FieldLabel>
                            <Select
                              value={item.parceiroId}
                              onValueChange={(v) =>
                                atualizarItem(item.id, { parceiroId: v as string })
                              }
                            >
                              <SelectTrigger id={`parceiro-${item.id}`}>
                                <SelectValue>
                                  {(value: string) =>
                                    PARCEIROS.find((p) => p.id === value)?.nome ??
                                    "Selecione o parceiro"
                                  }
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {PARCEIROS.map((parceiro) => (
                                    <SelectItem key={parceiro.id} value={parceiro.id}>
                                      {parceiro.nome}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor={`repasse-${item.id}`}>
                              Valor do repasse (R$)
                            </FieldLabel>
                            <Input
                              id={`repasse-${item.id}`}
                              type="number"
                              min={0}
                              step="0.01"
                              value={item.repasse}
                              onChange={(e) =>
                                atualizarItem(item.id, {
                                  repasse: Number(e.target.value) || 0,
                                })
                              }
                            />
                          </Field>
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t pt-3 text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold tabular-nums">
                          {formatBRL(subtotal)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </FieldGroup>
            </FieldSet>

            <Separator />

            <FieldSet>
              <FieldLegend variant="label">3. Resumo e fechamento</FieldLegend>

              <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Faturamento total</span>
                  <span className="font-medium tabular-nums">{formatBRL(totalFinal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <ArrowRightLeftIcon className="size-3.5" aria-hidden="true" />
                    Repasses a parceiros
                  </span>
                  <span className="font-medium tabular-nums text-muted-foreground">
                    {"- "}
                    {formatBRL(repasses)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Seu lucro líquido</span>
                  <span className="text-lg font-semibold tabular-nums text-success">
                    {formatBRL(lucro)}
                  </span>
                </div>
              </div>

              <Field className="mt-4">
                <FieldLabel htmlFor="total-final">Valor total final</FieldLabel>
                <div className="flex items-center gap-2">
                  <Input
                    id="total-final"
                    type="number"
                    step="0.01"
                    readOnly={!editandoTotal}
                    value={Number(totalFinal.toFixed(2))}
                    onChange={(e) => setTotalAjustado(Number(e.target.value) || 0)}
                    className="font-semibold tabular-nums"
                  />
                  <Button
                    variant={editandoTotal ? "default" : "outline"}
                    onClick={() => {
                      if (editandoTotal) {
                        setTotalAjustado(Math.round(totalFinal))
                        toast.success("Centavos arredondados")
                      }
                      setEditandoTotal((v) => !v)
                    }}
                  >
                    <SparklesIcon data-icon="inline-start" />
                    {editandoTotal ? "Arredondar" : "Editar"}
                  </Button>
                </div>
                <FieldDescription>
                  Ative a edição para ajustar manualmente ou arredondar os centavos.
                </FieldDescription>
              </Field>
            </FieldSet>
          </FieldGroup>
        </div>

        <SheetFooter className="grid gap-2 border-t bg-card px-5 py-4 sm:grid-cols-3">
          <Button
            variant="outline"
            disabled={salvando}
            onClick={() => void handleSalvarRascunho()}
          >
            <SaveIcon data-icon="inline-start" />
            {salvando ? "Salvando…" : "Salvar rascunho"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.success("PDF profissional gerado")}
          >
            <FileTextIcon data-icon="inline-start" />
            Gerar PDF
          </Button>
          <Button onClick={() => toast.success("Proposta enviada por WhatsApp")}>
            <MessageCircleIcon data-icon="inline-start" />
            WhatsApp
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
