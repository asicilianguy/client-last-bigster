// types/announcement.ts
import { AnnouncementPlatform, AnnouncementStatus } from "./enums";
import { Selection } from "./selection";
import { Application } from "./application";

export interface Announcement {
  id: number;
  selezione_id: number;
  piattaforma: AnnouncementPlatform;
  titolo: string;
  descrizione: string;
  link_candidatura: string;
  data_pubblicazione: Date | null;
  data_scadenza: Date | null;
  stato: AnnouncementStatus;
  data_creazione: Date;
  data_modifica: Date;

  // Relazioni
  selezione?: Selection;
  candidature?: Application[];
}

export type AnnouncementCreate = Omit<
  Announcement,
  "id" | "data_creazione" | "data_modifica" | "selezione" | "candidature"
> & {
  stato?: AnnouncementStatus;
};

export type AnnouncementUpdate = Partial<AnnouncementCreate>;

export type AnnouncementWithRelations = Announcement & {
  selezione: Selection;
  candidature: Application[];
};
