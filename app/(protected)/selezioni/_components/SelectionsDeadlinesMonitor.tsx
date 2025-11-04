// ============================================
// FILE: app/(protected)/selezioni/_components/SelectionsDeadlinesMonitor.tsx
// VERSIONE: Sempre visibile con empty state
// ============================================

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import {
  getSelectionsWithDeadlines,
  sortByUrgency,
  formatTimeRemaining,
  getUrgencyColor,
  UrgencyLevel,
  type SelectionWithDeadline,
} from "@/lib/utils/selection-deadlines";

interface SelectionsDeadlinesMonitorProps {
  selections: any[];
}

export function SelectionsDeadlinesMonitor({
  selections,
}: SelectionsDeadlinesMonitorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calcola selezioni con scadenze
  const selectionsWithDeadlines = useMemo(() => {
    return sortByUrgency(getSelectionsWithDeadlines(selections));
  }, [selections]);

  const hasDeadlines = selectionsWithDeadlines.length > 0;

  // Conta per urgenza
  const counts = useMemo(() => {
    const result = {
      total: selectionsWithDeadlines.length,
      overdue: 0,
      critical: 0,
      warning: 0,
      ok: 0,
    };

    selectionsWithDeadlines.forEach((s) => {
      switch (s.deadlineInfo.urgencyLevel) {
        case UrgencyLevel.OVERDUE:
          result.overdue++;
          break;
        case UrgencyLevel.CRITICAL:
          result.critical++;
          break;
        case UrgencyLevel.WARNING:
          result.warning++;
          break;
        case UrgencyLevel.OK:
          result.ok++;
          break;
      }
    });

    return result;
  }, [selectionsWithDeadlines]);

  // Determina il colore principale del badge
  const badgeColor = hasDeadlines
    ? counts.overdue > 0
      ? "#ef4444"
      : counts.critical > 0
      ? "#f97316"
      : counts.warning > 0
      ? "#f59e0b"
      : "#10b981"
    : "#6b7280"; // grigio quando non ci sono scadenze

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50 max-w-md"
      style={{ maxHeight: isExpanded ? "calc(100vh - 8rem)" : "auto" }}
    >
      <div
        className="bg-bigster-surface border-2 shadow-2xl overflow-hidden"
        style={{ borderColor: badgeColor }}
      >
        {/* Header - Sempre visibile */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-5 py-4 flex items-center justify-between bg-bigster-card-bg hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center"
              style={{
                backgroundColor: `${badgeColor}15`,
                border: `2px solid ${badgeColor}`,
              }}
            >
              {hasDeadlines ? (
                <Clock className="h-5 w-5" style={{ color: badgeColor }} />
              ) : (
                <CheckCircle2
                  className="h-5 w-5"
                  style={{ color: badgeColor }}
                />
              )}
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-bigster-text">
                Monitoraggio Scadenze
              </h3>
              <p className="text-xs text-bigster-text-muted">
                {hasDeadlines ? (
                  <>
                    {counts.total}{" "}
                    {counts.total === 1 ? "selezione" : "selezioni"} da
                    monitorare
                  </>
                ) : (
                  "Nessuna scadenza attiva"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Badge contatori - solo se ci sono scadenze */}
            {!isExpanded && hasDeadlines && (
              <div className="flex items-center gap-1.5">
                {counts.overdue > 0 && (
                  <span
                    className="px-2 py-0.5 text-xs font-bold rounded-full"
                    style={{ backgroundColor: "#fee2e2", color: "#ef4444" }}
                  >
                    {counts.overdue}
                  </span>
                )}
                {counts.critical > 0 && (
                  <span
                    className="px-2 py-0.5 text-xs font-bold rounded-full"
                    style={{ backgroundColor: "#ffedd5", color: "#f97316" }}
                  >
                    {counts.critical}
                  </span>
                )}
                {counts.warning > 0 && (
                  <span
                    className="px-2 py-0.5 text-xs font-bold rounded-full"
                    style={{ backgroundColor: "#fef3c7", color: "#f59e0b" }}
                  >
                    {counts.warning}
                  </span>
                )}
              </div>
            )}

            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-bigster-text" />
            ) : (
              <ChevronUp className="h-5 w-5 text-bigster-text" />
            )}
          </div>
        </button>

        {/* Content espandibile */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {hasDeadlines ? (
                <>
                  {/* Summary Stats */}
                  <div className="px-5 py-4 bg-bigster-background border-t border-bigster-border">
                    <div className="grid grid-cols-2 gap-3">
                      {counts.overdue > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200">
                          <div className="flex items-center gap-2 mb-1">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-xs font-semibold text-red-800">
                              SCADUTE
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-red-600">
                            {counts.overdue}
                          </p>
                        </div>
                      )}
                      {counts.critical > 0 && (
                        <div className="p-3 bg-orange-50 border border-orange-200">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            <span className="text-xs font-semibold text-orange-800">
                              CRITICHE
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-orange-600">
                            {counts.critical}
                          </p>
                        </div>
                      )}
                      {counts.warning > 0 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="text-xs font-semibold text-yellow-800">
                              ATTENZIONE
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-yellow-600">
                            {counts.warning}
                          </p>
                        </div>
                      )}
                      {counts.ok > 0 && (
                        <div className="p-3 bg-green-50 border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-semibold text-green-800">
                              OK
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-green-600">
                            {counts.ok}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lista selezioni */}
                  <div className="max-h-96 overflow-y-auto">
                    <div className="divide-y divide-bigster-border">
                      {selectionsWithDeadlines.map((selection) => (
                        <SelectionDeadlineItem
                          key={selection.id}
                          selection={selection}
                        />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                // ← EMPTY STATE
                <div className="px-5 py-12 text-center bg-bigster-background border-t border-bigster-border">
                  <div
                    className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                    style={{
                      backgroundColor: "#d1fae515",
                      border: "2px solid #10b981",
                    }}
                  >
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-bigster-text mb-2">
                    Tutto in Ordine
                  </h3>
                  <p className="text-sm text-bigster-text-muted mb-4 leading-relaxed max-w-xs mx-auto">
                    Al momento non ci sono selezioni con scadenze attive da
                    monitorare.
                  </p>
                  <div className="pt-4 border-t border-bigster-border max-w-xs mx-auto">
                    <p className="text-xs text-bigster-text-muted leading-relaxed">
                      Questo componente monitora automaticamente le selezioni
                      negli stati{" "}
                      <span className="font-semibold text-bigster-text">
                        "HR Assegnata"
                      </span>{" "}
                      (3 giorni) e{" "}
                      <span className="font-semibold text-bigster-text">
                        "Job Approvata Cliente"
                      </span>{" "}
                      (60 giorni).
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Componente per singolo item nella lista
function SelectionDeadlineItem({
  selection,
}: {
  selection: SelectionWithDeadline;
}) {
  const colors = getUrgencyColor(selection.deadlineInfo.urgencyLevel);
  const timeText = formatTimeRemaining(selection.deadlineInfo);

  // Icona basata sull'urgenza
  const UrgencyIcon =
    selection.deadlineInfo.urgencyLevel === UrgencyLevel.OVERDUE
      ? XCircle
      : selection.deadlineInfo.urgencyLevel === UrgencyLevel.CRITICAL
      ? AlertTriangle
      : selection.deadlineInfo.urgencyLevel === UrgencyLevel.WARNING
      ? AlertCircle
      : CheckCircle2;

  return (
    <Link href={`/selezioni/${selection.id}`}>
      <div
        className="px-5 py-4 hover:bg-bigster-background transition-colors cursor-pointer group"
        style={{ borderLeft: `4px solid ${colors.border}` }}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-bigster-text line-clamp-1 mb-0.5 group-hover:underline">
              {selection.titolo}
            </h4>
            <p className="text-xs text-bigster-text-muted line-clamp-1">
              {selection.company?.nome || "Cliente non specificato"}
            </p>
          </div>

          <ExternalLink className="h-4 w-4 text-bigster-text-muted flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="h-1.5 bg-bigster-border overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  selection.deadlineInfo.progressPercentage
                )}%`,
                backgroundColor: colors.border,
              }}
            />
          </div>
        </div>

        {/* Info riga */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UrgencyIcon
              className="h-3.5 w-3.5"
              style={{ color: colors.icon }}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: colors.text }}
            >
              {timeText}
            </span>
          </div>

          <span className="text-xs text-bigster-text-muted">
            {selection.deadlineInfo.daysElapsed}/
            {selection.deadlineInfo.deadlineDays} giorni
          </span>
        </div>

        {/* Azione richiesta */}
        <div className="mt-2 pt-2 border-t border-bigster-border">
          <p className="text-xs text-bigster-text-muted">
            <span className="font-semibold">Azione richiesta:</span> Cambia
            stato in "{selection.deadlineInfo.nextStateLabel}"
          </p>
        </div>
      </div>
    </Link>
  );
}
