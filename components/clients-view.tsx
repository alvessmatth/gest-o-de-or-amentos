"use client"

import * as React from "react"
import { toast } from "sonner"
import { PencilIcon, PlusIcon, SearchIcon } from "lucide-react"

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
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { ClienteIcon } from "@/components/atoms"
import { CLIENTES } from "@/lib/data"

const TIPO_LABEL = {
  universidade: "Universidade",
  instituto: "Instituto",
  editora: "Editora",
  pessoa: "Pessoa física",
}

export function ClientsView() {
  const [busca, setBusca] = React.useState("")

  const linhas = CLIENTES.filter((cliente) => {
    const termo = busca.trim().toLowerCase()
    return (
      termo === "" ||
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.sigla.toLowerCase().includes(termo) ||
      cliente.cidade.toLowerCase().includes(termo)
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
            placeholder="Buscar nome, sigla ou cidade"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Busca rápida de clientes"
          />
        </InputGroup>
        <Button onClick={() => toast.success("Novo cliente")}>
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
                Ajuste a busca para ver outros clientes ou instituições.
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
                  <span>{cliente.cidade}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Contato</span>
                  <span className="truncate">{cliente.contato}</span>
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
    </div>
  )
}
