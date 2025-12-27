// types/announcementApproval.ts

// ============================================
// RESPONSE TYPES
// ============================================

export interface AnnouncementApprovalResponse {
  id: number;
  selezione_id: number;
  testo_markdown: string;
  approvato: boolean;
  data_richiesta: string;
  data_approvazione: string | null;
  note_approvazione: string | null;
  data_creazione: string;
  data_modifica: string;
}

export interface AnnouncementApprovalDetail
  extends AnnouncementApprovalResponse {
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
    risorsa_umana?: {
      id: number;
      nome: string;
      cognome: string;
    } | null;
  };
}

export interface AnnouncementApprovalPending
  extends AnnouncementApprovalResponse {
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
    risorsa_umana: {
      id: number;
      nome: string;
      cognome: string;
    } | null;
  };
}

// ============================================
// PAYLOAD TYPES
// ============================================

export interface CreateAnnouncementApprovalPayload {
  selezione_id: number;
  testo_markdown: string;
}

export interface UpdateAnnouncementApprovalPayload {
  testo_markdown: string;
}

export interface ApproveAnnouncementPayload {
  id: number;
  approvato: boolean;
  note_approvazione?: string | null;
}

// ============================================
// RESPONSE TYPES (Mutations)
// ============================================

export interface ApproveAnnouncementResponse {
  success: boolean;
  message: string;
  bozza: AnnouncementApprovalResponse;
  stato_aggiornato: boolean;
}

export interface DeleteAnnouncementApprovalResponse {
  message: string;
}
