import { apiSlice } from "../api/apiSlice"

export const announcementsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncements: builder.query({
      query: () => "/announcements",
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.data.map(({ id }: { id: any }) => ({ type: "Announcement", id })),
              { type: "Announcement", id: "LIST" },
            ]
          : [{ type: "Announcement", id: "LIST" }],
    }),
    createAnnouncement: builder.mutation({
      query: (newAnnouncement) => ({
        url: "/announcements",
        method: "POST",
        body: newAnnouncement,
      }),
      invalidatesTags: [{ type: "Announcement", id: "LIST" }],
    }),
  }),
})

export const { useGetAnnouncementsQuery, useCreateAnnouncementMutation } = announcementsApiSlice
