"use client"

import { useGetSelectionsQuery } from "@/lib/redux/features/selections/selectionsApiSlice"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, Users, FileText, ArrowRight, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    CREATA: { label: "Creata", color: "bg-yellow-500", textColor: "text-yellow-500" },
    APPROVATA: { label: "Approvata", color: "bg-sky-500", textColor: "text-sky-500" },
    IN_CORSO: { label: "In Corso", color: "bg-blue-500", textColor: "text-blue-500" },
    ANNUNCI_PUBBLICATI: { label: "Annunci Pubblicati", color: "bg-indigo-500", textColor: "text-indigo-500" },
    CANDIDATURE_RICEVUTE: { label: "Candidature Ricevute", color: "bg-purple-500", textColor: "text-purple-500" },
    COLLOQUI_IN_CORSO: { label: "Colloqui in Corso", color: "bg-pink-500", textColor: "text-pink-500" },
    COLLOQUI_CEO: { label: "Colloqui CEO", color: "bg-fuchsia-500", textColor: "text-fuchsia-500" },
    CHIUSA: { label: "Chiusa", color: "bg-green-500", textColor: "text-green-500" },
    ANNULLATA: { label: "Annullata", color: "bg-red-500", textColor: "text-red-500" },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status.replace(/_/g, " "),
    color: "bg-gray-500",
    textColor: "text-gray-500",
  }

  return (
    <Badge variant="outline" className={cn("border-0 bg-opacity-10", config.textColor, config.color)}>
      <span className={cn("mr-2 h-2 w-2 rounded-full", config.color)}></span>
      {config.label}
    </Badge>
  )
}

export default function SelezioniDashboardPage() {
  const { data, error, isLoading } = useGetSelectionsQuery({})

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Selezioni</h1>
          <p className="text-muted-foreground">Visualizza e gestisci tutte le selezioni in corso.</p>
        </div>
        <Button asChild>
          <Link href="/selezioni/nuova">
            <PlusCircle />
            Nuova Selezione
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data?.data.length > 0 ? (
          data.data.map((selection: any) => (
            <Card key={selection.id} className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-lg leading-tight">{selection.titolo}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5" />
                      {selection.figura_professionale.nome}
                    </CardDescription>
                  </div>
                  <StatusBadge status={selection.stato} />
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileText />
                    <span>Annunci</span>
                  </div>
                  <span className="font-semibold text-foreground">{selection._count.annunci}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users />
                    <span>Candidature</span>
                  </div>
                  <span className="font-semibold text-foreground">{selection._count.candidature}</span>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/40 p-4">
                <Button asChild variant="secondary" size="sm" className="w-full">
                  <Link href={`/selezioni/${selection.id}`}>
                    Gestisci <ArrowRight className="ml-auto" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card">
            <h3 className="text-xl font-semibold">Nessuna selezione trovata</h3>
            <p className="text-muted-foreground">Inizia creando una nuova selezione.</p>
            <Button asChild className="mt-4">
              <Link href="/selezioni/nuova">
                <PlusCircle />
                Crea la prima Selezione
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
