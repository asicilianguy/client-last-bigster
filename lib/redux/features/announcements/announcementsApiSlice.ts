import { apiSlice } from "../api/apiSlice"

export const announcementsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncementsBySelectionId: builder.query({
      // FIX: The backend route is /announcements with a query parameter, not /announcements/selection/:id
      query: (selectionId) => `/announcements?selezione_id=${selectionId}`,
      providesTags: (result, error, selectionId) =>
        result && result.data // Add a check for result.data
          ? [
              ...result.data.map(({ id }: { id: number }) => ({ type: "Announcement" as const, id })),
              { type: "Announcement", id: `LIST_${selectionId}` },
            ]
          : [{ type: "Announcement", id: `LIST_${selectionId}` }],
    }),
    createAnnouncement: builder.mutation({
      query: (newAnnouncement) => ({
        url: "/announcements",
        method: "POST",
        body: newAnnouncement,
      }),
      invalidatesTags: (result, error, { selezione_id }) => [{ type: "Announcement", id: `LIST_${selezione_id}` }],
    }),
    publishAnnouncement: builder.mutation({
      query: (id) => ({
        url: `/announcements/${id}/publish`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Announcement", id },
        // Assuming the API returns the updated announcement with the selection ID
        { type: "Selection", id: result?.data?.selezione_id },
        { type: "Announcement", id: `LIST_${result?.data?.selezione_id}` },
      ],
    }),
  }),
})

export const { useGetAnnouncementsBySelectionIdQuery, useCreateAnnouncementMutation, usePublishAnnouncementMutation } =
  announcementsApiSlice
