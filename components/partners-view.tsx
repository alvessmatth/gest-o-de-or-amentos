"use client"

import * as React from "react"
import { toast } from "sonner"
import { PencilIcon, PlusIcon, SearchIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { PARCEIROS, formatBRL } from "@/lib/data"

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
  const [busca, setBusca] = React.useState("")

  const linhas = PARCEIROS.filter((parceiro) => {
    const termo = busca.trim().toLowerCase()
    return (
      termo === "" ||
      parceiro.nome.toLowerCase().includes(termo) ||
      parceiro.especialidade.toLowerCase().includes(termo)
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
            aria-label="Busca rápida de parceiros"
          />
        </InputGroup>
        <Button onClick={() => toast.success("Novo parceiro")}>
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
              <TableHead className="w-44 text-right">Repasse médio</TableHead>
              <TableHead className="w-32 text-right">Trabalhos</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map((parceiro) => (
              <TableRow key={parceiro.id} className="h-16">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {iniciais(parceiro.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{parceiro.nome}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {parceiro.especialidade}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatBRL(parceiro.repasseMedio)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {parceiro.trabalhos}
                </TableCell>
                <TableCell className="text-right">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Editar ${parceiro.nome}`}
                          onClick={() => toast.info(`Editar ${parceiro.nome}`)}
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
                Ajuste a busca para ver outros parceiros terceirizados.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  )
}
