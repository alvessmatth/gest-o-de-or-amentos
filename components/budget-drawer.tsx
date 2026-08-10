"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  ArrowRightLeftIcon,
  FileTextIcon,
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
import { formatBRL, type Orcamento, type Unidade, UNIDADES } from "@/lib/data"
import { salvarOrcamento } from "@/lib/orcamentos-api"
import {
  listarClientesDB,
  listarServicosDB,
  listarTerceirizadosDB,
  type ClienteDB,
  type ServicoDB,
  type TerceirizadoDB,
} from "@/lib/cadastros-api"
import { gerarPDFOrcamento } from "@/lib/pdf"

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

export function BudgetDrawer({
  open,
  onOpenChange,
  orcamentoParaEditar,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  orcamentoParaEditar?: (Orcamento & { rawItens?: Item[] }) | null
  onSaved?: () => void
}) {
  const [clientes, setClientes] = React.useState<ClienteDB[]>([])
  const [servicos, setServicos] = React.useState<ServicoDB[]>([])
  const [parceiros, setParceiros] = React.useState<TerceirizadoDB[]>([])

  const [clienteId, setClienteId] = React.useState<string>("")
  const [exigencia, setExigencia] = React.useState(false)
  const [tituloArtigo, setTituloArtigo] = React.useState("")
  const [docente, setDocente] = React.useState("")
  const [cpfProfessor, setCpfProfessor] = React.useState("")
  const [numeroProcesso, setNumeroProcesso] = React.useState("")
  const [itens, setItens] = React.useState<Item[]>([])
  const [totalAjustado, setTotalAjustado] = React.useState<number | null>(null)
  const [editandoTotal, setEditandoTotal] = React.useState(false)
  const [salvando, setSalvando] = React.useState(false)

  React.useEffect(() => {
    if (!open) return

    async function carregarTudo() {
      const [listC, listS, listP] = await Promise.all([
        listarClientesDB(),
        listarServicosDB(),
        listarTerceirizadosDB(),
      ])

      setClientes(listC)
      setServicos(listS)
      setParceiros(listP)

      if (orcamentoParaEditar) {
        setClienteId(orcamentoParaEditar.clienteId)
        if (orcamentoParaEditar.licitacao) {
          setExigencia(true)
          setTituloArtigo(orcamentoParaEditar.licitacao.titulo || "")
          setDocente(orcamentoParaEditar.licitacao.docente || "")
          setCpfProfessor(orcamentoParaEditar.licitacao.cpf || "")
          setNumeroProcesso(orcamentoParaEditar.licitacao.processo || "")
        } else {
          setExigencia(false)
        }
        setTotalAjustado(orcamentoParaEditar.valorTotal)

        if (orcamentoParaEditar.rawItens && orcamentoParaEditar.rawItens.length > 0) {
          setItens(
            orcamentoParaEditar.rawItens.map((item) => ({
              ...item,
              id: crypto.randomUUID(),
              unidade: "palavra" as Unidade,
            }))
          )
        } else if (listS.length > 0) {
          setItens([
            {
              id: crypto.randomUUID(),
              servicoId: listS[0].id!,
              unidade: "palavra",
              quantidade: 1,
              valorUnitario: listS[0].preco_padrao,
              terceirizado: false,
              parceiroId: listP[0]?.id || "",
              repasse: 0,
            },
          ])
        }
      } else {
        setClienteId(listC[0]?.id || "")
        setExigencia(false)
        setTituloArtigo("")
        setDocente("")
        setCpfProfessor("")
        setNumeroProcesso("")
        setTotalAjustado(null)

        if (listS.length > 0) {
          setItens([
            {
              id: crypto.randomUUID(),
              servicoId: listS[0].id!,
              unidade: "palavra",
              quantidade: 1,
              valorUnitario: listS[0].preco_padrao,
              terceirizado: false,
              parceiroId: listP[0]?.id || "",
              repasse: 0,
            },
          ])
        }
      }
    }

    void carregarTudo()
  }, [open, orcamentoParaEditar])

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
    const servico = servicos.find((s) => s.id === servicoId)
    if (!servico) return
    atualizarItem(id, {
      servicoId,
      valorUnitario: servico.preco_padrao,
    })
  }

  async function handleSalvar() {
    if (!clienteId) {
      toast.error("Cadastre ou selecione um cliente no sistema")
      return
    }
    if (itens.length === 0) {
      toast.error("Adicione pelo menos um serviço ao orçamento")
      return
    }

    setSalvando(true)
    try {
      const resultado = await salvarOrcamento({
        id: orcamentoParaEditar?.id,
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
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          terceirizado: item.terceirizado,
          parceiroId: item.parceiroId,
          repasse: item.repasse,
        })),
      })
      toast.success(
        orcamentoParaEditar
          ? "Orçamento atualizado com sucesso!"
          : `Proposta gerada: ${resultado.codigo}`
      )
      onSaved?.()
      onOpenChange(false)
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : "Erro ao salvar"
      toast.error(mensagem)
    } finally {
      setSalvando(false)
    }
  }

  function handleGerarPDF() {
    const clienteObj = clientes.find((c) => c.id === clienteId)
    gerarPDFOrcamento({
      codigo_proposta: orcamentoParaEditar?.codigo || "ORC-NOVO",
      cliente_nome: clienteObj ? clienteObj.nome : "Cliente",
      servicos_resumo: itens
        .map((i) => servicos.find((s) => s.id === i.servicoId)?.nome)
        .filter(Boolean)
        .join(", "),
      valor_total: totalFinal,
      validade_dias: 30,
      titulo_artigo: exigencia ? tituloArtigo : undefined,
      docente_responsavel: exigencia ? docente : undefined,
      numero_processo: exigencia ? numeroProcesso : undefined,
    })
    toast.success("PDF gerado com sucesso!")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b bg-card px-5 py-4">
          <SheetTitle className="text-base">
            {orcamentoParaEditar ? `Editar ${orcamentoParaEditar.codigo}` : "Novo orçamento"}
          </SheetTitle>
          <SheetDescription>
            Monte a proposta, calcule repasses e salve no banco de dados.
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
                          const cliente = clientes.find((c) => c.id === value)
                          return cliente ? cliente.nome : "Selecione o cliente"
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {clientes.map((c) => (
                          <SelectItem key={c.id} value={c.id!}>
                            {c.nome}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field orientation="horizontal" className="rounded-lg border bg-card px-3 py-3">
                  <div className="flex flex-col gap-0.5">
                    <FieldTitle>Exigência universitária / licitação</FieldTitle>
                    <FieldDescription>
                      Habilita campos obrigatórios de processo público.
                    </FieldDescription>
                  </div>
                  <Switch
                    checked={exigencia}
                    onCheckedChange={(v) => setExigencia(Boolean(v))}
                  />
                </Field>

                {exigencia && (
                  <FieldGroup className="gap-4 rounded-lg border border-dashed bg-accent/40 p-4">
                    <Field>
                      <FieldLabel htmlFor="titulo">Título do artigo</FieldLabel>
                      <Input
                        id="titulo"
                        placeholder="Ex: Biomarcadores inflamatórios"
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
                  onClick={() => {
                    if (servicos.length > 0) {
                      setItens((atual) => [
                        ...atual,
                        {
                          id: crypto.randomUUID(),
                          servicoId: servicos[0].id!,
                          unidade: "palavra",
                          quantidade: 1,
                          valorUnitario: servicos[0].preco_padrao,
                          terceirizado: false,
                          parceiroId: parceiros[0]?.id || "",
                          repasse: 0,
                        },
                      ])
                    }
                  }}
                >
                  <PlusIcon data-icon="inline-start" />
                  Adicionar linha
                </Button>
              </div>

              <FieldGroup className="gap-3">
                {itens.map((item, index) => {
                  const subtotal = item.quantidade * item.valorUnitario
                  return (
                    <div key={item.id} className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Serviço {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={itens.length === 1}
                          onClick={() => setItens((atual) => atual.filter((i) => i.id !== item.id))}
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
                                servicos.find((s) => s.id === value)?.nome ?? "Selecione o serviço"
                              }
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {servicos.map((s) => (
                                <SelectItem key={s.id} value={s.id!}>
                                  {s.nome}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field>
                          <FieldLabel htmlFor={`qtd-${item.id}`}>Quantidade</FieldLabel>
                          <Input
                            id={`qtd-${item.id}`}
                            type="number"
                            min={0}
                            value={item.quantidade}
                            onChange={(e) =>
                              atualizarItem(item.id, { quantidade: Number(e.target.value) || 0 })
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
                              atualizarItem(item.id, { valorUnitario: Number(e.target.value) || 0 })
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
                        <FieldLabel htmlFor={`terceiro-${item.id}`} className="font-normal">
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
                                    parceiros.find((p) => p.id === value)?.nome ?? "Selecione"
                                  }
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {parceiros.map((p) => (
                                    <SelectItem key={p.id} value={p.id!}>
                                      {p.nome}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor={`repasse-${item.id}`}>Valor do repasse (R$)</FieldLabel>
                            <Input
                              id={`repasse-${item.id}`}
                              type="number"
                              min={0}
                              step="0.01"
                              value={item.repasse}
                              onChange={(e) =>
                                atualizarItem(item.id, { repasse: Number(e.target.value) || 0 })
                              }
                            />
                          </Field>
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t pt-3 text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold tabular-nums">{formatBRL(subtotal)}</span>
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
                    <ArrowRightLeftIcon className="size-3.5" />
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
                  <span className="text-lg font-semibold tabular-nums text-emerald-600">
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
              </Field>
            </FieldSet>
          </FieldGroup>
        </div>

        <SheetFooter className="grid gap-2 border-t bg-card px-5 py-4 sm:grid-cols-2">
          <Button variant="outline" disabled={salvando} onClick={() => void handleSalvar()}>
            <SaveIcon data-icon="inline-start" />
            {salvando ? "Salvando…" : "Salvar orçamento"}
          </Button>
          <Button variant="secondary" onClick={handleGerarPDF}>
            <FileTextIcon data-icon="inline-start" />
            Gerar PDF
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}