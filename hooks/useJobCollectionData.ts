// hooks/useJobCollectionData.ts

import { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useGetJobCollectionBySelectionIdQuery } from "@/lib/redux/features/job-collections/jobCollectionsApiSlice";
import { jobCollectionsApiSlice } from "@/lib/redux/features/job-collections/jobCollectionsApiSlice";
import { useJobCollectionUpload } from "./useJobCollectionUpload";
import {
  JobDescriptionForm,
  JobDescriptionType,
  createDefaultJobDescriptionDO,
  createDefaultJobDescriptionASO,
} from "@/types/jobDescription";
import type { AppDispatch } from "@/lib/redux/store";

interface UseJobCollectionDataOptions {
  selectionId: number;
  tipo: JobDescriptionType;
  enabled?: boolean;
}

interface UseJobCollectionDataReturn {
  isLoading: boolean;
  isLoadingJson: boolean;
  isSaving: boolean;
  error: string | null;
  initialFormData: JobDescriptionForm | null;
  jobCollectionId: number | null;
  hasExistingData: boolean;
  hasJsonData: boolean;
  saveFormData: (formData: JobDescriptionForm) => Promise<void>;
  checkIsDirty: (currentData: JobDescriptionForm) => boolean;
  saveProgress: {
    status: "idle" | "saving" | "success" | "error";
    progress: number;
    error?: string;
  };
  resetSaveProgress: () => void;
}

export function useJobCollectionData({
  selectionId,
  tipo,
  enabled = true,
}: UseJobCollectionDataOptions): UseJobCollectionDataReturn {
  const dispatch = useDispatch<AppDispatch>();

  // Stato locale
  const [isLoadingJson, setIsLoadingJson] = useState(false);
  const [initialFormData, setInitialFormData] =
    useState<JobDescriptionForm | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ref per il confronto isDirty
  const loadedJsonRef = useRef<string | null>(null);

  // Query per ottenere la JobCollection esistente
  const {
    data: jobCollection,
    isLoading: isLoadingJobCollection,
    isError: isQueryError,
  } = useGetJobCollectionBySelectionIdQuery(selectionId, {
    skip: !enabled,
  });

  // Hook per upload
  const { uploadProgress, uploadJson, resetProgress } =
    useJobCollectionUpload();

  // Carica il JSON da S3 quando la JobCollection è disponibile
  useEffect(() => {
    const loadJsonFromS3 = async () => {
      if (!jobCollection?.s3_key_json) {
        setInitialFormData(null);
        loadedJsonRef.current = null;
        return;
      }

      setIsLoadingJson(true);
      setError(null);

      try {
        // Usa dispatch per chiamare l'endpoint
        const result = await dispatch(
          jobCollectionsApiSlice.endpoints.getDownloadJsonUrl.initiate(
            jobCollection.id,
            { forceRefetch: true } // ✅ Forza sempre una nuova richiesta
          )
        ).unwrap();
        const { download_url } = result;

        // Scarica il JSON
        const response = await fetch(download_url);
        if (!response.ok) {
          throw new Error("Errore nel download del JSON");
        }

        const jsonData = await response.json();

        // Valida e imposta i dati
        if (jsonData.data && jsonData.tipo) {
          setInitialFormData(jsonData.data as JobDescriptionForm);
          loadedJsonRef.current = JSON.stringify(jsonData.data);
        } else {
          throw new Error("Formato JSON non valido");
        }
      } catch (err: any) {
        console.error("Errore caricamento JSON da S3:", err);
        setError(err.message || "Errore nel caricamento dei dati");
        setInitialFormData(null);
        loadedJsonRef.current = null;
      } finally {
        setIsLoadingJson(false);
      }
    };

    if (jobCollection) {
      loadJsonFromS3();
    }
  }, [jobCollection, dispatch]);

  // Verifica se il form è modificato rispetto ai dati originali
  const checkIsDirty = useCallback(
    (currentData: JobDescriptionForm): boolean => {
      const currentJson = JSON.stringify(currentData);

      if (loadedJsonRef.current) {
        return currentJson !== loadedJsonRef.current;
      } else {
        const defaultData =
          tipo === JobDescriptionType.DO
            ? createDefaultJobDescriptionDO()
            : createDefaultJobDescriptionASO();
        const defaultJson = JSON.stringify(defaultData);
        return currentJson !== defaultJson;
      }
    },
    [tipo]
  );

  // Salva i dati del form su S3
  const saveFormData = useCallback(
    async (formData: JobDescriptionForm) => {
      setError(null);

      try {
        const exportData = {
          version: "1.0",
          exportDate: new Date().toISOString(),
          selectionId,
          tipo: formData.tipo,
          data: formData,
        };

        if (jobCollection) {
          await uploadJson(jobCollection.id, exportData);
        } else {
          throw new Error(
            "JobCollection non esistente. Genera prima il PDF dall'anteprima."
          );
        }

        loadedJsonRef.current = JSON.stringify(formData);
      } catch (err: any) {
        console.error("Errore salvataggio JSON su S3:", err);
        setError(err.message || "Errore nel salvataggio dei dati");
        throw err;
      }
    },
    [jobCollection, selectionId, uploadJson]
  );

  return {
    isLoading: isLoadingJobCollection,
    isLoadingJson,
    isSaving:
      uploadProgress.status === "uploading-json" ||
      uploadProgress.status === "confirming",
    error,
    initialFormData,
    jobCollectionId: jobCollection?.id || null,
    hasExistingData: !!jobCollection,
    hasJsonData: !!jobCollection?.s3_key_json,
    saveFormData,
    checkIsDirty,
    saveProgress: {
      status:
        uploadProgress.status === "success"
          ? "success"
          : uploadProgress.status === "error"
          ? "error"
          : uploadProgress.status === "idle"
          ? "idle"
          : "saving",
      progress: uploadProgress.progress,
      error: uploadProgress.error,
    },
    resetSaveProgress: resetProgress,
  };
}
