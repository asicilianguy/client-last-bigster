import { apiSlice } from "../api/apiSlice"
import { setCredentials, logOut } from "./authSlice"

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials(data))
        } catch (error) {
          console.error(error)
        }
      },
    }),
    verifyToken: builder.query({
      query: () => "/auth/verify",
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
          if (token) {
            dispatch(setCredentials({ user: data.user, token }))
          }
        } catch (error) {
          dispatch(logOut())
        }
      },
    }),
  }),
})

export const { useLoginMutation, useVerifyTokenQuery } = authApiSlice
