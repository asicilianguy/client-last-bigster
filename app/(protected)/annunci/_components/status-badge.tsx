import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status = "BOZZA" | "PUBBLICATO" | "SCADUTO" | "ANNULLATO"

const statusStyles: Record<Status, string> = {
  BOZZA: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PUBBLICATO: "bg-green-100 text-green-800 border-green-200",
  SCADUTO: "bg-gray-100 text-gray-800 border-gray-200",
  ANNULLATO: "bg-red-100 text-red-800 border-red-200",
}

export function StatusBadge({ status }: { status: Status }) {
  return <Badge className={cn("capitalize", statusStyles[status])}>{status.toLowerCase().replace("_", " ")}</Badge>
}
