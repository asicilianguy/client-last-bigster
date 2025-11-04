"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Megaphone, FileText, RefreshCw } from "lucide-react";

type SelectionStatus =
  | "FATTURA_AV_SALDATA"
  | "HR_ASSEGNATA"
  | "PRIMA_CALL_COMPLETATA"
  | "RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE"
  | "RACCOLTA_JOB_APPROVATA_CLIENTE"
  | "BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO"
  | "ANNUNCIO_APPROVATO"
  | "ANNUNCIO_PUBBLICATO"
  | "CANDIDATURE_RICEVUTE"
  | "COLLOQUI_IN_CORSO"
  | "PROPOSTA_CANDIDATI"
  | "SELEZIONI_IN_SOSTITUZIONE"
  | "CHIUSA"
  | "ANNULLATA";

interface StatusConfig {
  label: string;
  step: number | string;
  totalSteps: number;
  isSpecial?: boolean; // Flag per stati speciali
}

// Configurazione stati con step progression (11 step normali + stati speciali)
const STATUS_CONFIG: Record<SelectionStatus, StatusConfig> = {
  FATTURA_AV_SALDATA: {
    label: "Fattura Saldata",
    step: 1,
    totalSteps: 11,
  },
  HR_ASSEGNATA: {
    label: "HR Assegnata",
    step: 2,
    totalSteps: 11,
  },
  PRIMA_CALL_COMPLETATA: {
    label: "Prima Call",
    step: 3,
    totalSteps: 11,
  },
  RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE: {
    label: "Job in Approv.",
    step: 4,
    totalSteps: 11,
  },
  RACCOLTA_JOB_APPROVATA_CLIENTE: {
    label: "Job Approvata",
    step: 5,
    totalSteps: 11,
  },
  BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO: {
    label: "Bozza CEO",
    step: 6,
    totalSteps: 11,
  },
  ANNUNCIO_APPROVATO: {
    label: "Annuncio OK",
    step: 7,
    totalSteps: 11,
  },
  ANNUNCIO_PUBBLICATO: {
    label: "Pubblicato",
    step: 8,
    totalSteps: 11,
  },
  CANDIDATURE_RICEVUTE: {
    label: "Candidature",
    step: 9,
    totalSteps: 11,
  },
  COLLOQUI_IN_CORSO: {
    label: "Colloqui",
    step: 10,
    totalSteps: 11,
  },
  PROPOSTA_CANDIDATI: {
    label: "Proposta",
    step: 11,
    totalSteps: 11,
  },
  SELEZIONI_IN_SOSTITUZIONE: {
    label: "In Sostituzione",
    step: "↻",
    totalSteps: 11,
    isSpecial: true,
  },
  CHIUSA: {
    label: "Completata",
    step: "✓",
    totalSteps: 11,
    isSpecial: true,
  },
  ANNULLATA: {
    label: "Annullata",
    step: "✕",
    totalSteps: 11,
    isSpecial: true,
  },
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("it-IT");
};

interface SelectionCardProps {
  selection: {
    id: number;
    titolo: string;
    stato: SelectionStatus;
    pacchetto: "BASE" | "MDO";
    company?: {
      nome: string;
    };
    consulente?: {
      nome: string;
      cognome: string;
    };
    risorsa_umana?: {
      nome: string;
      cognome: string;
    } | null;
    figura_professionale?: {
      nome: string;
      seniority?: string;
    };
    data_creazione?: string;
    data_modifica?: string;
    _count?: {
      annunci?: number;
      raccolte_job?: number;
    };
  };
  index?: number;
}

