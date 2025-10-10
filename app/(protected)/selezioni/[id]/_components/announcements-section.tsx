"use client";

import { useGetAnnouncementsBySelectionIdQuery } from "@/lib/redux/features/announcements/announcementsApiSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, Users, Calendar, Clock } from "lucide-react";
import { CreateAnnouncementDialog } from "./create-announcement-dialog";
import { Badge } from "@/components/ui/badge";

export function AnnouncementsSection({
  selectionId,
  canCreateAnnouncements,
}: {
  selectionId: number;
  canCreateAnnouncements: boolean;
}) {
  const { data, error, isLoading } =
    useGetAnnouncementsBySelectionIdQuery(selectionId);

  return (
    <Card className="border-0 h-full mt-4 !border-outline">
      {canCreateAnnouncements && (
        <CardHeader className="flex flex-row items-center justify-between">
          <CreateAnnouncementDialog selectionId={selectionId} />
        </CardHeader>
      )}
      <CardContent className={`${canCreateAnnouncements ? "pt-0" : "pt-6 "}`}>
        {isLoading && (
          <div className="flex justify-center p-8">
            <Spinner className="text-primary" />
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Errore</AlertTitle>
            <AlertDescription>
              Impossibile caricare gli annunci.
            </AlertDescription>
          </Alert>
        )}
        {data && (
          <div className="space-y-4">
            {data.data.length > 0 ? (
              data.data.map((announcement: any) => (
                <div
                  key={announcement.id}
                  className="bg-background p-4 !border-outline"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{announcement.titolo}</h4>
                      <p className="text-sm text-muted-foreground">
                        {announcement.piattaforma.replace(/_/g, " ")}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="font-semibold text-xs px-3 py-1 border-2 whitespace-nowrap text-bigster-text"
                      style={{
                        backgroundColor: "white",
                        borderColor: "#6c4e06",
                      }}
                    >
                      {announcement.stato.charAt(0).toUpperCase() +
                        announcement.stato.slice(1).toLowerCase()}
                    </Badge>{" "}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{announcement._count.candidature} Candidature</span>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {announcement.data_pubblicazione
                            ? new Date(
                                announcement.data_pubblicazione
                              ).toLocaleDateString("it-IT")
                            : "Non pubblicato"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(
                            announcement.data_creazione
                          ).toLocaleDateString("it-IT")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  Nessun annuncio creato
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Crea il primo annuncio per questa selezione.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
