// ========================================================================
// components/job-description/JobDescriptionPreview.tsx
// Anteprima e generazione PDF della Job Description
// ========================================================================

"use client";

import { useRef, useState } from "react";
import {
  X,
  Download,
  Printer,
  Building2,
  User,
  Briefcase,
  GraduationCap,
  Gift,
  CheckSquare,
  Check,
  Star,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  JobDescriptionForm,
  JobDescriptionType,
  SERVIZI_ODONTOIATRICI_LABELS,
  ServizioOdontoiatrico,
  ATTIVITA_DO_LABELS,
  ATTIVITA_ASO_LABELS,
  COMPETENZE_HARD_DO_LABELS,
  COMPETENZE_HARD_ASO_LABELS,
  CONOSCENZE_TECNICHE_DO_LABELS,
  CONOSCENZE_TECNICHE_ASO_LABELS,
  CARATTERISTICHE_DO_LABELS,
  CARATTERISTICHE_ASO_LABELS,
  CONTRACT_TYPE_LABELS,
  REQUIREMENT_LEVEL_LABELS,
  WorkSchedule,
} from "@/types/jobDescription";

interface JobDescriptionPreviewProps {
  formData: JobDescriptionForm;
  tipo: JobDescriptionType;
  companyName?: string;
  onClose: () => void;
}

