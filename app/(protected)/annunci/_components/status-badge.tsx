import { Badge } from "@/components/ui/badge"
import type { Announcement } from "./columns"

const statusConfig = {
  BOZZA: { label: "Bozza", variant: "secondary" },
  PUBBLICATO: { label: "Pubblicato", variant: "success" },
  ARCHIVIATO: { label: "Archiviato", variant: "destructive" },
} as const

interface StatusBadgeProps {
  status: Announcement["stato"]
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "default" }
  // @ts-ignore
  return <Badge variant={config.variant}>{config.label}</Badge>
}
