"use client"

import * as React from "react"
import { toast } from "sonner"
import { PencilIcon, PlusIcon, SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
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
import { SERVICOS, UNIDADES, formatBRL } from "@/lib/data"

export function ServicesView() {
  const [busca, setBusca] = React.useState("")

  const linhas = SERVICOS.filter((servico) => {
    const termo = busca.trim().toLowerCase()
    return termo === "" || servico.nome.toLowerCase().includes(termo)
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <InputGroup className="bg-card sm:max-w-xs">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar serviço"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Busca rápida de serviços"
          />
        </InputGroup>
        <Button onClick={() => toast.success("Novo serviço")}>
          <PlusIcon data-icon="inline-start" />
          Adicionar serviço
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table className="min-w-2xl">
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60">
              <TableHead className="min-w-56">Serviço</TableHead>
              <TableHead className="w-44">Unidade de medida</TableHead>
              <TableHead className="w-40 text-right">Preço de tabela</TableHead>
              <TableHead className="w-40">Prazo médio</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map((servico) => {
              const unidade = UNIDADES.find((u) => u.value === servico.unidade)
              return (
                <TableRow key={servico.id} className="h-14">
                  <TableCell className="font-medium">{servico.nome}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {unidade?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold tabular-nums">
                      {formatBRL(servico.preco)}
                    </span>
                    <span className="text-xs text-muted-foreground"> {unidade?.abrev}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{servico.prazo}</TableCell>
                  <TableCell className="text-right">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Editar ${servico.nome}`}
                            onClick={() => toast.info(`Editar ${servico.nome}`)}
                          />
                        }
                      >
                        <PencilIcon />
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
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
                Ajuste a busca para ver outros serviços da tabela de preços.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  )
}
