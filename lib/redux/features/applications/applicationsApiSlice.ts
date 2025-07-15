import { apiSlice } from "../api/apiSlice"

export const applicationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getApplicationsBySelectionId: builder.query({
      query: (selectionId) => `/selections/${selectionId}/applications`,
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.data.map(({ id }: { id: any }) => ({ type: "Application" as const, id })),
              { type: "Application", id: "LIST" },
            ]
          : [{ type: "Application", id: "LIST" }],
    }),
    getApplications: builder.query({
      query: (params) => ({
        url: "/applications",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }: { id: any }) => ({ type: "Application" as const, id })),
              { type: "Application", id: "LIST" },
            ]
          : [{ type: "Application", id: "LIST" }],
    }),
  }),
})

export const { useGetApplicationsBySelectionIdQuery, useGetApplicationsQuery } = applicationsApiSlice
