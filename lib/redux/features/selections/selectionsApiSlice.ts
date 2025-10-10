import { apiSlice } from "../api/apiSlice";
import type {
  SelectionListItem,
  SelectionDetail,
  SelectionByConsulenteItem,
  SelectionResponse,
  SelectionInvoicesStatusResponse,
  CreateSelectionPayload,
  UpdateSelectionPayload,
  AssignHRPayload,
  ChangeStatusPayload,
  GetSelectionsQueryParams,
  DeleteSelectionResponse,
} from "@/types/selection";

export const selectionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSelections: builder.query<SelectionListItem[], GetSelectionsQueryParams>(
      {
        query: (params) => ({ url: "/selections", params }),
        providesTags: (result) =>
          result
            ? [
                ...result.map(({ id }: { id: number }) => ({
                  type: "Selection" as const,
                  id,
                })),
                { type: "Selection", id: "LIST" },
              ]
            : [{ type: "Selection", id: "LIST" }],
      }
    ),
    getSelectionById: builder.query<SelectionDetail, number>({
      query: (id) => `/selections/${id}`,
      providesTags: (result, error, id) => [{ type: "Selection", id }],
    }),
    getSelectionsByConsulente: builder.query<
      SelectionByConsulenteItem[],
      number
    >({
      query: (consulente_id) => `/selections/by-consulente/${consulente_id}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }: { id: number }) => ({
                type: "Selection" as const,
                id,
              })),
              { type: "Selection", id: "LIST" },
            ]
          : [{ type: "Selection", id: "LIST" }],
    }),
    getSelectionInvoicesStatus: builder.query<
      SelectionInvoicesStatusResponse,
      number
    >({
      query: (id) => `/selections/${id}/invoices-status`,
      providesTags: (result, error, id) => [{ type: "Selection", id }],
    }),
    createSelection: builder.mutation<
      SelectionResponse,
      CreateSelectionPayload
    >({
      query: (newSelection) => ({
        url: "/selections",
        method: "POST",
        body: newSelection,
      }),
      invalidatesTags: [{ type: "Selection", id: "LIST" }],
    }),
    updateSelection: builder.mutation<
      SelectionResponse,
      { id: number } & UpdateSelectionPayload
    >({
      query: ({ id, ...data }) => ({
        url: `/selections/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Selection", id },
        { type: "Selection", id: "LIST" },
      ],
    }),
    deleteSelection: builder.mutation<DeleteSelectionResponse, number>({
      query: (id) => ({
        url: `/selections/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Selection", id: "LIST" }],
    }),
    assignHr: builder.mutation<
      SelectionResponse,
      { id: number; risorsa_umana_id: number }
    >({
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
    changeSelectionStatus: builder.mutation<
      SelectionResponse,
      { id: number } & ChangeStatusPayload
    >({
      query: ({ id, nuovo_stato, note }) => ({
        url: `/selections/${id}/change-status`,
        method: "POST",
        body: { nuovo_stato, note },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Selection", id },
        { type: "Selection", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSelectionsQuery,
  useGetSelectionByIdQuery,
  useGetSelectionsByConsulenteQuery,
  useGetSelectionInvoicesStatusQuery,
  useCreateSelectionMutation,
  useUpdateSelectionMutation,
  useDeleteSelectionMutation,
  useAssignHrMutation,
  useChangeSelectionStatusMutation,
} = selectionsApiSlice;
