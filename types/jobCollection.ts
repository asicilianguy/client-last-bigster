// types/jobCollection.ts

// ========== Base Types ==========

export interface SelectionBasic {
  id: number;
  titolo: string;
  risorsa_umana_id?: number | null;
  company?: {
    id: number;
    nome: string;
  };
}

// ========== JobCollection Types ==========

export interface JobCollectionBase {
  id: number;
  selezione_id: number;
  s3_key: string;
  inviata_al_cliente: boolean;
  data_invio_cliente?: string | null;
  approvata_dal_cliente: boolean;
  data_approvazione_cliente?: string | null;
  note_cliente?: string | null;
  data_creazione: string;
  data_modifica: string;
}

// ========== Response Types ==========

// Response base con download URL
export interface JobCollectionResponse extends JobCollectionBase {
  download_url?: string;
}

// Response per getById con selezione inclusa
export interface JobCollectionDetail extends JobCollectionBase {
  download_url?: string;
  selezione: SelectionBasic;
}

// Response per upload URL
export interface UploadUrlResponse {
  upload_url: string;
  s3_key: string;
  expires_in: number;
}

// Response per download URL
export interface DownloadUrlResponse {
  download_url: string;
  expires_in: number;
}

// ========== Request Payloads ==========

export interface CreateJobCollectionPayload {
  selezione_id: number;
  s3_key: string;
}

export interface UpdateJobCollectionPayload {
  inviata_al_cliente?: boolean;
  approvata_dal_cliente?: boolean;
  note_cliente?: string | null;
}

export interface ReplaceJobCollectionPdfPayload {
  s3_key: string;
}

// ========== API Response Wrappers ==========

export interface DeleteJobCollectionResponse {
  message: string;
}

// ========== Type Guards ==========

export const isJobCollectionResponse = (
  obj: any
): obj is JobCollectionResponse => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.selezione_id === "number" &&
    typeof obj.s3_key === "string"
  );
};

export const isJobCollectionDetail = (obj: any): obj is JobCollectionDetail => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.selezione_id === "number" &&
    typeof obj.s3_key === "string" &&
    obj.selezione !== undefined // Controlliamo direttamente su obj (any)
  );
};
