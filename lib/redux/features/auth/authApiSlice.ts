// store/api/authApiSlice.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  LoginPayload,
  LoginResponse,
  VerifyTokenResponse,
  LogoutResponse,
  AuthErrorResponse,
} from "@/types/auth";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api";

export const authApiSlice = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/auth`,
    prepareHeaders: (headers, { getState }) => {
      // Recupera il token dallo state (se hai uno slice per l'auth)
      // const token = (getState() as RootState).auth.token;

      // Oppure dal localStorage
      const token = localStorage.getItem("token");

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    // Login
    login: builder.mutation<LoginResponse, LoginPayload>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      transformErrorResponse: (response: {
        status: number;
        data: AuthErrorResponse;
      }) => {
        return response.data;
      },
      // Dopo il login con successo, salva il token
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch (error) {
          // Gestione errore
        }
      },
    }),

    // Verifica token
    verifyToken: builder.query<VerifyTokenResponse, void>({
      query: () => ({
        url: "/verify",
        method: "GET",
      }),
      providesTags: ["Auth"],
      transformErrorResponse: (response: {
        status: number;
        data: AuthErrorResponse;
      }) => {
        return response.data;
      },
    }),

    // Logout
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      // Dopo il logout, rimuovi il token
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } catch (error) {
          // Anche in caso di errore, rimuovi il token locale
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      },
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useLoginMutation,
  useVerifyTokenQuery,
  useLazyVerifyTokenQuery,
  useLogoutMutation,
} = authApiSlice;
