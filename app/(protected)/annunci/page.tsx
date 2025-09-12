"use client";

import { useGetAnnouncementsQuery } from "@/lib/redux/features/announcements/announcementsApiSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Eye } from "lucide-react";
import { motion } from "framer-motion";
import WorkInProgressOverlay from "@/components/ui/bigster/WorkInProgressOverlay";

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
    <Badge variant="outline" className={cn("font-medium", config.color)}>
      {config.label}
    </Badge>
  );
};

export default function AnnouncementsPage() {
  const { data: announcements, error, isLoading } = useGetAnnouncementsQuery();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 lg:p-8 relative"
    >
      <WorkInProgressOverlay />
      <Card className="shadow-sm border-0">
        <CardHeader>
          <CardTitle className="text-2xl">Tutti gli Annunci</CardTitle>
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
              <AlertDescription>
                Impossibile caricare gli annunci.
              </AlertDescription>
            </Alert>
          )}
          {announcements && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titolo</TableHead>
                    <TableHead>Selezione</TableHead>
                    <TableHead>Piattaforma</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-center">Candidature</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.length > 0 ? (
                    announcements.map((announcement) => (
                      <TableRow key={announcement.id}>
                        <TableCell className="font-medium">
                          {announcement.titolo}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/selezioni/${announcement.selezione.id}`}
                            className="text-primary hover:underline"
                          >
                            {announcement.selezione.titolo}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {announcement.piattaforma.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell>
                          <AnnouncementStatusBadge
                            status={announcement.stato}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          {announcement._count.candidature}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" asChild>
                            <Link
                              href={`/selezioni/${announcement.selezione.id}`}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Vedi Dettagli</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        Nessun annuncio trovato.
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
  );
}
