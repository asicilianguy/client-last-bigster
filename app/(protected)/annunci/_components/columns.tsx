"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "./status-badge"

export type Announcement = {
  id: string
  titolo: string
  stato: "BOZZA" | "PUBBLICATO" | "ARCHIVIATO"
  data_pubblicazione: string
  data_scadenza: string
  candidature_count: number
}

export const columns: ColumnDef<Announcement>[] = [
  {
    accessorKey: "titolo",
    header: "Titolo",
  },
  {
    accessorKey: "stato",
    header: "Stato",
    cell: ({ row }) => {
      const status = row.getValue("stato") as Announcement["stato"]
      return <StatusBadge status={status} />
    },
  },
  {
    accessorKey: "data_pubblicazione",
    header: "Data Pubblicazione",
    cell: ({ row }) => {
      const date = row.getValue("data_pubblicazione")
      return date ? new Date(date as string).toLocaleDateString() : "N/A"
    },
  },
  {
    accessorKey: "data_scadenza",
    header: "Data Scadenza",
    cell: ({ row }) => {
      const date = row.getValue("data_scadenza")
      return date ? new Date(date as string).toLocaleDateString() : "N/A"
    },
  },
  {
    accessorKey: "candidature_count",
    header: "Candidature",
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("candidature_count")}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const announcement = row.original

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Azioni</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(announcement.id)}>
                Copia ID Annuncio
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Visualizza Dettagli</DropdownMenuItem>
              <DropdownMenuItem>Modifica</DropdownMenuItem>
              <DropdownMenuItem className="text-red-500">Archivia</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
