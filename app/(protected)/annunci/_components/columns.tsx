"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { StatusBadge } from "./status-badge"

export type Announcement = {
  id: string
  titolo: string
  stato: "BOZZA" | "PUBBLICATO" | "SCADUTO" | "ANNULLATO"
  data_pubblicazione: string
  data_scadenza: string
  selezione: {
    id: string
    nome: string
  }
}

export const columns: ColumnDef<Announcement>[] = [
  {
    accessorKey: "titolo",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Titolo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "selezione.nome",
    header: "Selezione",
    cell: ({ row }) => {
      const selezione = row.original.selezione
      return (
        <Link href={`/selezioni/${selezione.id}`} className="hover:underline">
          {selezione.nome}
        </Link>
      )
    },
  },
  {
    accessorKey: "stato",
    header: "Stato",
    cell: ({ row }) => <StatusBadge status={row.getValue("stato")} />,
  },
  {
    accessorKey: "data_pubblicazione",
    header: "Pubblicazione",
    cell: ({ row }) => new Date(row.getValue("data_pubblicazione")).toLocaleDateString(),
  },
  {
    accessorKey: "data_scadenza",
    header: "Scadenza",
    cell: ({ row }) => new Date(row.getValue("data_scadenza")).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const announcement = row.original

      return (
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
            <DropdownMenuItem>
              <Link href={`/annunci/${announcement.id}`}>Visualizza Dettagli</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Modifica</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Annulla</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
