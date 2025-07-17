// types/professionalFigure.ts
import { Seniority } from "./enums";
import { Department } from "./department";
import { Selection } from "./selection";

export interface ProfessionalFigure {
  id: number;
  nome: string;
  seniority: Seniority;
  prerequisiti: string | null;
  descrizione: string;
  reparto_id: number;
  data_creazione: Date;
  data_modifica: Date;

  // Relazioni
  reparto?: Department;
  selezioni?: Selection[];
}

export type ProfessionalFigureCreate = Omit<
  ProfessionalFigure,
  "id" | "data_creazione" | "data_modifica" | "reparto" | "selezioni"
>;

export type ProfessionalFigureUpdate = Partial<ProfessionalFigureCreate>;

export type ProfessionalFigureWithRelations = ProfessionalFigure & {
  reparto: Department;
  selezioni: Selection[];
};
