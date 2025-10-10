import { apiSlice } from "../api/apiSlice";
import type {
  CompanyListItem,
  CompanyDetail,
  CompanyResponse,
  CompanySearchResult,
  CompanyRegionStats,
  CompanyStatsResponse,
  CreateCompanyPayload,
  UpdateCompanyPayload,
  GetCompaniesQueryParams,
  DeleteCompanyResponse,
} from "@/types/company";

export const companiesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all companies with optional filters
    getCompanies: builder.query<
      CompanyListItem[],
      GetCompaniesQueryParams | void
    >({
      query: (params) => ({
        url: "/companies",
        params: params ?? undefined,
      }),
      transformResponse: (response: { data: CompanyListItem[] }) =>
        response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Company" as const, id })),
              { type: "Company", id: "LIST" },
            ]
          : [{ type: "Company", id: "LIST" }],
    }),

    // Get company by ID
    getCompanyById: builder.query<CompanyDetail, number>({
      query: (id) => `/companies/${id}`,
      transformResponse: (response: { data: CompanyDetail }) => response.data,
      providesTags: (result, error, id) => [{ type: "Company" as const, id }],
    }),

    // Search companies by name
    searchCompanies: builder.query<CompanySearchResult[], string>({
      query: (query) => ({
        url: `/companies/search`,
        params: { query },
      }),
      transformResponse: (response: { data: CompanySearchResult[] }) =>
        response.data,
    }),

    // Get companies statistics by region
    getCompaniesByRegionStats: builder.query<CompanyRegionStats[], void>({
      query: () => `/companies/stats-by-region`,
      transformResponse: (response: { data: CompanyRegionStats[] }) =>
        response.data,
      providesTags: [{ type: "Company" as const, id: "REGION_STATS" }],
    }),

    // Get company statistics
    getCompanyStats: builder.query<CompanyStatsResponse, number>({
      query: (id) => `/companies/${id}/stats`,
      transformResponse: (response: { data: CompanyStatsResponse }) =>
        response.data,
      providesTags: (result, error, id) => [
        { type: "Company", id },
        { type: "Company", id: `STATS_${id}` },
      ],
    }),

    // Create company
    createCompany: builder.mutation<CompanyResponse, CreateCompanyPayload>({
      query: (newCompany) => ({
        url: "/companies",
        method: "POST",
        body: newCompany,
      }),
      transformResponse: (response: { data: CompanyResponse }) => response.data,
      invalidatesTags: [
        { type: "Company", id: "LIST" },
        { type: "Company", id: "REGION_STATS" },
      ],
    }),

    // Update company
    updateCompany: builder.mutation<
      CompanyResponse,
      { id: number } & UpdateCompanyPayload
    >({
      query: ({ id, ...changes }) => ({
        url: `/companies/${id}`,
        method: "PUT",
        body: changes,
      }),
      transformResponse: (response: { data: CompanyResponse }) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Company", id },
        { type: "Company", id: "LIST" },
        { type: "Company", id: "REGION_STATS" },
        { type: "Company", id: `STATS_${id}` },
      ],
    }),

    // Delete company
    deleteCompany: builder.mutation<DeleteCompanyResponse, number>({
      query: (id) => ({
        url: `/companies/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Company", id: "LIST" },
        { type: "Company", id: "REGION_STATS" },
      ],
    }),
  }),
});

export const {
  useGetCompaniesQuery,
  useGetCompanyByIdQuery,
  useSearchCompaniesQuery,
  useGetCompaniesByRegionStatsQuery,
  useGetCompanyStatsQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
} = companiesApiSlice;
