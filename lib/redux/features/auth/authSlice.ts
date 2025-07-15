import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type User = {
  id: number
  nome: string
  cognome: string
  email: string
  ruolo: string
  reparto_id?: number | null
}

type AuthState = {
  user: User | null
  token: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, { payload: { user, token } }: PayloadAction<{ user: User; token: string }>) => {
      state.user = user
      state.token = token
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token)
      }
    },
    logOut: (state) => {
      state.user = null
      state.token = null
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
      }
    },
  },
})

export const { setCredentials, logOut } = authSlice.actions

export default authSlice.reducer

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user
