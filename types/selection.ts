// types/selection.ts
import { SelectionStatus, SelectionType } from "./enums";
import { Department } from "./department";
import { ProfessionalFigure } from "./professionalFigure";
import { User } from "./user";
import { Announcement } from "./announcement";

export interface SelectionStatusHistory {
  id: number;
  selezione_id: number;
  stato_precedente: SelectionStatus;
  stato_nuovo: SelectionStatus;
  risorsa_umana_id: number | null;
  data_cambio: Date;
  note: string | null;
  risorsa_umana?: User | null;
}

export interface Selection {
  id: number;
  titolo: string;
  reparto_id: number;
  figura_professionale_id: number;
  responsabile_id: number;
  risorsa_umana_id: number | null;
  stato: SelectionStatus;
  tipo: SelectionType;
  note: string | null;
  data_creazione: Date;
  data_modifica: Date;
  data_chiusura: Date | null;

  // Relazioni
  reparto?: Department;
  figura_professionale?: ProfessionalFigure;
  responsabile?: User;
  risorsa_umana?: User | null;
  annunci?: Announcement[];
  storico_stati?: SelectionStatusHistory[];
}

export type SelectionCreate = Omit<
  Selection,
  | "id"
  | "data_creazione"
  | "data_modifica"
  | "reparto"
  | "figura_professionale"
  | "responsabile"
  | "risorsa_umana"
  | "annunci"
  | "storico_stati"
> & {
  stato?: SelectionStatus;
};

export type SelectionUpdate = Partial<SelectionCreate>;

export type SelectionWithRelations = Selection & {
  reparto: Department;
  figura_professionale: ProfessionalFigure;
  responsabile: User;
  risorsa_umana: User | null;
  annunci: Announcement[];
  storico_stati: SelectionStatusHistory[];
};
