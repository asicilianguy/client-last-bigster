import { apiSlice } from "../api/apiSlice"

type AnnouncementWithDetails = {
  id: number
  titolo: string
  piattaforma: string
  stato: "PUBBLICATO" | "BOZZA" | "CHIUSO" | "SCADUTO"
  data_creazione: string
  selezione: {
    id: number
    titolo: string
  }
  _count: {
    candidature: number
  }
}

export const announcementsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncements: builder.query<AnnouncementWithDetails[], void>({
      query: () => "/announcements",
      transformResponse: (response: { data: AnnouncementWithDetails[] }) => response.data,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Announcement" as const, id })), { type: "Announcement", id: "LIST" }]
          : [{ type: "Announcement", id: "LIST" }],
    }),
    getAnnouncementsBySelectionId: builder.query({
      // FIX: Use the new RESTful route /selections/:id/announcements
      query: (selectionId) => `selections/${selectionId}/announcements`,
      providesTags: (result, error, selectionId) =>
        result && result.data
          ? [
              ...result.data.map(({ id }: { id: number }) => ({ type: "Announcement" as const, id })),
              { type: "Announcement", id: `LIST_SELECTION_${selectionId}` },
            ]
          : [{ type: "Announcement", id: `LIST_SELECTION_${selectionId}` }],
    }),
    createAnnouncement: builder.mutation({
      query: (newAnnouncement) => ({
        url: "/announcements",
        method: "POST",
        body: newAnnouncement,
      }),
      invalidatesTags: (result, error, { selezione_id }) => [
        { type: "Announcement", id: `LIST_SELECTION_${selezione_id}` },
        { type: "Announcement", id: "LIST" },
      ],
    }),
    publishAnnouncement: builder.mutation({
      query: (id) => ({
        url: `/announcements/${id}/publish`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Announcement", id },
        { type: "Selection", id: result?.data?.selezione_id },
        { type: "Announcement", id: `LIST_SELECTION_${result?.data?.selezione_id}` },
        { type: "Announcement", id: "LIST" },
      ],
    }),
    // Altri endpoint esistenti verranno mantenuti
  }),
})

export const {
  useGetAnnouncementsQuery,
  useGetAnnouncementsBySelectionIdQuery,
  useCreateAnnouncementMutation,
  usePublishAnnouncementMutation,
} = announcementsApiSlice
