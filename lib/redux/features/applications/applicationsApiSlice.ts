import { apiSlice } from "../api/apiSlice";

export type ApplicationWithDetails = {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  stato: string;
  data_creazione: string;
  annuncio: {
    id: number;
    titolo: string;
    selezione_id: number;
    selezione: {
      id: number;
      titolo: string;
    };
  };
};

export const applicationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getApplications: builder.query<ApplicationWithDetails[], void>({
      query: () => "/applications",
      transformResponse: (response: { data: ApplicationWithDetails[] }) =>
        response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Application" as const, id })),
              { type: "Application", id: "LIST" },
            ]
          : [{ type: "Application", id: "LIST" }],
    }),

    // Endpoint per ottenere candidature in base all'ID selezione
    getApplicationsBySelectionId: builder.query<
      { data: ApplicationWithDetails[] },
      number
    >({
      query: (selectionId) => `/selections/${selectionId}/applications`,
      providesTags: (result, error, selectionId) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Application" as const,
                id,
              })),
              { type: "Application", id: "LIST" },
              { type: "Selection", id: selectionId },
            ]
          : [
              { type: "Application", id: "LIST" },
              { type: "Selection", id: selectionId },
            ],
    }),

    // Endpoint per ottenere candidature in base agli ID selezione (multipli)
    getApplicationsBySelections: builder.query<
      { data: ApplicationWithDetails[] },
      number[]
    >({
      query: (selectionIds) => ({
        url: `/applications/by-selections`,
        method: "GET",
        params: { ids: selectionIds.join(",") },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Application" as const,
                id,
              })),
              { type: "Application", id: "LIST" },
            ]
          : [{ type: "Application", id: "LIST" }],
    }),
  }),
});

export const {
  useGetApplicationsQuery,
  useGetApplicationsBySelectionIdQuery,
  useGetApplicationsBySelectionsQuery,
} = applicationsApiSlice;
