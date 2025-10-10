export interface AnnouncementApprovalBase {
  id: number;
  selezione_id: number;
  annuncio_id?: number | null;
  bozza_titolo: string;
  bozza_descrizione: string;
  bozza_requisiti?: string | null;
  approvato: boolean;
  data_richiesta: string;
  data_approvazione?: string | null;
  note_approvazione?: string | null;
  data_creazione: string;
  data_modifica: string;
}

export interface AnnouncementApprovalResponse
  extends AnnouncementApprovalBase {}

export interface CreateAnnouncementApprovalPayload {
  selezione_id: number;
  annuncio_id?: number;
  bozza_titolo: string;
  bozza_descrizione: string;
  bozza_requisiti?: string;
}

export interface UpdateAnnouncementApprovalPayload {
  bozza_titolo?: string;
  bozza_descrizione?: string;
  bozza_requisiti?: string | null;
  approvato?: boolean;
  note_approvazione?: string | null;
}

export interface ApproveAnnouncementPayload {
  approvato: boolean;
  note_approvazione?: string;
}
