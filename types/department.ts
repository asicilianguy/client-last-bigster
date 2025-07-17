// types/department.ts
import { User } from "./user";
import { ProfessionalFigure } from "./professionalFigure";
import { Selection } from "./selection";

export interface Department {
  id: number;
  nome: string;
  descrizione: string | null;
  responsabile_id: number | null;
  data_creazione: Date;
  data_modifica: Date;

  // Relazioni
  responsabile?: User | null;
  utenti?: User[];
  figure?: ProfessionalFigure[];
  selezioni?: Selection[];
}

export type DepartmentCreate = Omit<
  Department,
  | "id"
  | "data_creazione"
  | "data_modifica"
  | "responsabile"
  | "utenti"
  | "figure"
  | "selezioni"
>;

export type DepartmentUpdate = Partial<DepartmentCreate>;

export type DepartmentWithRelations = Department & {
  responsabile: User | null;
  utenti: User[];
  figure: ProfessionalFigure[];
  selezioni: Selection[];
};
