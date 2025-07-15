import { apiSlice } from "../api/apiSlice"

type ApplicationWithDetails = {
  id: number
  nome: string
  cognome: string
  email: string
  stato: string
  data_creazione: string
  annuncio: {
    id: number
    titolo: string
    selezione_id: number
    selezione: {
      id: number
      titolo: string
    }
  }
}

export const applicationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getApplications: builder.query<ApplicationWithDetails[], void>({
      query: () => "/applications",
      transformResponse: (response: { data: ApplicationWithDetails[] }) => response.data,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Application" as const, id })), { type: "Application", id: "LIST" }]
          : [{ type: "Application", id: "LIST" }],
    }),
  }),
})

export const { useGetApplicationsQuery } = applicationsApiSlice
