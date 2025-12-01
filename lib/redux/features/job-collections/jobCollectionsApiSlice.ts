// lib/redux/features/job-collections/jobCollectionsApiSlice.ts

import { apiSlice } from "../api/apiSlice";
import type {
  JobCollectionResponse,
  JobCollectionDetail,
  UploadUrlResponse,
  DownloadUrlResponse,
  CreateJobCollectionPayload,
  UpdateJobCollectionPayload,
  ReplaceJobCollectionPdfPayload,
  DeleteJobCollectionResponse,
} from "@/types/jobCollection";

export const jobCollectionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ============================================
    // UPLOAD URL ENDPOINTS
    // ============================================

    /**
     * Genera presigned URL per upload nuovo PDF
     * POST /job-collections/upload-url/:selectionId
     */
    getUploadUrl: builder.mutation<UploadUrlResponse, number>({
      query: (selectionId) => ({
        url: `/job-collections/upload-url/${selectionId}`,
        method: "POST",
      }),
    }),

    /**
     * Genera presigned URL per sostituzione PDF
     * POST /job-collections/:id/replacement-upload-url
     */
    getReplacementUploadUrl: builder.mutation<UploadUrlResponse, number>({
      query: (id) => ({
        url: `/job-collections/${id}/replacement-upload-url`,
        method: "POST",
      }),
    }),

    // ============================================
    // CRUD ENDPOINTS
    // ============================================

    /**
     * Crea JobCollection dopo upload completato su S3
     * POST /job-collections
     */
    createJobCollection: builder.mutation<
      JobCollectionResponse,
      CreateJobCollectionPayload
    >({
      query: (payload) => ({
        url: "/job-collections",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, { selezione_id }) => [
        { type: "JobCollection", id: "LIST" },
        { type: "JobCollection", id: `SELECTION_${selezione_id}` },
        { type: "Selection", id: selezione_id },
      ],
    }),

    /**
     * Ottieni JobCollection per ID
     * GET /job-collections/:id
     */
    getJobCollectionById: builder.query<JobCollectionDetail, number>({
      query: (id) => `/job-collections/${id}`,
      providesTags: (result, error, id) => [
        { type: "JobCollection", id },
        ...(result
          ? [{ type: "Selection" as const, id: result.selezione_id }]
          : []),
      ],
    }),

    /**
     * Ottieni JobCollection per selezione
     * GET /job-collections/selection/:selectionId
     */
    getJobCollectionBySelectionId: builder.query<JobCollectionResponse, number>(
      {
        query: (selectionId) => `/job-collections/selection/${selectionId}`,
        providesTags: (result, error, selectionId) => [
          { type: "JobCollection", id: `SELECTION_${selectionId}` },
          ...(result
            ? [{ type: "JobCollection" as const, id: result.id }]
            : []),
        ],
      }
    ),

    /**
     * Aggiorna workflow JobCollection (invio/approvazione cliente)
     * PUT /job-collections/:id
     */
    updateJobCollection: builder.mutation<
      JobCollectionResponse,
      { id: number } & UpdateJobCollectionPayload
    >({
      query: ({ id, ...data }) => ({
        url: `/job-collections/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "JobCollection", id },
        ...(result
          ? [
              {
                type: "JobCollection" as const,
                id: `SELECTION_${result.selezione_id}`,
              },
              { type: "Selection" as const, id: result.selezione_id },
            ]
          : []),
      ],
    }),

    /**
     * Sostituisce il PDF (dopo upload completato)
     * PUT /job-collections/:id/replace-pdf
     */
    replaceJobCollectionPdf: builder.mutation<
      JobCollectionResponse,
      { id: number } & ReplaceJobCollectionPdfPayload
    >({
      query: ({ id, s3_key }) => ({
        url: `/job-collections/${id}/replace-pdf`,
        method: "PUT",
        body: { s3_key },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "JobCollection", id },
        ...(result
          ? [
              {
                type: "JobCollection" as const,
                id: `SELECTION_${result.selezione_id}`,
              },
              { type: "Selection" as const, id: result.selezione_id },
            ]
          : []),
      ],
    }),

    /**
     * Elimina JobCollection (e file S3)
     * DELETE /job-collections/:id
     */
    deleteJobCollection: builder.mutation<DeleteJobCollectionResponse, number>({
      query: (id) => ({
        url: `/job-collections/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "JobCollection", id: "LIST" }],
    }),

    // ============================================
    // DOWNLOAD URL ENDPOINT
    // ============================================

    /**
     * Genera presigned URL per download
     * GET /job-collections/:id/download-url
     */
    getDownloadUrl: builder.query<DownloadUrlResponse, number>({
      query: (id) => `/job-collections/${id}/download-url`,
      // Non mettiamo providesTags perché l'URL è temporaneo e non va cachato a lungo
    }),

    /**
     * Lazy query per download URL (per richieste on-demand)
     */
    lazyGetDownloadUrl: builder.query<DownloadUrlResponse, number>({
      query: (id) => `/job-collections/${id}/download-url`,
    }),
  }),
});

// Export hooks
export const {
  // Mutations per upload
  useGetUploadUrlMutation,
  useGetReplacementUploadUrlMutation,

  // CRUD mutations
  useCreateJobCollectionMutation,
  useUpdateJobCollectionMutation,
  useReplaceJobCollectionPdfMutation,
  useDeleteJobCollectionMutation,

  // Queries
  useGetJobCollectionByIdQuery,
  useGetJobCollectionBySelectionIdQuery,
  useGetDownloadUrlQuery,
  useLazyGetDownloadUrlQuery,
} = jobCollectionsApiSlice;
