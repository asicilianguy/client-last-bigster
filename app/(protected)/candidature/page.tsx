"use client"

import { useGetApplicationsQuery } from "@/lib/redux/features/applications/applicationsApiSlice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Eye } from "lucide-react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { it } from "date-fns/locale"

const ApplicationStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    RICEVUTA: { label: "Ricevuta", color: "bg-blue-400/20 text-blue-600 border-blue-400/30" },
    TEST_INVIATO: { label: "Test Inviato", color: "bg-cyan-400/20 text-cyan-600 border-cyan-400/30" },
    TEST_COMPLETATO: { label: "Test Completato", color: "bg-indigo-400/20 text-indigo-600 border-indigo-400/30" },
    PRIMO_COLLOQUIO_PROGRAMMATO: {
      label: "1° Colloquio",
      color: "bg-purple-400/20 text-purple-600 border-purple-400/30",
    },
    PRIMO_COLLOQUIO_EFFETTUATO: {
      label: "1° Colloquio Fatto",
      color: "bg-fuchsia-400/20 text-fuchsia-600 border-fuchsia-400/30",
    },
    COLLOQUIO_CEO_PROGRAMMATO: { label: "Colloquio CEO", color: "bg-pink-400/20 text-pink-600 border-pink-400/30" },
    COLLOQUIO_CEO_EFFETTUATO: {
      label: "Colloquio CEO Fatto",
      color: "bg-rose-400/20 text-rose-600 border-rose-400/30",
    },
    ASSUNTO: { label: "Assunto", color: "bg-green-400/20 text-green-600 border-green-400/30" },
    SCARTATO: { label: "Scartato", color: "bg-red-400/20 text-red-600 border-red-400/30" },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status.replace(/_/g, " "),
    color: "bg-gray-400/20 text-gray-600 border-gray-400/30",
  }

  return (
    <Badge variant="outline" className={cn("font-medium whitespace-nowrap", config.color)}>
      {config.label}
    </Badge>
  )
}

export default function ApplicationsPage() {
  const { data: applications, error, isLoading } = useGetApplicationsQuery()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 lg:p-8"
    >
      <Card className="shadow-sm border-0">
        <CardHeader>
          <CardTitle className="text-2xl">Tutte le Candidature</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center p-8">
              <Spinner className="text-primary" />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Errore</AlertTitle>
              <AlertDescription>Impossibile caricare le candidature.</AlertDescription>
            </Alert>
          )}
          {applications && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidato</TableHead>
                    <TableHead>Annuncio</TableHead>
                    <TableHead>Data Invio</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.length > 0 ? (
                    applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{`${application.nome} ${application.cognome}`}</span>
                            <span className="text-xs text-muted-foreground">{application.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/selezioni/${application.annuncio.selezione.id}`}
                            className="text-primary hover:underline"
                          >
                            {application.annuncio.titolo}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {format(new Date(application.data_creazione), "dd MMM yyyy", { locale: it })}
                        </TableCell>
                        <TableCell>
                          <ApplicationStatusBadge status={application.stato} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/selezioni/${application.annuncio.selezione.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Vedi Dettagli Selezione</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        Nessuna candidatura trovata.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
