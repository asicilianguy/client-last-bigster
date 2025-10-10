// store/slices/authSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { UserBasic } from "@/types/auth";
import { authApiSlice } from "./authApiSlice";

interface AuthState {
  user: UserBasic | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Inizializza lo state dal localStorage
const loadAuthFromStorage = (): AuthState => {
  try {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      const user = JSON.parse(userStr);
      return {
        user,
        token,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error("Errore nel caricamento dati auth dal localStorage:", error);
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
  };
};

const initialState: AuthState = loadAuthFromStorage();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Action per impostare le credenziali manualmente (se necessario)
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserBasic; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      // Salva nel localStorage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },

    // Action per effettuare il logout
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      // Rimuovi dal localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },

    // Action per aggiornare solo i dati utente
    updateUser: (state, action: PayloadAction<UserBasic>) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    // Gestisci il successo del login
    builder.addMatcher(
      authApiSlice.endpoints.login.matchFulfilled,
      (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      }
    );

    // Gestisci il successo della verifica token
    builder.addMatcher(
      authApiSlice.endpoints.verifyToken.matchFulfilled,
      (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      }
    );

    // Gestisci il logout
    builder.addMatcher(
      authApiSlice.endpoints.logout.matchFulfilled,
      (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      }
    );

    // Gestisci errori di autenticazione (401)
    builder.addMatcher(
      (action) =>
        action.type.endsWith("/rejected") && action.payload?.status === 401,
      (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    );
  },
});

export const { setCredentials, clearCredentials, updateUser } =
  authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectCurrentToken = (state: { auth: AuthState }) =>
  state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
