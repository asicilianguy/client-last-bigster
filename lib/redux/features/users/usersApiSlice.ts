import { apiSlice } from "../api/apiSlice";
import type {
  UserResponse,
  UserDetail,
  UserWithSelectionCount,
  UserStatsResponse,
  RegisterPayload,
  UpdateUserPayload,
  ChangePasswordPayload,
  GetUsersQueryParams,
  DeleteUserResponse,
  ChangePasswordResponse,
  UserRole,
} from "@/types/user";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all users with optional role filter
    getUsers: builder.query<UserResponse[], GetUsersQueryParams>({
      query: (params) => ({ url: "/users", params }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    // Get user by ID
    getUserById: builder.query<UserDetail, number>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    // Get all consulenti (only accessible by AMMINISTRAZIONE)
    getConsulenti: builder.query<UserWithSelectionCount[], void>({
      query: () => "/users/consulenti",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User", id: "CONSULENTI" },
            ]
          : [{ type: "User", id: "CONSULENTI" }],
    }),

    // Get all HR
    getHR: builder.query<UserWithSelectionCount[], void>({
      query: () => "/users/hr",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User", id: "HR" },
            ]
          : [{ type: "User", id: "HR" }],
    }),

    // Get all Responsabili Risorse Umane
    getResponsabiliRU: builder.query<UserWithSelectionCount[], void>({
      query: () => "/users/responsabili-ru",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User", id: "RESPONSABILI_RU" },
            ]
          : [{ type: "User", id: "RESPONSABILI_RU" }],
    }),

    // Get all Amministrazione users
    getAmministrazione: builder.query<UserResponse[], void>({
      query: () => "/users/amministrazione",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User", id: "AMMINISTRAZIONE" },
            ]
          : [{ type: "User", id: "AMMINISTRAZIONE" }],
    }),

    // Get users by specific role
    getUsersByRole: builder.query<UserResponse[], UserRole>({
      query: (role) => `/users/by-role/${role}`,
      providesTags: (result, error, role) => [
        { type: "User" as const, id: `ROLE_${role}` },
      ],
    }),

    // Get user statistics
    getUserStats: builder.query<UserStatsResponse, number>({
      query: (id) => `/users/${id}/stats`,
      providesTags: (result, error, id) => [
        { type: "User", id },
        { type: "User", id: "STATS" },
      ],
    }),

    // Register new user
    register: builder.mutation<UserResponse, RegisterPayload>({
      query: (newUser) => ({
        url: "/users/register",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: [
        { type: "User", id: "LIST" },
        { type: "User", id: "CONSULENTI" },
        { type: "User", id: "HR" },
        { type: "User", id: "RESPONSABILI_RU" },
        { type: "User", id: "AMMINISTRAZIONE" },
      ],
    }),

    // Update user
    updateUser: builder.mutation<
      UserResponse,
      { id: number } & UpdateUserPayload
    >({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
        { type: "User", id: "CONSULENTI" },
        { type: "User", id: "HR" },
        { type: "User", id: "RESPONSABILI_RU" },
        { type: "User", id: "AMMINISTRAZIONE" },
        { type: "User", id: "STATS" },
      ],
    }),

    // Delete user
    deleteUser: builder.mutation<DeleteUserResponse, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
        { type: "User", id: "CONSULENTI" },
        { type: "User", id: "HR" },
        { type: "User", id: "RESPONSABILI_RU" },
        { type: "User", id: "AMMINISTRAZIONE" },
      ],
    }),

    // Change password
    changePassword: builder.mutation<
      ChangePasswordResponse,
      { id: number } & ChangePasswordPayload
    >({
      query: ({ id, old_password, new_password }) => ({
        url: `/users/${id}/change-password`,
        method: "POST",
        body: { old_password, new_password },
      }),
      // Non invalida cache perché il cambio password non modifica i dati pubblici
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetConsulentiQuery,
  useGetHRQuery,
  useGetResponsabiliRUQuery,
  useGetAmministrazioneQuery,
  useGetUsersByRoleQuery,
  useGetUserStatsQuery,
  useRegisterMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useChangePasswordMutation,
} = usersApiSlice;
