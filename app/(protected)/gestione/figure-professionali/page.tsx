"use client"

import { useGetAllProfessionalFiguresQuery } from "@/lib/redux/features/professional-figures/professionalFiguresApiSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Edit, PlusCircle } from "lucide-react"
import { FigureFormDialog } from "./_components/figure-form-dialog"

export default function GestioneFigureProfessionaliPage() {
  const { data, error, isLoading } = useGetAllProfessionalFiguresQuery({})

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Errore nel caricamento delle figure professionali.</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestione Figure Professionali</CardTitle>
          <CardDescription>Crea, visualizza e modifica le figure professionali aziendali.</CardDescription>
        </div>
        <FigureFormDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crea Figura
          </Button>
        </FigureFormDialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Seniority</TableHead>
              <TableHead>Reparto</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.length > 0 ? (
              data.data.map((figure: any) => (
                <TableRow key={figure.id}>
                  <TableCell className="font-medium">{figure.nome}</TableCell>
                  <TableCell>{figure.seniority}</TableCell>
                  <TableCell>{figure.reparto?.nome || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <FigureFormDialog figure={figure}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </FigureFormDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Nessuna figura professionale trovata.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
