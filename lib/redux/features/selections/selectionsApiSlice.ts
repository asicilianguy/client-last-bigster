import { apiSlice } from "../api/apiSlice"

export const selectionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSelections: builder.query({
      query: (params) => ({ url: "/selections", params }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }: { id: number }) => ({ type: "Selection" as const, id })),
              { type: "Selection", id: "LIST" },
            ]
          : [{ type: "Selection", id: "LIST" }],
    }),
    getSelectionById: builder.query({
      query: (id) => `/selections/${id}`,
      providesTags: (result, error, id) => [{ type: "Selection", id }],
    }),
    createSelection: builder.mutation({
      query: (newSelection) => ({
        url: "/selections",
        method: "POST",
        body: newSelection,
      }),
      invalidatesTags: [{ type: "Selection", id: "LIST" }],
    }),
    approveSelection: builder.mutation({
      query: (id) => ({
        url: `/selections/${id}/approve`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Selection", id },
        { type: "Selection", id: "LIST" },
      ],
    }),
    assignHr: builder.mutation({
      query: ({ id, risorsa_umana_id }) => ({
        url: `/selections/${id}/assign-hr`,
        method: "POST",
        body: { risorsa_umana_id },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Selection", id },
        { type: "Selection", id: "LIST" },
      ],
    }),
  }),
})

export const {
  useGetSelectionsQuery,
  useGetSelectionByIdQuery,
  useCreateSelectionMutation,
  useApproveSelectionMutation,
  useAssignHrMutation,
} = selectionsApiSlice
