"use client"

import { useGetAllProfessionalFiguresQuery } from "@/lib/redux/features/professional-figures/professionalFiguresApiSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Edit, PlusCircle, Users, Building } from "lucide-react"
import { FigureFormDialog } from "./_components/figure-form-dialog"
import { Badge } from "@/components/ui/badge"

export default function GestioneFigureProfessionaliPage() {
  const { data, error, isLoading } = useGetAllProfessionalFiguresQuery({})

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Errore nel caricamento delle figure professionali.</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
        <div>
          <CardTitle className="text-2xl font-bold tracking-tight">Figure Professionali</CardTitle>
          <CardDescription>Crea, visualizza e modifica le figure professionali aziendali.</CardDescription>
        </div>
        <FigureFormDialog>
          <Button>
            <PlusCircle />
            Crea Figura
          </Button>
        </FigureFormDialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
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
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span>{figure.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{figure.seniority}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{figure.reparto?.nome || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <FigureFormDialog figure={figure}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Modifica</span>
                        </Button>
                      </FigureFormDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nessuna figura professionale trovata.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
