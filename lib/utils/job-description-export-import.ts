// ========================================================================
// lib/utils/job-description-export-import.ts
// Utility functions per export/import JSON delle raccolte Job Description
// ========================================================================

import { JobDescriptionForm, JobDescriptionType } from "@/types/jobDescription";

/**
 * Esporta il form della Job Description in formato JSON
 * e avvia il download del file
 */
export function exportJobDescriptionAsJSON(
  formData: JobDescriptionForm,
  selectionId: number,
  companyName?: string
): void {
  try {
    // Crea oggetto export con metadata
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      selectionId,
      companyName: companyName || "N/A",
      tipo: formData.tipo,
      data: formData,
    };

    // Converti in JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    // Genera nome file con timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const tipoLabel = formData.tipo === JobDescriptionType.DO ? "DO" : "ASO";
    const companySlug = companyName
      ? companyName.toLowerCase().replace(/\s+/g, "-").slice(0, 20)
      : `selezione-${selectionId}`;
    const filename = `raccolta-job-${companySlug}-${tipoLabel}-${timestamp}.json`;

    // Crea link temporaneo e avvia download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("✅ Export JSON completato:", filename);
  } catch (error) {
    console.error("❌ Errore durante l'export JSON:", error);
    throw new Error("Impossibile esportare la raccolta job");
  }
}

/**
 * Importa una Job Description da file JSON
 * Valida la struttura e restituisce i dati del form
 */
export async function importJobDescriptionFromJSON(
  file: File
): Promise<JobDescriptionForm> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Nessun file selezionato"));
      return;
    }

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      reject(new Error("Il file deve essere in formato JSON"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        // Validazione struttura base
        if (!parsed.data || !parsed.tipo) {
          reject(
            new Error(
              "File JSON non valido: mancano i campi obbligatori (data, tipo)"
            )
          );
          return;
        }

        // Validazione tipo
        if (
          parsed.tipo !== JobDescriptionType.DO &&
          parsed.tipo !== JobDescriptionType.ASO
        ) {
          reject(new Error("Tipo Job Description non valido nel file"));
          return;
        }

        console.log("✅ Import JSON completato");
        console.log("- Selection ID:", parsed.selectionId);
        console.log("- Company:", parsed.companyName);
        console.log("- Tipo:", parsed.tipo);
        console.log("- Export Date:", parsed.exportDate);

        resolve(parsed.data as JobDescriptionForm);
      } catch (error) {
        console.error("❌ Errore parsing JSON:", error);
        reject(new Error("File JSON corrotto o non valido"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Errore durante la lettura del file"));
    };

    reader.readAsText(file);
  });
}

/**
 * Crea un input file nascosto per triggerare la selezione file
 */
export function triggerFileImport(
  onImport: (formData: JobDescriptionForm) => void
): void {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.style.display = "none";

  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const formData = await importJobDescriptionFromJSON(file);
      onImport(formData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Errore sconosciuto";
      alert(`❌ Errore durante l'import: ${errorMessage}`);
    }
  };

  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
}
