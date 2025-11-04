"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetSelectionByIdQuery } from "@/lib/redux/features/selections/selectionsApiSlice";
import { useUserRole } from "@/hooks/use-user-role";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

// Import componenti modulari
import { SelectionHeader } from "./_components/SelectionHeader";
import { SelectionInfoCard } from "./_components/SelectionInfoCard";
import { SelectionActionsPanel } from "./_components/SelectionActionsPanel";
import { StatusFlowDiagram } from "./_components/StatusFlowDiagram";
import { InvoicesSection } from "./_components/InvoicesSection";
import { AnnouncementsSection } from "./_components/AnnouncementsSection";
import { StatusHistorySection } from "./_components/StatusHistorySection";

export default function SelectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const selectionId = parseInt(params.id as string);

  const { user, canViewSelection } = useUserRole();
  const {
    data: selection,
    isLoading,
    error,
  } = useGetSelectionByIdQuery(selectionId);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  // Error state
  if (error || !selection) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container max-w-7xl mx-auto py-8 px-4"
      >
        <Alert className="rounded-none border border-red-400 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            {error
              ? "Errore nel caricamento della selezione"
              : "Selezione non trovata"}
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <Button
            asChild
            variant="outline"
            className="rounded-none border border-bigster-border"
          >
            <Link href="/selezioni">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alle selezioni
            </Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  // Permission check
  if (!canViewSelection(selection)) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container max-w-7xl mx-auto py-8 px-4"
      >
        <Alert className="rounded-none border border-red-400 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            Non hai i permessi per visualizzare questa selezione
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <Button
            asChild
            variant="outline"
            className="rounded-none border border-bigster-border"
          >
            <Link href="/selezioni">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alle selezioni
            </Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-bigster-background"
    >
      <div className="container max-w-7xl mx-auto py-6 px-4 space-y-6">
        {/* Header con breadcrumb e titolo */}
        <SelectionHeader selection={selection} />

        {/* Card informazioni principali */}
        <SelectionInfoCard selection={selection} />

        {/* Panel azioni in base allo stato */}
        <SelectionActionsPanel selection={selection} />

        {/* Diagramma flusso stato */}
        <StatusFlowDiagram selection={selection} />

        {/* Sezione Fatture */}
        <InvoicesSection selection={selection} />

        {/* Sezione Raccolte Job - visibile solo dopo HR_ASSEGNATA */}
        {/* {shouldShowJobCollections(selection.stato) && (
          <JobCollectionsSection selection={selection} />
        )} */}

        {/* Sezione Annunci - visibile dopo RACCOLTA_JOB_APPROVATA_CLIENTE */}
        {shouldShowAnnouncements(selection.stato) && (
          <AnnouncementsSection selection={selection} />
        )}

        {/* Storico Stati */}
        <StatusHistorySection selection={selection} />
      </div>
    </motion.div>
  );
}

// Helper functions per determinare la visibilità delle sezioni
function shouldShowJobCollections(stato: string): boolean {
  const visibleStates = [
    "HR_ASSEGNATA",
    "PRIMA_CALL_COMPLETATA",
    "RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE",
    "RACCOLTA_JOB_APPROVATA_CLIENTE",
    "BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO",
    "ANNUNCIO_APPROVATO",
    "ANNUNCIO_PUBBLICATO",
    "CANDIDATURE_RICEVUTE",
    "COLLOQUI_IN_CORSO",
    "PROPOSTA_CANDIDATI",
    "SELEZIONI_IN_SOSTITUZIONE",
    "CHIUSA",
  ];
  return visibleStates.includes(stato);
}

function shouldShowAnnouncements(stato: string): boolean {
  const visibleStates = [
    "RACCOLTA_JOB_APPROVATA_CLIENTE",
    "BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO",
    "ANNUNCIO_APPROVATO",
    "ANNUNCIO_PUBBLICATO",
    "CANDIDATURE_RICEVUTE",
    "COLLOQUI_IN_CORSO",
    "PROPOSTA_CANDIDATI",
    "SELEZIONI_IN_SOSTITUZIONE",
    "CHIUSA",
  ];
  return visibleStates.includes(stato);
}
