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

    // Get all consulenti
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

    // Get user statistics
    getUserStats: builder.query<UserStatsResponse, number>({
      query: (id) => `/users/${id}/stats`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    // Get users by role (backward compatibility)
    getUsersByRole: builder.query<UserResponse[], UserRole>({
      query: (role) => ({ url: "/users", params: { ruolo: role } }),
      providesTags: (result, error, role) => [
        { type: "User" as const, id: `ROLE_${role}` },
      ],
    }),

    // Register new user
    register: builder.mutation<UserResponse, RegisterPayload>({
      query: (newUser) => ({
        url: "/users/register",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
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
      ],
    }),

    // Delete user
    deleteUser: builder.mutation<DeleteUserResponse, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
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
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetConsulentiQuery,
  useGetHRQuery,
  useGetUserStatsQuery,
  useGetUsersByRoleQuery,
  useRegisterMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useChangePasswordMutation,
} = usersApiSlice;