function SelectionCard({ selection, index = 0 }: SelectionCardProps) {
  const config =
    STATUS_CONFIG[selection.stato as SelectionStatus] ||
    STATUS_CONFIG.HR_ASSEGNATA;

  // Determina colore badge in base al tipo di stato
  const getBadgeStyle = () => {
    if (selection.stato === "ANNULLATA") {
      return {
        backgroundColor: "#fee2e2",
        borderColor: "#ef4444",
        color: "#ef4444",
      };
    }
    if (selection.stato === "CHIUSA") {
      return {
        backgroundColor: "#d1fae5",
        borderColor: "#10b981",
        color: "#10b981",
      };
    }
    if (selection.stato === "SELEZIONI_IN_SOSTITUZIONE") {
      return {
        backgroundColor: "#ffedd5",
        borderColor: "#f97316",
        color: "#f97316",
      };
    }
    return {
      backgroundColor: "white",
      borderColor: "#6c4e06",
      color: "#6c4e06",
    };
  };

  const badgeStyle = getBadgeStyle();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      className="w-full h-full"
    >
      <div
        className="bg-white border-0 overflow-hidden group flex flex-col h-full transition-all duration-300"
        style={{
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Header con badge stato */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <span
                className="font-semibold text-xs px-3 py-1 border-2 whitespace-nowrap flex items-center gap-1.5"
                style={badgeStyle}
              >
                {selection.stato === "SELEZIONI_IN_SOSTITUZIONE" && (
                  <RefreshCw className="h-3 w-3" />
                )}
                {config.label}
                {!config.isSpecial && (
                  <>
                    {" "}
                    • {config.step}/{config.totalSteps}
                  </>
                )}
                {config.isSpecial && typeof config.step === "string" && (
                  <span className="ml-1 font-bold">{config.step}</span>
                )}
              </span>
            </div>
          </div>

          {/* Titolo */}
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-3">
            {selection.titolo}
          </h3>

          {/* Dettagli con layout migliorato */}
          <div className="space-y-3 mb-6 flex-1">
            {/* Cliente e Pacchetto - highlight box */}
            <div className="bg-bigster-background border border-bigster-border p-3 space-y-2.5">
              <div>
                <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1">
                  Nome Cliente
                </p>
                <p className="text-sm font-semibold text-bigster-text">
                  {selection.company?.nome || "—"}
                </p>
              </div>

              <div className="border-t border-bigster-border pt-2.5">
                <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1">
                  Tipo Pacchetto
                </p>
                <span
                  className="text-xs font-bold px-2 py-0.5 inline-block"
                  style={{
                    backgroundColor:
                      selection.pacchetto === "MDO" ? "#e4d72b" : "#fef19a",
                    color: "#6c4e06",
                  }}
                >
                  {selection.pacchetto}
                </span>
              </div>
            </div>

            {/* Figura professionale */}
            <div>
              <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1">
                Figura Professionale
              </p>
              <p className="text-sm text-bigster-text">
                {selection.figura_professionale?.nome || "N/A"}
                {selection.figura_professionale?.seniority && (
                  <span className="text-bigster-text-muted ml-1">
                    ({selection.figura_professionale.seniority})
                  </span>
                )}
              </p>
            </div>

            {/* Team - Consulente e HR */}
            <div className="border-t border-bigster-border pt-3 space-y-2.5">
              <div>
                <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1">
                  Consulente Assegnato
                </p>
                <p className="text-sm text-bigster-text">
                  {selection.consulente
                    ? `${selection.consulente.nome} ${selection.consulente.cognome}`
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1">
                  Risorsa Umana
                </p>
                <p className="text-sm text-bigster-text">
                  {selection.risorsa_umana ? (
                    `${selection.risorsa_umana.nome} ${selection.risorsa_umana.cognome}`
                  ) : (
                    <span className="italic text-bigster-text-muted">
                      Non assegnata
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Date - Creazione e Modifica */}
            <div className="pt-2 border-t border-bigster-border space-y-2.5">
              {selection.data_creazione && (
                <div>
                  <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1">
                    Data Creazione
                  </p>
                  <p className="text-sm text-bigster-text">
                    {formatDate(selection.data_creazione)}
                  </p>
                </div>
              )}

              {selection.data_modifica && (
                <div>
                  <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1">
                    Ultima Modifica
                  </p>
                  <p className="text-sm text-bigster-text">
                    {formatDate(selection.data_modifica)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stats box */}
          {selection._count && (
            <div className="flex items-center justify-between bg-bigster-background p-4 mb-6">
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Megaphone className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500 font-medium">
                    Annunci
                  </span>
                </div>
                <p className="text-2xl font-bold text-bigster-text">
                  {selection._count.annunci || 0}
                </p>
              </div>

              <div className="w-px h-16 bg-gray-400" />

              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500 font-medium">Job</span>
                </div>
                <p className="text-2xl font-bold text-bigster-text">
                  {selection._count.raccolte_job || 0}
                </p>
              </div>
            </div>
          )}

          {/* Button */}
          <div className="mt-auto">
            <Link href={`/selezioni/${selection.id}`}>
              <button
                className="w-full font-semibold text-bigster-text transition-all duration-300 border-2 bg-transparent py-2 px-4 flex items-center justify-center gap-2"
                style={{
                  borderColor: "#6c4e06",
                }}
              >
                Visualizza dettagli
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default SelectionCard;
