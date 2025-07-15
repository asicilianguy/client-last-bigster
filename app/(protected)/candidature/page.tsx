"use client"

import { useGetApplicationsQuery } from "@/lib/redux/features/applications/applicationsApiSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { it } from "date-fns/locale"

const applicationStatusText: { [key: string]: string } = {
  RICEVUTA: "Ricevuta",
  TEST_INVIATO: "Test Inviato",
  TEST_COMPLETATO: "Test Completato",
  PRIMO_COLLOQUIO_PROGRAMMATO: "1° Colloquio Prog.",
  PRIMO_COLLOQUIO_EFFETTUATO: "1° Colloquio Fatto",
  COLLOQUIO_CEO_PROGRAMMATO: "Colloquio CEO Prog.",
  COLLOQUIO_CEO_EFFETTUATO: "Colloquio CEO Fatto",
  ASSUNTO: "Assunto",
  SCARTATO: "Scartato",
}

const getApplicationStatusVariant = (status: string): BadgeProps["variant"] => {
  const variants: { [key: string]: BadgeProps["variant"] } = {
    RICEVUTA: "secondary",
    TEST_INVIATO: "outline",
    TEST_COMPLETATO: "outline",
    PRIMO_COLLOQUIO_PROGRAMMATO: "default",
    PRIMO_COLLOQUIO_EFFETTUATO: "default",
    COLLOQUIO_CEO_PROGRAMMATO: "default",
    COLLOQUIO_CEO_EFFETTUATO: "default",
    ASSUNTO: "default",
    SCARTATO: "destructive",
  }
  return variants[status] || "secondary"
}

export default function CandidaturePage() {
  const { data: applications, isLoading, isError, error } = useGetApplicationsQuery()

  const renderContent = () => {
    if (isLoading) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidato</TableHead>
              <TableHead>Annuncio</TableHead>
              <TableHead>Selezione</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Data candidatura</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    }

    if (isError) {
      return (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Errore</AlertTitle>
          <AlertDescription>
            Impossibile caricare le candidature.
            {/* @ts-ignore */}
            <p className="mt-2 text-xs">{error?.data?.message || "Errore sconosciuto"}</p>
          </AlertDescription>
        </Alert>
      )
    }

    if (!applications || applications.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">Nessuna candidatura trovata.</p>
        </div>
      )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidato</TableHead>
            <TableHead>Annuncio</TableHead>
            <TableHead>Selezione</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Data candidatura</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => (
            <TableRow key={application.id}>
              <TableCell>
                <div className="font-medium">{`${application.nome} ${application.cognome}`}</div>
                <div className="text-sm text-muted-foreground">{application.email}</div>
              </TableCell>
              <TableCell>
                <Link href={`/selezioni/${application.annuncio.selezione.id}`} className="hover:underline">
                  {application.annuncio.titolo}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/selezioni/${application.annuncio.selezione.id}`}
                  className="text-muted-foreground hover:underline"
                >
                  {application.annuncio.selezione.titolo}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant={getApplicationStatusVariant(application.stato)}>
                  {applicationStatusText[application.stato] || application.stato}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(application.data_creazione), "dd MMM yyyy", { locale: it })}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Candidature</CardTitle>
          <CardDescription>Visualizza e gestisci tutte le candidature ricevute.</CardDescription>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  )
}
