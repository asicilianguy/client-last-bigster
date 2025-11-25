// ========== Enums (replicate from Prisma) ==========

export enum UserRole {
  CEO = "CEO",
  RESPONSABILE_REPARTO = "RESPONSABILE_REPARTO",
  RISORSA_UMANA = "RISORSA_UMANA",
  CONSULENTE = "CONSULENTE",
  DIPENDENTE = "DIPENDENTE",
  DEVELOPER = "DEVELOPER",
}

export enum Seniority {
  JUNIOR = "JUNIOR",
  MID = "MID",
  SENIOR = "SENIOR",
}

export enum SelectionStatus {
  FATTURA_AV_SALDATA = "FATTURA_AV_SALDATA",
  HR_ASSEGNATA = "HR_ASSEGNATA",
  PRIMA_CALL_COMPLETATA = "PRIMA_CALL_COMPLETATA",
  RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE = "RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE",
  RACCOLTA_JOB_APPROVATA_CLIENTE = "RACCOLTA_JOB_APPROVATA_CLIENTE",
  BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO = "BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO",
  ANNUNCIO_APPROVATO = "ANNUNCIO_APPROVATO",
  ANNUNCIO_PUBBLICATO = "ANNUNCIO_PUBBLICATO",
  CANDIDATURE_RICEVUTE = "CANDIDATURE_RICEVUTE",
  COLLOQUI_IN_CORSO = "COLLOQUI_IN_CORSO",
  PROPOSTA_CANDIDATI = "PROPOSTA_CANDIDATI",
  SELEZIONI_IN_SOSTITUZIONE = "SELEZIONI_IN_SOSTITUZIONE",
  CHIUSA = "CHIUSA",
  ANNULLATA = "ANNULLATA",
}

export enum PackageType {
  BASE = "BASE",
  MDO = "MDO",
}

export enum InvoiceType {
  AV = "AV",
  INS = "INS",
  MDO = "MDO",
}

export enum AnnouncementStatus {
  BOZZA = "BOZZA",
  PUBBLICATO = "PUBBLICATO",
  SCADUTO = "SCADUTO",
  CHIUSO = "CHIUSO",
}

// ========== Base Types ==========

export interface UserBasic {
  id: number;
  nome: string;
  cognome: string;
  email: string;
}

export interface CompanyBasic {
  id: number;
  nome: string;
  partita_iva?: string | null;
  codice_fiscale?: string | null;
  citta?: string | null;
  provincia?: string | null;
  regione?: string | null;
  cap?: string | null;
  indirizzo?: string | null;
  telefono?: string | null;
  email_referente?: string | null;
  nome_referente?: string | null;
  cognome_referente?: string | null;
  numero_dipendenti?: number | null;
  fatturato?: string | null;
  settore_attivita?: string | null;
  note?: string | null;
  data_creazione: string;
  data_modifica: string;
}

export interface ProfessionalFigureBasic {
  id: number;
  nome: string;
  seniority: Seniority;
  prerequisiti?: string | null;
  descrizione: string;
  data_creazione: string;
  data_modifica: string;
}

export interface InvoiceBasic {
  id: number;
  numero_fattura: string;
  company_id: number;
  selezione_id: number;
  tipo_fattura: InvoiceType;
  data_emissione: string;
  data_pagamento?: string | null;
  data_creazione: string;
  data_modifica: string;
}

export interface AnnouncementBasic {
  id: number;
  selezione_id: number;
  titolo: string;
  stato: AnnouncementStatus;
  data_pubblicazione?: string | null;
  data_scadenza?: string | null;
  data_creazione: string;
  _count?: {
    candidature: number;
  };
}

export interface JobCollectionBasic {
  id: number;
  selezione_id: number;
  titolo_posizione: string;
  descrizione_ruolo: string;
  competenze_richieste: string;
  inviata_al_cliente: boolean;
  approvata_dal_cliente: boolean;
  data_creazione: string;
  data_modifica: string;
}

export interface AnnouncementApprovalBasic {
  id: number;
  selezione_id: number;
  annuncio_id?: number | null;
  bozza_titolo: string;
  bozza_descrizione: string;
  approvato: boolean;
  data_richiesta: string;
  data_approvazione?: string | null;
}

export interface SelectionStatusHistoryBasic {
  id: number;
  selezione_id: number;
  stato_precedente?: SelectionStatus | null;
  stato_nuovo: SelectionStatus;
  risorsa_umana_id?: number | null;
  risorsa_umana?: {
    id: number;
    nome: string;
    cognome: string;
  } | null;
  data_cambio: string;
  data_scadenza?: string | null;
  note?: string | null;
}

