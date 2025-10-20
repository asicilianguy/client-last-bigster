// ============================================
// FILE: app/(protected)/selezioni/_components/SelectionsKPI.tsx
// ============================================

"use client";

import { motion } from "framer-motion";
import {
  LayoutGrid,
  Zap,
  CheckCheck,
  XCircle,
  UserCheck,
  FileCheck,
  Megaphone,
  Users,
} from "lucide-react";
import { SelectionStatus } from "@/types/selection";

const STATUS_LABELS: Record<SelectionStatus, string> = {
  [SelectionStatus.FATTURA_AV_SALDATA]: "Fattura Saldata",
  [SelectionStatus.HR_ASSEGNATA]: "HR Assegnata",
  [SelectionStatus.PRIMA_CALL_COMPLETATA]: "Prima Call",
  [SelectionStatus.RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE]: "Job in Approv.",
  [SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE]: "Job Approvata",
  [SelectionStatus.BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO]: "Bozza CEO",
  [SelectionStatus.ANNUNCIO_APPROVATO]: "Annuncio OK",
  [SelectionStatus.ANNUNCIO_PUBBLICATO]: "Pubblicato",
  [SelectionStatus.CANDIDATURE_RICEVUTE]: "Candidature",
  [SelectionStatus.COLLOQUI_IN_CORSO]: "Colloqui",
  [SelectionStatus.PROPOSTA_CANDIDATI]: "Proposta",
  [SelectionStatus.CHIUSA]: "Chiusa",
  [SelectionStatus.ANNULLATA]: "Annullata",
};

interface SelectionsKPIProps {
  data: {
    total: number;
    byStatus: Record<SelectionStatus, number>;
    lastModified: any;
  };
}

export function SelectionsKPI({ data }: SelectionsKPIProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const activeSelections = Object.entries(data.byStatus)
    .filter(
      ([status]) =>
        status !== SelectionStatus.CHIUSA &&
        status !== SelectionStatus.ANNULLATA
    )
    .reduce((sum, [_, count]) => sum + count, 0);

  const closedSelections = data.byStatus[SelectionStatus.CHIUSA] || 0;
  const cancelledSelections = data.byStatus[SelectionStatus.ANNULLATA] || 0;

  // Stati chiave che vogliamo monitorare
  const keyStates = [
    {
      status: SelectionStatus.HR_ASSEGNATA,
      label: "HR Assegnata",
      icon: UserCheck,
      color: "#3b82f6",
      bgColor: "#dbeafe",
    },
    {
      status: SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE,
      label: "Job Approvata",
      icon: FileCheck,
      color: "#10b981",
      bgColor: "#d1fae5",
    },
    {
      status: SelectionStatus.ANNUNCIO_APPROVATO,
      label: "Annuncio OK",
      icon: Megaphone,
      color: "#8b5cf6",
      bgColor: "#ede9fe",
    },
    {
      status: SelectionStatus.PROPOSTA_CANDIDATI,
      label: "Proposta",
      icon: Users,
      color: "#f59e0b",
      bgColor: "#fef3c7",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header KPI */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-bigster-text">
            Dashboard Selezioni
          </h2>
          <p className="text-sm text-bigster-text-muted mt-1">
            Panoramica completa dello stato delle selezioni
          </p>
        </div>
        {data.lastModified && (
          <div className="text-right">
            <p className="text-xs text-bigster-text-muted">Ultima modifica</p>
            <p className="text-sm font-semibold text-bigster-text">
              {formatDate(data.lastModified.data_modifica)}
            </p>
            <p className="text-xs text-bigster-text-muted mt-0.5">
              {data.lastModified.titolo}
            </p>
          </div>
        )}
      </div>

      {/* KPI Cards principali */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-bigster-surface border border-bigster-border p-6 shadow-bigster-card"
      >
        <h3 className="text-sm font-bold text-bigster-text mb-6 uppercase tracking-wide">
          Metriche Principali
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Totale",
              count: data.total,
              suffix: data.total === 1 ? "selezione" : "selezioni",
              icon: LayoutGrid,
              color: "#e4d72b",
              bgColor: "#fef9e6",
              delay: 0,
            },
            {
              label: "In Corso",
              count: activeSelections,
              suffix:
                activeSelections === 1
                  ? "selezione attiva"
                  : "selezioni attive",
              icon: Zap,
              color: "#3b82f6",
              bgColor: "#dbeafe",
              delay: 0.1,
            },
            {
              label: "Completate",
              count: closedSelections,
              suffix:
                closedSelections === 1
                  ? "selezione chiusa"
                  : "selezioni chiuse",
              icon: CheckCheck,
              color: "#10b981",
              bgColor: "#d1fae5",
              delay: 0.2,
            },
            {
              label: "Annullate",
              count: cancelledSelections,
              suffix:
                cancelledSelections === 1
                  ? "selezione annullata"
                  : "selezioni annullate",
              icon: XCircle,
              color: "#ef4444",
              bgColor: "#fee2e2",
              delay: 0.3,
            },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + kpi.delay }}
                className="bg-bigster-background border border-bigster-border p-5 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300"
              >
                {/* Icona decorativa di sfondo */}
                <div
                  className="absolute -right-4 -top-4 opacity-10"
                  style={{ color: kpi.color }}
                >
                  <Icon className="h-24 w-24" />
                </div>

                {/* Contenuto */}
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="p-2.5 rounded-none"
                      style={{ backgroundColor: kpi.bgColor }}
                    >
                      <Icon className="h-5 w-5" style={{ color: kpi.color }} />
                    </div>
                    <span
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{ color: kpi.color }}
                    >
                      {kpi.label}
                    </span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold text-bigster-text">
                        {kpi.count}
                      </p>
                      <p className="text-xs text-bigster-text-muted mt-1">
                        {kpi.suffix}
                      </p>
                    </div>

                    {/* Progress indicator */}
                    {data.total > 0 && kpi.label !== "Totale" && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-bigster-text">
                          {Math.round((kpi.count / data.total) * 100)}%
                        </p>
                        <p className="text-xs text-bigster-text-muted">
                          del totale
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Stati chiave - Design fluido e moderno */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-bigster-surface border border-bigster-border p-6 shadow-bigster-card"
      >
        <h3 className="text-sm font-bold text-bigster-text mb-6 uppercase tracking-wide">
          Stati Chiave del Processo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {keyStates.map((state, index) => {
            const count = data.byStatus[state.status] || 0;
            const Icon = state.icon;

            return (
              <motion.div
                key={state.status}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-bigster-background border border-bigster-border p-5 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300"
              >
                {/* Icona decorativa di sfondo */}
                <div
                  className="absolute -right-4 -top-4 opacity-10"
                  style={{ color: state.color }}
                >
                  <Icon className="h-24 w-24" />
                </div>

                {/* Contenuto */}
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="p-2.5 rounded-none"
                      style={{ backgroundColor: state.bgColor }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: state.color }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{ color: state.color }}
                    >
                      {state.label}
                    </span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold text-bigster-text">
                        {count}
                      </p>
                      <p className="text-xs text-bigster-text-muted mt-1">
                        {count === 1 ? "selezione" : "selezioni"}
                      </p>
                    </div>

                    {/* Progress indicator */}
                    {data.total > 0 && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-bigster-text">
                          {Math.round((count / data.total) * 100)}%
                        </p>
                        <p className="text-xs text-bigster-text-muted">
                          del totale
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
