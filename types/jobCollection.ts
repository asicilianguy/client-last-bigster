import { ContractType, WorkMode } from "./enums";

export interface JobCollectionBase {
  id: number;
  selezione_id: number;
  titolo_posizione: string;
  descrizione_ruolo: string;
  competenze_richieste: string;
  competenze_preferenziali?: string | null;
  esperienza_richiesta?: string | null;
  titoli_studio_richiesti?: string | null;
  soft_skills?: string | null;
  benefit_offerti?: string | null;
  range_retributivo?: string | null;
  sede_lavoro?: string | null;
  modalita_lavoro?: WorkMode | null;
  tipo_contratto?: ContractType | null;
  orario_lavoro?: string | null;
  note_aggiuntive?: string | null;
  inviata_al_cliente: boolean;
  data_invio_cliente?: string | null;
  approvata_dal_cliente: boolean;
  data_approvazione_cliente?: string | null;
  note_cliente?: string | null;
  file_path?: string | null;
  data_creazione: string;
  data_modifica: string;
}

export interface JobCollectionResponse extends JobCollectionBase {}

export interface CreateJobCollectionPayload {
  selezione_id: number;
  titolo_posizione: string;
  descrizione_ruolo: string;
  competenze_richieste: string;
  competenze_preferenziali?: string;
  esperienza_richiesta?: string;
  titoli_studio_richiesti?: string;
  soft_skills?: string;
  benefit_offerti?: string;
  range_retributivo?: string;
  sede_lavoro?: string;
  modalita_lavoro?: WorkMode;
  tipo_contratto?: ContractType;
  orario_lavoro?: string;
  note_aggiuntive?: string;
}

export interface UpdateJobCollectionPayload {
  titolo_posizione?: string;
  descrizione_ruolo?: string;
  competenze_richieste?: string;
  competenze_preferenziali?: string | null;
  esperienza_richiesta?: string | null;
  titoli_studio_richiesti?: string | null;
  soft_skills?: string | null;
  benefit_offerti?: string | null;
  range_retributivo?: string | null;
  sede_lavoro?: string | null;
  modalita_lavoro?: WorkMode | null;
  tipo_contratto?: ContractType | null;
  orario_lavoro?: string | null;
  note_aggiuntive?: string | null;
}

export interface SendJobCollectionToClientPayload {
  note_aggiuntive?: string;
}

export interface ApproveJobCollectionPayload {
  approvata_dal_cliente: boolean;
  note_cliente?: string;
}
