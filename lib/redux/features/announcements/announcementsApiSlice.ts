import { apiSlice } from "../api/apiSlice"

export const announcementsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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
      ],
    }),
  }),
})

export const { useGetAnnouncementsBySelectionIdQuery, useCreateAnnouncementMutation, usePublishAnnouncementMutation } =
  announcementsApiSlice
