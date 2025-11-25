// ============================================
// FILE: app/(protected)/selezioni/_components/SelectionsDeadlinesMonitor.tsx
// VERSIONE: Con tab system per HR_ASSEGNATA e RACCOLTA_JOB_APPROVATA_CLIENTE
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
  Users,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import { useGetDeadlineMonitoringQuery } from "@/lib/redux/features/selections/selectionsApiSlice";
import {
  getSelectionsWithDeadlines,
  sortByUrgency,
  formatTimeRemaining,
  getUrgencyColor,
  UrgencyLevel,
  type SelectionWithDeadline,
} from "@/lib/utils/selection-deadlines";
import { SelectionStatus } from "@/types/selection";
import { Spinner } from "@/components/ui/spinner";

type TabType = "hr_assegnata" | "job_approvata";

/**
 * Componente floating per monitorare scadenze critiche delle selezioni
 * Sistema a tab per visualizzare separatamente:
 * - HR_ASSEGNATA (3 giorni)
 * - RACCOLTA_JOB_APPROVATA_CLIENTE (60 giorni)
 */
export function SelectionsDeadlinesMonitor() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("hr_assegnata");

  // ✅ USA IL NUOVO ENDPOINT OTTIMIZZATO
  const {
    data: selections,
    isLoading,
    error,
  } = useGetDeadlineMonitoringQuery();

  // Calcola selezioni con scadenze e dividi per stato
  const { hrAssegnataSelections, jobApprovataSelections, allSelections } =
    useMemo(() => {
      if (!selections) {
        return {
          hrAssegnataSelections: [],
          jobApprovataSelections: [],
          allSelections: [],
        };
      }

      const withDeadlines = getSelectionsWithDeadlines(selections);

      return {
        hrAssegnataSelections: sortByUrgency(
          withDeadlines.filter((s) => s.stato === SelectionStatus.HR_ASSEGNATA)
        ),
        jobApprovataSelections: sortByUrgency(
          withDeadlines.filter(
            (s) => s.stato === SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE
          )
        ),
        allSelections: sortByUrgency(withDeadlines),
      };
    }, [selections]);

  const hasDeadlines = allSelections.length > 0;
  const hasHrAssegnata = hrAssegnataSelections.length > 0;
  const hasJobApprovata = jobApprovataSelections.length > 0;

  // Auto-switch al tab con contenuto quando si espande
  useMemo(() => {
    if (isExpanded && hasDeadlines) {
      if (activeTab === "hr_assegnata" && !hasHrAssegnata && hasJobApprovata) {
        setActiveTab("job_approvata");
      } else if (
        activeTab === "job_approvata" &&
        !hasJobApprovata &&
        hasHrAssegnata
      ) {
        setActiveTab("hr_assegnata");
      }
    }
  }, [isExpanded, hasDeadlines, hasHrAssegnata, hasJobApprovata, activeTab]);

  // Conta per urgenza - GLOBALI
  const globalCounts = useMemo(() => {
    const result = {
      total: allSelections.length,
      overdue: 0,
      critical: 0,
      warning: 0,
      ok: 0,
    };

    allSelections.forEach((s) => {
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
  }, [allSelections]);

  // Conta per urgenza - HR_ASSEGNATA
  const hrCounts = useMemo(() => {
    const result = {
      total: hrAssegnataSelections.length,
      overdue: 0,
      critical: 0,
      warning: 0,
      ok: 0,
    };

    hrAssegnataSelections.forEach((s) => {
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
  }, [hrAssegnataSelections]);

  // Conta per urgenza - RACCOLTA_JOB_APPROVATA_CLIENTE
  const jobCounts = useMemo(() => {
    const result = {
      total: jobApprovataSelections.length,
      overdue: 0,
      critical: 0,
      warning: 0,
      ok: 0,
    };

    jobApprovataSelections.forEach((s) => {
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
  }, [jobApprovataSelections]);

  // Determina il colore del badge per ogni tab
  const getTabBadgeColor = (counts: typeof hrCounts) => {
    if (counts.overdue > 0) return "#ef4444";
    if (counts.critical > 0) return "#f97316";
    if (counts.warning > 0) return "#f59e0b";
    if (counts.ok > 0) return "#10b981";
    return "#6b7280";
  };

  const hrBadgeColor = getTabBadgeColor(hrCounts);
  const jobBadgeColor = getTabBadgeColor(jobCounts);

  // Colore principale del badge (basato sul worst case globale)
  const badgeColor = hasDeadlines
    ? globalCounts.overdue > 0
      ? "#ef4444"
      : globalCounts.critical > 0
      ? "#f97316"
      : globalCounts.warning > 0
      ? "#f59e0b"
      : "#10b981"
    : "#6b7280";

  // Selezioni da mostrare nel tab attivo
  const activeSelections =
    activeTab === "hr_assegnata"
      ? hrAssegnataSelections
      : jobApprovataSelections;

  // ============================================
  // LOADING STATE
  // ============================================
  if (isLoading) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div
          className="bg-bigster-surface border-2 shadow-2xl p-4"
          style={{ borderColor: "#6b7280" }}
        >
          <div className="flex items-center gap-3">
            <Spinner className="h-5 w-5 text-bigster-text" />
            <div>
              <p className="text-sm font-semibold text-bigster-text">
                Caricamento scadenze...
              </p>
              <p className="text-xs text-bigster-text-muted">
                Recupero dati in corso
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error) {
    return (
      <div className="fixed bottom-6 right-6 z-50 max-w-md">
        <div className="bg-bigster-surface border-2 border-red-400 shadow-2xl p-4">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800 mb-1">
                Errore nel caricamento
              </p>
              <p className="text-xs text-red-700">
                Impossibile recuperare i dati delle scadenze. Riprova più tardi.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN COMPONENT
  // ============================================
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
        {/* ============================================ */}
        {/* HEADER - Sempre visibile */}
        {/* ============================================ */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-5 py-4 flex items-center justify-between bg-bigster-card-bg hover:opacity-90 transition-opacity gap-6"
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
                    {globalCounts.total}{" "}
                    {globalCounts.total === 1 ? "selezione" : "selezioni"} da
                    monitorare
                  </>
                ) : (
                  "Nessuna scadenza attiva"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Badge contatori - solo se ci sono scadenze e non espanso */}
            {!isExpanded && hasDeadlines && (
              <div className="flex items-center gap-1.5">
                {globalCounts.overdue > 0 && (
                  <span
                    className="px-2 py-0.5 text-xs font-bold rounded-full"
                    style={{ backgroundColor: "#fee2e2", color: "#ef4444" }}
                  >
                    {globalCounts.overdue}
                  </span>
                )}
                {globalCounts.critical > 0 && (
                  <span
                    className="px-2 py-0.5 text-xs font-bold rounded-full"
                    style={{ backgroundColor: "#ffedd5", color: "#f97316" }}
                  >
                    {globalCounts.critical}
                  </span>
                )}
                {globalCounts.warning > 0 && (
                  <span
                    className="px-2 py-0.5 text-xs font-bold rounded-full"
                    style={{ backgroundColor: "#fef3c7", color: "#f59e0b" }}
                  >
                    {globalCounts.warning}
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

        {/* ============================================ */}
        {/* CONTENT ESPANDIBILE */}
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
              {hasDeadlines ? (
                <>
                  {/* Summary Stats GLOBALI */}
                  <div className="px-5 py-4 bg-bigster-background border-t border-bigster-border">
                    <div className="grid grid-cols-2 gap-3">
                      {globalCounts.overdue > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200">
                          <div className="flex items-center gap-2 mb-1">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-xs font-semibold text-red-800">
                              SCADUTE
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-red-600">
                            {globalCounts.overdue}
                          </p>
                        </div>
                      )}
                      {globalCounts.critical > 0 && (
                        <div className="p-3 bg-orange-50 border border-orange-200">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            <span className="text-xs font-semibold text-orange-800">
                              CRITICHE
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-orange-600">
                            {globalCounts.critical}
                          </p>
                        </div>
                      )}
                      {globalCounts.warning > 0 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="text-xs font-semibold text-yellow-800">
                              ATTENZIONE
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-yellow-600">
                            {globalCounts.warning}
                          </p>
                        </div>
                      )}
                      {globalCounts.ok > 0 && (
                        <div className="p-3 bg-green-50 border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-semibold text-green-800">
                              OK
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-green-600">
                            {globalCounts.ok}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ============================================ */}
                  {/* TAB BAR */}
                  {/* ============================================ */}
                  <div className="border-t border-bigster-border bg-bigster-card-bg">
                    <div className="flex">
                      {/* Tab 1: HR Assegnata */}
                      <button
                        onClick={() => setActiveTab("hr_assegnata")}
                        disabled={!hasHrAssegnata}
                        className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${
                          activeTab === "hr_assegnata"
                            ? "border-bigster-text bg-bigster-surface"
                            : "border-transparent hover:bg-bigster-muted-bg"
                        } ${
                          !hasHrAssegnata ? "opacity-40 cursor-not-allowed" : ""
                        }`}
                      >
                        <Users
                          className="h-4 w-4"
                          style={{
                            color:
                              activeTab === "hr_assegnata"
                                ? "#6c4e06"
                                : "#666666",
                          }}
                        />
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-bold ${
                              activeTab === "hr_assegnata"
                                ? "text-bigster-text"
                                : "text-bigster-text-muted"
                            }`}
                          >
                            HR Assegnata
                          </span>
                          {hasHrAssegnata && (
                            <span
                              className="px-1.5 py-0.5 text-[10px] font-bold rounded-full"
                              style={{
                                backgroundColor:
                                  activeTab === "hr_assegnata"
                                    ? `${hrBadgeColor}20`
                                    : "#f5f5f7",
                                color:
                                  activeTab === "hr_assegnata"
                                    ? hrBadgeColor
                                    : "#666666",
                                border: `1px solid ${
                                  activeTab === "hr_assegnata"
                                    ? hrBadgeColor
                                    : "#d8d8d8"
                                }`,
                              }}
                            >
                              {hrCounts.total}
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Tab 2: Job Approvata Cliente */}
                      <button
                        onClick={() => setActiveTab("job_approvata")}
                        disabled={!hasJobApprovata}
                        className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${
                          activeTab === "job_approvata"
                            ? "border-bigster-text bg-bigster-surface"
                            : "border-transparent hover:bg-bigster-muted-bg"
                        } ${
                          !hasJobApprovata
                            ? "opacity-40 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <FileCheck
                          className="h-4 w-4"
                          style={{
                            color:
                              activeTab === "job_approvata"
                                ? "#6c4e06"
                                : "#666666",
                          }}
                        />
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-bold ${
                              activeTab === "job_approvata"
                                ? "text-bigster-text"
                                : "text-bigster-text-muted"
                            }`}
                          >
                            Job Approvata
                          </span>
                          {hasJobApprovata && (
                            <span
                              className="px-1.5 py-0.5 text-[10px] font-bold rounded-full"
                              style={{
                                backgroundColor:
                                  activeTab === "job_approvata"
                                    ? `${jobBadgeColor}20`
                                    : "#f5f5f7",
                                color:
                                  activeTab === "job_approvata"
                                    ? jobBadgeColor
                                    : "#666666",
                                border: `1px solid ${
                                  activeTab === "job_approvata"
                                    ? jobBadgeColor
                                    : "#d8d8d8"
                                }`,
                              }}
                            >
                              {jobCounts.total}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* ============================================ */}
                  {/* TAB CONTENT */}
                  {/* ============================================ */}
                  <div className="max-h-96 overflow-y-auto">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        {activeSelections.length > 0 ? (
                          <div className="divide-y divide-bigster-border">
                            {activeSelections.map((selection) => (
                              <SelectionDeadlineItem
                                key={selection.id}
                                selection={selection}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="px-5 py-12 text-center bg-bigster-background">
                            <div
                              className="w-12 h-12 mx-auto mb-3 flex items-center justify-center"
                              style={{
                                backgroundColor: "#d1fae515",
                                border: "2px solid #10b981",
                              }}
                            >
                              <CheckCircle2 className="h-6 w-6 text-green-500" />
                            </div>
                            <p className="text-sm font-semibold text-bigster-text mb-1">
                              Nessuna scadenza in questa categoria
                            </p>
                            <p className="text-xs text-bigster-text-muted">
                              {activeTab === "hr_assegnata"
                                ? "Non ci sono selezioni in 'HR Assegnata' da monitorare"
                                : "Non ci sono selezioni in 'Job Approvata Cliente' da monitorare"}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                // ============================================
                // EMPTY STATE
                // ============================================
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

// ============================================
// COMPONENTE ITEM SINGOLO
// ============================================
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
