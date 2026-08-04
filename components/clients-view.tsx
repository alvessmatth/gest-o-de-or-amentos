import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ClienteIcon } from "@/components/atoms"
import { CLIENTES } from "@/lib/data"

const TIPO_LABEL = {
  universidade: "Universidade",
  instituto: "Instituto",
  editora: "Editora",
  pessoa: "Pessoa física",
}

export function ClientsView() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {CLIENTES.map((cliente) => (
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
        </Card>
      ))}
    </div>
  )
}
