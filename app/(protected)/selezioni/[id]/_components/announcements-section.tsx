"use client"

import {
  useGetAnnouncementsBySelectionIdQuery,
  usePublishAnnouncementMutation,
} from "@/lib/redux/features/announcements/announcementsApiSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CreateAnnouncementDialog } from "./create-announcement-dialog"
import { Send } from "lucide-react"
import toast from "react-hot-toast"

function AnnouncementsList({ announcements }: { announcements: any[] }) {
  const [publishAnnouncement, { isLoading: isPublishing, originalArgs }] = usePublishAnnouncementMutation()

  const handlePublish = async (announcementId: number) => {
    try {
      await publishAnnouncement(announcementId).unwrap()
      toast.success("Annuncio pubblicato con successo!")
    } catch (err) {
      toast.error("Errore durante la pubblicazione dell'annuncio.")
    }
  }

  if (announcements.length === 0) {
    return (
      <Alert>
        <AlertTitle>Nessun Annuncio</AlertTitle>
        <AlertDescription>Non sono ancora stati creati annunci per questa selezione.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titolo</TableHead>
          <TableHead>Canale</TableHead>
          <TableHead>Stato</TableHead>
          <TableHead>Data Creazione</TableHead>
          <TableHead className="text-right">Azioni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {announcements.map((announcement) => (
          <TableRow key={announcement.id}>
            <TableCell className="font-medium">{announcement.titolo}</TableCell>
            <TableCell>{announcement.canale.replace(/_/g, " ")}</TableCell>
            <TableCell>
              <Badge variant={announcement.stato === "PUBBLICATO" ? "success" : "outline"}>{announcement.stato}</Badge>
            </TableCell>
            <TableCell>{new Date(announcement.data_creazione).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              {announcement.stato === "BOZZA" && (
                <Button
                  size="sm"
                  onClick={() => handlePublish(announcement.id)}
                  disabled={isPublishing && originalArgs === announcement.id}
                >
                  {isPublishing && originalArgs === announcement.id ? <Spinner /> : <Send className="mr-2 h-4 w-4" />}
                  Pubblica
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function AnnouncementsSection({ selectionId }: { selectionId: number }) {
  const { data, error, isLoading } = useGetAnnouncementsBySelectionIdQuery(selectionId)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Annunci</CardTitle>
          <CardDescription>Gestisci gli annunci per questa selezione.</CardDescription>
        </div>
        <CreateAnnouncementDialog selectionId={selectionId} />
      </CardHeader>
      <CardContent>
        {isLoading && <Spinner />}
        {error && <p className="text-red-500">Errore nel caricamento degli annunci.</p>}
        {data && <AnnouncementsList announcements={data.data} />}
      </CardContent>
    </Card>
  )
}
