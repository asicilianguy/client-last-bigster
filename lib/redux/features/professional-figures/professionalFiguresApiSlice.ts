import { apiSlice } from "../api/apiSlice";

export type ProfessionalFigure = {
  id: number;
  nome: string;
  seniority: string;
  descrizione: string;
  prerequisiti: string;
  reparto_id: number;
  reparto?: {
    id: number;
    nome: string;
  };
};

export const professionalFiguresApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfessionalFigures: builder.query<{ data: ProfessionalFigure[] }, void>(
      {
        query: () => "/professional-figures",
        providesTags: (result) =>
          result
            ? [
                ...result.data.map(({ id }) => ({
                  type: "ProfessionalFigure" as const,
                  id,
                })),
                { type: "ProfessionalFigure", id: "LIST" },
              ]
            : [{ type: "ProfessionalFigure", id: "LIST" }],
      }
    ),
    getProfessionalFiguresByDepartment: builder.query<
      { data: ProfessionalFigure[] },
      number | null | undefined
    >({
      query: (departmentId) => {
        // Se departmentId è null o undefined, restituiamo tutte le figure professionali
        if (departmentId === null || departmentId === undefined) {
          return `/professional-figures`;
        }
        return `/professional-figures/department/${departmentId}`;
      },
      providesTags: (result, error, departmentId) => [
        {
          type: "ProfessionalFigure",
          id: departmentId ? `DEPT_${departmentId}` : "LIST",
        },
        ...(result?.data
          ? result.data.map(({ id }) => ({
              type: "ProfessionalFigure" as const,
              id,
            }))
          : []),
      ],
    }),
    getProfessionalFigureById: builder.query<
      { data: ProfessionalFigure },
      number
    >({
      query: (id) => `/professional-figures/${id}`,
      providesTags: (result, error, id) => [{ type: "ProfessionalFigure", id }],
    }),
    createProfessionalFigure: builder.mutation<
      { data: ProfessionalFigure },
      Partial<ProfessionalFigure>
    >({
      query: (newFigure) => ({
        url: "/professional-figures",
        method: "POST",
        body: newFigure,
      }),
      invalidatesTags: [{ type: "ProfessionalFigure", id: "LIST" }],
    }),
    updateProfessionalFigure: builder.mutation<
      { data: ProfessionalFigure },
      { id: number } & Partial<ProfessionalFigure>
    >({
      query: ({ id, ...updateData }) => ({
        url: `/professional-figures/${id}`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ProfessionalFigure", id },
        { type: "ProfessionalFigure", id: "LIST" },
      ],
    }),
    deleteProfessionalFigure: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/professional-figures/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "ProfessionalFigure", id },
        { type: "ProfessionalFigure", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProfessionalFiguresQuery,
  useGetProfessionalFiguresByDepartmentQuery,
  useGetProfessionalFigureByIdQuery,
  useCreateProfessionalFigureMutation,
  useUpdateProfessionalFigureMutation,
  useDeleteProfessionalFigureMutation,
} = professionalFiguresApiSlice;

// Alias per compatibilità con il codice esistente
export const {
  useGetProfessionalFiguresQuery: useGetAllProfessionalFiguresQuery,
} = professionalFiguresApiSlice;
