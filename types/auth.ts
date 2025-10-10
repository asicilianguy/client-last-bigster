// types/auth.ts

import { UserRole } from "./enums";

// ========== Base Types ==========

export interface UserBasic {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo: UserRole;
}

// ========== Request Payloads ==========

export interface LoginPayload {
  email: string;
  password: string;
}

// ========== Response Types ==========

export interface LoginResponse {
  token: string;
  user: UserBasic;
}

export interface VerifyTokenResponse {
  user: UserBasic;
}

export interface LogoutResponse {
  message: string;
}

// ========== Error Response ==========

export interface AuthErrorResponse {
  message: string;
}

// ========== Type Guards ==========

export const isLoginResponse = (obj: any): obj is LoginResponse => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.token === "string" &&
    obj.user !== undefined &&
    typeof obj.user === "object" &&
    typeof obj.user.id === "number" &&
    typeof obj.user.email === "string"
  );
};

export const isVerifyTokenResponse = (obj: any): obj is VerifyTokenResponse => {
  return (
    obj &&
    typeof obj === "object" &&
    obj.user !== undefined &&
    typeof obj.user === "object" &&
    typeof obj.user.id === "number" &&
    typeof obj.user.email === "string"
  );
};
