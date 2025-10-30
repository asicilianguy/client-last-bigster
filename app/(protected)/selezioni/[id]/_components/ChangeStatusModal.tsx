"use client";

import { useState } from "react";
import { useChangeSelectionStatusMutation } from "@/lib/redux/features/selections/selectionsApiSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/bigster/dialog-custom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SelectionDetail, SelectionStatus } from "@/types/selection";
import { useNotify } from "@/hooks/use-notify";

const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2";

interface ChangeStatusModalProps {
  selection: SelectionDetail;
  isOpen: boolean;
  onClose: () => void;
}

// Definizione dei possibili stati successivi per ogni stato
const NEXT_STATES: Partial<Record<SelectionStatus, SelectionStatus[]>> = {
  [SelectionStatus.FATTURA_AV_SALDATA]: [SelectionStatus.HR_ASSEGNATA],
  [SelectionStatus.HR_ASSEGNATA]: [SelectionStatus.PRIMA_CALL_COMPLETATA],
  [SelectionStatus.PRIMA_CALL_COMPLETATA]: [
    SelectionStatus.RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE,
  ],
  [SelectionStatus.RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE]: [
    SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE,
  ],
  [SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE]: [
    SelectionStatus.BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO,
  ],
  [SelectionStatus.BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO]: [
    SelectionStatus.ANNUNCIO_APPROVATO,
  ],
  [SelectionStatus.ANNUNCIO_APPROVATO]: [SelectionStatus.ANNUNCIO_PUBBLICATO],
  [SelectionStatus.ANNUNCIO_PUBBLICATO]: [SelectionStatus.CANDIDATURE_RICEVUTE],
  [SelectionStatus.CANDIDATURE_RICEVUTE]: [SelectionStatus.COLLOQUI_IN_CORSO],
  [SelectionStatus.COLLOQUI_IN_CORSO]: [SelectionStatus.PROPOSTA_CANDIDATI],
  [SelectionStatus.PROPOSTA_CANDIDATI]: [SelectionStatus.CHIUSA],
};

const STATUS_LABELS: Record<SelectionStatus, string> = {
  [SelectionStatus.FATTURA_AV_SALDATA]: "Fattura AV Saldata",
  [SelectionStatus.HR_ASSEGNATA]: "HR Assegnata",
  [SelectionStatus.PRIMA_CALL_COMPLETATA]: "Prima Call Completata",
  [SelectionStatus.RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE]:
    "Raccolta Job in Approvazione",
  [SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE]: "Raccolta Job Approvata",
  [SelectionStatus.BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO]:
    "Bozza Annuncio in Approvazione CEO",
  [SelectionStatus.ANNUNCIO_APPROVATO]: "Annuncio Approvato",
  [SelectionStatus.ANNUNCIO_PUBBLICATO]: "Annuncio Pubblicato",
  [SelectionStatus.CANDIDATURE_RICEVUTE]: "Candidature Ricevute",
  [SelectionStatus.COLLOQUI_IN_CORSO]: "Colloqui in Corso",
  [SelectionStatus.PROPOSTA_CANDIDATI]: "Proposta Candidati",
  [SelectionStatus.CHIUSA]: "Chiusa",
  [SelectionStatus.ANNULLATA]: "Annullata",
};

export function ChangeStatusModal({
  selection,
  isOpen,
  onClose,
}: ChangeStatusModalProps) {
  const notify = useNotify();
  const [selectedStatus, setSelectedStatus] = useState<SelectionStatus | "">(
    ""
  );
  const [note, setNote] = useState("");

  const [changeStatus, { isLoading }] = useChangeSelectionStatusMutation();

  const availableStatuses =
    NEXT_STATES[selection.stato as SelectionStatus] || [];

  const handleSubmit = async () => {
    if (!selectedStatus) {
      notify.error("Errore", "Seleziona uno stato");
      return;
    }

    try {
      await changeStatus({
        id: selection.id,
        nuovo_stato: selectedStatus as SelectionStatus,
        note: note || undefined,
      }).unwrap();

      notify.success(
        "Stato Aggiornato",
        `Lo stato della selezione è stato cambiato in "${
          STATUS_LABELS[selectedStatus as SelectionStatus]
        }"`
      );
      onClose();
    } catch (error) {
      notify.error(
        "Errore",
        "Si è verificato un errore durante il cambio di stato"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-md">
        <DialogHeader title="Cambia Stato Selezione" onClose={onClose} />

        <div className="p-5 space-y-5">
          {/* Stato Attuale */}
          <div className="p-4 border border-bigster-border bg-bigster-background">
            <p className="text-xs font-semibold text-bigster-text-muted mb-1">
              STATO ATTUALE
            </p>
            <p className="text-sm font-bold text-bigster-text">
              {STATUS_LABELS[selection.stato as SelectionStatus]}
            </p>
          </div>

          {/* Select Nuovo Stato */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-bigster-text">
              Nuovo Stato *
            </label>
            {availableStatuses.length === 0 ? (
              <div className="p-4 border border-yellow-200 bg-yellow-50">
                <p className="text-xs text-yellow-800">
                  Non ci sono stati successivi disponibili per questa selezione.
                </p>
              </div>
            ) : (
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as SelectionStatus)
                }
                className={inputBase}
              >
                <option value="">-- Seleziona nuovo stato --</option>
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-bigster-text">
              Note (opzionale)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Aggiungi eventuali note sul cambio di stato..."
              rows={4}
              className={inputBase}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSubmit}
              disabled={
                !selectedStatus || isLoading || availableStatuses.length === 0
              }
              className="flex-1 rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
            >
              {isLoading ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Aggiornamento...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Conferma Cambio
                </>
              )}
            </Button>

            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-background"
            >
              Annulla
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
