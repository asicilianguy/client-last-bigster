// ========================================================================
// app/(protected)/selezioni/[id]/_components/job-description/sections/OffertaSection.tsx
// Sezione Offerta contrattuale e benefits
// AGGIORNATO: Aggiunto campo Master DTO
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

      {/* Numero persone e Motivo ricerca */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bigster-text">
            Numero persone ricercate
          </label>
          <input
            type="number"
            min={1}
            value={offerta.numero_persone}
            onChange={(e) =>
              updateField("numero_persone", parseInt(e.target.value) || 1)
            }
            className={inputBase}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bigster-text">
            Motivo della ricerca
          </label>
          <input
            type="text"
            value={offerta.motivo_ricerca}
            onChange={(e) => updateField("motivo_ricerca", e.target.value)}
            placeholder="Es: Sostituzione maternità, ampliamento organico..."
            className={inputBase}
          />
        </div>
      </div>

      {/* Requisiti Anagrafici */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-bigster-text">
          Requisiti Anagrafici
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Età */}
          <div className="space-y-2">
            <label className="text-xs text-bigster-text-muted">
              Età preferita
            </label>
            <input
              type="text"
              value={offerta.eta}
              onChange={(e) => updateField("eta", e.target.value)}
              placeholder="Es: 25-35 anni"
              className={inputBase}
            />
            <select
              value={offerta.eta_livello}
              onChange={(e) =>
                updateField("eta_livello", e.target.value as RequirementLevel)
              }
              className={inputBase}
            >
              {Object.entries(REQUIREMENT_LEVEL_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Patente */}
          <div className="space-y-2">
            <label className="text-xs text-bigster-text-muted">Patente</label>
            <select
              value={offerta.patente}
              onChange={(e) =>
                updateField("patente", e.target.value as RequirementLevel)
              }
              className={inputBase}
            >
              {Object.entries(REQUIREMENT_LEVEL_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Automunita */}
          <div className="space-y-2">
            <label className="text-xs text-bigster-text-muted">
              Automunita
            </label>
            <select
              value={offerta.automunita}
              onChange={(e) =>
                updateField("automunita", e.target.value as RequirementLevel)
              }
              className={inputBase}
            >
              {Object.entries(REQUIREMENT_LEVEL_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tipologia Contratto */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-bigster-text flex items-center gap-2">
          <FileCheck className="h-4 w-4" />
          Tipologia Contratto (seleziona una o più opzioni)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(CONTRACT_TYPE_LABELS).map(([key, label]) => {
            const isSelected = (offerta.tipi_contratto || []).includes(
              key as ContractTypeJD
            );
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleContractType(key as ContractTypeJD)}
                className={`p-3 text-xs font-medium text-left border transition-colors ${
                  isSelected
                    ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                    : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-muted-bg"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orario di lavoro */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-bigster-text flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Orario di Lavoro
        </label>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(WORK_SCHEDULE_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => updateField("orario", key as WorkSchedule)}
              className={`p-4 text-sm font-semibold border transition-colors ${
                offerta.orario === key
                  ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                  : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-muted-bg"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Dettagli orario */}
        {offerta.orario === WorkSchedule.PART_TIME && (
          <div className="space-y-2">
            <label className="text-xs text-bigster-text-muted">
              Dettagli Part Time
            </label>
            <input
              type="text"
              value={offerta.orario_part_time_dettagli}
              onChange={(e) =>
                updateField("orario_part_time_dettagli", e.target.value)
              }
              placeholder="Es: 20 ore settimanali, mattino..."
              className={inputBase}
            />
          </div>
        )}
        {offerta.orario === WorkSchedule.FULL_TIME && (
          <div className="space-y-2">
            <label className="text-xs text-bigster-text-muted">
              Dettagli Full Time
            </label>
            <input
              type="text"
              value={offerta.orario_full_time_dettagli}
              onChange={(e) =>
                updateField("orario_full_time_dettagli", e.target.value)
              }
              placeholder="Es: 40 ore settimanali, lun-ven 9-18..."
              className={inputBase}
            />
          </div>
        )}
      </div>

      {/* Compenso */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-bigster-text flex items-center gap-2">
          <Euro className="h-4 w-4" />
          Retribuzione
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-bigster-text-muted">
              Compenso Mensile Netto
            </label>
            <input
              type="text"
              value={offerta.compenso_mensile_netto}
              onChange={(e) =>
                updateField("compenso_mensile_netto", e.target.value)
              }
              placeholder="Es: 1.500 - 1.800 €"
              className={inputBase}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-bigster-text-muted">
              Composizione Retribuzione
            </label>
            <input
              type="text"
              value={offerta.composizione_retribuzione}
              onChange={(e) =>
                updateField("composizione_retribuzione", e.target.value)
              }
              placeholder="Es: Fisso + variabile, premi..."
              className={inputBase}
            />
          </div>
        </div>
      </div>

      {/* Prospettive */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-bigster-text">
          Prospettive di Crescita
        </label>
        <textarea
          value={offerta.prospettive_crescita}
          onChange={(e) => updateField("prospettive_crescita", e.target.value)}
          placeholder="Quali prospettive di crescita può offrire lo studio? In cosa si traducono?"
          className={inputBase}
          rows={3}
        />
      </div>

      {/* Benefits - AGGIORNATO CON MASTER DTO */}
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

          {/* ✅ NUOVO: Master DTO (con specifica) */}
          <div className="p-3 bg-bigster-card-bg border border-bigster-border space-y-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={offerta.benefits.master_dto || false}
                onChange={(e) => updateBenefit("master_dto", e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded-none"
              />
              <div className="flex-1">
                <span className="text-sm text-bigster-text font-medium">
                  Master DTO
                </span>
              </div>
            </label>
            {offerta.benefits.master_dto && (
              <input
                type="text"
                value={offerta.benefits.master_dto_specifica || ""}
                onChange={(e) =>
                  updateBenefit("master_dto_specifica", e.target.value)
                }
                placeholder="Es: Master in Dental Team Organization..."
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
