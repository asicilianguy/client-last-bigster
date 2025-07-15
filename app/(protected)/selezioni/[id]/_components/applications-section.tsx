"use client"

import { useGetApplicationsBySelectionIdQuery } from "@/lib/redux/features/applications/applicationsApiSlice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users } from "lucide-react"

const ApplicationStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    NUOVA: { label: "Nuova", color: "bg-blue-400/20 text-blue-600 border-blue-400/30" },
    IN_REVISIONE: { label: "In Revisione", color: "bg-yellow-400/20 text-yellow-600 border-yellow-400/30" },
    IDONEO: { label: "Idoneo", color: "bg-sky-400/20 text-sky-600 border-sky-400/30" },
    NON_IDONEO: { label: "Non Idoneo", color: "bg-orange-400/20 text-orange-600 border-orange-400/30" },
    ASSUNTO: { label: "Assunto", color: "bg-green-400/20 text-green-600 border-green-400/30" },
    RIFIUTATO: { label: "Rifiutato", color: "bg-red-400/20 text-red-600 border-red-400/30" },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status.replace(/_/g, " "),
    color: "bg-gray-400/20 text-gray-600 border-gray-400/30",
  }

  return (
    <Badge variant="outline" className={cn("font-medium", config.color)}>
      {config.label}
    </Badge>
  )
}

export function ApplicationsSection({ selectionId }: { selectionId: number }) {
  const { data, error, isLoading } = useGetApplicationsBySelectionIdQuery(selectionId)

  return (
    <Card className="shadow-sm border-0 h-full mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Candidature Ricevute</CardTitle>
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
        {data && (
          <>
            {data.data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidato</TableHead>
                    <TableHead>Annuncio</TableHead>
                    <TableHead>Stato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((application: any) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`https://avatar.vercel.sh/${application.email}.png`} />
                            <AvatarFallback>
                              {application.nome.charAt(0)}
                              {application.cognome.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {application.nome} {application.cognome}
                            </p>
                            <p className="text-sm text-muted-foreground">{application.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{application.annuncio.titolo}</TableCell>
                      <TableCell>
                        <ApplicationStatusBadge status={application.stato} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nessuna candidatura</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Non sono ancora state ricevute candidature per questa selezione.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
