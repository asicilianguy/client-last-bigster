import { apiSlice } from "../api/apiSlice"

export const applicationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getApplications: builder.query({
      query: (params) => ({ url: "/applications", params }),
      providesTags: (result) =>
        result && result.data
          ? [
              ...result.data.map(({ id }: { id: number }) => ({ type: "Application" as const, id })),
              { type: "Application", id: "LIST" },
            ]
          : [{ type: "Application", id: "LIST" }],
    }),
    getApplicationsBySelectionId: builder.query({
      query: (selectionId) => `/selections/${selectionId}/applications`,
      providesTags: (result, error, selectionId) =>
        result && result.data
          ? [
              ...result.data.map(({ id }: { id: number }) => ({ type: "Application" as const, id })),
              { type: "Application", id: `LIST_SELECTION_${selectionId}` },
            ]
          : [{ type: "Application", id: `LIST_SELECTION_${selectionId}` }],
    }),
    getApplicationsByAnnouncementId: builder.query({
      query: (announcementId) => `/applications?annuncio_id=${announcementId}`,
      providesTags: (result, error, announcementId) =>
        result && result.data
          ? [
              ...result.data.map(({ id }: { id: number }) => ({ type: "Application" as const, id })),
              { type: "Application", id: `LIST_ANNOUNCEMENT_${announcementId}` },
            ]
          : [{ type: "Application", id: `LIST_ANNOUNCEMENT_${announcementId}` }],
    }),
  }),
})

export const {
  useGetApplicationsQuery,
  useGetApplicationsBySelectionIdQuery,
  useGetApplicationsByAnnouncementIdQuery,
} = applicationsApiSlice
