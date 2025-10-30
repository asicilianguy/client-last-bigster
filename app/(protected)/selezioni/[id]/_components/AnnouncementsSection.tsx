"use client";

import { useState } from "react";
import {
  Megaphone,
  Plus,
  Eye,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle2,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SelectionDetail,
  SelectionStatus,
  AnnouncementStatus,
} from "@/types/selection";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface AnnouncementsSectionProps {
  selection: SelectionDetail;
}

const ANNOUNCEMENT_STATUS_LABELS: Record<AnnouncementStatus, string> = {
  BOZZA: "Bozza",
  PUBBLICATO: "Pubblicato",
  SCADUTO: "Scaduto",
  CHIUSO: "Chiuso",
};

const ANNOUNCEMENT_STATUS_CONFIG: Record<
  AnnouncementStatus,
  {
    bgColor: string;
    borderColor: string;
    textColor: string;
    icon: React.ElementType;
  }
> = {
  BOZZA: {
    bgColor: "bg-bigster-surface",
    borderColor: "border-bigster-border",
    textColor: "text-bigster-text-muted",
    icon: FileText,
  },
  PUBBLICATO: {
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    icon: CheckCircle2,
  },
  SCADUTO: {
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700",
    icon: Clock,
  },
  CHIUSO: {
    bgColor: "bg-gray-50",
    borderColor: "border-gray-300",
    textColor: "text-gray-600",
    icon: AlertCircle,
  },
};