// ========== Selection Types ==========

export interface SelectionBase {
  id: number;
  titolo: string;
  company_id: number;
  stato: SelectionStatus;
  pacchetto: PackageType;
  consulente_id: number;
  risorsa_umana_id?: number | null;
  figura_professionale_id?: number | null;
  note?: string | null;
  data_creazione: string;
  data_modifica: string;
  data_chiusura?: string | null;
}

// Response per create, update, assignHR, changeStatus
export interface SelectionResponse extends SelectionBase {
  company: CompanyBasic;
  consulente: UserBasic;
  risorsa_umana?: UserBasic | null;
  figura_professionale?: ProfessionalFigureBasic | null;
}

// Response per getAll
export interface SelectionListItem extends SelectionBase {
  company: CompanyBasic;
  consulente: UserBasic;
  risorsa_umana?: UserBasic | null;
  figura_professionale?: ProfessionalFigureBasic | null;
  fatture: InvoiceBasic[];
  _count: {
    annunci: number;
    raccolte_job: number;
  };
}

// Response per getById
export interface SelectionDetail extends SelectionBase {
  company: CompanyBasic;
  consulente: UserBasic;
  risorsa_umana?: UserBasic | null;
  figura_professionale?: ProfessionalFigureBasic | null;
  fatture: InvoiceBasic[];
  annunci: AnnouncementBasic[];
  raccolte_job: JobCollectionBasic[];
  approvazioni_annuncio: AnnouncementApprovalBasic[];
  storico_stati: SelectionStatusHistoryBasic[];
}

// Response per getByConsulente
export interface SelectionByConsulenteItem extends SelectionBase {
  company: CompanyBasic;
  risorsa_umana?: UserBasic | null;
  figura_professionale?: ProfessionalFigureBasic | null;
  _count: {
    annunci: number;
    fatture: number;
  };
}

// ========== Request Payloads ==========

export interface CreateSelectionPayload {
  titolo: string;
  company_id: number;
  consulente_id: number;
  pacchetto: PackageType;
  figura_professionale_id?: number;
  risorsa_umana_id?: number;
  note?: string;
}

export interface UpdateSelectionPayload {
  titolo?: string;
  company_id?: number;
  consulente_id?: number;
  figura_professionale_id?: number | null;
  risorsa_umana_id?: number | null;
  stato?: SelectionStatus;
  pacchetto?: PackageType;
  note?: string | null;
  data_chiusura?: string | null;
}

export interface AssignHRPayload {
  risorsa_umana_id: number;
}

export interface ChangeStatusPayload {
  nuovo_stato: SelectionStatus;
  note?: string;
}

// ========== Query Params ==========

export interface GetSelectionsQueryParams {
  company_id?: string;
  consulente_id?: string;
  risorsa_umana_id?: string;
  stato?: SelectionStatus;
  pacchetto?: PackageType;
}

// ========== Invoice Status Response ==========

export interface InvoiceStatusDetail {
  id: number;
  numero_fattura: string;
  tipo: InvoiceType;
  data_emissione: string;
  data_pagamento?: string | null;
  saldato: boolean;
}

export interface SelectionInvoicesStatusResponse {
  pacchetto: PackageType;
  fatture_previste: number;
  fatture_presenti: number;
  fatture_saldate: number;
  completamente_fatturato: boolean;
  tutto_saldato: boolean;
  dettaglio_fatture: InvoiceStatusDetail[];
}

// ========== API Response Wrappers ==========

export interface DeleteSelectionResponse {
  message: string;
}

// ========== Type Guards ==========

export const isSelectionResponse = (obj: any): obj is SelectionResponse => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.titolo === "string" &&
    obj.company !== undefined &&
    obj.consulente !== undefined
  );
};

export const isSelectionListItem = (obj: any): obj is SelectionListItem => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.titolo === "string" &&
    Array.isArray(obj.fatture) &&
    obj._count !== undefined &&
    obj.company !== undefined &&
    obj.consulente !== undefined
  );
};

// ============================================
// DEADLINE MONITORING
// ============================================

/**
 * Dati minimi per il monitoraggio scadenze
 * Usato da SelectionsDeadlinesMonitor (endpoint ottimizzato)
 */
export interface SelectionDeadlineMonitoring {
  id: number;
  titolo: string;
  stato: SelectionStatus;
  data_creazione: string;
  company: {
    id: number;
    nome: string;
  };
  storico_stati: Array<{
    id: number;
    stato_nuovo: SelectionStatus;
    data_cambio: string;
    data_scadenza: string | null;
  }>;
}
