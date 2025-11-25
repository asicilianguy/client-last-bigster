// ========================================================================
// app/(protected)/selezioni/[id]/_components/job-description/JobDescriptionWizard.tsx
// Componente principale per la compilazione Job Description DO/ASO
// ========================================================================

"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  FileText,
  Building2,
  User,
  Briefcase,
  GraduationCap,
  Gift,
  CheckSquare,
  AlertCircle,
  Check,
  X,
  RefreshCw,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import {
  JobDescriptionType,
  JobDescriptionForm,
  JobDescriptionFormDO,
  JobDescriptionFormASO,
  WizardSection,
  WIZARD_STEPS,
  createDefaultJobDescriptionDO,
  createDefaultJobDescriptionASO,
} from "@/types/jobDescription";

// Import delle sezioni del wizard
import { DatiAnagraficiSection } from "./sections/DatiAnagraficiSection";
import { StudioInfoSection } from "./sections/StudioInfoSection";
import { StrutturaSection } from "./sections/StrutturaSection";
import { ServiziSection } from "./sections/ServiziSection";
import { DigitalizzazioneSection } from "./sections/DigitalizzazioneSection";
import { SwotSection } from "./sections/SwotSection";
import { AttivitaSection } from "./sections/AttivitaSection";
import { CompetenzeHardSection } from "./sections/CompetenzeHardSection";
import { ConoscenzeTecnicheSection } from "./sections/ConoscenzeTecnicheSection";
import { SoftSkillsSection } from "./sections/SoftSkillsSection";
import { FormazioneSection } from "./sections/FormazioneSection";
import { OffertaSection } from "./sections/OffertaSection";
import { ChiusuraSection } from "./sections/ChiusuraSection";

// Import del componente Anteprima
import { JobDescriptionPreview } from "./JobDescriptionPreview";

// Styles
const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

interface JobDescriptionWizardProps {
  selectionId: number;
  companyName?: string;
  figuraProfessionale?: string;
  initialData?: Partial<JobDescriptionForm>;
  onSave?: (data: JobDescriptionForm) => Promise<void>;
  onClose?: () => void;
}

// Gruppi di sezioni per la navigazione
const SECTION_GROUPS = {
  organizzativa: {
    label: "Analisi Organizzativa",
    icon: Building2,
    color: "#3b82f6",
  },
  profilo: {
    label: "Analisi del Profilo",
    icon: User,
    color: "#8b5cf6",
  },
  offerta: {
    label: "Offerta",
    icon: Gift,
    color: "#10b981",
  },
  chiusura: {
    label: "Chiusura",
    icon: CheckSquare,
    color: "#f59e0b",
  },
};

