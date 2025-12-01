// ========================================================================
// app/(protected)/selezioni/[id]/_components/job-description/JobDescriptionSection.tsx
// Componente wrapper per integrare il wizard nella pagina di dettaglio selezione
// ========================================================================

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Edit3,
  Eye,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectionDetail, SelectionStatus } from "@/types/selection";
import JobDescriptionWizard from "./JobDescriptionWizard";
import { JobDescriptionType, JobDescriptionForm } from "@/types/jobDescription";
import { triggerFileImport } from "@/lib/utils/job-description-export-import";

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
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [importedData, setImportedData] = useState<JobDescriptionForm | null>(
    null
  );

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

  // Simula presenza di dati salvati (da collegare con API)
  const hasExistingData = selection.raccolte_job?.length > 0;
  const existingJobCollection = selection.raccolte_job?.[0];

  // Handler per import JSON
  const handleImportJSON = () => {
    triggerFileImport((formData) => {
      setImportedData(formData);
      setIsWizardOpen(true);
      console.log("✅ Dati importati con successo");
    });
  };

  // Handler per chiusura wizard
  const handleWizardClose = () => {
    setIsWizardOpen(false);
    setImportedData(null); // Reset imported data
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card">
        {/* Header */}
        <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-bigster-text" />
              <div>
                <h2 className="text-lg font-bold text-bigster-text">
                  Raccolta Job Description
                </h2>
                <p className="text-xs text-bigster-text-muted">
                  {selection.figura_professionale?.nome
                    ? `${
                        selection.figura_professionale.nome
                      } (${determineType()})`
                    : "Documento di raccolta requisiti"}
                </p>
              </div>
            </div>

            {/* Stato */}
            {hasExistingData && existingJobCollection && (
              <div className="flex items-center gap-2">
                {existingJobCollection.approvata_dal_cliente ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approvata dal Cliente
                  </span>
                ) : existingJobCollection.inviata_al_cliente ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold">
                    <Clock className="h-3.5 w-3.5" />
                    In Attesa Approvazione
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold">
                    <Edit3 className="h-3.5 w-3.5" />
                    Bozza
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isWizardOpen ? (
            // Mostra il wizard
            <JobDescriptionWizard
              selectionId={selection.id}
              companyName={selection.company?.nome}
              figuraProfessionale={selection.figura_professionale?.nome}
              initialData={importedData || undefined}
              onClose={handleWizardClose}
            />
          ) : hasExistingData ? (
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
                      Tipo
                    </p>
                    <p className="text-sm font-medium text-bigster-text">
                      {determineType() === JobDescriptionType.DO
                        ? "Dentist Organizer"
                        : "ASO"}
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
                    Modifica
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizza
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
            // Nessun dato - Mostra CTA per creare o importare
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-bigster-text-muted mx-auto mb-4" />
              <h3 className="text-base font-semibold text-bigster-text mb-2">
                Nessuna Raccolta Job Presente
              </h3>
              <p className="text-sm text-bigster-text-muted mb-6 max-w-md mx-auto">
                {isEditable
                  ? "Avvia la compilazione della Job Description o importa una raccolta esistente."
                  : "La raccolta job verrà compilata dalla risorsa HR assegnata."}
              </p>

              {isEditable && (
                <div className="flex items-center justify-center gap-3">
                  {/* Bottone Avvia */}
                  <Button
                    onClick={() => setIsWizardOpen(true)}
                    className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Avvia Raccolta Job
                  </Button>

                  {/* Bottone Importa */}
                  <Button
                    onClick={handleImportJSON}
                    variant="outline"
                    className="rounded-none border-2 border-blue-400 text-blue-600 hover:bg-blue-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Importa Raccolta Job
                  </Button>
                </div>
              )}

              {!isEditable && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 inline-block">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <p className="text-xs text-yellow-800">
                      La modifica è disponibile solo negli stati "HR Assegnata"
                      e "Prima Call Completata"
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default JobDescriptionSection;
