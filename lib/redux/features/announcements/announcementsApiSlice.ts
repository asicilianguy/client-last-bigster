import { apiSlice } from "../api/apiSlice";
import type {
  AnnouncementListItem,
  AnnouncementDetail,
  AnnouncementBySelectionItem,
  AnnouncementByCompanyItem,
  AnnouncementResponse,
  PublishAnnouncementResponse,
  CloseAnnouncementResponse,
  AnnouncementStatsResponse,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
  PublishAnnouncementPayload,
  GetAnnouncementsQueryParams,
  DeleteAnnouncementResponse,
} from "@/types/announcement";

export const announcementsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all announcements with optional filters
    getAnnouncements: builder.query<
      AnnouncementListItem[],
      GetAnnouncementsQueryParams | void
    >({
      query: (params) => ({
        url: "/announcements",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Announcement" as const,
                id,
              })),
              { type: "Announcement", id: "LIST" },
            ]
          : [{ type: "Announcement", id: "LIST" }],
    }),

    // Get announcement by ID
    getAnnouncementById: builder.query<AnnouncementDetail, number>({
      query: (id) => `/announcements/${id}`,
      providesTags: (result, error, id) => [
        { type: "Announcement" as const, id },
      ],
    }),

    // Get announcements by selection
    getAnnouncementsBySelection: builder.query<
      AnnouncementBySelectionItem[],
      number
    >({
      query: (selezione_id) => `/announcements/by-selection/${selezione_id}`,
      providesTags: (result, error, selezione_id) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Announcement" as const,
                id,
              })),
              { type: "Announcement", id: `LIST_SELECTION_${selezione_id}` },
            ]
          : [{ type: "Announcement", id: `LIST_SELECTION_${selezione_id}` }],
    }),

    // Get announcements by company
    getAnnouncementsByCompany: builder.query<
      AnnouncementByCompanyItem[],
      number
    >({
      query: (company_id) => `/announcements/by-company/${company_id}`,
      providesTags: (result, error, company_id) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Announcement" as const,
                id,
              })),
              { type: "Announcement", id: `LIST_COMPANY_${company_id}` },
            ]
          : [{ type: "Announcement", id: `LIST_COMPANY_${company_id}` }],
    }),

    // Get announcement statistics
    getAnnouncementStats: builder.query<AnnouncementStatsResponse, void>({
      query: () => "/announcements/stats",
      providesTags: [{ type: "Announcement", id: "STATS" }],
    }),

    // Create announcement
    createAnnouncement: builder.mutation<
      AnnouncementResponse,
      CreateAnnouncementPayload
    >({
      query: (newAnnouncement) => ({
        url: "/announcements",
        method: "POST",
        body: newAnnouncement,
      }),
      invalidatesTags: (result, error, { selezione_id, company_id }) => [
        { type: "Announcement", id: "LIST" },
        { type: "Announcement", id: `LIST_SELECTION_${selezione_id}` },
        { type: "Announcement", id: `LIST_COMPANY_${company_id}` },
        { type: "Selection", id: selezione_id },
        { type: "Announcement", id: "STATS" },
      ],
    }),

    // Update announcement
    updateAnnouncement: builder.mutation<
      AnnouncementResponse,
      { id: number } & UpdateAnnouncementPayload
    >({
      query: ({ id, ...changes }) => ({
        url: `/announcements/${id}`,
        method: "PUT",
        body: changes,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Announcement", id },
        { type: "Announcement", id: "LIST" },
        ...(result
          ? [
              { type: "Selection" as const, id: result.selezione_id },
              {
                type: "Announcement" as const,
                id: `LIST_SELECTION_${result.selezione_id}`,
              },
              {
                type: "Announcement" as const,
                id: `LIST_COMPANY_${result.company_id}`,
              },
            ]
          : []),
      ],
    }),

    // Publish announcement
    publishAnnouncement: builder.mutation<
      PublishAnnouncementResponse,
      { id: number } & PublishAnnouncementPayload
    >({
      query: ({ id, ...body }) => ({
        url: `/announcements/${id}/publish`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Announcement", id },
        { type: "Announcement", id: "LIST" },
        { type: "Announcement", id: "STATS" },
        ...(result
          ? [
              { type: "Selection" as const, id: result.selezione_id },
              {
                type: "Announcement" as const,
                id: `LIST_SELECTION_${result.selezione_id}`,
              },
              {
                type: "Announcement" as const,
                id: `LIST_COMPANY_${result.company_id}`,
              },
            ]
          : []),
      ],
    }),

    // Close announcement
    closeAnnouncement: builder.mutation<CloseAnnouncementResponse, number>({
      query: (id) => ({
        url: `/announcements/${id}/close`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Announcement", id },
        { type: "Announcement", id: "LIST" },
        { type: "Announcement", id: "STATS" },
        ...(result
          ? [
              { type: "Selection" as const, id: result.selezione_id },
              {
                type: "Announcement" as const,
                id: `LIST_SELECTION_${result.selezione_id}`,
              },
              {
                type: "Announcement" as const,
                id: `LIST_COMPANY_${result.company_id}`,
              },
            ]
          : []),
      ],
    }),

    // Delete announcement
    deleteAnnouncement: builder.mutation<DeleteAnnouncementResponse, number>({
      query: (id) => ({
        url: `/announcements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Announcement", id: "LIST" },
        { type: "Announcement", id: "STATS" },
      ],
    }),
  }),
});

export const {
  useGetAnnouncementsQuery,
  useGetAnnouncementByIdQuery,
  useGetAnnouncementsBySelectionQuery,
  useGetAnnouncementsByCompanyQuery,
  useGetAnnouncementStatsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  usePublishAnnouncementMutation,
  useCloseAnnouncementMutation,
  useDeleteAnnouncementMutation,
} = announcementsApiSlice;

// Alias for backward compatibility
export const {
  useGetAnnouncementsBySelectionQuery: useGetAnnouncementsBySelectionIdQuery,
} = announcementsApiSlice;
