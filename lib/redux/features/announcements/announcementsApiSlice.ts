import { apiSlice } from "../api/apiSlice"

export const announcementsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncementsBySelectionId: builder.query({
      query: (selectionId) => `/selections/${selectionId}/announcements`,
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.data.map(({ id }: { id: any }) => ({ type: "Announcement" as const, id })),
              { type: "Announcement", id: "LIST" },
            ]
          : [{ type: "Announcement", id: "LIST" }],
    }),
    getAnnouncements: builder.query({
      query: (params) => ({
        url: "/announcements",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }: { id: any }) => ({ type: "Announcement" as const, id })),
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
    updateAnnouncement: builder.mutation({
      query: ({ id, ...updatedAnnouncement }) => ({
        url: `/announcements/${id}`,
        method: "PUT",
        body: updatedAnnouncement,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Announcement", id: arg.id },
        { type: "Announcement", id: "LIST" },
      ],
    }),
    deleteAnnouncement: builder.mutation({
      query: (id) => ({
        url: `/announcements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Announcement", id: arg },
        { type: "Announcement", id: "LIST" },
      ],
    }),
  }),
})

export const {
  useGetAnnouncementsBySelectionIdQuery,
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} = announcementsApiSlice
