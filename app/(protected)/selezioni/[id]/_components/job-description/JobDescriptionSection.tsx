// app/(protected)/selezioni/[id]/_components/job-description/JobDescriptionSection.tsx

"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Edit3,
  Eye,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SelectionDetail, SelectionStatus } from "@/types/selection";
import JobDescriptionWizard from "./JobDescriptionWizard";
import { JobDescriptionType, JobDescriptionForm } from "@/types/jobDescription";
import { useJobCollectionData } from "@/hooks/useJobCollectionData";
import { jobCollectionsApiSlice } from "@/lib/redux/features/job-collections/jobCollectionsApiSlice";
import type { AppDispatch } from "@/lib/redux/store";

interface JobDescriptionSectionProps {
  selection: SelectionDetail;
}

// Stati in cui mostrare questa sezione
const VISIBLE_STATES = [
  SelectionStatus.HR_ASSEGNATA,
  SelectionStatus.PRIMA_CALL_COMPLETATA,
  SelectionStatus.RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE,
  SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE,
  SelectionStatus.BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO,
  SelectionStatus.ANNUNCIO_APPROVATO,
  SelectionStatus.ANNUNCIO_PUBBLICATO,
  SelectionStatus.CANDIDATURE_RICEVUTE,
  SelectionStatus.COLLOQUI_IN_CORSO,
  SelectionStatus.PROPOSTA_CANDIDATI,
  SelectionStatus.SELEZIONI_IN_SOSTITUZIONE,
  SelectionStatus.CHIUSA,
];

// Stati in cui è possibile modificare/creare
const EDITABLE_STATES = [
  SelectionStatus.HR_ASSEGNATA,
  SelectionStatus.PRIMA_CALL_COMPLETATA,
];

