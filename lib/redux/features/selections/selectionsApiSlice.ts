import { apiSlice } from "../api/apiSlice"

export const selectionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSelections: builder.query({
      query: (params) => ({
        url: "/selections",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }: { id: number }) => ({ type: "Selection" as const, id })),
              { type: "Selection", id: "LIST" },
            ]
          : [{ type: "Selection", id: "LIST" }],
    }),
  }),
})

export const { useGetSelectionsQuery } = selectionsApiSlice
