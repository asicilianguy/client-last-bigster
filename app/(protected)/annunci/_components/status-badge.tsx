import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const statusConfig = {
  BOZZA: { label: "Bozza", color: "bg-gray-400/20 text-gray-600 border-gray-400/30" },
  PUBBLICATO: { label: "Pubblicato", color: "bg-blue-400/20 text-blue-600 border-blue-400/30" },
  SCADUTO: { label: "Scaduto", color: "bg-orange-400/20 text-orange-600 border-orange-400/30" },
  CHIUSO: { label: "Chiuso", color: "bg-red-400/20 text-red-600 border-red-400/30" },
}

export const StatusBadge = ({ status }: { status: keyof typeof statusConfig }) => {
  const config = statusConfig[status] || {
    label: status,
    color: "bg-gray-400/20 text-gray-600 border-gray-400/30",
  }

  return (
    <Badge variant="outline" className={cn("font-medium", config.color)}>
      {config.label}
    </Badge>
  )
}
