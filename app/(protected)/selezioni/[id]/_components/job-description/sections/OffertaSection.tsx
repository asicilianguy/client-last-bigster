// ========================================================================
// sections/OffertaSection.tsx
// Sezione Offerta contrattuale e benefits
// ========================================================================

"use client";

import { Gift, Euro, Clock, FileCheck } from "lucide-react";
import {
  JobDescriptionForm,
  JobDescriptionType,
  ContractTypeJD,
  RequirementLevel,
  WorkSchedule,
  CONTRACT_TYPE_LABELS,
  REQUIREMENT_LEVEL_LABELS,
  WORK_SCHEDULE_LABELS,
} from "@/types/jobDescription";

interface OffertaSectionProps {
  formData: JobDescriptionForm;
  updateFormData: <K extends keyof JobDescriptionForm>(
    key: K,
    value: JobDescriptionForm[K]
  ) => void;
  updateNestedData: <K extends keyof JobDescriptionForm>(
    key: K,
    nestedKey: string,
    value: any
  ) => void;
  tipo: JobDescriptionType;
  inputBase: string;
}

export function OffertaSection({
  formData,
  updateFormData,
  inputBase,
}: OffertaSectionProps) {
  const offerta = formData.offerta;

  const updateField = (field: string, value: any) => {
    updateFormData("offerta", {
      ...offerta,
      [field]: value,
    });
  };

  const updateBenefit = (field: string, value: any) => {
    updateFormData("offerta", {
      ...offerta,
      benefits: {
        ...offerta.benefits,
        [field]: value,
      },
    });
  };

  // Toggle tipo contratto
  const toggleContractType = (type: ContractTypeJD) => {
    const current = offerta.tipi_contratto || [];
    if (current.includes(type)) {
      updateField(
        "tipi_contratto",
        current.filter((t) => t !== type)
      );
    } else {
      updateField("tipi_contratto", [...current, type]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Info Box */}
      <div className="p-4 bg-green-50 border border-green-200">
        <div className="flex items-start gap-3">
          <Gift className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800 mb-1">
              Dettagli dell'Offerta
            </p>
            <p className="text-xs text-green-700">
              Compila i dati relativi all'offerta che il cliente prevede per la
              persona da inserire.
            </p>
          </div>
        </div>
      </div>

      {/* Prima riga: Numero persone e Motivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bigster-text">
            Numero Persone Ricercate
          </label>
          <input
            type="number"
            min="1"
            value={offerta.numero_persone}
            onChange={(e) =>
              updateField("numero_persone", parseInt(e.target.value) || 1)
            }
            className={`${inputBase} w-32`}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-bigster-text">
            Motivo della Ricerca
          </label>
          <input
            type="text"
            value={offerta.motivo_ricerca}
            onChange={(e) => updateField("motivo_ricerca", e.target.value)}
            placeholder="Es: Ampliamento organico, sostituzione maternità..."
            className={inputBase}
          />
        </div>
      </div>

      {/* Età, Patente, Automunita */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Età */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bigster-text">Età</label>
          <input
            type="text"
            value={offerta.eta}
            onChange={(e) => updateField("eta", e.target.value)}
            placeholder="Es: 25-40 anni"
            className={inputBase}
          />
          <div className="flex gap-2 mt-2">
            {Object.entries(REQUIREMENT_LEVEL_LABELS).map(([key, label]) => (
              <label key={key} className="flex items-center gap-1 text-xs">
                <input
                  type="radio"
                  name="eta_livello"
                  checked={offerta.eta_livello === key}
                  onChange={() =>
                    updateField("eta_livello", key as RequirementLevel)
                  }
                  className="w-3 h-3"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Patente */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bigster-text">
            Patente
          </label>
          <div className="space-y-1">
            {Object.entries(REQUIREMENT_LEVEL_LABELS).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 text-sm text-bigster-text"
              >
                <input
                  type="radio"
                  name="patente"
                  checked={offerta.patente === key}
                  onChange={() =>
                    updateField("patente", key as RequirementLevel)
                  }
                  className="w-4 h-4"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Automunita */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bigster-text">
            Automunita
          </label>
          <div className="space-y-1">
            {Object.entries(REQUIREMENT_LEVEL_LABELS).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 text-sm text-bigster-text"
              >
                <input
                  type="radio"
                  name="automunita"
                  checked={offerta.automunita === key}
                  onChange={() =>
                    updateField("automunita", key as RequirementLevel)
                  }
                  className="w-4 h-4"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Tipo Contratto */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-bigster-text flex items-center gap-2">
          <FileCheck className="h-4 w-4" />
          Tipo di Contratto Previsto
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(CONTRACT_TYPE_LABELS).map(([key, label]) => (
            <label
              key={key}
              className={`flex items-center gap-2 p-3 border cursor-pointer transition-all ${
                offerta.tipi_contratto?.includes(key as ContractTypeJD)
                  ? "bg-bigster-primary/10 border-yellow-400"
                  : "bg-bigster-card-bg border-bigster-border hover:border-bigster-text"
              }`}
            >
              <input
                type="checkbox"
                checked={
                  offerta.tipi_contratto?.includes(key as ContractTypeJD) ||
                  false
                }
                onChange={() => toggleContractType(key as ContractTypeJD)}
                className="w-4 h-4 rounded-none"
              />
              <span className="text-xs text-bigster-text">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Orario di Lavoro - NUOVO DESIGN */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-bigster-text flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Orario di Lavoro
        </label>

        {/* Descrizione orario dettagliato */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-bigster-text-muted">
            Descrizione Orario
          </label>
          <textarea
            value={offerta.orario_dettaglio}
            onChange={(e) => updateField("orario_dettaglio", e.target.value)}
            placeholder="Es: LUN-MAR-MER-VEN: 9:00/13:00 – 15:30/19:30&#10;GIOV: 10:00/18:00&#10;SAB: 9:00/13:00 (nella fase estiva ridotto)"
            className={inputBase}
            rows={4}
          />
        </div>

        {/* Tipo impegno: Part-time / Full-time */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-bigster-text-muted">
            Tipo di Impegno
          </label>

          <div className="space-y-3">
            {/* Part-time */}
            <div className="p-4 bg-bigster-card-bg border border-bigster-border space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="tipo_impegno"
                  checked={offerta.orario === WorkSchedule.PART_TIME}
                  onChange={() => updateField("orario", WorkSchedule.PART_TIME)}
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium text-bigster-text">
                  Part-time
                </span>
              </label>
              {offerta.orario === WorkSchedule.PART_TIME && (
                <input
                  type="text"
                  value={offerta.orario_part_time_dettagli || ""}
                  onChange={(e) =>
                    updateField("orario_part_time_dettagli", e.target.value)
                  }
                  placeholder="Es: 30 ore dal lunedì al sabato, obiettivo passaggio a full-time 36/40 ore"
                  className={inputBase}
                />
              )}
            </div>

            {/* Full-time */}
            <div className="p-4 bg-bigster-card-bg border border-bigster-border space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="tipo_impegno"
                  checked={offerta.orario === WorkSchedule.FULL_TIME}
                  onChange={() => updateField("orario", WorkSchedule.FULL_TIME)}
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium text-bigster-text">
                  Full-time
                </span>
              </label>
              {offerta.orario === WorkSchedule.FULL_TIME && (
                <input
                  type="text"
                  value={offerta.orario_full_time_dettagli || ""}
                  onChange={(e) =>
                    updateField("orario_full_time_dettagli", e.target.value)
                  }
                  placeholder="Es: 36/40 ore settimanali"
                  className={inputBase}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compenso */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bigster-text flex items-center gap-2">
            <Euro className="h-4 w-4" />
            Compenso Mensile Netto
          </label>
          <input
            type="text"
            value={offerta.compenso_mensile_netto}
            onChange={(e) =>
              updateField("compenso_mensile_netto", e.target.value)
            }
            placeholder="Es: 1.500€ - 1.800€"
            className={inputBase}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-bigster-text">
            Composizione Retribuzione
          </label>
          <input
            type="text"
            value={offerta.composizione_retribuzione}
            onChange={(e) =>
              updateField("composizione_retribuzione", e.target.value)
            }
            placeholder="Es: Fisso + variabile, solo fisso..."
            className={inputBase}
          />
        </div>
      </div>

      {/* Prospettive di Crescita */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-bigster-text">
          Prospettive di Crescita
        </label>
        <textarea
          value={offerta.prospettive_crescita}
          onChange={(e) => updateField("prospettive_crescita", e.target.value)}
          placeholder="Vi sono opportunità di crescita? In cosa si traducono?"
          className={inputBase}
          rows={3}
        />
      </div>

      {/* Benefits - AGGIORNATO CON PIÙ OPZIONI */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-bigster-text">
          Altri Elementi dell'Offerta / Benefits
        </label>
        <p className="text-xs text-bigster-text-muted">
          Cosa altro potrà trovare la persona nello studio?
        </p>

        <div className="space-y-2">
          {/* Affiancamenti */}
          <label className="flex items-start gap-2 p-3 bg-bigster-card-bg border border-bigster-border cursor-pointer">
            <input
              type="checkbox"
              checked={offerta.benefits.affiancamenti || false}
              onChange={(e) => updateBenefit("affiancamenti", e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded-none"
            />
            <div className="flex-1">
              <span className="text-sm text-bigster-text font-medium">
                Affiancamenti
              </span>
            </div>
          </label>

          {/* Auto aziendale */}
          <label className="flex items-start gap-2 p-3 bg-bigster-card-bg border border-bigster-border cursor-pointer">
            <input
              type="checkbox"
              checked={offerta.benefits.auto_aziendale || false}
              onChange={(e) =>
                updateBenefit("auto_aziendale", e.target.checked)
              }
              className="w-5 h-5 mt-0.5 rounded-none"
            />
            <div className="flex-1">
              <span className="text-sm text-bigster-text font-medium">
                Auto aziendale
              </span>
            </div>
          </label>

          {/* Benefits (con specifica) */}
          <div className="p-3 bg-bigster-card-bg border border-bigster-border space-y-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={offerta.benefits.benefits || false}
                onChange={(e) => updateBenefit("benefits", e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded-none"
              />
              <div className="flex-1">
                <span className="text-sm text-bigster-text font-medium">
                  Benefits (specificare)
                </span>
              </div>
            </label>
            {offerta.benefits.benefits && (
              <input
                type="text"
                value={offerta.benefits.benefits_specifica || ""}
                onChange={(e) =>
                  updateBenefit("benefits_specifica", e.target.value)
                }
                placeholder="Specificare i benefits offerti..."
                className={inputBase}
              />
            )}
          </div>

          {/* Corsi di aggiornamento */}
          <label className="flex items-start gap-2 p-3 bg-bigster-card-bg border border-bigster-border cursor-pointer">
            <input
              type="checkbox"
              checked={offerta.benefits.corsi_aggiornamento || false}
              onChange={(e) =>
                updateBenefit("corsi_aggiornamento", e.target.checked)
              }
              className="w-5 h-5 mt-0.5 rounded-none"
            />
            <div className="flex-1">
              <span className="text-sm text-bigster-text font-medium">
                Corsi di aggiornamento professionale
              </span>
            </div>
          </label>

          {/* Incentivi (con specifica) */}
          <div className="p-3 bg-bigster-card-bg border border-bigster-border space-y-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={offerta.benefits.incentivi || false}
                onChange={(e) => updateBenefit("incentivi", e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded-none"
              />
              <div className="flex-1">
                <span className="text-sm text-bigster-text font-medium">
                  Incentivi
                </span>
              </div>
            </label>
            {offerta.benefits.incentivi && (
              <input
                type="text"
                value={offerta.benefits.incentivi_specifica || ""}
                onChange={(e) =>
                  updateBenefit("incentivi_specifica", e.target.value)
                }
                placeholder="Es: Scattano al rinnovo del contratto"
                className={inputBase}
              />
            )}
          </div>

          {/* Quote societarie */}
          <label className="flex items-start gap-2 p-3 bg-bigster-card-bg border border-bigster-border cursor-pointer">
            <input
              type="checkbox"
              checked={offerta.benefits.quote_societarie || false}
              onChange={(e) =>
                updateBenefit("quote_societarie", e.target.checked)
              }
              className="w-5 h-5 mt-0.5 rounded-none"
            />
            <div className="flex-1">
              <span className="text-sm text-bigster-text font-medium">
                Possibilità di acquisire quote societarie
              </span>
            </div>
          </label>

          {/* Rimborso spese */}
          <label className="flex items-start gap-2 p-3 bg-bigster-card-bg border border-bigster-border cursor-pointer">
            <input
              type="checkbox"
              checked={offerta.benefits.rimborso_spese || false}
              onChange={(e) =>
                updateBenefit("rimborso_spese", e.target.checked)
              }
              className="w-5 h-5 mt-0.5 rounded-none"
            />
            <div className="flex-1">
              <span className="text-sm text-bigster-text font-medium">
                Rimborso spese
              </span>
            </div>
          </label>

          {/* Altro (con specifica) */}
          <div className="p-3 bg-bigster-card-bg border border-bigster-border space-y-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={offerta.benefits.altro || false}
                onChange={(e) => updateBenefit("altro", e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded-none"
              />
              <div className="flex-1">
                <span className="text-sm text-bigster-text font-medium">
                  Altro (specificare)
                </span>
              </div>
            </label>
            {offerta.benefits.altro && (
              <input
                type="text"
                value={offerta.benefits.altro_specifica || ""}
                onChange={(e) =>
                  updateBenefit("altro_specifica", e.target.value)
                }
                placeholder="Specificare altro..."
                className={inputBase}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================================================
// sections/ChiusuraSection.tsx
// Sezione Chiusura (canali, note, firma)
// ========================================================================

interface ChiusuraSectionProps extends OffertaSectionProps {
  companyName?: string;
}

export function ChiusuraSection({
  formData,
  updateFormData,
  inputBase,
  companyName,
}: ChiusuraSectionProps) {
  const chiusura = formData.chiusura;

  const updateField = (field: string, value: string) => {
    updateFormData("chiusura", {
      ...chiusura,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="p-4 bg-orange-50 border border-orange-200">
        <p className="text-xs text-orange-700">
          <span className="font-semibold">Chiusura intervista:</span> "Sulla
          base di quanto ci siam detti attiveremo i nostri canali per arrivare
          al target di candidati più in linea. Elaboreremo il tutto in una
          scheda di sintesi che le invieremo per firma e approvazione."
        </p>
      </div>

      {/* Canali Specifici */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-bigster-text">
          Canali Specifici da Attivare
        </label>
        <textarea
          value={chiusura.canali_specifici}
          onChange={(e) => updateField("canali_specifici", e.target.value)}
          placeholder="Vi sono canali, mezzi locali e specifici che il cliente ritiene efficaci? Realtà/organizzazioni/network nella zona da intercettare?"
          className={inputBase}
          rows={4}
        />
      </div>

      {/* Note Aggiuntive */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-bigster-text">
          Note Aggiuntive
        </label>
        <textarea
          value={chiusura.note_aggiuntive}
          onChange={(e) => updateField("note_aggiuntive", e.target.value)}
          placeholder="Informazioni, indicazioni utili per integrare i messaggi per attrarre candidati in linea..."
          className={inputBase}
          rows={4}
        />
      </div>

      {/* Firma */}
      <div className="p-6 bg-bigster-card-bg border border-bigster-border space-y-4">
        <h4 className="text-base font-bold text-bigster-text">
          Firma per Accettazione
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-bigster-text">
              Luogo
            </label>
            <input
              type="text"
              value={chiusura.luogo}
              onChange={(e) => updateField("luogo", e.target.value)}
              placeholder="Es: Milano"
              className={inputBase}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-bigster-text">
              Data
            </label>
            <input
              type="date"
              value={chiusura.data}
              onChange={(e) => updateField("data", e.target.value)}
              className={inputBase}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-bigster-text">
            Il Cliente (Nome e Cognome)
          </label>
          <input
            type="text"
            value={chiusura.firma_cliente}
            onChange={(e) => updateField("firma_cliente", e.target.value)}
            placeholder="Nome e cognome del cliente firmatario"
            className={inputBase}
          />
        </div>

        {companyName && (
          <p className="text-xs text-bigster-text-muted">
            Per conto di: <span className="font-semibold">{companyName}</span>
          </p>
        )}
      </div>

      {/* Riepilogo completamento */}
      <div className="p-4 bg-green-50 border border-green-200">
        <p className="text-sm font-semibold text-green-800 mb-2">
          ✓ Intervista Completata
        </p>
        <p className="text-xs text-green-700">
          Una volta salvato, potrai rivedere e modificare i dati in qualsiasi
          momento. La scheda di sintesi sarà disponibile per l'invio al cliente.
        </p>
      </div>
    </div>
  );
}
