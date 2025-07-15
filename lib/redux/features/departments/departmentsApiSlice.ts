import { apiSlice } from "../api/apiSlice"

export const departmentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query({
      query: () => "/departments",
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }: { id: number }) => ({ type: "Department" as const, id })),
              { type: "Department", id: "LIST" },
            ]
          : [{ type: "Department", id: "LIST" }],
    }),
  }),
})

export const { useGetDepartmentsQuery } = departmentsApiSlice