export function JobDescriptionWizard({
  selectionId,
  companyName,
  figuraProfessionale,
  initialData,
  onSave,
  onClose,
}: JobDescriptionWizardProps) {
  // Determina il tipo in base alla figura professionale o ai dati iniziali
  const determineType = useCallback((): JobDescriptionType => {
    if (initialData?.tipo) return initialData.tipo;
    if (figuraProfessionale?.toLowerCase().includes("aso")) {
      return JobDescriptionType.ASO;
    }
    return JobDescriptionType.DO;
  }, [initialData?.tipo, figuraProfessionale]);

  // State
  const [tipo, setTipo] = useState<JobDescriptionType>(determineType());
  const [formData, setFormData] = useState<JobDescriptionForm>(() => {
    if (initialData) {
      return initialData as JobDescriptionForm;
    }
    return tipo === JobDescriptionType.DO
      ? createDefaultJobDescriptionDO()
      : createDefaultJobDescriptionASO();
  });
  const [currentSection, setCurrentSection] = useState<WizardSection>(
    WizardSection.DATI_ANAGRAFICI
  );
  const [completedSections, setCompletedSections] = useState<
    Set<WizardSection>
  >(new Set());
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Aggiorna i dati quando cambia il tipo
  useEffect(() => {
    if (!initialData) {
      setFormData(
        tipo === JobDescriptionType.DO
          ? createDefaultJobDescriptionDO()
          : createDefaultJobDescriptionASO()
      );
    }
  }, [tipo, initialData]);

  // Indice della sezione corrente
  const currentIndex = useMemo(
    () => WIZARD_STEPS.findIndex((s) => s.id === currentSection),
    [currentSection]
  );

  // Handler per aggiornamento dati
  const updateFormData = useCallback(
    <K extends keyof JobDescriptionForm>(
      key: K,
      value: JobDescriptionForm[K]
    ) => {
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
      setIsDirty(true);
    },
    []
  );

  // Handler per aggiornamento parziale (nested)
  const updateNestedData = useCallback(
    <K extends keyof JobDescriptionForm>(
      key: K,
      nestedKey: string,
      value: any
    ) => {
      setFormData((prev) => ({
        ...prev,
        [key]: {
          ...(prev[key] as any),
          [nestedKey]: value,
        },
      }));
      setIsDirty(true);
    },
    []
  );

  // Navigazione
  const goToSection = useCallback((section: WizardSection) => {
    setCurrentSection(section);
  }, []);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentSection(WIZARD_STEPS[currentIndex - 1].id);
    }
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < WIZARD_STEPS.length - 1) {
      // Marca la sezione corrente come completata
      setCompletedSections((prev) => new Set([...prev, currentSection]));
      setCurrentSection(WIZARD_STEPS[currentIndex + 1].id);
    }
  }, [currentIndex, currentSection]);

  // Salvataggio
  const handleSave = useCallback(async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      setIsDirty(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
    } finally {
      setIsSaving(false);
    }
  }, [formData, onSave]);

  // Cambia tipo (DO/ASO)
  const handleTypeChange = useCallback(
    (newType: JobDescriptionType) => {
      if (newType === tipo) return;

      // Mantieni i dati comuni (analisi organizzativa, offerta, chiusura)
      const commonData = {
        analisi_organizzativa: formData.analisi_organizzativa,
        offerta: formData.offerta,
        chiusura: formData.chiusura,
      };

      if (newType === JobDescriptionType.DO) {
        setFormData({
          ...createDefaultJobDescriptionDO(),
          ...commonData,
        });
      } else {
        setFormData({
          ...createDefaultJobDescriptionASO(),
          ...commonData,
        });
      }

      setTipo(newType);
      setIsDirty(true);
    },
    [tipo, formData]
  );

  // Render della sezione corrente
  const renderCurrentSection = () => {
    const sectionProps = {
      formData,
      updateFormData,
      updateNestedData,
      tipo,
      inputBase,
    };

    switch (currentSection) {
      case WizardSection.DATI_ANAGRAFICI:
        return <DatiAnagraficiSection {...sectionProps} />;
      case WizardSection.STUDIO_INFO:
        return <StudioInfoSection {...sectionProps} />;
      case WizardSection.STRUTTURA:
        return <StrutturaSection {...sectionProps} />;
      case WizardSection.SERVIZI:
        return <ServiziSection {...sectionProps} />;
      case WizardSection.DIGITALIZZAZIONE:
        return <DigitalizzazioneSection {...sectionProps} />;
      case WizardSection.SWOT:
        return <SwotSection {...sectionProps} />;
      case WizardSection.ATTIVITA:
        return <AttivitaSection {...sectionProps} />;
      case WizardSection.COMPETENZE_HARD:
        return <CompetenzeHardSection {...sectionProps} />;
      case WizardSection.CONOSCENZE_TECNICHE:
        return <ConoscenzeTecnicheSection {...sectionProps} />;
      case WizardSection.SOFT_SKILLS:
        return <SoftSkillsSection {...sectionProps} />;
      case WizardSection.FORMAZIONE:
        return <FormazioneSection {...sectionProps} />;
      case WizardSection.OFFERTA:
        return <OffertaSection {...sectionProps} />;
      case WizardSection.CHIUSURA:
        return <ChiusuraSection {...sectionProps} companyName={companyName} />;
      default:
        return null;
    }
  };

  // Calcolo progresso
  const progress = useMemo(() => {
    return Math.round(((currentIndex + 1) / WIZARD_STEPS.length) * 100);
  }, [currentIndex]);

  return (
    <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card">
      {/* Header */}
      <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileText className="h-6 w-6 text-bigster-text" />
            <div>
              <h2 className="text-lg font-bold text-bigster-text">
                Raccolta Job Description
              </h2>
              <p className="text-xs text-bigster-text-muted">
                {companyName && `${companyName} • `}
                {tipo === JobDescriptionType.DO
                  ? "Dentist Organizer"
                  : "Assistente di Studio Odontoiatrico"}
              </p>
            </div>
          </div>

          {/* Toggle Tipo */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-bigster-text-muted">
              Tipo:
            </span>
            <div className="flex">
              <button
                onClick={() => handleTypeChange(JobDescriptionType.DO)}
                className={`px-3 py-1.5 text-xs font-semibold border transition-all ${
                  tipo === JobDescriptionType.DO
                    ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                    : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-muted-bg"
                }`}
              >
                DO
              </button>
              <button
                onClick={() => handleTypeChange(JobDescriptionType.ASO)}
                className={`px-3 py-1.5 text-xs font-semibold border-t border-b border-r transition-all ${
                  tipo === JobDescriptionType.ASO
                    ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                    : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-muted-bg"
                }`}
              >
                ASO
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-bigster-text-muted mb-2">
            <span>
              Sezione {currentIndex + 1} di {WIZARD_STEPS.length}
            </span>
            <span>{progress}% completato</span>
          </div>
          <div className="w-full h-2 bg-bigster-border">
            <motion.div
              className="h-full bg-bigster-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-bigster-border bg-bigster-muted-bg">
        <div className="px-6 py-3">
          {/* Gruppi */}
          <div className="flex gap-6 mb-3">
            {Object.entries(SECTION_GROUPS).map(([key, group]) => {
              const GroupIcon = group.icon;
              const groupSteps = WIZARD_STEPS.filter((s) => s.group === key);
              const isCurrentGroup = groupSteps.some(
                (s) => s.id === currentSection
              );
              const completedInGroup = groupSteps.filter((s) =>
                completedSections.has(s.id)
              ).length;

              return (
                <div key={key} className="flex items-center gap-2">
                  <GroupIcon
                    className="h-4 w-4"
                    style={{ color: isCurrentGroup ? group.color : "#666666" }}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      isCurrentGroup
                        ? "text-bigster-text"
                        : "text-bigster-text-muted"
                    }`}
                  >
                    {group.label}
                  </span>
                  <span className="text-xs text-bigster-text-muted">
                    ({completedInGroup}/{groupSteps.length})
                  </span>
                </div>
              );
            })}
          </div>

          {/* Steps */}
          <div className="flex flex-wrap gap-1">
            {WIZARD_STEPS.map((step, index) => {
              const isActive = step.id === currentSection;
              const isCompleted = completedSections.has(step.id);
              const isPast = index < currentIndex;

              return (
                <button
                  key={step.id}
                  onClick={() => goToSection(step.id)}
                  className={`px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-bigster-primary text-bigster-primary-text"
                      : isCompleted || isPast
                      ? "bg-bigster-surface text-bigster-text border border-bigster-border"
                      : "bg-transparent text-bigster-text-muted hover:bg-bigster-surface"
                  }`}
                >
                  {isCompleted && !isActive && (
                    <Check className="h-3 w-3 text-green-600" />
                  )}
                  <span>{step.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Section Title */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-bigster-text">
                {WIZARD_STEPS[currentIndex]?.label}
              </h3>
              <p className="text-sm text-bigster-text-muted mt-1">
                {getStepDescription(currentSection, tipo)}
              </p>
            </div>

            {/* Section Content */}
            {renderCurrentSection()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="px-6 py-4 border-t border-bigster-border bg-bigster-card-bg">
        <div className="flex items-center justify-between">
          {/* Left: Status */}
          <div className="flex items-center gap-4">
            {isDirty && (
              <span className="flex items-center gap-1.5 text-xs text-orange-600">
                <AlertCircle className="h-3.5 w-3.5" />
                Modifiche non salvate
              </span>
            )}
            {lastSaved && !isDirty && (
              <span className="flex items-center gap-1.5 text-xs text-green-600">
                <Check className="h-3.5 w-3.5" />
                Salvato alle {lastSaved.toLocaleTimeString("it-IT")}
              </span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Salva */}
            <Button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              variant="outline"
              className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
            >
              {isSaving ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salva Bozza
            </Button>

            {/* Navigazione */}
            <div className="flex items-center">
              <Button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                variant="outline"
                className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Indietro
              </Button>
              <Button
                onClick={goToNext}
                disabled={currentIndex === WIZARD_STEPS.length - 1}
                className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
              >
                Avanti
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Preview / Esporta (ultima sezione) */}
            {currentIndex === WIZARD_STEPS.length - 1 && (
              <Button
                onClick={() => setShowPreview(true)}
                className="rounded-none bg-green-600 text-white border border-green-500 hover:bg-green-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Anteprima
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Anteprima PDF */}
      {showPreview && (
        <JobDescriptionPreview
          formData={formData}
          tipo={tipo}
          companyName={companyName}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

// Helper per descrizioni delle sezioni
function getStepDescription(
  section: WizardSection,
  tipo: JobDescriptionType
): string {
  const descriptions: Record<WizardSection, string> = {
    [WizardSection.DATI_ANAGRAFICI]:
      "Inserisci i dati anagrafici dello studio del cliente.",
    [WizardSection.STUDIO_INFO]:
      "Raccogli informazioni sulla storia e l'evoluzione dello studio.",
    [WizardSection.STRUTTURA]:
      "Definisci la struttura organizzativa attuale con dipendenti e collaboratori.",
    [WizardSection.SERVIZI]:
      "Indica i servizi offerti, la distribuzione e il fatturato.",
    [WizardSection.DIGITALIZZAZIONE]:
      "Mappa il livello di digitalizzazione dello studio.",
    [WizardSection.SWOT]:
      "Identifica punti di forza, debolezze, obiettivi e tratti distintivi.",
    [WizardSection.ATTIVITA]:
      tipo === JobDescriptionType.DO
        ? "Seleziona le attività che il Dentist Organizer dovrà gestire."
        : "Seleziona le attività che l'ASO dovrà svolgere.",
    [WizardSection.COMPETENZE_HARD]:
      "Indica le competenze hard rilevanti per il ruolo.",
    [WizardSection.CONOSCENZE_TECNICHE]:
      "Specifica le conoscenze tecniche richieste.",
    [WizardSection.SOFT_SKILLS]:
      "Seleziona le caratteristiche personali e soft skills desiderate.",
    [WizardSection.FORMAZIONE]:
      "Definisci i requisiti di formazione, esperienza e lingue.",
    [WizardSection.OFFERTA]:
      "Compila i dettagli dell'offerta contrattuale e dei benefit.",
    [WizardSection.CHIUSURA]:
      "Aggiungi note finali, canali di recruiting e firma.",
  };

  return descriptions[section] || "";
}

export default JobDescriptionWizard;
