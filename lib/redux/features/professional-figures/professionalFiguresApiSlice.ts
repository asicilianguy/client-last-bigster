import { apiSlice } from "../api/apiSlice"

export const professionalFiguresApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllProfessionalFigures: builder.query({
      query: () => "/professional-figures",
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }: { id: number }) => ({ type: "ProfessionalFigure" as const, id })),
              { type: "ProfessionalFigure", id: "LIST" },
            ]
          : [{ type: "ProfessionalFigure", id: "LIST" }],
    }),
    getProfessionalFiguresByDepartment: builder.query({
      query: (departmentId) => `/professional-figures/department/${departmentId}`,
      providesTags: (result, error, departmentId) => [{ type: "ProfessionalFigure", id: `DEPT_${departmentId}` }],
    }),
    createProfessionalFigure: builder.mutation({
      query: (newFigure) => ({
        url: "/professional-figures",
        method: "POST",
        body: newFigure,
      }),
      invalidatesTags: [{ type: "ProfessionalFigure", id: "LIST" }],
    }),
    updateProfessionalFigure: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `/professional-figures/${id}`,
        method: "PATCH",
        body: updateData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ProfessionalFigure", id },
        { type: "ProfessionalFigure", id: "LIST" },
      ],
    }),
  }),
})

export const {
  useGetAllProfessionalFiguresQuery,
  useGetProfessionalFiguresByDepartmentQuery,
  useCreateProfessionalFigureMutation,
  useUpdateProfessionalFigureMutation,
} = professionalFiguresApiSlice
