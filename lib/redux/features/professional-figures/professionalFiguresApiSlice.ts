import { apiSlice } from "../api/apiSlice";
import type {
  ProfessionalFigureResponse,
  ProfessionalFigureDetail,
  ProfessionalFigureStatsResponse,
  CreateProfessionalFigurePayload,
  UpdateProfessionalFigurePayload,
  GetProfessionalFiguresQueryParams,
  DeleteProfessionalFigureResponse,
  Seniority,
} from "@/types/professionalFigure";

export const professionalFiguresApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all professional figures with optional filters
    getProfessionalFigures: builder.query<
      ProfessionalFigureResponse[],
      GetProfessionalFiguresQueryParams | void
    >({
      query: (params) => ({
        url: "/professional-figures",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "ProfessionalFigure" as const,
                id,
              })),
              { type: "ProfessionalFigure", id: "LIST" },
            ]
          : [{ type: "ProfessionalFigure", id: "LIST" }],
    }),

    // Get professional figure by ID
    getProfessionalFigureById: builder.query<ProfessionalFigureDetail, number>({
      query: (id) => `/professional-figures/${id}`,
      providesTags: (result, error, id) => [{ type: "ProfessionalFigure", id }],
    }),

    // Get professional figures by seniority
    getProfessionalFiguresBySeniority: builder.query<
      ProfessionalFigureResponse[],
      Seniority
    >({
      query: (seniority) => `/professional-figures/by-seniority/${seniority}`,
      providesTags: (result, error, seniority) => [
        { type: "ProfessionalFigure", id: `SENIORITY_${seniority}` },
        ...(result
          ? result.map(({ id }) => ({
              type: "ProfessionalFigure" as const,
              id,
            }))
          : []),
      ],
    }),

    // Search professional figures
    searchProfessionalFigures: builder.query<
      ProfessionalFigureResponse[],
      string
    >({
      query: (query) => `/professional-figures/search/${query}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "ProfessionalFigure" as const,
                id,
              })),
            ]
          : [],
    }),

    // Get professional figures statistics
    getProfessionalFiguresStats: builder.query<
      ProfessionalFigureStatsResponse,
      void
    >({
      query: () => "/professional-figures/stats",
      providesTags: [{ type: "ProfessionalFigure", id: "STATS" }],
    }),

    // Create professional figure
    createProfessionalFigure: builder.mutation<
      ProfessionalFigureDetail,
      CreateProfessionalFigurePayload
    >({
      query: (newFigure) => ({
        url: "/professional-figures",
        method: "POST",
        body: newFigure,
      }),
      invalidatesTags: [
        { type: "ProfessionalFigure", id: "LIST" },
        { type: "ProfessionalFigure", id: "STATS" },
      ],
    }),

    // Update professional figure
    updateProfessionalFigure: builder.mutation<
      ProfessionalFigureDetail,
      { id: number } & UpdateProfessionalFigurePayload
    >({
      query: ({ id, ...changes }) => ({
        url: `/professional-figures/${id}`,
        method: "PUT",
        body: changes,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ProfessionalFigure", id },
        { type: "ProfessionalFigure", id: "LIST" },
        { type: "ProfessionalFigure", id: "STATS" },
      ],
    }),

    // Delete professional figure
    deleteProfessionalFigure: builder.mutation<
      DeleteProfessionalFigureResponse,
      number
    >({
      query: (id) => ({
        url: `/professional-figures/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "ProfessionalFigure", id: "LIST" },
        { type: "ProfessionalFigure", id: "STATS" },
      ],
    }),
  }),
});

export const {
  useGetProfessionalFiguresQuery,
  useGetProfessionalFigureByIdQuery,
  useGetProfessionalFiguresBySeniorityQuery,
  useSearchProfessionalFiguresQuery,
  useGetProfessionalFiguresStatsQuery,
  useCreateProfessionalFigureMutation,
  useUpdateProfessionalFigureMutation,
  useDeleteProfessionalFigureMutation,
} = professionalFiguresApiSlice;

// Alias for backward compatibility
export const {
  useGetProfessionalFiguresQuery: useGetAllProfessionalFiguresQuery,
} = professionalFiguresApiSlice;
