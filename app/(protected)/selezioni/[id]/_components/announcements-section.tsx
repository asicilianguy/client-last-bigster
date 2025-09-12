"use client";

import { useGetAnnouncementsBySelectionIdQuery } from "@/lib/redux/features/announcements/announcementsApiSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, FileText, ExternalLink, Users, Edit } from "lucide-react";
import { CreateAnnouncementDialog } from "./create-announcement-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSelectionPermissions } from "@/hooks/use-selection-permissions";

const AnnouncementStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    BOZZA: {
      label: "Bozza",
      color: "bg-gray-400/20 text-gray-600 border-gray-400/30",
    },
    PUBBLICATO: {
      label: "Pubblicato",
      color: "bg-green-400/20 text-green-600 border-green-400/30",
    },
    SCADUTO: {
      label: "Scaduto",
      color: "bg-orange-400/20 text-orange-600 border-orange-400/30",
    },
    CHIUSO: {
      label: "Chiuso",
      color: "bg-red-400/20 text-red-600 border-red-400/30",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    color: "bg-gray-400/20 text-gray-600 border-gray-400/30",
  };

  return (
    <Badge
      variant="outline"
      className="border-none rounded-none text-bigster-text bg-bigster-background"
    >
      {config.label}
    </Badge>
  );
};

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
      <CardContent
        className={`${canCreateAnnouncements ? "pt-0" : "pt-6 "}`}
      >
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
