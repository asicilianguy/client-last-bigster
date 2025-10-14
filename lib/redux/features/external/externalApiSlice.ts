import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Types for Consultants
export interface Consultant {
  id: number;
  fullName: string;
  email: string;
  role: string;
  area: string;
  areaColor: string;
  companies: number;
  profileUrl: string;
}

export interface ConsultantsApiResponse {
  success: boolean;
  totalConsultants: number;
  consultants: Consultant[];
}

// Types for Invoices
export interface Invoice {
  id: number;
  number: string;
  date: string;
  amount_gross: number;
  contract_number?: string;
  items_codes?: string[];
}

export interface InvoicesApiResponse {
  success: boolean;
  invoices: Invoice[];
}

export const externalApiSlice = createApi({
  reducerPath: "externalApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),
  tagTypes: ["Consultants", "Invoices"],
  endpoints: (builder) => ({
    // GET Consultants
    getConsultants: builder.query<ConsultantsApiResponse, void>({
      query: () => "/consultants",
      providesTags: ["Consultants"],
    }),

    // GET Invoices (potrebbe richiedere parametri in futuro)
    getInvoices: builder.query<InvoicesApiResponse, void>({
      query: () => "/invoices",
      providesTags: ["Invoices"],
    }),
  }),
});

export const { useGetConsultantsQuery, useGetInvoicesQuery } = externalApiSlice;
