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
  UpdateJobCollectionJsonPayload,
  DeleteJobCollectionResponse,
} from "@/types/jobCollection";

export const jobCollectionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ============================================
    // UPLOAD URL ENDPOINTS - PDF
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
    // UPLOAD URL ENDPOINTS - JSON
    // ============================================

    /**
     * Genera presigned URL per upload nuovo JSON (dati form)
     * POST /job-collections/upload-json-url/:selectionId
     */
    getUploadJsonUrl: builder.mutation<UploadUrlResponse, number>({
      query: (selectionId) => ({
        url: `/job-collections/upload-json-url/${selectionId}`,
        method: "POST",
      }),
    }),

    /**
     * Genera presigned URL per sostituzione JSON
     * POST /job-collections/:id/replacement-upload-json-url
     */
    getReplacementUploadJsonUrl: builder.mutation<UploadUrlResponse, number>({
      query: (id) => ({
        url: `/job-collections/${id}/replacement-upload-json-url`,
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
     * Aggiorna/Sostituisce il JSON (dopo upload completato)
     * PUT /job-collections/:id/update-json
     */
    updateJobCollectionJson: builder.mutation<
      JobCollectionResponse,
      { id: number } & UpdateJobCollectionJsonPayload
    >({
      query: ({ id, s3_key_json }) => ({
        url: `/job-collections/${id}/update-json`,
        method: "PUT",
        body: { s3_key_json },
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
    // DOWNLOAD URL ENDPOINTS - PDF
    // ============================================

    /**
     * Genera presigned URL per download PDF
     * GET /job-collections/:id/download-url
     */
    getDownloadUrl: builder.query<DownloadUrlResponse, number>({
      query: (id) => `/job-collections/${id}/download-url`,
    }),

    /**
     * Lazy query per download URL PDF (per richieste on-demand)
     */
    lazyGetDownloadUrl: builder.query<DownloadUrlResponse, number>({
      query: (id) => `/job-collections/${id}/download-url`,
    }),

    // ============================================
    // DOWNLOAD URL ENDPOINTS - JSON
    // ============================================

    /**
     * Genera presigned URL per download JSON
     * GET /job-collections/:id/download-json-url
     */
    getDownloadJsonUrl: builder.query<DownloadUrlResponse, number>({
      query: (id) => `/job-collections/${id}/download-json-url`,
    }),

    /**
     * Lazy query per download URL JSON (per richieste on-demand)
     */
    lazyGetDownloadJsonUrl: builder.query<DownloadUrlResponse, number>({
      query: (id) => `/job-collections/${id}/download-json-url`,
    }),
  }),
});

// Export hooks
export const {
  // Mutations per upload PDF
  useGetUploadUrlMutation,
  useGetReplacementUploadUrlMutation,

  // Mutations per upload JSON
  useGetUploadJsonUrlMutation,
  useGetReplacementUploadJsonUrlMutation,

  // CRUD mutations
  useCreateJobCollectionMutation,
  useUpdateJobCollectionMutation,
  useReplaceJobCollectionPdfMutation,
  useUpdateJobCollectionJsonMutation,
  useDeleteJobCollectionMutation,

  // Queries PDF
  useGetJobCollectionByIdQuery,
  useGetJobCollectionBySelectionIdQuery,
  useGetDownloadUrlQuery,
  useLazyGetDownloadUrlQuery,

  // Queries JSON
  useGetDownloadJsonUrlQuery,
  useLazyGetDownloadJsonUrlQuery,
} = jobCollectionsApiSlice;
