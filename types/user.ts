// types/user.ts
import { UserRole } from "./enums";
import { Department } from "./department";
import { Selection } from "./selection";

export interface User {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  password?: string;
  ruolo: UserRole;
  reparto_id: number | null;
  data_creazione?: Date;
  data_modifica?: Date;

  // Relazioni
  reparto?: Department | null;
  reparti_gestiti?: Department[];
  selezioni_create?: Selection[];
  selezioni_gestite?: Selection[];
}

export type UserCreate = Omit<
  User,
  | "id"
  | "data_creazione"
  | "data_modifica"
  | "reparto"
  | "reparti_gestiti"
  | "selezioni_create"
  | "selezioni_gestite"
>;

export type UserUpdate = Partial<UserCreate>;

export type UserWithRelations = User & {
  reparto: Department | null;
  reparti_gestiti: Department[];
  selezioni_create: Selection[];
  selezioni_gestite: Selection[];
};
