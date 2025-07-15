import { apiSlice } from "../api/apiSlice"

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsersByRole: builder.query({
      query: (role) => `/users/role/${role}`,
      providesTags: (result, error, role) => [{ type: "User" as const, id: `ROLE_${role}` }],
    }),
  }),
})

export const { useGetUsersByRoleQuery } = usersApiSlice
