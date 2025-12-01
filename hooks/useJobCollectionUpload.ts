// hooks/useJobCollectionUpload.ts

import { useState, useCallback } from "react";
import {
  useGetUploadUrlMutation,
  useCreateJobCollectionMutation,
  useGetReplacementUploadUrlMutation,
  useReplaceJobCollectionPdfMutation,
} from "@/lib/redux/features/job-collections/jobCollectionsApiSlice";

interface UploadProgress {
  status:
    | "idle"
    | "getting-url"
    | "uploading"
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

  const [getUploadUrl] = useGetUploadUrlMutation();
  const [createJobCollection] = useCreateJobCollectionMutation();
  const [getReplacementUploadUrl] = useGetReplacementUploadUrlMutation();
  const [replaceJobCollectionPdf] = useReplaceJobCollectionPdfMutation();

  /**
   * Upload nuovo PDF per una selezione
   */
  const uploadNewPdf = useCallback(
    async (selectionId: number, file: File) => {
      try {
        setUploadProgress({ status: "getting-url", progress: 10 });

        // 1. Ottieni presigned URL
        const { upload_url, s3_key } = await getUploadUrl(selectionId).unwrap();

        setUploadProgress({ status: "uploading", progress: 30 });

        // 2. Upload diretto su S3
        const uploadResponse = await fetch(upload_url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": "application/pdf",
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("Errore durante l'upload su S3");
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

        setUploadProgress({ status: "uploading", progress: 30 });

        // 2. Upload diretto su S3
        const uploadResponse = await fetch(upload_url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": "application/pdf",
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("Errore durante l'upload su S3");
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
            "Errore durante la sostituzione",
        });
        throw error;
      }
    },
    [getReplacementUploadUrl, replaceJobCollectionPdf]
  );

  const resetProgress = useCallback(() => {
    setUploadProgress({ status: "idle", progress: 0 });
  }, []);

  return {
    uploadProgress,
    uploadNewPdf,
    replacePdf,
    resetProgress,
  };
}
