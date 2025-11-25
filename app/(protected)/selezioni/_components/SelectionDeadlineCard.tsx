// ============================================
// FILE: app/(protected)/selezioni/[id]/_components/SelectionDeadlineCard.tsx
// Card dettagliata per mostrare informazioni scadenza nella pagina di dettaglio
// VERSIONE: Espandibile
// ============================================

"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  TrendingUp,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  calculateDeadlineInfo,
  formatTimeRemaining,
  getUrgencyColor,
  UrgencyLevel,
} from "@/lib/utils/selection-deadlines";
import { SelectionDetail } from "@/types/selection";

interface SelectionDeadlineCardProps {
  selection: SelectionDetail;
}

export function SelectionDeadlineCard({
  selection,
}: SelectionDeadlineCardProps) {
  const [isExpanded, setIsExpanded] = useState(true); // Default espanso perché importante

  // Calcola info scadenza
  const deadlineInfo = useMemo(() => {
    return calculateDeadlineInfo(selection);
  }, [selection]);

  // Se non c'è scadenza per questo stato, non mostrare nulla
  if (!deadlineInfo) {
    return null;
  }

  const colors = getUrgencyColor(deadlineInfo.urgencyLevel);
  const timeText = formatTimeRemaining(deadlineInfo);

  // Icona basata sull'urgenza
  const UrgencyIcon =
    deadlineInfo.urgencyLevel === UrgencyLevel.OVERDUE
      ? XCircle
      : deadlineInfo.urgencyLevel === UrgencyLevel.CRITICAL
      ? AlertTriangle
      : deadlineInfo.urgencyLevel === UrgencyLevel.WARNING
      ? AlertCircle
      : CheckCircle2;

  // Messaggio descrittivo
  const getMessage = () => {
    if (deadlineInfo.isOverdue) {
      return "Questa selezione ha superato la scadenza prevista. Si consiglia di agire tempestivamente per avanzare al prossimo stato.";
    }
    if (deadlineInfo.urgencyLevel === UrgencyLevel.CRITICAL) {
      return "Attenzione! La scadenza si avvicina rapidamente. È necessario completare le azioni richieste al più presto.";
    }
    if (deadlineInfo.urgencyLevel === UrgencyLevel.WARNING) {
      return "La selezione ha superato un terzo del tempo disponibile. Monitora attentamente il progresso.";
    }
    return "La selezione è in linea con i tempi previsti. Continua a monitorare l'avanzamento.";
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-bigster-surface border-2 shadow-bigster-card"
      style={{ borderColor: colors.border }}
    >
      {/* ============================================ */}
      {/* HEADER - Cliccabile */}
      {/* ============================================ */}
      <div
        className="px-6 py-4 border-b border-bigster-border"
        style={{ backgroundColor: colors.bg }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between hover:opacity-70 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 flex items-center justify-center border-2"
              style={{
                borderColor: colors.border,
                backgroundColor: "white",
              }}
            >
              <Clock className="h-6 w-6" style={{ color: colors.icon }} />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold" style={{ color: colors.text }}>
                Monitoraggio Scadenza
              </h2>
              <p
                className="text-xs font-semibold"
                style={{ color: colors.text, opacity: 0.8 }}
              >
                Stato: {deadlineInfo.statusLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Info quando collassato */}
            {!isExpanded && (
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <UrgencyIcon
                      className="h-4 w-4"
                      style={{ color: colors.icon }}
                    />
                    <span
                      className="text-sm font-bold"
                      style={{ color: colors.text }}
                    >
                      {timeText}
                    </span>
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: colors.text, opacity: 0.8 }}
                  >
                    {deadlineInfo.urgencyLevel === UrgencyLevel.OVERDUE
                      ? "SCADUTA"
                      : deadlineInfo.urgencyLevel === UrgencyLevel.CRITICAL
                      ? "CRITICA"
                      : deadlineInfo.urgencyLevel === UrgencyLevel.WARNING
                      ? "ATTENZIONE"
                      : "IN LINEA"}
                  </span>
                </div>

                <div
                  className="px-3 py-1.5 border-2"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: "white",
                  }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ color: colors.text }}
                  >
                    {deadlineInfo.daysElapsed}/{deadlineInfo.deadlineDays}gg
                  </span>
                </div>
              </div>
            )}

            {/* Mobile quick badge quando collapsed */}
            {!isExpanded && (
              <div
                className="sm:hidden px-3 py-1.5 border-2"
                style={{
                  borderColor: colors.border,
                  backgroundColor: "white",
                }}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: colors.text }}
                >
                  {Math.round(deadlineInfo.progressPercentage)}%
                </span>
              </div>
            )}

            {isExpanded ? (
              <ChevronUp
                className="h-5 w-5 flex-shrink-0"
                style={{ color: colors.text }}
              />
            ) : (
              <ChevronDown
                className="h-5 w-5 flex-shrink-0"
                style={{ color: colors.text }}
              />
            )}
          </div>
        </button>

        {/* Progress Bar - Solo quando collassato */}
        {!isExpanded && (
          <div className="mt-3 h-1 bg-white bg-opacity-50 overflow-hidden">
            <div
              className="h-full"
              style={{
                width: `${Math.min(100, deadlineInfo.progressPercentage)}%`,
                backgroundColor: colors.border,
              }}
            />
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* CONTENT - Espandibile */}
      {/* ============================================ */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Messaggio descrittivo */}
              <div
                className="p-4 border-2"
                style={{
                  backgroundColor: `${colors.bg}50`,
                  borderColor: colors.border,
                }}
              >
                <div className="flex items-start gap-3">
                  <UrgencyIcon
                    className="h-5 w-5 flex-shrink-0 mt-0.5"
                    style={{ color: colors.icon }}
                  />
                  <div>
                    <p
                      className="text-sm font-semibold mb-1"
                      style={{ color: colors.text }}
                    >
                      {deadlineInfo.isOverdue
                        ? "Scadenza Superata"
                        : "Avviso Tempistiche"}
                    </p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: colors.text, opacity: 0.9 }}
                    >
                      {getMessage()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress bar dettagliata */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-bigster-text">
                    Avanzamento Temporale
                  </span>
                  <span className="text-xs font-bold text-bigster-text">
                    {Math.round(deadlineInfo.progressPercentage)}%
                  </span>
                </div>
                <div className="h-3 bg-bigster-border overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        100,
                        deadlineInfo.progressPercentage
                      )}%`,
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full"
                    style={{ backgroundColor: colors.border }}
                  />
                  {/* Marker a 33% e 66% */}
                  <div className="absolute inset-0 flex items-center justify-between px-0.5">
                    <div
                      className="w-0.5 h-full bg-white opacity-30"
                      style={{ marginLeft: "33%" }}
                    />
                    <div
                      className="w-0.5 h-full bg-white opacity-30"
                      style={{ marginLeft: "33%" }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-bigster-text-muted">
                    Inizio
                  </span>
                  <span className="text-xs text-bigster-text-muted">33%</span>
                  <span className="text-xs text-bigster-text-muted">66%</span>
                  <span className="text-xs text-bigster-text-muted">
                    Scadenza
                  </span>
                </div>
              </div>

              {/* Statistiche dettagliate */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Giorni trascorsi */}
                <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-bigster-text-muted" />
                    <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                      Trascorsi
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-bigster-text">
                    {deadlineInfo.daysElapsed}
                  </p>
                  <p className="text-xs text-bigster-text-muted">
                    {deadlineInfo.daysElapsed === 1 ? "giorno" : "giorni"}
                  </p>
                </div>

                {/* Giorni rimanenti */}
                <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-bigster-text-muted" />
                    <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                      Rimanenti
                    </span>
                  </div>
                  <p
                    className="text-2xl font-bold"
                    style={{
                      color: deadlineInfo.isOverdue ? colors.icon : "#6c4e06",
                    }}
                  >
                    {deadlineInfo.isOverdue ? 0 : deadlineInfo.daysRemaining}
                  </p>
                  <p className="text-xs text-bigster-text-muted">
                    {deadlineInfo.daysRemaining === 1 ? "giorno" : "giorni"}
                  </p>
                </div>

                {/* Ore rimanenti */}
                <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-bigster-text-muted" />
                    <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                      Ore
                    </span>
                  </div>
                  <p
                    className="text-2xl font-bold"
                    style={{
                      color: deadlineInfo.isOverdue ? colors.icon : "#6c4e06",
                    }}
                  >
                    {deadlineInfo.isOverdue ? 0 : deadlineInfo.hoursRemaining}
                  </p>
                  <p className="text-xs text-bigster-text-muted">
                    {deadlineInfo.hoursRemaining === 1 ? "ora" : "ore"}
                  </p>
                </div>

                {/* Scadenza totale */}
                <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-bigster-text-muted" />
                    <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                      Totale
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-bigster-text">
                    {deadlineInfo.deadlineDays}
                  </p>
                  <p className="text-xs text-bigster-text-muted">
                    {deadlineInfo.deadlineDays === 1 ? "giorno" : "giorni"}
                  </p>
                </div>
              </div>

              {/* Timeline date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Data inizio */}
                <div className="p-4 bg-bigster-background border border-bigster-border">
                  <p className="text-xs font-semibold text-bigster-text-muted uppercase mb-2">
                    Entrata nello Stato
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-bigster-text" />
                    <p className="text-sm font-semibold text-bigster-text">
                      {formatDate(deadlineInfo.dateEntered)}
                    </p>
                  </div>
                </div>

                {/* Data scadenza */}
                <div
                  className="p-4 border-2"
                  style={{
                    backgroundColor: deadlineInfo.isOverdue
                      ? `${colors.bg}80`
                      : "#f5f5f7",
                    borderColor: deadlineInfo.isOverdue
                      ? colors.border
                      : "#d8d8d8",
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase mb-2"
                    style={{
                      color: deadlineInfo.isOverdue ? colors.text : "#666666",
                    }}
                  >
                    Data Scadenza Prevista
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar
                      className="h-4 w-4"
                      style={{
                        color: deadlineInfo.isOverdue ? colors.icon : "#6c4e06",
                      }}
                    />
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: deadlineInfo.isOverdue ? colors.text : "#6c4e06",
                      }}
                    >
                      {formatDate(deadlineInfo.deadlineDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Azione consigliata */}
              <div className="p-4 border-2 border-bigster-text bg-bigster-background">
                <div className="flex items-start gap-3">
                  <ArrowRight className="h-5 w-5 text-bigster-text flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-bigster-text mb-1">
                      Azione Consigliata
                    </p>
                    <p className="text-xs text-bigster-text-muted leading-relaxed">
                      Per rispettare le tempistiche previste, è consigliato
                      cambiare lo stato della selezione in{" "}
                      <span className="font-semibold text-bigster-text">
                        "{deadlineInfo.nextStateLabel}"
                      </span>
                      {deadlineInfo.isOverdue
                        ? " il prima possibile."
                        : ` entro ${deadlineInfo.daysRemaining} ${
                            deadlineInfo.daysRemaining === 1
                              ? "giorno"
                              : "giorni"
                          }.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info aggiuntiva */}
              <div className="pt-4 border-t border-bigster-border">
                <p className="text-xs text-bigster-text-muted leading-relaxed">
                  <span className="font-semibold">Nota:</span> Queste scadenze
                  sono indicative e non bloccano le operazioni. Servono come
                  guida per mantenere un flusso di lavoro efficiente e
                  tempestivo. È sempre possibile cambiare lo stato della
                  selezione indipendentemente dalle tempistiche.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
