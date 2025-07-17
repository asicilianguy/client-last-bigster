// types/selection.ts
import { SelectionStatus, SelectionType } from './enums';
import { Department } from './department';
import { ProfessionalFigure } from './professionalFigure';
import { User } from './user';
import { Announcement } from './announcement';

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
}

export type SelectionCreate = Omit<
  Selection, 
  'id' | 'data_creazione' | 'data_modifica' | 'reparto' | 'figura_professionale' | 'responsabile' | 'risorsa_umana' | 'annunci'
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
};