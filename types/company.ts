// types/company.ts

import {
  AnnouncementStatus,
  SelectionStatus,
  PackageType,
  InvoiceType,
} from "./enums";

// ========== Base Types ==========

export interface Company {
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

export interface UserBasic {
  id: number;
  nome: string;
  cognome: string;
}

// ========== Response Types ==========

// Response per create, update
export interface CompanyResponse extends Company {}

// Response per getAll
export interface CompanyListItem extends Company {
  _count: {
    annunci: number;
    selezioni: number;
    fatture: number;
  };
}

// Response per getById
export interface CompanyDetail extends Company {
  annunci: Array<{
    id: number;
    titolo: string;
    stato: AnnouncementStatus;
    data_pubblicazione?: string | null;
    data_scadenza?: string | null;
    selezione: {
      id: number;
      titolo: string;
      stato: SelectionStatus;
    };
  }>;
  selezioni: Array<{
    id: number;
    titolo: string;
    stato: SelectionStatus;
    pacchetto: PackageType;
    consulente?: UserBasic | null;
    risorsa_umana?: UserBasic | null;
    data_creazione: string;
  }>;
  fatture: Array<{
    id: number;
    numero_fattura: string;
    tipo_fattura: InvoiceType;
    data_emissione: string;
    data_pagamento?: string | null;
    selezione: {
      id: number;
      titolo: string;
    };
  }>;
  _count: {
    annunci: number;
    selezioni: number;
    fatture: number;
  };
}

// Response per searchByName
export interface CompanySearchResult {
  id: number;
  nome: string;
  citta?: string | null;
  provincia?: string | null;
  regione?: string | null;
  settore_attivita?: string | null;
}

// ========== Stats Types ==========

export interface CompanyRegionStats {
  regione: string;
  numero_aziende: number;
  media_dipendenti: number;
}

export interface CompanyStatsResponse {
  company: {
    id: number;
    nome: string;
  };
  selezioni: {
    totale: number;
    per_stato: Record<SelectionStatus, number>;
  };
  fatture: {
    totale: number;
    per_tipo: Record<InvoiceType, number>;
  };
}

// ========== Request Payloads ==========

export interface CreateCompanyPayload {
  nome: string;
  partita_iva?: string;
  codice_fiscale?: string;
  citta?: string;
  provincia?: string;
  regione?: string;
  cap?: string;
  indirizzo?: string;
  telefono?: string;
  email_referente?: string;
  nome_referente?: string;
  cognome_referente?: string;
  numero_dipendenti?: number;
  fatturato?: string;
  settore_attivita?: string;
  note?: string;
}

export interface UpdateCompanyPayload {
  nome?: string;
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
}

// ========== Query Params ==========

export interface GetCompaniesQueryParams {
  search?: string;
  regione?: string;
  provincia?: string;
  citta?: string;
  settore_attivita?: string;
  min_dipendenti?: number;
  max_dipendenti?: number;
}

// ========== API Response Wrappers ==========

export interface DeleteCompanyResponse {
  message: string;
}

// ========== Type Guards ==========

export const isCompanyResponse = (obj: any): obj is CompanyResponse => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.nome === "string"
  );
};

export const isCompanyListItem = (obj: any): obj is CompanyListItem => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.nome === "string" &&
    obj._count !== undefined &&
    typeof obj._count === "object" &&
    typeof obj._count.annunci === "number" &&
    typeof obj._count.selezioni === "number" &&
    typeof obj._count.fatture === "number"
  );
};

export const isCompanyDetail = (obj: any): obj is CompanyDetail => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.nome === "string" &&
    Array.isArray(obj.annunci) &&
    Array.isArray(obj.selezioni) &&
    Array.isArray(obj.fatture) &&
    obj._count !== undefined &&
    typeof obj._count === "object"
  );
};
