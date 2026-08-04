import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <Table className="min-w-2xl">
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60">
              <TableHead className="min-w-56">Parceiro</TableHead>
              <TableHead className="min-w-56">Especialidade</TableHead>
              <TableHead className="w-44 text-right">Repasse médio</TableHead>
              <TableHead className="w-32 text-right">Trabalhos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PARCEIROS.map((parceiro) => (
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
              </TableRow>
            ))}
          </TableBody>
      </Table>
    </div>
  )
}
