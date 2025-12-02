// ========================================================================
// app/(protected)/selezioni/[id]/_components/job-description/JobDescriptionPreview.tsx
// Anteprima e generazione PDF della Job Description
// ========================================================================

"use client";

import { useRef, useState } from "react";
import {
  X,
  Download,
  Printer,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useJobCollectionUpload } from "@/hooks/useJobCollectionUpload";
import { JobDescriptionForm, JobDescriptionType } from "@/types/jobDescription";
import { JobDescriptionPdfContent } from "./JobDescriptionPdfContent";

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

  // Hook per upload S3
  const { uploadProgress, uploadNewPdfAndJson, resetProgress } =
    useJobCollectionUpload();

  const analisi = formData.analisi_organizzativa;

  // Genera PDF come Blob
  const generatePdfBlob = async (): Promise<Blob | null> => {
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = printRef.current;
      if (!element) return null;

      const opt = {
        margin: [8, 8, 8, 8] as [number, number, number, number],
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait" as const,
        },
        pagebreak: { mode: "css", avoid: ["tr", "td", ".break-inside-avoid"] },
      };

      const blob = await html2pdf()
        .set(opt as any)
        .from(element)
        .outputPdf("blob");
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
        margin: [8, 8, 8, 8] as [number, number, number, number],
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

      await html2pdf()
        .set(opt as any)
        .from(element)
        .save();
    } catch (error) {
      console.error("Errore generazione PDF:", error);
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  // Carica PDF + JSON su S3
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
          <JobDescriptionPdfContent
            ref={printRef}
            formData={formData}
            tipo={tipo}
            companyName={companyName}
          />
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
