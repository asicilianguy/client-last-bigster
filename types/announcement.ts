// ========== Enums ==========

export enum AnnouncementPlatform {
  LINKEDIN = "LINKEDIN",
  INDEED = "INDEED",
  ALTRO = "ALTRO",
}

export enum AnnouncementStatus {
  BOZZA = "BOZZA",
  PUBBLICATO = "PUBBLICATO",
  SCADUTO = "SCADUTO",
  CHIUSO = "CHIUSO",
}

export enum ContractType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  COLLABORAZIONE = "COLLABORAZIONE",
  STAGE = "STAGE",
}

export enum WorkMode {
  IN_PRESENZA = "IN_PRESENZA",
  IBRIDO = "IBRIDO",
  DA_REMOTO = "DA_REMOTO",
}

export enum LanguageType {
  ITALIANO = "ITALIANO",
  INGLESE = "INGLESE",
  ALTRO = "ALTRO",
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
  CHIUSA = "CHIUSA",
  ANNULLATA = "ANNULLATA",
}

export enum Seniority {
  JUNIOR = "JUNIOR",
  MID = "MID",
  SENIOR = "SENIOR",
}

// ========== Base Types ==========

export interface CompanyBasic {
  id: number;
  nome: string;
  citta?: string | null;
}

export interface SelectionBasic {
  id: number;
  titolo: string;
  stato: SelectionStatus;
}

export interface ProfessionalFigureBasic {
  id: number;
  nome: string;
  seniority: Seniority;
}

export interface AnnouncementBase {
  id: number;
  selezione_id: number;
  company_id: number;
  piattaforma: AnnouncementPlatform;
  titolo: string;
  descrizione: string;
  link_candidatura: string;
  citta: string;
  provincia: string;
  regione: string;
  tipo_contratto: ContractType;
  orari_turni: string;
  modalita_lavoro: WorkMode;
  retribuzione: string;
  lingua: LanguageType;
  data_pubblicazione?: string | null;
  data_scadenza?: string | null;
  stato: AnnouncementStatus;
  link_test?: string | null;
  budget?: string | null;
  parole_chiave?: string | null;
  note_interne?: string | null;
  data_creazione: string;
  data_modifica: string;
}

// ========== Response Types ==========

// Response per create, update
export interface AnnouncementResponse extends AnnouncementBase {
  selezione: SelectionBasic;
  company: CompanyBasic;
}

// Response per getAll
export interface AnnouncementListItem extends AnnouncementBase {
  selezione: SelectionBasic;
  company: CompanyBasic;
  _count: {
    candidature: number;
  };
}

// Response per getById
export interface AnnouncementDetail extends AnnouncementBase {
  selezione: {
    id: number;
    titolo: string;
    stato: SelectionStatus;
    company: CompanyBasic;
    consulente: {
      id: number;
      nome: string;
      cognome: string;
    } | null;
    risorsa_umana: {
      id: number;
      nome: string;
      cognome: string;
    } | null;
  };
  company: CompanyBasic;
  candidature: Array<{
    id: number;
    nome: string;
    cognome: string;
    email: string;
    stato: string;
    data_creazione: string;
  }>;
  _count: {
    candidature: number;
  };
}

// Response per getBySelection, getByCompany
export interface AnnouncementBySelectionItem extends AnnouncementBase {
  company: CompanyBasic;
  _count: {
    candidature: number;
  };
}

export interface AnnouncementByCompanyItem extends AnnouncementBase {
  selezione: SelectionBasic;
  _count: {
    candidature: number;
  };
}

// Response per publish, close
export interface PublishAnnouncementResponse extends AnnouncementBase {
  selezione: SelectionBasic;
  company: CompanyBasic;
}

export interface CloseAnnouncementResponse extends AnnouncementBase {
  selezione: SelectionBasic;
  company: CompanyBasic;
  _count: {
    candidature: number;
  };
}

// ========== Stats Types ==========

export interface TopCompanyStats {
  company_id: number;
  company_nome: string;
  numero_annunci: number;
}

export interface AnnouncementStatsResponse {
  totale: number;
  per_stato: Record<AnnouncementStatus, number>;
  per_piattaforma: Record<AnnouncementPlatform, number>;
  top_companies: TopCompanyStats[];
}

// ========== Request Payloads ==========

export interface CreateAnnouncementPayload {
  selezione_id: number;
  company_id: number;
  piattaforma: AnnouncementPlatform;
  titolo: string;
  descrizione: string;
  link_candidatura: string;
  citta: string;
  provincia: string;
  regione: string;
  tipo_contratto: ContractType;
  orari_turni: string;
  modalita_lavoro: WorkMode;
  retribuzione: string;
  lingua: LanguageType;
  data_pubblicazione?: string;
  data_scadenza?: string;
  link_test?: string;
  budget?: string;
  parole_chiave?: string;
  note_interne?: string;
}

export interface UpdateAnnouncementPayload {
  piattaforma?: AnnouncementPlatform;
  titolo?: string;
  descrizione?: string;
  link_candidatura?: string;
  citta?: string;
  provincia?: string;
  regione?: string;
  tipo_contratto?: ContractType;
  orari_turni?: string;
  modalita_lavoro?: WorkMode;
  retribuzione?: string;
  lingua?: LanguageType;
  data_pubblicazione?: string | null;
  data_scadenza?: string | null;
  stato?: AnnouncementStatus;
  link_test?: string | null;
  budget?: string | null;
  parole_chiave?: string | null;
  note_interne?: string | null;
}

export interface PublishAnnouncementPayload {
  data_pubblicazione?: string;
  data_scadenza?: string;
}

// ========== Query Params ==========

export interface GetAnnouncementsQueryParams {
  stato?: AnnouncementStatus;
  piattaforma?: AnnouncementPlatform;
  selezione_id?: number;
  company_id?: number;
}

// ========== API Response Wrappers ==========

export interface DeleteAnnouncementResponse {
  message: string;
}

// ========== Type Guards ==========

export const isAnnouncementResponse = (
  obj: any
): obj is AnnouncementResponse => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.titolo === "string" &&
    obj.selezione !== undefined &&
    obj.company !== undefined
  );
};

export const isAnnouncementDetail = (obj: any): obj is AnnouncementDetail => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.titolo === "string" &&
    obj.selezione !== undefined &&
    obj.company !== undefined &&
    Array.isArray(obj.candidature) &&
    obj._count !== undefined &&
    typeof obj._count === "object" &&
    typeof obj._count.candidature === "number"
  );
};
