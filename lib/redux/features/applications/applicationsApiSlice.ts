import { apiSlice } from "../api/apiSlice"

export const applicationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getApplications: builder.query({
      query: () => "/applications",
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.data.map(({ id }: { id: any }) => ({ type: "Application", id })),
              { type: "Application", id: "LIST" },
            ]
          : [{ type: "Application", id: "LIST" }],
    }),
  }),
})

export const { useGetApplicationsQuery } = applicationsApiSlice
