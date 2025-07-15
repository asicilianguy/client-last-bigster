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
    // Altri endpoint esistenti verranno mantenuti
  }),
})

export const { useGetAnnouncementsQuery } = announcementsApiSlice
