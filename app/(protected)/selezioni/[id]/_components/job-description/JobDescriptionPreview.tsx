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
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useJobCollectionUpload } from "@/hooks/useJobCollectionUpload";
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
  selectionId: number;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

export function JobDescriptionPreview({
  formData,
  tipo,
  companyName,
  selectionId,
  onClose,
  onUploadSuccess,
}: JobDescriptionPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Hook per upload S3 (ora usa uploadNewPdfAndJson)
  const { uploadProgress, uploadNewPdfAndJson, resetProgress } =
    useJobCollectionUpload();

  const analisi = formData.analisi_organizzativa;
  const profilo = formData.analisi_profilo;
  const offerta = formData.offerta;
  const chiusura = formData.chiusura;

  // Helper per ottenere il nome di un servizio
  const getServizioNome = (servizioId: string): string => {
    if (
      Object.values(ServizioOdontoiatrico).includes(
        servizioId as ServizioOdontoiatrico
      )
    ) {
      return SERVIZI_ODONTOIATRICI_LABELS[servizioId as ServizioOdontoiatrico];
    }
    const personalizzato = analisi.servizi_personalizzati?.find(
      (s) => s.id === servizioId
    );
    return personalizzato?.nome || servizioId;
  };

  // Genera PDF come Blob
  const generatePdfBlob = async (): Promise<Blob | null> => {
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = printRef.current;
      if (!element) return null;

      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait" as const,
        },
        pagebreak: { mode: "css", avoid: ["tr", "td", ".break-inside-avoid"] },
      };

      const blob = await html2pdf().set(opt as any).from(element).outputPdf("blob");
      return blob;
    } catch (error) {
      console.error("Errore generazione PDF:", error);
      return null;
    }
  };

  // Genera e scarica PDF (download locale)
  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = printRef.current;
      if (!element) return;

      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `Job_Description_${tipo}_${
          analisi.dati_anagrafici.ragione_sociale || "Documento"
        }.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait" as const,
        },
        pagebreak: { mode: "css", avoid: ["tr", "td", ".break-inside-avoid"] },
      };

      await html2pdf().set(opt as any).from(element).save();
    } catch (error) {
      console.error("Errore generazione PDF:", error);
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  // NUOVO: Carica PDF + JSON su S3
  const handleUploadToS3 = async () => {
    try {
      // 1. Genera il PDF come Blob
      const pdfBlob = await generatePdfBlob();
      if (!pdfBlob) {
        throw new Error("Impossibile generare il PDF");
      }

      // 2. Converti Blob in File
      const fileName = `Job_Description_${tipo}_${
        analisi.dati_anagrafici.ragione_sociale || "Documento"
      }.pdf`;
      const pdfFile = new File([pdfBlob], fileName, {
        type: "application/pdf",
      });

      // 3. Prepara i dati JSON
      const jsonData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        selectionId,
        companyName: companyName || "N/A",
        tipo: formData.tipo,
        data: formData,
      };

      // 4. Upload PDF + JSON su S3 usando l'hook
      await uploadNewPdfAndJson(selectionId, pdfFile, jsonData);

      // 5. Successo
      setUploadSuccess(true);
      onUploadSuccess?.();
    } catch (error) {
      console.error("Errore upload S3:", error);
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

  // Labels
  const attivitaLabels =
    tipo === JobDescriptionType.DO ? ATTIVITA_DO_LABELS : ATTIVITA_ASO_LABELS;
  const competenzeLabels =
    tipo === JobDescriptionType.DO
      ? COMPETENZE_HARD_DO_LABELS
      : COMPETENZE_HARD_ASO_LABELS;
  const conoscenzeLabels =
    tipo === JobDescriptionType.DO
      ? CONOSCENZE_TECNICHE_DO_LABELS
      : CONOSCENZE_TECNICHE_ASO_LABELS;
  const caratteristicheLabels =
    tipo === JobDescriptionType.DO
      ? CARATTERISTICHE_DO_LABELS
      : CARATTERISTICHE_ASO_LABELS;

  // Stato upload in corso
  const isUploading = [
    "getting-url",
    "uploading-pdf",
    "uploading-json",
    "confirming",
  ].includes(uploadProgress.status);

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
              disabled={isUploading}
            >
              <Printer className="h-4 w-4 mr-2" />
              Stampa
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={isGenerating || isUploading}
              variant="outline"
              className="rounded-none border border-bigster-border"
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
              disabled={isUploading}
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

            {/* Il resto del contenuto PDF rimane invariato... */}
            {/* (Tutte le sezioni: Dati Anagrafici, Studio, Struttura, etc.) */}

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
            </div>
          </div>
        </div>

        {/* Footer con CTA Upload S3 */}
        <div className="px-6 py-4 border-t border-bigster-border bg-bigster-card-bg">
          {/* Stato Success */}
          {uploadSuccess && (
            <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-800">
                  Job Collection caricata con successo!
                </p>
                <p className="text-xs text-green-700">
                  Il documento PDF e i dati del form sono stati salvati.
                </p>
              </div>
            </div>
          )}

          {/* Stato Errore */}
          {uploadProgress.status === "error" && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-800">
                  Errore durante il caricamento
                </p>
                <p className="text-xs text-red-700">
                  {uploadProgress.error ||
                    "Si è verificato un errore imprevisto"}
                </p>
              </div>
              <Button
                onClick={resetProgress}
                variant="outline"
                size="sm"
                className="ml-auto rounded-none border-red-300 text-red-700 hover:bg-red-100"
              >
                Riprova
              </Button>
            </div>
          )}

          {/* Progress Bar durante upload */}
          {isUploading && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-bigster-text">
                  {uploadProgress.status === "getting-url" &&
                    "Preparazione upload..."}
                  {uploadProgress.status === "uploading-pdf" &&
                    "Caricamento PDF..."}
                  {uploadProgress.status === "uploading-json" &&
                    "Caricamento dati form..."}
                  {uploadProgress.status === "confirming" &&
                    "Finalizzazione..."}
                </span>
                <span className="text-xs font-semibold text-bigster-text">
                  {uploadProgress.progress}%
                </span>
              </div>
              <div className="w-full h-2 bg-bigster-border">
                <div
                  className="h-full bg-bigster-primary transition-all duration-300"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* CTA Principale */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-bigster-text-muted">
              Carica il documento e i dati come Job Collection per questa
              selezione
            </p>
            <Button
              onClick={handleUploadToS3}
              disabled={isUploading || uploadSuccess}
              className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-300 font-semibold px-6"
            >
              {isUploading ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Caricamento...
                </>
              ) : uploadSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Caricato
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Carica su S3
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
