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
  s3_key_json?: string | null;
  inviata_al_cliente: boolean;
  data_invio_cliente?: string | null;
  approvata_dal_cliente: boolean;
  data_approvazione_cliente?: string | null;
  note_cliente?: string | null;
  data_creazione: string;
  data_modifica: string;
}

// ========== Response Types ==========

export interface JobCollectionResponse extends JobCollectionBase {
  download_url?: string;
  download_url_json?: string;
}

export interface JobCollectionDetail extends JobCollectionBase {
  download_url?: string;
  download_url_json?: string;
  selezione: SelectionBasic;
}

export interface UploadUrlResponse {
  upload_url: string;
  s3_key: string;
  expires_in: number;
}

export interface DownloadUrlResponse {
  download_url: string;
  expires_in: number;
}

// ========== Request Payloads ==========

export interface CreateJobCollectionPayload {
  selezione_id: number;
  s3_key: string;
  s3_key_json?: string;
}

export interface UpdateJobCollectionPayload {
  inviata_al_cliente?: boolean;
  approvata_dal_cliente?: boolean;
  note_cliente?: string | null;
}

export interface ReplaceJobCollectionPdfPayload {
  s3_key: string;
}

export interface UpdateJobCollectionJsonPayload {
  s3_key_json: string;
}

// ========== Send to Client Types ==========

export interface SendToClientPayload {
  id: number;
  email: string;
}

export interface SendToClientResponse extends JobCollectionBase {
  message: string;
  email_sent_to: string;
  warning?: string;
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
    obj.selezione !== undefined
  );
};

export const hasJsonData = (obj: JobCollectionBase): boolean => {
  return !!obj.s3_key_json;
};

// ============================================
// CLIENT PUBLIC ENDPOINTS (NO AUTH)
// ============================================

export interface ClientViewResponse {
  id: number;
  inviata_al_cliente: boolean;
  data_invio_cliente: string | null;
  approvata_dal_cliente: boolean;
  data_approvazione_cliente: string | null;
  note_cliente: string | null;
  download_url: string | null;
  selezione: {
    id: number;
    titolo: string;
    company: {
      id: number;
      nome: string;
    };
    figura_professionale: {
      id: number;
      nome: string;
      seniority: string;
    } | null;
  };
}

export interface ClientApprovalPayload {
  id: number;
  note_cliente?: string;
}

export interface ClientApprovalResponse {
  success: boolean;
  message: string;
  already_approved?: boolean;
  data_approvazione?: string;
  job_collection: {
    id: number;
    approvata_dal_cliente: boolean;
    data_approvazione_cliente: string | null;
    note_cliente: string | null;
  };
  selezione: {
    id: number;
    titolo: string;
    company: {
      id: number;
      nome: string;
    };
    figura_professionale: {
      id: number;
      nome: string;
    } | null;
  };
  stato_aggiornato?: boolean;
}
