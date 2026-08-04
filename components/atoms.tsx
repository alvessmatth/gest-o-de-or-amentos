import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { STATUS_LABEL, type StatusOrcamento, type TipoCliente } from "@/lib/data"
import { BookOpenIcon, BuildingIcon, GraduationCapIcon, UserIcon } from "lucide-react"

const STATUS_STYLE: Record<StatusOrcamento, string> = {
  rascunho: "bg-secondary text-secondary-foreground",
  enviado: "bg-info-muted text-info",
  execucao: "bg-warning-muted text-warning",
  concluido: "bg-success-muted text-success",
  pago: "bg-success text-success-foreground",
}

export function StatusBadge({ status }: { status: StatusOrcamento }) {
  return (
    <Badge className={cn("gap-1.5 px-2", STATUS_STYLE[status])}>
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          status === "pago" ? "bg-success-foreground" : "bg-current"
        )}
      />
      {STATUS_LABEL[status]}
    </Badge>
  )
}

const SERVICO_STYLE: { match: string; className: string }[] = [
  { match: "Tradução", className: "bg-info-muted text-info" },
  { match: "Revisão", className: "bg-success-muted text-success" },
  { match: "Normalização", className: "bg-warning-muted text-warning" },
]

export function ServicoPill({ nome }: { nome: string }) {
  const style =
    SERVICO_STYLE.find((s) => nome.startsWith(s.match))?.className ??
    "bg-secondary text-secondary-foreground"
  return <Badge className={cn("font-normal", style)}>{nome}</Badge>
}

const TIPO_ICON = {
  universidade: GraduationCapIcon,
  instituto: BuildingIcon,
  editora: BookOpenIcon,
  pessoa: UserIcon,
}

export function ClienteIcon({
  tipo,
  className,
}: {
  tipo: TipoCliente
  className?: string
}) {
  const Icon = TIPO_ICON[tipo]
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground",
        className
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </span>
  )
}
