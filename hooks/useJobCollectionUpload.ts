// hooks/useJobCollectionUpload.ts

import { useState, useCallback } from "react";
import {
  // PDF mutations
  useGetUploadUrlMutation,
  useCreateJobCollectionMutation,
  useGetReplacementUploadUrlMutation,
  useReplaceJobCollectionPdfMutation,
  // JSON mutations
  useGetUploadJsonUrlMutation,
  useGetReplacementUploadJsonUrlMutation,
  useUpdateJobCollectionJsonMutation,
} from "@/lib/redux/features/job-collections/jobCollectionsApiSlice";

interface UploadProgress {
  status:
    | "idle"
    | "getting-url"
    | "uploading-pdf"
    | "uploading-json"
    | "confirming"
    | "success"
    | "error";
  progress: number;
  error?: string;
}

export function useJobCollectionUpload() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: "idle",
    progress: 0,
  });

  // PDF mutations
  const [getUploadUrl] = useGetUploadUrlMutation();
  const [createJobCollection] = useCreateJobCollectionMutation();
  const [getReplacementUploadUrl] = useGetReplacementUploadUrlMutation();
  const [replaceJobCollectionPdf] = useReplaceJobCollectionPdfMutation();

  // JSON mutations
  const [getUploadJsonUrl] = useGetUploadJsonUrlMutation();
  const [getReplacementUploadJsonUrl] =
    useGetReplacementUploadJsonUrlMutation();
  const [updateJobCollectionJson] = useUpdateJobCollectionJsonMutation();

  // ============================================
  // UPLOAD PDF
  // ============================================

  /**
   * Upload nuovo PDF per una selezione
   */
  const uploadNewPdf = useCallback(
    async (selectionId: number, file: File) => {
      try {
        setUploadProgress({ status: "getting-url", progress: 10 });

        // 1. Ottieni presigned URL
        const { upload_url, s3_key } = await getUploadUrl(selectionId).unwrap();

        setUploadProgress({ status: "uploading-pdf", progress: 30 });

        // 2. Upload diretto su S3
        const uploadResponse = await fetch(upload_url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": "application/pdf",
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("Errore durante l'upload del PDF su S3");
        }

        setUploadProgress({ status: "confirming", progress: 80 });

        // 3. Conferma creazione record nel database
        const jobCollection = await createJobCollection({
          selezione_id: selectionId,
          s3_key,
        }).unwrap();

        setUploadProgress({ status: "success", progress: 100 });

        return jobCollection;
      } catch (error: any) {
        setUploadProgress({
          status: "error",
          progress: 0,
          error:
            error?.data?.error || error?.message || "Errore durante l'upload",
        });
        throw error;
      }
    },
    [getUploadUrl, createJobCollection]
  );

  /**
   * Sostituisci PDF esistente
   */
  const replacePdf = useCallback(
    async (jobCollectionId: number, file: File) => {
      try {
        setUploadProgress({ status: "getting-url", progress: 10 });

        // 1. Ottieni presigned URL per sostituzione
        const { upload_url, s3_key } = await getReplacementUploadUrl(
          jobCollectionId
        ).unwrap();

        setUploadProgress({ status: "uploading-pdf", progress: 30 });

        // 2. Upload diretto su S3
        const uploadResponse = await fetch(upload_url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": "application/pdf",
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("Errore durante l'upload del PDF su S3");
        }

        setUploadProgress({ status: "confirming", progress: 80 });

        // 3. Conferma sostituzione nel database
        const jobCollection = await replaceJobCollectionPdf({
          id: jobCollectionId,
          s3_key,
        }).unwrap();

        setUploadProgress({ status: "success", progress: 100 });

        return jobCollection;
      } catch (error: any) {
        setUploadProgress({
          status: "error",
          progress: 0,
          error:
            error?.data?.error ||
            error?.message ||
            "Errore durante la sostituzione del PDF",
        });
        throw error;
      }
    },
    [getReplacementUploadUrl, replaceJobCollectionPdf]
  );

  // ============================================
  // UPLOAD JSON
  // ============================================

  /**
   * Upload JSON (dati form) per una JobCollection esistente
   */
  const uploadJson = useCallback(
    async (jobCollectionId: number, jsonData: object) => {
      try {
        setUploadProgress({ status: "getting-url", progress: 10 });

        // 1. Ottieni presigned URL per JSON
        const { upload_url, s3_key } = await getReplacementUploadJsonUrl(
          jobCollectionId
        ).unwrap();

        setUploadProgress({ status: "uploading-json", progress: 30 });

        // 2. Upload diretto su S3
        const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], {
          type: "application/json",
        });

        const uploadResponse = await fetch(upload_url, {
          method: "PUT",
          body: jsonBlob,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("Errore durante l'upload del JSON su S3");
        }

        setUploadProgress({ status: "confirming", progress: 80 });

        // 3. Aggiorna record nel database con s3_key_json
        const jobCollection = await updateJobCollectionJson({
          id: jobCollectionId,
          s3_key_json: s3_key,
        }).unwrap();

        setUploadProgress({ status: "success", progress: 100 });

        return jobCollection;
      } catch (error: any) {
        setUploadProgress({
          status: "error",
          progress: 0,
          error:
            error?.data?.error ||
            error?.message ||
            "Errore durante l'upload del JSON",
        });
        throw error;
      }
    },
    [getReplacementUploadJsonUrl, updateJobCollectionJson]
  );

  // ============================================
  // UPLOAD COMBINATO PDF + JSON
  // ============================================

  /**
   * Upload nuovo PDF + JSON per una selezione (creazione completa)
   */
  const uploadNewPdfAndJson = useCallback(
    async (selectionId: number, pdfFile: File, jsonData: object) => {
      try {
        setUploadProgress({ status: "getting-url", progress: 5 });

        // 1. Ottieni presigned URL per PDF
        const pdfUrlResponse = await getUploadUrl(selectionId).unwrap();

        // 2. Ottieni presigned URL per JSON
        const jsonUrlResponse = await getUploadJsonUrl(selectionId).unwrap();

        setUploadProgress({ status: "uploading-pdf", progress: 15 });

        // 3. Upload PDF su S3
        const pdfUploadResponse = await fetch(pdfUrlResponse.upload_url, {
          method: "PUT",
          body: pdfFile,
          headers: {
            "Content-Type": "application/pdf",
          },
        });

        if (!pdfUploadResponse.ok) {
          throw new Error("Errore durante l'upload del PDF su S3");
        }

        setUploadProgress({ status: "uploading-json", progress: 50 });

        // 4. Upload JSON su S3
        const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], {
          type: "application/json",
        });

        const jsonUploadResponse = await fetch(jsonUrlResponse.upload_url, {
          method: "PUT",
          body: jsonBlob,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!jsonUploadResponse.ok) {
          throw new Error("Errore durante l'upload del JSON su S3");
        }

        setUploadProgress({ status: "confirming", progress: 80 });

        // 5. Crea record nel database con entrambe le chiavi S3
        const jobCollection = await createJobCollection({
          selezione_id: selectionId,
          s3_key: pdfUrlResponse.s3_key,
          s3_key_json: jsonUrlResponse.s3_key,
        }).unwrap();

        setUploadProgress({ status: "success", progress: 100 });

        return jobCollection;
      } catch (error: any) {
        setUploadProgress({
          status: "error",
          progress: 0,
          error:
            error?.data?.error || error?.message || "Errore durante l'upload",
        });
        throw error;
      }
    },
    [getUploadUrl, getUploadJsonUrl, createJobCollection]
  );

  /**
   * Sostituisci PDF + JSON esistenti
   */
  const replacePdfAndJson = useCallback(
    async (jobCollectionId: number, pdfFile: File, jsonData: object) => {
      try {
        setUploadProgress({ status: "getting-url", progress: 5 });

        // 1. Ottieni presigned URL per PDF
        const pdfUrlResponse = await getReplacementUploadUrl(
          jobCollectionId
        ).unwrap();

        // 2. Ottieni presigned URL per JSON
        const jsonUrlResponse = await getReplacementUploadJsonUrl(
          jobCollectionId
        ).unwrap();

        setUploadProgress({ status: "uploading-pdf", progress: 15 });

        // 3. Upload PDF su S3
        const pdfUploadResponse = await fetch(pdfUrlResponse.upload_url, {
          method: "PUT",
          body: pdfFile,
          headers: {
            "Content-Type": "application/pdf",
          },
        });

        if (!pdfUploadResponse.ok) {
          throw new Error("Errore durante l'upload del PDF su S3");
        }

        setUploadProgress({ status: "uploading-json", progress: 50 });

        // 4. Upload JSON su S3
        const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], {
          type: "application/json",
        });

        const jsonUploadResponse = await fetch(jsonUrlResponse.upload_url, {
          method: "PUT",
          body: jsonBlob,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!jsonUploadResponse.ok) {
          throw new Error("Errore durante l'upload del JSON su S3");
        }

        setUploadProgress({ status: "confirming", progress: 80 });

        // 5. Aggiorna PDF
        await replaceJobCollectionPdf({
          id: jobCollectionId,
          s3_key: pdfUrlResponse.s3_key,
        }).unwrap();

        // 6. Aggiorna JSON
        const jobCollection = await updateJobCollectionJson({
          id: jobCollectionId,
          s3_key_json: jsonUrlResponse.s3_key,
        }).unwrap();

        setUploadProgress({ status: "success", progress: 100 });

        return jobCollection;
      } catch (error: any) {
        setUploadProgress({
          status: "error",
          progress: 0,
          error:
            error?.data?.error ||
            error?.message ||
            "Errore durante la sostituzione",
        });
        throw error;
      }
    },
    [
      getReplacementUploadUrl,
      getReplacementUploadJsonUrl,
      replaceJobCollectionPdf,
      updateJobCollectionJson,
    ]
  );

  // ============================================
  // UTILS
  // ============================================

  const resetProgress = useCallback(() => {
    setUploadProgress({ status: "idle", progress: 0 });
  }, []);

  return {
    uploadProgress,
    // PDF only
    uploadNewPdf,
    replacePdf,
    // JSON only
    uploadJson,
    // Combined PDF + JSON
    uploadNewPdfAndJson,
    replacePdfAndJson,
    // Utils
    resetProgress,
  };
}
