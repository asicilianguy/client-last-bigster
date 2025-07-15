import { apiSlice } from "../api/apiSlice"

export const professionalFiguresApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfessionalFigures: builder.query({
      query: (departmentId) => `/professional-figures/department/${departmentId}`,
      providesTags: (result, error, departmentId) => [{ type: "ProfessionalFigure", id: departmentId }],
    }),
  }),
})

export const { useGetProfessionalFiguresQuery } = professionalFiguresApiSlice
