"use client"

import { useGetSelectionsQuery } from "@/lib/redux/features/selections/selectionsApiSlice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, Eye } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function SelezioniPage() {
  const { data, error, isLoading } = useGetSelectionsQuery({})

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner className="h-10 w-10" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Errore nel caricamento delle selezioni.</div>
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVATA":
      case "IN_CORSO":
      case "ANNUNCI_PUBBLICATI":
      case "CANDIDATURE_RICEVUTE":
      case "COLLOQUI_IN_CORSO":
      case "COLLOQUI_CEO":
        return "success"
      case "CHIUSA":
        return "secondary"
      case "ANNULLATA":
        return "destructive"
      case "CREATA":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Selezioni</CardTitle>
          <Button asChild>
            <Link href="/selezioni/nuova">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuova Selezione
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titolo</TableHead>
                <TableHead>Reparto</TableHead>
                <TableHead>Figura Professionale</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Candidature</TableHead>
                <TableHead>Data Creazione</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length > 0 ? (
                data.data.map((selection: any) => (
                  <TableRow key={selection.id}>
                    <TableCell className="font-medium">{selection.titolo}</TableCell>
                    <TableCell>{selection.reparto.nome}</TableCell>
                    <TableCell>{selection.figura_professionale.nome}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(selection.stato)}>{selection.stato.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell>{selection._count.candidature}</TableCell>
                    <TableCell>{new Date(selection.data_creazione).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/selezioni/${selection.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Vedi Dettagli</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Nessuna selezione trovata.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
