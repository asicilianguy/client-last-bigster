"use client"

import { useGetSelectionsQuery } from "@/lib/redux/features/selections/selectionsApiSlice"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, Users, FileText, ArrowRight } from "lucide-react"
import { useSelector } from "react-redux"
import { selectCurrentUser } from "@/lib/redux/features/auth/authSlice"

export default function SelezioniDashboardPage() {
  const { data, error, isLoading } = useGetSelectionsQuery({})
  const user = useSelector(selectCurrentUser)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVATA":
      case "IN_CORSO":
      case "ANNUNCI_PUBBLICATI":
      case "CANDIDATURE_RICEVUTE":
      case "COLLOQUI_IN_CORSO":
      case "COLLOQUI_CEO":
        return "bg-green-100 text-green-800 border-green-200"
      case "CHIUSA":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "ANNULLATA":
        return "bg-red-100 text-red-800 border-red-200"
      case "CREATA":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Errore nel caricamento delle selezioni.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Selezioni</h1>
          <p className="text-muted-foreground">Visualizza e gestisci tutte le selezioni in corso.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/gestione/figure-professionali">
              <Users className="mr-2 h-4 w-4" />
              Gestisci Figure
            </Link>
          </Button>
          <Button asChild>
            <Link href="/selezioni/nuova">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuova Selezione
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.data.length > 0 ? (
          data.data.map((selection: any) => (
            <Card key={selection.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{selection.titolo}</CardTitle>
                  <Badge className={getStatusColor(selection.stato)}>{selection.stato.replace(/_/g, " ")}</Badge>
                </div>
                <CardDescription>
                  {selection.reparto.nome} / {selection.figura_professionale.nome}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Annunci</span>
                  </div>
                  <span className="font-semibold text-foreground">{selection._count.annunci}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Candidature</span>
                  </div>
                  <span className="font-semibold text-foreground">{selection._count.candidature}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/selezioni/${selection.id}`}>
                    Vedi Dettagli <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground">Nessuna selezione trovata.</div>
        )}
      </div>
    </div>
  )
}
