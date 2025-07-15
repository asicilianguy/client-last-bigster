"use client"

import { useGetAnnouncementsQuery } from "@/lib/redux/features/announcements/announcementsApiSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { it } from "date-fns/locale"

const getStatusVariant = (status: "PUBBLICATO" | "BOZZA" | "CHIUSO" | "SCADUTO"): BadgeProps["variant"] => {
  switch (status) {
    case "PUBBLICATO":
      return "default"
    case "BOZZA":
      return "secondary"
    case "CHIUSO":
      return "destructive"
    case "SCADUTO":
      return "outline"
    default:
      return "secondary"
  }
}

export default function AnnunciPage() {
  const { data: announcements, isLoading, isError, error } = useGetAnnouncementsQuery()

  const renderContent = () => {
    if (isLoading) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titolo</TableHead>
              <TableHead>Selezione</TableHead>
              <TableHead>Piattaforma</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-center">Candidature</TableHead>
              <TableHead>Creato il</TableHead>
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
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="mx-auto h-5 w-12" />
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
            Impossibile caricare gli annunci.
            {/* @ts-ignore */}
            <p className="mt-2 text-xs">{error?.data?.message || "Errore sconosciuto"}</p>
          </AlertDescription>
        </Alert>
      )
    }

    if (!announcements || announcements.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">Nessun annuncio trovato.</p>
        </div>
      )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titolo</TableHead>
            <TableHead>Selezione</TableHead>
            <TableHead>Piattaforma</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead className="text-center">Candidature</TableHead>
            <TableHead>Creato il</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {announcements.map((announcement) => (
            <TableRow key={announcement.id}>
              <TableCell className="font-medium">
                <Link href={`/selezioni/${announcement.selezione.id}`} className="hover:underline">
                  {announcement.titolo}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/selezioni/${announcement.selezione.id}`}
                  className="text-muted-foreground hover:underline"
                >
                  {announcement.selezione.titolo}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{announcement.piattaforma}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(announcement.stato)}>{announcement.stato}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary">{announcement._count.candidature}</Badge>
              </TableCell>
              <TableCell>{format(new Date(announcement.data_creazione), "dd MMM yyyy", { locale: it })}</TableCell>
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
          <CardTitle className="text-2xl font-bold tracking-tight">Annunci</CardTitle>
          <CardDescription>Visualizza e gestisci tutti gli annunci di lavoro.</CardDescription>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  )
}