export function AnnouncementsSection({ selection }: AnnouncementsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const canCreateAnnouncement =
    selection.stato === SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE ||
    selection.stato === SelectionStatus.ANNUNCIO_APPROVATO;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateFull = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Oggi";
    if (diffDays === 1) return "Ieri";
    if (diffDays < 7) return `${diffDays} giorni fa`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} settimane fa`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} mesi fa`;
    return `${Math.floor(diffDays / 365)} anni fa`;
  };

  const getDaysUntilExpiry = (dateString: string | null): number | null => {
    if (!dateString) return null;
    const expiry = new Date(dateString);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // Statistiche
  const totalAnnunci = selection.annunci.length;
  const pubblicati = selection.annunci.filter(
    (a) => a.stato === AnnouncementStatus.PUBBLICATO
  ).length;
  const totalCandidature = selection.annunci.reduce(
    (sum, a) => sum + (a._count?.candidature || 0),
    0
  );
  const bozze = selection.annunci.filter(
    (a) => a.stato === AnnouncementStatus.BOZZA
  ).length;

  // Ultimo annuncio pubblicato
  const ultimoAnnuncio = selection.annunci
    .filter((a) => a.data_pubblicazione)
    .sort(
      (a, b) =>
        new Date(b.data_pubblicazione!).getTime() -
        new Date(a.data_pubblicazione!).getTime()
    )[0];

  return (
    <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card">
      {/* Header - GRIGIO - Cliccabile */}
      <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between hover:opacity-70 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <Megaphone className="h-5 w-5 text-bigster-text" />
            <div className="text-left">
              <h2 className="text-lg font-bold text-bigster-text">Annunci</h2>
              <p className="text-xs text-bigster-text-muted">
                {totalAnnunci} annunci • {pubblicati} pubblicati •{" "}
                {totalCandidature} candidature totali
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Info quando collassato */}
            {!isExpanded && totalAnnunci > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-bigster-border bg-bigster-surface">
                {pubblicati > 0 ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-bigster-text-muted">
                      {pubblicati} pubblicati
                      {ultimoAnnuncio && (
                        <span className="ml-1 font-semibold text-bigster-text">
                          • Ultimo: {getTimeAgo(ultimoAnnuncio.data_pubblicazione!)}
                        </span>
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    <FileText className="h-3 w-3 text-bigster-text-muted" />
                    <span className="text-xs text-bigster-text-muted">
                      {bozze} {bozze === 1 ? "bozza" : "bozze"} in sospeso
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Bottone Nuovo Annuncio quando collassato */}
            {!isExpanded && canCreateAnnouncement && (
              <Button
                asChild
                size="sm"
                onClick={(e) => e.stopPropagation()}
                className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
              >
                <Link href={`/selezioni/${selection.id}/annunci/nuovo`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo
                </Link>
              </Button>
            )}

            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-bigster-text flex-shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 text-bigster-text flex-shrink-0" />
            )}
          </div>
        </button>
      </div>

      {/* Content - Espandibile */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6">
              {selection.annunci.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-bigster-muted-bg border border-bigster-border"
                >
                  <Megaphone className="h-12 w-12 text-bigster-text-muted mx-auto mb-3" />
                  <p className="text-sm font-medium text-bigster-text-muted mb-1">
                    Nessun annuncio ancora creato
                  </p>
                  {canCreateAnnouncement ? (
                    <p className="text-xs text-bigster-text-muted mb-4">
                      Crea il primo annuncio per iniziare a ricevere candidature
                    </p>
                  ) : (
                    <p className="text-xs text-bigster-text-muted mb-4">
                      Gli annunci potranno essere creati dopo l'approvazione della
                      raccolta job
                    </p>
                  )}

                  {canCreateAnnouncement && (
                    <Button
                      asChild
                      className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
                    >
                      <Link href={`/selezioni/${selection.id}/annunci/nuovo`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Crea Primo Annuncio
                      </Link>
                    </Button>
                  )}
                </motion.div>
              ) : (
                <>
                  {/* Header Actions - quando espanso */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-bigster-text-muted">
                        {totalAnnunci} {totalAnnunci === 1 ? "annuncio" : "annunci"}{" "}
                        trovati
                      </span>
                    </div>

                    {canCreateAnnouncement && (
                      <Button
                        asChild
                        className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
                      >
                        <Link href={`/selezioni/${selection.id}/annunci/nuovo`}>
                          <Plus className="h-4 w-4 mr-2" />
                          Nuovo Annuncio
                        </Link>
                      </Button>
                    )}
                  </div>

                  {/* Stats Cards - GRIGIO */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-bigster-card-bg border border-bigster-border p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-bigster-text-muted" />
                        <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                          Totale Annunci
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-bigster-text">
                        {totalAnnunci}
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-bigster-card-bg border border-bigster-border p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                          Pubblicati
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {pubblicati}
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-bigster-card-bg border border-bigster-border p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-bigster-text-muted" />
                        <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                          Candidature
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-bigster-text">
                        {totalCandidature}
                      </p>
                    </motion.div>
                  </div>

                  {/* Annunci List */}
                  <div className="space-y-4">
                    {selection.annunci.map((annuncio, index) => {
                      const statusConfig =
                        ANNOUNCEMENT_STATUS_CONFIG[annuncio.stato];
                      const StatusIcon = statusConfig.icon;
                      const daysUntilExpiry = getDaysUntilExpiry(
                        annuncio.data_scadenza || ""
                      );
                      const isExpiringSoon =
                        daysUntilExpiry !== null &&
                        daysUntilExpiry > 0 &&
                        daysUntilExpiry <= 7;

                      return (
                        <motion.div
                          key={annuncio.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-bigster-border bg-bigster-card-bg hover:border-bigster-text transition-colors"
                        >
                          <div className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-[15px] font-bold text-bigster-text mb-2">
                                  {annuncio.titolo}
                                </h3>

                                {/* Dates */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-bigster-text-muted">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3" />
                                    <span>Creato:</span>
                                    <span className="font-medium">
                                      {formatDate(annuncio.data_creazione)}
                                    </span>
                                    <span className="text-bigster-text-muted">•</span>
                                    <span>{getTimeAgo(annuncio.data_creazione)}</span>
                                  </div>

                                  {annuncio.data_pubblicazione && (
                                    <div className="flex items-center gap-1.5">
                                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                                      <span>Pubblicato:</span>
                                      <span className="font-medium text-green-700">
                                        {formatDate(annuncio.data_pubblicazione)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Status Badge */}
                              <div
                                className={`flex items-center gap-1.5 px-3 py-1.5 border ${statusConfig.bgColor} ${statusConfig.borderColor}`}
                              >
                                <StatusIcon
                                  className={`h-3 w-3 ${statusConfig.textColor}`}
                                />
                                <span
                                  className={`text-xs font-semibold ${statusConfig.textColor}`}
                                >
                                  {ANNOUNCEMENT_STATUS_LABELS[annuncio.stato]}
                                </span>
                              </div>
                            </div>

                            {/* Scadenza Warning (se in scadenza) */}
                            {isExpiringSoon && (
                              <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="h-4 w-4 text-yellow-700 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-yellow-800">
                                      In scadenza tra {daysUntilExpiry}{" "}
                                      {daysUntilExpiry === 1 ? "giorno" : "giorni"}
                                    </p>
                                    <p className="text-xs text-yellow-700 mt-0.5">
                                      Scadenza:{" "}
                                      {formatDateFull(annuncio.data_scadenza!)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Scadenza Info (se non in scadenza ma presente) */}
                            {annuncio.data_scadenza &&
                              !isExpiringSoon &&
                              daysUntilExpiry !== null &&
                              daysUntilExpiry > 0 && (
                                <div className="mb-3 flex items-center gap-2 text-xs text-bigster-text-muted">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    Scadenza:{" "}
                                    {formatDateFull(annuncio.data_scadenza)} (
                                    {daysUntilExpiry}{" "}
                                    {daysUntilExpiry === 1 ? "giorno" : "giorni"})
                                  </span>
                                </div>
                              )}

                            {/* Candidature Stats */}
                            {annuncio._count && annuncio._count.candidature > 0 ? (
                              <div className="mb-3 p-3 border border-bigster-border bg-bigster-surface">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-bigster-card-bg border border-bigster-border flex items-center justify-center">
                                    <Users className="h-5 w-5 text-bigster-text" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-bigster-text">
                                      {annuncio._count.candidature} candidature
                                      ricevute
                                    </p>
                                    {annuncio.data_pubblicazione && (
                                      <p className="text-xs text-bigster-text-muted mt-0.5">
                                        {Math.floor(
                                          annuncio._count.candidature /
                                            Math.max(
                                              1,
                                              Math.floor(
                                                (new Date().getTime() -
                                                  new Date(
                                                    annuncio.data_pubblicazione
                                                  ).getTime()) /
                                                  (1000 * 60 * 60 * 24)
                                              )
                                            )
                                        )}{" "}
                                        candidature/giorno in media
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              annuncio.stato === AnnouncementStatus.PUBBLICATO && (
                                <div className="mb-3 p-3 border border-bigster-border bg-bigster-muted-bg">
                                  <p className="text-xs text-bigster-text-muted text-center">
                                    Nessuna candidatura ricevuta ancora
                                  </p>
                                </div>
                              )
                            )}

                            {/* Action Button */}
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="w-full rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                            >
                              <Link href={`/annunci/${annuncio.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizza Dettagli Annuncio
                              </Link>
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Info Box - Se ci sono bozze */}
                  {bozze > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-6 p-4 bg-bigster-card-bg border border-bigster-border"
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-bigster-text-muted flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-bigster-text mb-1">
                            {bozze} {bozze === 1 ? "bozza" : "bozze"} in sospeso
                          </p>
                          <p className="text-xs text-bigster-text-muted leading-relaxed">
                            {bozze === 1
                              ? "C'è una bozza di annuncio che può essere completata e pubblicata."
                              : `Ci sono ${bozze} bozze di annunci che possono essere completate e pubblicate.`}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Success State - Tutti pubblicati */}
                  {totalAnnunci > 0 &&
                    pubblicati === totalAnnunci &&
                    totalCandidature > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6 p-4 border-2 border-green-200 bg-green-50"
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-green-800 mb-1">
                              Tutti gli annunci sono pubblicati
                            </p>
                            <p className="text-xs text-green-700 leading-relaxed">
                              Ottimo lavoro! Tutti gli annunci sono stati pubblicati
                              e stanno ricevendo candidature. Totale candidature
                              ricevute: <strong>{totalCandidature}</strong>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}