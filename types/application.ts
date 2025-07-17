// types/application.ts
import { ApplicationStatus, InterviewOutcome } from "./enums";
import { Announcement } from "./announcement";

export interface Application {
  id: number;
  annuncio_id: number;
  nome: string;
  cognome: string;
  email: string;
  eta: number | null;
  residenza: string | null;
  titoli_studio: string | null;
  cv_path: string | null;
  stato: ApplicationStatus;

  // Campi relativi al test
  test_inviato_il: Date | null;
  test_completato_il: Date | null;
  test_punteggio_totale: number | null;
  test_valutazione_automatica: string | null;
  test_note_valutazione: string | null;
  test_token_accesso: string | null;

  // Campi relativi ai colloqui
  data_primo_colloquio: Date | null;
  esito_primo_colloquio: InterviewOutcome | null;
  data_colloquio_ceo: Date | null;
  esito_colloquio_ceo: InterviewOutcome | null;

  note: string | null;
  data_creazione: Date;
  data_modifica: Date;

  // Relazioni
  annuncio?: Announcement;
}

export type ApplicationCreate = Omit<
  Application,
  "id" | "data_creazione" | "data_modifica" | "annuncio"
> & {
  stato?: ApplicationStatus;
};

export type ApplicationUpdate = Partial<ApplicationCreate>;

export type ApplicationWithRelations = Application & {
  annuncio: Announcement;
};
