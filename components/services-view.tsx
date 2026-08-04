import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SERVICOS, UNIDADES, formatBRL } from "@/lib/data"

export function ServicesView() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <Table className="min-w-2xl">
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60">
              <TableHead className="min-w-56">Serviço</TableHead>
              <TableHead className="w-44">Unidade de medida</TableHead>
              <TableHead className="w-40 text-right">Preço de tabela</TableHead>
              <TableHead className="w-40">Prazo médio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SERVICOS.map((servico) => {
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
                </TableRow>
              )
            })}
          </TableBody>
      </Table>
    </div>
  )
}
