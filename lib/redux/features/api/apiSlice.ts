import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { RootState } from "../../store"

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set("authorization", `Bearer ${token}`)
    }
    return headers
  },
})

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["User", "Department", "Selection", "Announcement", "Application", "ProfessionalFigure"],
  endpoints: (builder) => ({}),
})
