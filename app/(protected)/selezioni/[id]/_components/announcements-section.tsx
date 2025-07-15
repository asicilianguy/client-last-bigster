"use client"

import { useGetAnnouncementsBySelectionIdQuery } from "@/lib/redux/features/announcements/announcementsApiSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PlusCircle, FileText, ExternalLink, Users } from "lucide-react"
import { CreateAnnouncementDialog } from "./create-announcement-dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const AnnouncementStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    BOZZA: { label: "Bozza", color: "bg-gray-400", textColor: "text-gray-400" },
    PUBBLICATO: { label: "Pubblicato", color: "bg-green-500", textColor: "text-green-500" },
    SCADUTO: { label: "Scaduto", color: "bg-orange-500", textColor: "text-orange-500" },
    CHIUSO: { label: "Chiuso", color: "bg-red-500", textColor: "text-red-500" },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    color: "bg-gray-500",
    textColor: "text-gray-500",
  }

  return (
    <Badge variant="outline" className={cn("border-0 bg-opacity-10 text-xs", config.textColor, config.color)}>
      <span className={cn("mr-2 h-2 w-2 rounded-full", config.color)}></span>
      {config.label}
    </Badge>
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
        <CreateAnnouncementDialog selectionId={selectionId}>
          <Button size="sm">
            <PlusCircle />
            Crea Annuncio
          </Button>
        </CreateAnnouncementDialog>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex justify-center p-8">
            <Spinner />
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Errore</AlertTitle>
            <AlertDescription>Impossibile caricare gli annunci.</AlertDescription>
          </Alert>
        )}
        {data && (
          <div className="space-y-4">
            {data.data.length > 0 ? (
              data.data.map((announcement: any) => (
                <div key={announcement.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{announcement.titolo}</h4>
                      <p className="text-sm text-muted-foreground">{announcement.piattaforma}</p>
                    </div>
                    <AnnouncementStatusBadge status={announcement.stato} />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{announcement._count.candidature} Candidature</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreateAnnouncementDialog selectionId={selectionId} announcement={announcement}>
                        <Button variant="ghost" size="sm">
                          Modifica
                        </Button>
                      </CreateAnnouncementDialog>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={announcement.link_candidatura} target="_blank" rel="noopener noreferrer">
                          Link <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nessun annuncio creato</h3>
                <p className="mt-1 text-sm text-muted-foreground">Crea il primo annuncio per questa selezione.</p>
                <CreateAnnouncementDialog selectionId={selectionId}>
                  <Button className="mt-4">
                    <PlusCircle />
                    Crea Annuncio
                  </Button>
                </CreateAnnouncementDialog>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
