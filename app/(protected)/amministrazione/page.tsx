"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ArrowRight,
  User,
  Building2,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ConsultantSelector from "@/components/accesso-fattureincloud/ConsultantSelector";
import CompanySelector from "@/components/accesso-fattureincloud/CompanySelector";
import InvoiceSelector from "@/components/accesso-fattureincloud/InvoiceSelector";
import SelectionForm from "@/components/accesso-fattureincloud/SelectionForm";
import { useCreateSelectionMutation } from "@/lib/redux/features/selections/selectionsApiSlice";
import { useGetConsultantsQuery } from "@/lib/redux/features/external/externalApiSlice";
import { useGetCompaniesQuery } from "@/lib/redux/features/companies/companiesApiSlice";
import { useNotify } from "@/hooks/use-notify";
import type { CreateSelectionPayload } from "@/types/selection";
import { PackageType } from "@/types/enums";

type CreationStep = "consultant" | "company" | "invoice" | "form";

const STORAGE_KEY = "bigster_selection_draft";

interface SelectionDraft {
  consultantId: number | null;
  companyId: number | null;
  invoiceId: number | null;
}

export default function CreateSelectionPage() {
  const router = useRouter();
  const notify = useNotify();
  const [createSelection, { isLoading }] = useCreateSelectionMutation();

  // Queries per ottenere i dati completi
  const { data: consultantsData } = useGetConsultantsQuery();
  const { data: companies } = useGetCompaniesQuery();

  // Inizializza gli stati dal localStorage
  const [selectedConsultantId, setSelectedConsultantId] = useState<
    number | null
  >(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState<CreationStep>("consultant");
  const [isInitialized, setIsInitialized] = useState(false);

  // Carica i dati dal localStorage all'avvio
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const draft: SelectionDraft = JSON.parse(savedDraft);

        if (draft.consultantId) setSelectedConsultantId(draft.consultantId);
        if (draft.companyId) setSelectedCompanyId(draft.companyId);
        if (draft.invoiceId) setSelectedInvoiceId(draft.invoiceId);

        // Determina lo step iniziale in base ai dati salvati
        if (draft.invoiceId) {
          setCurrentStep("form");
        } else if (draft.companyId) {
          setCurrentStep("invoice");
        } else if (draft.consultantId) {
          setCurrentStep("company");
        }

        // Notifica il ripristino della bozza
        if (draft.consultantId || draft.companyId || draft.invoiceId) {
          notify.info(
            "Bozza ripristinata",
            "Hai una bozza salvata in precedenza"
          );
        }
      } catch (error) {
        console.error("Errore nel caricamento della bozza:", error);
        localStorage.removeItem(STORAGE_KEY);
        notify.error(
          "Errore nel ripristino",
          "Non è stato possibile recuperare la bozza salvata"
        );
      }
    }
    setIsInitialized(true);
  }, []);

  // Sincronizza con localStorage quando cambiano i valori
  useEffect(() => {
    if (!isInitialized) return;

    const draft: SelectionDraft = {
      consultantId: selectedConsultantId,
      companyId: selectedCompanyId,
      invoiceId: selectedInvoiceId,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [
    selectedConsultantId,
    selectedCompanyId,
    selectedInvoiceId,
    isInitialized,
  ]);

  // Ottieni i dati completi per il riepilogo
  const selectedConsultant = consultantsData?.consultants?.find(
    (c) => c.id === selectedConsultantId
  );
  const selectedCompany = companies?.find((c) => c.id === selectedCompanyId);

  const handleConsultantSelect = (consultantId: number) => {
    setSelectedConsultantId(consultantId);
    notify.success("Consulente selezionato");
  };

  const handleCompanySelect = (companyId: number) => {
    setSelectedCompanyId(companyId);
    notify.success("Azienda selezionata");
  };

  const handleInvoiceSelect = (invoiceId: number) => {
    setSelectedInvoiceId(invoiceId);
    notify.success("Fattura selezionata");
  };

  const handleNext = () => {
    if (currentStep === "consultant" && selectedConsultantId) {
      setCurrentStep("company");
    } else if (currentStep === "company" && selectedCompanyId) {
      setCurrentStep("invoice");
    } else if (currentStep === "invoice" && selectedInvoiceId) {
      setCurrentStep("form");
    }
  };

  const handleSubmit = async (formData: {
    titolo: string;
    pacchetto: "BASE" | "MDO";
  }) => {
    if (!selectedConsultantId || !selectedCompanyId || !selectedInvoiceId) {
      notify.error(
        "Dati mancanti",
        "Completa tutti i passaggi prima di procedere"
      );
      return;
    }

    try {
      const payload: CreateSelectionPayload = {
        titolo: formData.titolo,
        company_id: selectedCompanyId,
        pacchetto: formData.pacchetto as PackageType,
        consulente_id: selectedConsultantId,
      };

      const creationPromise = createSelection(payload).unwrap();

      // Usa promise notification per mostrare lo stato
      await notify.promise(creationPromise, {
        loading: "Creazione selezione in corso...",
        success: "Selezione creata con successo!",
        error: "Errore nella creazione della selezione",
      });

      // Pulisci il localStorage dopo la creazione riuscita
      localStorage.removeItem(STORAGE_KEY);

      // Breve delay prima del redirect per permettere all'utente di vedere la notifica
      // setTimeout(() => {
      //   router.push("/selezioni");
      // }, 800);
    } catch (error: any) {
      console.error("Errore nella creazione della selezione:", error);

      // Gestione errori specifici
      if (error?.status === 400) {
        notify.error(
          "Dati non validi",
          error?.data?.message || "Controlla i dati inseriti"
        );
      } else if (error?.status === 401) {
        notify.error("Sessione scaduta", "Effettua nuovamente il login");
        setTimeout(() => router.push("/login"), 1500);
      } else if (error?.status === 403) {
        notify.error(
          "Permessi insufficienti",
          "Non hai i permessi per creare selezioni"
        );
      } else {
        // Errore generico già gestito dalla promise notification
      }
    }
  };

  const handleBack = () => {
    if (currentStep === "form") {
      setCurrentStep("invoice");
    } else if (currentStep === "invoice") {
      setCurrentStep("company");
    } else if (currentStep === "company") {
      setCurrentStep("consultant");
    } else {
      // Chiedi conferma se ci sono dati salvati
      if (selectedConsultantId || selectedCompanyId || selectedInvoiceId) {
        notify.richWarning(
          "Uscire dalla creazione?",
          "La bozza verrà salvata automaticamente",
          {
            actionLabel: "Esci",
            actionOnClick: () => router.back(),
            cancelLabel: "Resta",
          }
        );
      } else {
        router.back();
      }
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case "consultant":
        return selectedConsultantId !== null;
      case "company":
        return selectedCompanyId !== null;
      case "invoice":
        return selectedInvoiceId !== null;
      case "form":
        return false;
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "consultant":
        return "Seleziona Consulente di Riferimento";
      case "company":
        return "Seleziona Compagnia";
      case "invoice":
        return "Seleziona Fattura";
      case "form":
        return "Completa Selezione";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "consultant":
        return "Scegli il consulente che gestirà questa selezione";
      case "company":
        return "Seleziona l'azienda per cui creare la selezione";
      case "invoice":
        return "Scegli la fattura associata alla selezione";
      case "form":
        return "Inserisci i dettagli finali della selezione";
      default:
        return "";
    }
  };

  // Non renderizzare finché non abbiamo caricato dal localStorage
  if (!isInitialized) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bigster-page-container"
    >
      {/* Header */}
      <div className="bigster-page-header">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBack}
              variant="outline"
              className="rounded-none border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-surface"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <motion.h1
                className="bigster-page-title"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Crea Nuova Selezione
              </motion.h1>
              <motion.p
                className="bigster-page-description"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {getStepTitle()}
              </motion.p>
            </div>
          </div>

          {currentStep !== "form" && (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Avanti
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress Indicator - Minimalista */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <Card className="shadow-bigster-card border border-bigster-border rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <StepIndicator
                step={1}
                label="Consulente"
                isActive={currentStep === "consultant"}
                isCompleted={selectedConsultantId !== null}
                onClick={() => setCurrentStep("consultant")}
                isClickable={true}
              />
              <div className="flex-1 h-px bg-bigster-border" />
              <StepIndicator
                step={2}
                label="Compagnia"
                isActive={currentStep === "company"}
                isCompleted={selectedCompanyId !== null}
                onClick={() =>
                  selectedConsultantId && setCurrentStep("company")
                }
                isClickable={selectedConsultantId !== null}
              />
              <div className="flex-1 h-px bg-bigster-border" />
              <StepIndicator
                step={3}
                label="Fattura"
                isActive={currentStep === "invoice"}
                isCompleted={selectedInvoiceId !== null}
                onClick={() => selectedCompanyId && setCurrentStep("invoice")}
                isClickable={selectedCompanyId !== null}
              />
              <div className="flex-1 h-px bg-bigster-border" />
              <StepIndicator
                step={4}
                label="Dettagli"
                isActive={currentStep === "form"}
                isCompleted={false}
                onClick={() => selectedInvoiceId && setCurrentStep("form")}
                isClickable={selectedInvoiceId !== null}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* RIEPILOGO SELEZIONI - Compatto */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-6"
      >
        <Card className="shadow-bigster-card border border-bigster-border rounded-none bg-bigster-surface">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              {/* Consulente */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-bigster-text-muted" />
                  <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                    Consulente
                  </span>
                </div>
                {selectedConsultant ? (
                  <div>
                    <p className="font-semibold text-sm text-bigster-text">
                      {selectedConsultant.fullName}
                    </p>
                    {selectedConsultant.area && (
                      <p className="text-xs text-bigster-text-muted">
                        {selectedConsultant.area}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-bigster-text-muted">—</span>
                )}
              </div>

              <div className="h-12 w-px bg-bigster-border" />

              {/* Compagnia */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-4 w-4 text-bigster-text-muted" />
                  <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                    Azienda
                  </span>
                </div>
                {selectedCompany ? (
                  <div>
                    <p className="font-semibold text-sm text-bigster-text">
                      {selectedCompany.nome}
                    </p>
                    <p className="text-xs text-bigster-text-muted">
                      {selectedCompany.citta}
                    </p>
                  </div>
                ) : (
                  <span className="text-sm text-bigster-text-muted">—</span>
                )}
              </div>

              <div className="h-12 w-px bg-bigster-border" />

              {/* Fattura */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-bigster-text-muted" />
                  <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                    Fattura
                  </span>
                </div>
                {selectedInvoiceId ? (
                  <p className="font-semibold text-sm text-bigster-text">
                    #{selectedInvoiceId}
                  </p>
                ) : (
                  <span className="text-sm text-bigster-text-muted">—</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Step Description - Minimale */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-6"
      >
        <div className="px-1">
          <p className="text-sm text-bigster-text-muted italic">
            {getStepDescription()}
          </p>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {currentStep === "consultant" && (
          <ConsultantSelector
            onSelect={handleConsultantSelect}
            selectedId={selectedConsultantId}
          />
        )}

        {currentStep === "company" && (
          <CompanySelector
            onSelect={handleCompanySelect}
            selectedId={selectedCompanyId}
          />
        )}

        {currentStep === "invoice" && selectedCompanyId && (
          <InvoiceSelector
            companyId={selectedCompanyId}
            onSelect={handleInvoiceSelect}
            selectedId={selectedInvoiceId}
          />
        )}

        {currentStep === "form" && (
          <SelectionForm onSubmit={handleSubmit} isLoading={isLoading} />
        )}
      </motion.div>
    </motion.div>
  );
}

// Step Indicator - Minimalista
interface StepIndicatorProps {
  step: number;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
  isClickable: boolean;
}

function StepIndicator({
  step,
  label,
  isActive,
  isCompleted,
  onClick,
  isClickable,
}: StepIndicatorProps) {
  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={`flex flex-col items-center gap-2 transition-all ${
        isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"
      }`}
    >
      <div
        className={`w-10 h-10 flex items-center justify-center font-semibold text-sm border-2 transition-all rounded-none ${
          isCompleted
            ? "bg-bigster-primary border-yellow-200 text-bigster-primary-text"
            : isActive
            ? "bg-bigster-surface border-bigster-text text-bigster-text"
            : "bg-bigster-surface border-bigster-border text-bigster-text-muted"
        }`}
      >
        {isCompleted ? <Check className="h-5 w-5" /> : step}
      </div>
      <span
        className={`text-xs font-medium text-center ${
          isActive
            ? "text-bigster-text"
            : isCompleted
            ? "text-bigster-text"
            : "text-bigster-text-muted"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