export function JobDescriptionPreview({
  formData,
  tipo,
  companyName,
  onClose,
}: JobDescriptionPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const analisi = formData.analisi_organizzativa;
  const profilo = formData.analisi_profilo;
  const offerta = formData.offerta;
  const chiusura = formData.chiusura;

  // Helper per ottenere il nome di un servizio (enum o personalizzato)
  const getServizioNome = (servizioId: string): string => {
    // Controlla se è un enum
    if (
      Object.values(ServizioOdontoiatrico).includes(
        servizioId as ServizioOdontoiatrico
      )
    ) {
      return SERVIZI_ODONTOIATRICI_LABELS[servizioId as ServizioOdontoiatrico];
    }
    // Altrimenti cerca nei personalizzati
    const personalizzato = analisi.servizi_personalizzati?.find(
      (s) => s.id === servizioId
    );
    return personalizzato?.nome || servizioId;
  };

  // Genera e scarica PDF
  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      // Importa dinamicamente html2pdf per evitare errori SSR
      const html2pdf = (await import("html2pdf.js")).default;

      const element = printRef.current;
      if (!element) return;

      const margins: [number, number, number, number] = [10, 10, 10, 10];
      const pagebreakModes = ["avoid-all", "css", "legacy"] as const;
      const opt = {
        margin: margins,
        filename: `Job_Description_${tipo}_${
          analisi.dati_anagrafici.ragione_sociale || "Documento"
        }.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait" as const,
        },
        pagebreak: { mode: pagebreakModes },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Errore generazione PDF:", error);
      // Fallback: stampa
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  // Stampa
  const handlePrint = () => {
    window.print();
  };

  // Helper per mostrare checkbox
  const CheckItem = ({
    checked,
    label,
    note,
  }: {
    checked: boolean;
    label: string;
    note?: string;
  }) => (
    <div className="flex items-start gap-2 py-1">
      <span
        className={`flex-shrink-0 w-5 h-5 flex items-center justify-center border ${
          checked
            ? "bg-bigster-primary border-yellow-400 text-bigster-primary-text"
            : "bg-white border-gray-300"
        }`}
      >
        {checked && <Check className="w-3 h-3" />}
      </span>
      <div className="flex-1">
        <span
          className={`text-sm ${checked ? "font-medium" : "text-gray-500"}`}
        >
          {label}
        </span>
        {note && checked && (
          <p className="text-xs text-gray-600 mt-0.5 italic">{note}</p>
        )}
      </div>
    </div>
  );

  // Helper per sezione
  const Section = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: any;
    children: React.ReactNode;
  }) => (
    <div className="mb-6 break-inside-avoid">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-bigster-primary">
        <Icon className="w-5 h-5 text-bigster-text" />
        <h3 className="text-base font-bold text-bigster-text uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div className="pl-1">{children}</div>
    </div>
  );

  // Helper per campo
  const Field = ({
    label,
    value,
    fullWidth = false,
  }: {
    label: string;
    value: string | number | undefined;
    fullWidth?: boolean;
  }) => {
    if (!value) return null;
    return (
      <div className={`mb-2 ${fullWidth ? "col-span-2" : ""}`}>
        <span className="text-xs font-semibold text-gray-500 uppercase">
          {label}
        </span>
        <p className="text-sm text-bigster-text">{value}</p>
      </div>
    );
  };

  // Attività labels
  const attivitaLabels =
    tipo === JobDescriptionType.DO ? ATTIVITA_DO_LABELS : ATTIVITA_ASO_LABELS;

  // Competenze labels
  const competenzeLabels =
    tipo === JobDescriptionType.DO
      ? COMPETENZE_HARD_DO_LABELS
      : COMPETENZE_HARD_ASO_LABELS;

  // Conoscenze labels
  const conoscenzeLabels =
    tipo === JobDescriptionType.DO
      ? CONOSCENZE_TECNICHE_DO_LABELS
      : CONOSCENZE_TECNICHE_ASO_LABELS;

  // Caratteristiche labels
  const caratteristicheLabels =
    tipo === JobDescriptionType.DO
      ? CARATTERISTICHE_DO_LABELS
      : CARATTERISTICHE_ASO_LABELS;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col rounded-none border border-bigster-border shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
          <h2 className="text-lg font-bold text-bigster-text">
            Anteprima Job Description
          </h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="rounded-none border border-bigster-border"
            >
              <Printer className="h-4 w-4 mr-2" />
              Stampa
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-300"
            >
              {isGenerating ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Scarica PDF
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="rounded-none border border-bigster-border"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <div
            ref={printRef}
            className="bg-white p-8 shadow-lg mx-auto max-w-[210mm]"
            style={{ minHeight: "297mm" }}
          >
            {/* Intestazione Documento */}
            <div className="text-center mb-8 pb-6 border-b-2 border-bigster-primary">
              <h1 className="text-2xl font-bold text-bigster-text mb-2">
                SCHEDA RACCOLTA JOB
              </h1>
              <p className="text-lg font-semibold text-bigster-primary">
                {tipo === JobDescriptionType.DO
                  ? "DENTIST ORGANIZER (DO)"
                  : "ASSISTENTE DI STUDIO ODONTOIATRICO (ASO)"}
              </p>
              {companyName && (
                <p className="text-sm text-gray-600 mt-2">{companyName}</p>
              )}
            </div>

            {/* SEZIONE 1: ANALISI ORGANIZZATIVA */}
            <div className="mb-8">
              <div className="bg-bigster-card-bg px-4 py-2 mb-4">
                <h2 className="text-lg font-bold text-bigster-text">
                  1. ANALISI ORGANIZZATIVA
                </h2>
              </div>

              {/* Dati Anagrafici */}
              <Section title="Dati Anagrafici" icon={Building2}>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field
                    label="Ragione Sociale"
                    value={analisi.dati_anagrafici.ragione_sociale}
                    fullWidth
                  />
                  <Field
                    label="Indirizzo"
                    value={analisi.dati_anagrafici.indirizzo}
                    fullWidth
                  />
                  <Field label="Città" value={analisi.dati_anagrafici.citta} />
                  <Field
                    label="Provincia"
                    value={analisi.dati_anagrafici.provincia}
                  />
                </div>
              </Section>

              {/* Info Studio */}
              <Section title="Lo Studio" icon={Building2}>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field
                    label="Anni di Attività"
                    value={analisi.studio_info.anni_attivita}
                  />
                  <Field
                    label="Evoluzioni nel Tempo"
                    value={analisi.studio_info.evoluzioni_nel_tempo}
                    fullWidth
                  />
                </div>
              </Section>

              {/* Struttura - AGGIORNATA */}
              <Section title="Struttura ad Oggi" icon={User}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-bigster-card-bg">
                    <span className="text-xs font-semibold text-gray-500">
                      DIPENDENTI
                    </span>
                    <p className="text-xl font-bold text-bigster-text">
                      {analisi.struttura_ad_oggi.dipendenti?.length || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-bigster-card-bg">
                    <span className="text-xs font-semibold text-gray-500">
                      COLLABORATORI
                    </span>
                    <p className="text-xl font-bold text-bigster-text">
                      {analisi.struttura_ad_oggi.collaboratori?.length || 0}
                    </p>
                  </div>
                </div>

                {analisi.struttura_ad_oggi.dipendenti?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      DETTAGLIO DIPENDENTI
                    </p>
                    <div className="space-y-2">
                      {analisi.struttura_ad_oggi.dipendenti.map((d, i) => (
                        <div
                          key={i}
                          className="p-2 bg-gray-50 border-l-2 border-bigster-primary"
                        >
                          <p className="text-sm font-semibold">
                            {d.nome_cognome || "N/A"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {d.ruolo_mansione || "Ruolo non specificato"}
                          </p>
                          {d.eta && (
                            <p className="text-xs text-gray-500">
                              Età: {d.eta}
                            </p>
                          )}
                          {d.dettagli_presenza && (
                            <p className="text-xs text-gray-500 italic">
                              {d.dettagli_presenza}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analisi.struttura_ad_oggi.collaboratori?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      DETTAGLIO COLLABORATORI
                    </p>
                    <div className="space-y-2">
                      {analisi.struttura_ad_oggi.collaboratori.map((c, i) => (
                        <div
                          key={i}
                          className="p-2 bg-gray-50 border-l-2 border-blue-400"
                        >
                          <p className="text-sm font-semibold">
                            {c.nome_cognome || "N/A"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {c.ruolo_mansione || "Ruolo non specificato"}
                          </p>
                          {c.eta && (
                            <p className="text-xs text-gray-500">
                              Età: {c.eta}
                            </p>
                          )}
                          {c.dettagli_presenza && (
                            <p className="text-xs text-gray-500 italic">
                              {c.dettagli_presenza}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Section>

              {/* Servizi - AGGIORNATA */}
              <Section title="Servizi e Clientela" icon={Briefcase}>
                <Field
                  label="Clienti / Segmenti"
                  value={analisi.clienti_segmenti}
                  fullWidth
                />

                {/* Servizi predefiniti attivi */}
                {analisi.distribuzione_servizi?.some((s) => s.attivo) && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      DISTRIBUZIONE SERVIZI
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {analisi.distribuzione_servizi
                        .filter((s) => s.attivo)
                        .map((s) => (
                          <div
                            key={s.servizio}
                            className="flex justify-between items-center p-2 bg-bigster-card-bg"
                          >
                            <span className="text-sm">
                              {SERVIZI_ODONTOIATRICI_LABELS[s.servizio]}
                            </span>
                            <span className="font-semibold">
                              {s.percentuale}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Servizi personalizzati attivi */}
                {(analisi.servizi_personalizzati?.filter(
                  (s) => s.attivo && s.nome
                ).length ?? 0) > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      SERVIZI PERSONALIZZATI
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {analisi.servizi_personalizzati
                        ?.filter((s) => s.attivo && s.nome)
                        .map((s) => (
                          <div
                            key={s.id}
                            className="flex justify-between items-center p-2 bg-blue-50 border border-blue-200"
                          >
                            <span className="text-sm">{s.nome}</span>
                            <span className="font-semibold">
                              {s.percentuale}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Servizi di punta - AGGIORNATA */}
                {(analisi.servizi_di_punta?.length ?? 0) > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">
                      SERVIZI DI PUNTA
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analisi.servizi_di_punta?.map((servizioId) => (
                        <span
                          key={servizioId}
                          className="px-3 py-1 bg-bigster-primary text-bigster-primary-text text-sm font-semibold flex items-center gap-1"
                        >
                          <Star className="w-3 h-3" />
                          {getServizioNome(servizioId)}
                        </span>
                      ))}
                    </div>
                    {analisi.servizi_di_punta_note && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200">
                        <p className="text-xs font-semibold text-yellow-800">
                          NOTE:
                        </p>
                        <p className="text-sm text-yellow-900">
                          {analisi.servizi_di_punta_note}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-x-6">
                  <Field
                    label="Fatturato Annuo"
                    value={analisi.fatturato_annuo}
                  />
                  <Field
                    label="Forniture e Magazzino"
                    value={analisi.forniture_e_magazzino}
                  />
                </div>
              </Section>

              {/* Digitalizzazione */}
              <Section title="Digitalizzazione" icon={Globe}>
                <div className="grid grid-cols-2 gap-2">
                  <CheckItem
                    checked={analisi.digitalizzazione.applicativi_contabilita}
                    label="Applicativi contabilità"
                    note={analisi.digitalizzazione.applicativi_contabilita_note}
                  />
                  <CheckItem
                    checked={
                      analisi.digitalizzazione.software_gestionali_odontoiatrici
                    }
                    label="Software gestionali"
                    note={
                      analisi.digitalizzazione
                        .software_gestionali_odontoiatrici_note
                    }
                  />
                  <CheckItem
                    checked={analisi.digitalizzazione.sito}
                    label="Sito Web"
                    note={analisi.digitalizzazione.sito_url}
                  />
                  <CheckItem
                    checked={analisi.digitalizzazione.social}
                    label="Social Network"
                    note={analisi.digitalizzazione.social_note}
                  />
                  <CheckItem
                    checked={analisi.digitalizzazione.piattaforme_marketing}
                    label="Piattaforme Marketing"
                    note={analisi.digitalizzazione.piattaforme_marketing_note}
                  />
                  <CheckItem
                    checked={analisi.digitalizzazione.altri_app_strumenti}
                    label="Altri strumenti"
                    note={analisi.digitalizzazione.altri_app_strumenti_note}
                  />
                </div>
              </Section>

              {/* SWOT */}
              <Section title="SWOT e Obiettivi" icon={CheckSquare}>
                <Field
                  label="Tratti Distintivi"
                  value={analisi.tratti_distintivi}
                  fullWidth
                />
                <Field
                  label="Obiettivi di Sviluppo"
                  value={analisi.obiettivi_di_sviluppo}
                  fullWidth
                />
                <Field
                  label="SWOT Analysis"
                  value={analisi.swot_analysis}
                  fullWidth
                />
              </Section>
            </div>

            {/* SEZIONE 2: ANALISI DEL PROFILO */}
            <div className="mb-8">
              <div className="bg-bigster-card-bg px-4 py-2 mb-4">
                <h2 className="text-lg font-bold text-bigster-text">
                  2. ANALISI DEL PROFILO
                </h2>
              </div>

              {/* Attività */}
              <Section title="Attività" icon={Briefcase}>
                <div className="grid grid-cols-2 gap-x-4">
                  {Object.entries(attivitaLabels).map(([key, label]) => {
                    if (key === "altro") return null;
                    const isSelected = (profilo.attivita as any)[key];
                    return (
                      <CheckItem key={key} checked={isSelected} label={label} />
                    );
                  })}
                </div>
                {profilo.attivita.altro && profilo.attivita.altro_specifica && (
                  <div className="mt-2 p-2 bg-gray-50">
                    <span className="text-xs font-semibold text-gray-500">
                      ALTRO:
                    </span>
                    <p className="text-sm">
                      {profilo.attivita.altro_specifica}
                    </p>
                  </div>
                )}
                {profilo.attivita.note_attivita && (
                  <div className="mt-2 p-2 bg-gray-50">
                    <span className="text-xs font-semibold text-gray-500">
                      NOTE:
                    </span>
                    <p className="text-sm">{profilo.attivita.note_attivita}</p>
                  </div>
                )}
              </Section>

              {/* Competenze Hard */}
              <Section title="Competenze Hard" icon={GraduationCap}>
                <div className="space-y-1">
                  {Object.entries(competenzeLabels).map(([key, label]) => {
                    const comp = (profilo.competenze_hard as any)[key];
                    return (
                      <CheckItem
                        key={key}
                        checked={comp?.selezionata}
                        label={label}
                        note={comp?.note}
                      />
                    );
                  })}
                </div>
              </Section>

              {/* Conoscenze Tecniche */}
              <Section title="Conoscenze Tecniche" icon={GraduationCap}>
                <div className="space-y-1">
                  {Object.entries(conoscenzeLabels).map(([key, label]) => {
                    const con = (profilo.conoscenze_tecniche as any)[key];
                    return (
                      <CheckItem
                        key={key}
                        checked={con?.selezionata}
                        label={label}
                        note={con?.note}
                      />
                    );
                  })}
                </div>
              </Section>

              {/* Soft Skills */}
              <Section title="Caratteristiche Personali" icon={User}>
                <div className="grid grid-cols-2 gap-x-4">
                  {Object.entries(caratteristicheLabels).map(([key, label]) => {
                    if (key === "altro") return null;
                    const isSelected = (
                      profilo.caratteristiche_personali as any
                    )[key];
                    return (
                      <CheckItem key={key} checked={isSelected} label={label} />
                    );
                  })}
                </div>
                {profilo.caratteristiche_personali.altro &&
                  profilo.caratteristiche_personali.altro_specifica && (
                    <div className="mt-2 p-2 bg-gray-50">
                      <span className="text-xs font-semibold text-gray-500">
                        ALTRO:
                      </span>
                      <p className="text-sm">
                        {profilo.caratteristiche_personali.altro_specifica}
                      </p>
                    </div>
                  )}
              </Section>

              {/* Formazione */}
              <Section title="Formazione ed Esperienza" icon={GraduationCap}>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field
                    label="Laurea Triennale"
                    value={profilo.percorso_formativo.laurea_triennale}
                  />
                  <Field
                    label="Laurea Magistrale"
                    value={profilo.percorso_formativo.laurea_magistrale}
                  />
                  <Field
                    label="Diploma"
                    value={profilo.percorso_formativo.diploma}
                  />
                  {profilo.percorso_formativo.nessun_titolo_preferenziale && (
                    <p className="text-sm italic text-gray-600">
                      Nessun titolo preferenziale
                    </p>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-6">
                  <Field
                    label="Esperienza Richiesta"
                    value={
                      profilo.esperienza.richiesta
                        ? `Sì - ${profilo.esperienza.anni || "Non specificato"}`
                        : "Non richiesta"
                    }
                  />
                </div>

                {(profilo.lingue.inglese.richiesta ||
                  profilo.lingue.altra_lingua.richiesta) && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">
                      LINGUE
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {profilo.lingue.inglese.richiesta && (
                        <p className="text-sm">
                          Inglese:{" "}
                          {profilo.lingue.inglese.livello || "Richiesto"}
                        </p>
                      )}
                      {profilo.lingue.altra_lingua.richiesta && (
                        <p className="text-sm">
                          {profilo.lingue.altra_lingua_nome || "Altra lingua"}:{" "}
                          {profilo.lingue.altra_lingua.livello || "Richiesto"}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Section>
            </div>

            {/* SEZIONE 3: OFFERTA - AGGIORNATA */}
            <div className="mb-8">
              <div className="bg-bigster-card-bg px-4 py-2 mb-4">
                <h2 className="text-lg font-bold text-bigster-text">
                  3. OFFERTA
                </h2>
              </div>

              <Section title="Dettagli Offerta" icon={Gift}>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field
                    label="Numero Persone da Ricercare"
                    value={offerta.numero_persone}
                  />
                  <Field
                    label="Motivo Ricerca"
                    value={offerta.motivo_ricerca}
                  />
                  <Field
                    label="Età"
                    value={
                      offerta.eta
                        ? `${offerta.eta} (${
                            REQUIREMENT_LEVEL_LABELS[offerta.eta_livello]
                          })`
                        : undefined
                    }
                  />
                  <Field
                    label="Patente"
                    value={REQUIREMENT_LEVEL_LABELS[offerta.patente]}
                  />
                  <Field
                    label="Automunita"
                    value={REQUIREMENT_LEVEL_LABELS[offerta.automunita]}
                  />
                </div>

                {offerta.tipi_contratto?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">
                      TIPI CONTRATTO
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {offerta.tipi_contratto.map((c) => (
                        <span
                          key={c}
                          className="px-2 py-1 bg-bigster-card-bg text-sm border border-bigster-border"
                        >
                          {CONTRACT_TYPE_LABELS[c]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Orario - AGGIORNATO */}
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    ORARIO DI LAVORO
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {offerta.orario === WorkSchedule.FULL_TIME
                        ? "Full Time"
                        : "Part Time"}
                    </p>
                    {offerta.orario_dettaglio && (
                      <div className="p-2 bg-gray-50 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 mb-1">
                          DESCRIZIONE ORARIO
                        </p>
                        <p className="text-sm whitespace-pre-line">
                          {offerta.orario_dettaglio}
                        </p>
                      </div>
                    )}
                    {offerta.orario === WorkSchedule.PART_TIME &&
                      offerta.orario_part_time_dettagli && (
                        <div className="p-2 bg-blue-50 border border-blue-200">
                          <p className="text-xs font-semibold text-blue-700 mb-1">
                            DETTAGLI PART-TIME
                          </p>
                          <p className="text-sm text-blue-900">
                            {offerta.orario_part_time_dettagli}
                          </p>
                        </div>
                      )}
                    {offerta.orario === WorkSchedule.FULL_TIME &&
                      offerta.orario_full_time_dettagli && (
                        <div className="p-2 bg-green-50 border border-green-200">
                          <p className="text-xs font-semibold text-green-700 mb-1">
                            DETTAGLI FULL-TIME
                          </p>
                          <p className="text-sm text-green-900">
                            {offerta.orario_full_time_dettagli}
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field
                    label="Compenso Mensile Netto"
                    value={offerta.compenso_mensile_netto}
                  />
                  <Field
                    label="Composizione Retribuzione"
                    value={offerta.composizione_retribuzione}
                  />
                  <Field
                    label="Prospettive di Crescita"
                    value={offerta.prospettive_crescita}
                    fullWidth
                  />
                </div>

                {/* Benefits - AGGIORNATI */}
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    BENEFITS
                  </p>
                  <div className="space-y-1">
                    <CheckItem
                      checked={offerta.benefits.affiancamenti}
                      label="Affiancamenti"
                    />
                    <CheckItem
                      checked={offerta.benefits.auto_aziendale}
                      label="Auto aziendale"
                    />
                    <CheckItem
                      checked={offerta.benefits.corsi_aggiornamento}
                      label="Corsi di aggiornamento professionale"
                    />
                    {offerta.benefits.incentivi && (
                      <CheckItem
                        checked={true}
                        label="Incentivi"
                        note={offerta.benefits.incentivi_specifica}
                      />
                    )}
                    <CheckItem
                      checked={offerta.benefits.quote_societarie}
                      label="Possibilità di acquisire quote societarie"
                    />
                    <CheckItem
                      checked={offerta.benefits.rimborso_spese}
                      label="Rimborso spese"
                    />
                    {offerta.benefits.benefits && (
                      <CheckItem
                        checked={true}
                        label="Benefits"
                        note={offerta.benefits.benefits_specifica}
                      />
                    )}
                    {offerta.benefits.altro && (
                      <CheckItem
                        checked={true}
                        label="Altro"
                        note={offerta.benefits.altro_specifica}
                      />
                    )}
                  </div>
                </div>
              </Section>
            </div>

            {/* SEZIONE 4: CHIUSURA */}
            <div className="mb-8">
              <div className="bg-bigster-card-bg px-4 py-2 mb-4">
                <h2 className="text-lg font-bold text-bigster-text">
                  4. CHIUSURA
                </h2>
              </div>

              <Section title="Note e Firma" icon={CheckSquare}>
                <Field
                  label="Canali Specifici da Attivare"
                  value={chiusura.canali_specifici}
                  fullWidth
                />
                <Field
                  label="Note Aggiuntive"
                  value={chiusura.note_aggiuntive}
                  fullWidth
                />

                {/* Firma */}
                <div className="mt-6 pt-4 border-t border-gray-300">
                  <div className="grid grid-cols-2 gap-x-6">
                    <Field label="Luogo" value={chiusura.luogo} />
                    <Field
                      label="Data"
                      value={
                        chiusura.data
                          ? new Date(chiusura.data).toLocaleDateString("it-IT")
                          : undefined
                      }
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500">
                      FIRMA DEL CLIENTE
                    </p>
                    <div className="mt-2 p-4 border-b-2 border-gray-400">
                      <p className="text-lg">{chiusura.firma_cliente}</p>
                    </div>
                  </div>
                </div>
              </Section>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-gray-200 text-xs text-gray-500">
              <p>
                Documento generato il{" "}
                {new Date().toLocaleDateString("it-IT", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {companyName && <p className="mt-1">{companyName}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