export function JobDescriptionSection({
  selection,
}: JobDescriptionSectionProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isLoadingPdfUrl, setIsLoadingPdfUrl] = useState(false);

  // Verifica se la sezione deve essere visibile
  const isVisible = VISIBLE_STATES.includes(selection.stato as SelectionStatus);
  const isEditable = EDITABLE_STATES.includes(
    selection.stato as SelectionStatus
  );

  // Determina il tipo basandosi sulla figura professionale
  const determineType = (): JobDescriptionType => {
    const figuraNome =
      selection.figura_professionale?.nome?.toLowerCase() || "";
    if (figuraNome.includes("aso") || figuraNome.includes("assistente")) {
      return JobDescriptionType.ASO;
    }
    return JobDescriptionType.DO;
  };

  const tipo = determineType();

  // Hook per caricare i dati JSON da S3
  const {
    isLoading,
    isLoadingJson,
    initialFormData,
    jobCollectionId,
    hasExistingData,
    hasJsonData,
    error,
  } = useJobCollectionData({
    selectionId: selection.id,
    tipo,
    enabled: isVisible,
  });

  // Handler per visualizzare il PDF
  const handleViewPdf = async () => {
    if (!jobCollectionId) return;

    setIsLoadingPdfUrl(true);
    try {
      const result = await dispatch(
        jobCollectionsApiSlice.endpoints.getDownloadUrl.initiate(
          jobCollectionId
        )
      ).unwrap();

      window.open(result.download_url, "_blank");
    } catch (err) {
      console.error("Errore apertura PDF:", err);
    } finally {
      setIsLoadingPdfUrl(false);
    }
  };

  // Chiudi wizard
  const handleWizardClose = () => {
    setIsWizardOpen(false);
  };

  if (!isVisible) return null;

  // Dati esistenti dalla relazione (per le date)
  const existingJobCollection = selection.raccolta_job;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bigster-surface border border-bigster-border"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-bigster-text">
              Raccolta Job Description
            </h2>
            <p className="text-xs text-bigster-text-muted">
              {tipo === JobDescriptionType.DO
                ? "Dentist Organizer (DO)"
                : "Assistente di Studio Odontoiatrico (ASO)"}
            </p>
          </div>

          {/* Badge stato */}
          {hasExistingData && (
            <div className="flex items-center gap-2">
              {existingJobCollection?.approvata_dal_cliente ? (
                <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold">
                  <CheckCircle2 className="h-3 w-3" />
                  Approvata
                </span>
              ) : existingJobCollection?.inviata_al_cliente ? (
                <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold">
                  <Clock className="h-3 w-3" />
                  In attesa approvazione
                </span>
              ) : (
                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold">
                  <Clock className="h-3 w-3" />
                  Bozza
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Loading state */}
        {(isLoading || isLoadingJson) && (
          <div className="text-center py-12">
            <Spinner className="h-8 w-8 mx-auto mb-4 text-bigster-primary" />
            <p className="text-sm text-bigster-text-muted">
              {isLoadingJson
                ? "Caricamento dati salvati..."
                : "Verifica dati esistenti..."}
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && !isLoadingJson && (
          <div className="p-4 bg-red-50 border border-red-200 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Errore nel caricamento
                </p>
                <p className="text-xs text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Wizard aperto */}
        {!isLoading && !isLoadingJson && isWizardOpen && (
          <JobDescriptionWizard
            selectionId={selection.id}
            companyName={selection.company?.nome}
            figuraProfessionale={selection.figura_professionale?.nome}
            initialData={initialFormData || undefined}
            jobCollectionId={jobCollectionId || undefined}
            hasExistingJson={hasJsonData}
            onClose={handleWizardClose}
          />
        )}

        {/* Contenuto quando wizard chiuso */}
        {!isLoading && !isLoadingJson && !isWizardOpen && (
          <>
            {hasExistingData ? (
              // Mostra card con dati esistenti
              <div className="space-y-4">
                <div className="p-5 bg-bigster-card-bg border border-bigster-border">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                        Creata il
                      </p>
                      <p className="text-sm font-medium text-bigster-text">
                        {existingJobCollection?.data_creazione
                          ? new Date(
                              existingJobCollection.data_creazione
                            ).toLocaleDateString("it-IT")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                        Ultima modifica
                      </p>
                      <p className="text-sm font-medium text-bigster-text">
                        {existingJobCollection?.data_modifica
                          ? new Date(
                              existingJobCollection.data_modifica
                            ).toLocaleDateString("it-IT")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                        Dati Form
                      </p>
                      <p className="text-sm font-medium text-bigster-text">
                        {hasJsonData ? (
                          <span className="text-green-600">Salvati</span>
                        ) : (
                          <span className="text-yellow-600">Non salvati</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Azioni */}
                <div className="flex items-center gap-3">
                  {isEditable && (
                    <Button
                      onClick={() => setIsWizardOpen(true)}
                      className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {hasJsonData ? "Modifica" : "Compila Dati"}
                    </Button>
                  )}

                  <Button
                    onClick={handleViewPdf}
                    disabled={isLoadingPdfUrl}
                    variant="outline"
                    className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                  >
                    {isLoadingPdfUrl ? (
                      <Spinner className="h-4 w-4 mr-2" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    Visualizza PDF
                  </Button>

                  {isEditable && !existingJobCollection?.inviata_al_cliente && (
                    <Button
                      variant="outline"
                      className="rounded-none border border-blue-400 text-blue-600 hover:bg-blue-50"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Invia al Cliente
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              // Nessun dato - Mostra solo CTA per creare
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-bigster-text-muted mx-auto mb-4" />
                <h3 className="text-base font-semibold text-bigster-text mb-2">
                  Nessuna Raccolta Job Presente
                </h3>
                <p className="text-sm text-bigster-text-muted mb-6 max-w-md mx-auto">
                  {isEditable
                    ? "Avvia la compilazione della Job Description per questa selezione."
                    : "La raccolta job verrà compilata dalla risorsa HR assegnata."}
                </p>

                {isEditable && (
                  <Button
                    onClick={() => setIsWizardOpen(true)}
                    className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Avvia Raccolta Job
                  </Button>
                )}

                {!isEditable && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 inline-block">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <p className="text-xs text-yellow-800">
                        La modifica è disponibile solo negli stati "HR
                        Assegnata" e "Prima Call Completata"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default JobDescriptionSection;
