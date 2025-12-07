// ========================================================================
// app/(protected)/selezioni/[id]/_components/job-description/JobDescriptionPreview.tsx
// Anteprima e generazione PDF con @react-pdf/renderer
// ========================================================================

"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  X,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useJobCollectionUpload } from "@/hooks/useJobCollectionUpload";
import { JobDescriptionForm, JobDescriptionType } from "@/types/jobDescription";
import { pdf } from "@react-pdf/renderer";
import { JobDescriptionPdfDocument } from "./JobDescriptionPdfDocument";

// Importa PDFViewer dinamicamente per evitare errori SSR
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <Spinner className="h-8 w-8 mx-auto mb-4 text-bigster-primary" />
          <p className="text-sm text-bigster-text-muted">
            Generazione anteprima PDF...
          </p>
        </div>
      </div>
    ),
  }
);

interface JobDescriptionPreviewProps {
  formData: JobDescriptionForm;
  tipo: JobDescriptionType;
  companyName?: string;
  selectionId: number;
  onClose: () => void;
  onUploadSuccess?: (jobCollectionId?: number) => void;
  jobCollectionId?: number;
  mode?: "preview" | "upload"; // Modalità: solo anteprima o con upload
}

export function JobDescriptionPreview({
  formData,
  tipo,
  companyName,
  selectionId,
  onClose,
  onUploadSuccess,
  jobCollectionId,
  mode = "upload",
}: JobDescriptionPreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Hook per upload S3
  const {
    uploadProgress,
    uploadNewPdfAndJson,
    replacePdfAndJson,
    resetProgress,
  } = useJobCollectionUpload();

  const analisi = formData.analisi_organizzativa;

  // Genera il PDF come Blob usando @react-pdf/renderer
  const generatePdfBlob = useCallback(async (): Promise<Blob | null> => {
    try {
      const blob = await pdf(
        <JobDescriptionPdfDocument
          formData={formData}
          tipo={tipo}
          companyName={companyName}
        />
      ).toBlob();
      return blob;
    } catch (error) {
      console.error("Errore generazione PDF:", error);
      return null;
    }
  }, [formData, tipo, companyName]);

  // Download PDF
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const blob = await generatePdfBlob();
      if (!blob) {
        throw new Error("Impossibile generare il PDF");
      }

      // Crea URL e scarica
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Job_Description_${tipo}_${
        analisi.dati_anagrafici.ragione_sociale || "Documento"
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Errore download PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Upload su S3 (crea nuovo o sostituisce esistente)
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

      // 4. Upload - CREA o AGGIORNA in base a se esiste jobCollectionId
      let resultId: number | undefined;

      if (jobCollectionId) {
        // JobCollection esiste: aggiorna PDF + JSON
        await replacePdfAndJson(jobCollectionId, pdfFile, jsonData);
        resultId = jobCollectionId;
      } else {
        // JobCollection NON esiste: crea nuova con PDF + JSON
        const newJobCollection = await uploadNewPdfAndJson(
          selectionId,
          pdfFile,
          jsonData
        );
        resultId = newJobCollection.id;
      }

      // 5. Successo
      setUploadSuccess(true);
      onUploadSuccess?.(resultId);
    } catch (error) {
      console.error("Errore upload S3:", error);
    }
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
      <div className="bg-white w-full max-w-5xl h-[90vh] flex flex-col rounded-none border border-bigster-border shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bigster-border bg-bigster-card-bg flex-shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-bigster-primary" />
            <div>
              <h2 className="text-lg font-bold text-bigster-text">
                Anteprima Job Description
              </h2>
              <p className="text-xs text-bigster-text-muted">
                {tipo === JobDescriptionType.DO
                  ? "Dentist Organizer (DO)"
                  : "Assistente di Studio Odontoiatrico (ASO)"}
                {companyName && false && ` • ${companyName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadPDF}
              disabled={isDownloading || isUploading}
              variant="outline"
              className="rounded-none border border-bigster-border"
            >
              {isDownloading ? (
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

        {/* PDF Viewer - LIVE PREVIEW */}
        <div className="flex-1 overflow-hidden bg-gray-200">
          <PDFViewer
            style={{ width: "100%", height: "100%", border: "none" }}
            showToolbar={false}
          >
            <JobDescriptionPdfDocument
              formData={formData}
              tipo={tipo}
              companyName={companyName}
            />
          </PDFViewer>
        </div>

        {/* Footer con azioni */}
        {mode === "upload" && (
          <div className="px-6 py-4 border-t border-bigster-border bg-bigster-card-bg flex-shrink-0">
            {/* Stato Success */}
            {uploadSuccess && (
              <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-green-800">
                    {jobCollectionId
                      ? "Job Collection aggiornata con successo!"
                      : "Job Collection creata con successo!"}
                  </p>
                  <p className="text-xs text-green-700">
                    Il documento PDF e i dati del form sono stati salvati su S3.
                  </p>
                </div>
              </div>
            )}

            {/* Errore */}
            {uploadProgress.status === "error" && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-800">
                    Errore durante il caricamento
                  </p>
                  <p className="text-xs text-red-700">
                    {uploadProgress.error || "Si è verificato un errore"}
                  </p>
                </div>
              </div>
            )}

            {/* Progress */}
            {isUploading && (
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Spinner className="h-4 w-4 text-bigster-primary" />
                  <span className="text-sm text-bigster-text">
                    {uploadProgress.status === "getting-url" &&
                      "Preparazione upload..."}
                    {uploadProgress.status === "uploading-pdf" &&
                      "Caricamento PDF..."}
                    {uploadProgress.status === "uploading-json" &&
                      "Caricamento dati..."}
                    {uploadProgress.status === "confirming" &&
                      "Finalizzazione..."}
                  </span>
                </div>
                <div className="w-full h-2 bg-bigster-border">
                  <div
                    className="h-full bg-bigster-primary transition-all"
                    style={{ width: `${uploadProgress.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Azioni */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-bigster-text-muted">
                {jobCollectionId
                  ? "Clicca per aggiornare il PDF e i dati salvati"
                  : "Clicca per salvare il PDF e i dati del form su S3"}
              </p>

              {!uploadSuccess ? (
                <Button
                  onClick={handleUploadToS3}
                  disabled={isUploading}
                  className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
                >
                  {isUploading ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      Caricamento...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {jobCollectionId ? "Aggiorna su S3" : "Carica su S3"}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={onClose}
                  className="rounded-none bg-green-600 text-white border border-green-500 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Chiudi
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobDescriptionPreview;
