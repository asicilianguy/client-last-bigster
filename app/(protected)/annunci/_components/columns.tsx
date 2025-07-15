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
import { Badge } from "@/components/ui/badge"

export type Announcement = {
  id: number
  titolo: string
  piattaforma: string
  stato: "BOZZA" | "PUBBLICATO" | "SCADUTO" | "CHIUSO"
  data_creazione: string
  selezione: {
    id: number
    titolo: string
  }
  _count: {
    candidature: number
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
    cell: ({ row }) => {
      const announcement = row.original
      return (
        <div className="flex flex-col">
          <Link href={`/selezioni/${announcement.selezione.id}`} className="font-medium text-primary hover:underline">
            {announcement.titolo}
          </Link>
          <span className="text-xs text-muted-foreground">{announcement.selezione.titolo}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "piattaforma",
    header: "Piattaforma",
    cell: ({ row }) => {
      return <Badge variant="outline">{row.original.piattaforma}</Badge>
    },
  },
  {
    accessorKey: "stato",
    header: "Stato",
    cell: ({ row }) => <StatusBadge status={row.original.stato} />,
  },
  {
    accessorKey: "_count.candidature",
    header: "Candidature",
    cell: ({ row }) => {
      return <div className="text-center font-medium">{row.original._count.candidature}</div>
    },
  },
  {
    accessorKey: "data_creazione",
    header: "Creato il",
    cell: ({ row }) => {
      const date = new Date(row.getValue("data_creazione"))
      return <div>{date.toLocaleDateString("it-IT")}</div>
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
                <span className="sr-only">Apri menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Azioni</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/selezioni/${announcement.selezione.id}?tab=annunci`}>Vedi nella selezione</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Modifica</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Elimina</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
