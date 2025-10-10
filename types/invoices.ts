// ========== Enums ==========

export enum InvoiceType {
  AV = "AV",
  INS = "INS",
  MDO = "MDO",
}

export enum PackageType {
  BASE = "BASE",
  MDO = "MDO",
}

// ========== Base Types ==========

export interface CompanyBasic {
  id: number;
  nome: string;
}

export interface SelectionBasic {
  id: number;
  titolo: string;
  pacchetto: PackageType;
}

export interface InvoiceBase {
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

// ========== Response Types ==========

// Response per create, update, markAsPaid
export interface InvoiceResponse extends InvoiceBase {
  company: CompanyBasic;
  selezione: SelectionBasic;
}

// Response per getAll, getByCompany, getBySelection
export interface InvoiceListItem extends InvoiceResponse {}

// Response per getById
export interface InvoiceDetail extends InvoiceResponse {}

// ========== Stats Types ==========

export interface InvoiceStatsItem {
  tipo_fattura: InvoiceType;
  totale: number;
  saldate: number;
  non_saldate: number;
  importo_totale?: number;
}

export interface InvoiceStatsResponse {
  totale: number;
  saldate: number;
  non_saldate: number;
  per_tipo: InvoiceStatsItem[];
}

// ========== Request Payloads ==========

export interface CreateInvoicePayload {
  numero_fattura: string;
  company_id: number;
  selezione_id: number;
  tipo_fattura: InvoiceType;
  data_emissione: string;
  data_pagamento?: string;
}

export interface UpdateInvoicePayload {
  numero_fattura?: string;
  tipo_fattura?: InvoiceType;
  data_emissione?: string;
  data_pagamento?: string | null;
}

export interface MarkInvoiceAsPaidPayload {
  data_pagamento?: string;
}

// ========== Query Params ==========

export interface GetInvoicesQueryParams {
  company_id?: number;
  selezione_id?: number;
  tipo_fattura?: InvoiceType;
  saldato?: boolean;
}

// ========== API Response Wrappers ==========

export interface DeleteInvoiceResponse {
  message: string;
}

// ========== Type Guards ==========

export const isInvoiceResponse = (obj: any): obj is InvoiceResponse => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.numero_fattura === "string" &&
    typeof obj.company_id === "number" &&
    typeof obj.selezione_id === "number" &&
    obj.company !== undefined &&
    obj.selezione !== undefined
  );
};

export const isInvoiceDetail = (obj: any): obj is InvoiceDetail => {
  return isInvoiceResponse(obj);
};
