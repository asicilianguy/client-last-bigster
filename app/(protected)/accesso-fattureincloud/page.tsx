"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ConsultantSelector from "@/components/accesso-fattureincloud/ConsultantSelector";
import CompanySelector from "@/components/accesso-fattureincloud/CompanySelector";
import InvoiceSelector from "@/components/accesso-fattureincloud/InvoiceSelector";
import SelectionForm from "@/components/accesso-fattureincloud/SelectionForm";
import { useCreateSelectionMutation } from "@/lib/redux/features/selections/selectionsApiSlice";
import type { CreateSelectionPayload } from "@/types/selection";
import { PackageType } from "@/types/enums";

type CreationStep = "consultant" | "company" | "invoice" | "form";

export default function CreateSelectionPage() {
  const router = useRouter();
  const [createSelection, { isLoading }] = useCreateSelectionMutation();

  // State per i dati della selezione - TUTTI PERSISTENTI
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

  // Handler per la selezione del consulente (STEP 1)
  const handleConsultantSelect = (consultantId: number) => {
    setSelectedConsultantId(consultantId);
  };

  // Handler per la selezione della compagnia (STEP 2)
  const handleCompanySelect = (companyId: number) => {
    setSelectedCompanyId(companyId);
  };

  // Handler per la selezione della fattura (STEP 3)
  const handleInvoiceSelect = (invoiceId: number) => {
    setSelectedInvoiceId(invoiceId);
  };

  // Handler per andare avanti
  const handleNext = () => {
    if (currentStep === "consultant" && selectedConsultantId) {
      setCurrentStep("company");
    } else if (currentStep === "company" && selectedCompanyId) {
      setCurrentStep("invoice");
    } else if (currentStep === "invoice" && selectedInvoiceId) {
      setCurrentStep("form");
    }
  };

  // Handler per il submit finale (STEP 4)
  const handleSubmit = async (formData: {
    titolo: string;
    pacchetto: "BASE" | "MDO";
  }) => {
    if (!selectedConsultantId || !selectedCompanyId || !selectedInvoiceId) {
      console.error("Dati mancanti per la creazione della selezione");
      return;
    }

    try {
      const payload: CreateSelectionPayload = {
        titolo: formData.titolo,
        company_id: selectedCompanyId,
        pacchetto: formData.pacchetto as PackageType,
        consulente_id: selectedConsultantId,
      };

      await createSelection(payload).unwrap();
      router.push("/selezioni");
    } catch (error) {
      console.error("Errore nella creazione della selezione:", error);
    }
  };

  // Handler per tornare indietro - NON perde i dati
  const handleBack = () => {
    if (currentStep === "form") {
      setCurrentStep("invoice");
    } else if (currentStep === "invoice") {
      setCurrentStep("company");
    } else if (currentStep === "company") {
      setCurrentStep("consultant");
    } else {
      router.back();
    }
  };

  // Verifica se può andare avanti
  const canProceed = () => {
    switch (currentStep) {
      case "consultant":
        return selectedConsultantId !== null;
      case "company":
        return selectedCompanyId !== null;
      case "invoice":
        return selectedInvoiceId !== null;
      case "form":
        return false; // Il form ha il suo submit
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

          {/* Next Button - mostrato solo se non siamo nel form finale */}
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

      {/* Progress Indicator */}
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

      {/* Step Description Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-6"
      >
        <Card className="shadow-bigster-card border border-bigster-border rounded-none bg-bigster-surface">
          <CardContent className="p-4">
            <p className="text-sm text-bigster-text-muted">
              {getStepDescription()}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content - I dati non si perdono! */}
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

      {/* Debug Info */}
      {process.env.NODE_ENV === "development" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Card className="shadow-bigster-card border border-bigster-border rounded-none">
            <CardContent className="p-4">
              <p className="text-xs text-bigster-text-muted mb-2 font-semibold">
                Debug Info (solo development):
              </p>
              <div className="space-y-1 text-xs text-bigster-text-muted">
                <p>Current Step: {currentStep}</p>
                <p>
                  Selected Consultant ID:{" "}
                  {selectedConsultantId || "Non selezionato"}
                </p>
                <p>
                  Selected Company ID: {selectedCompanyId || "Non selezionato"}
                </p>
                <p>
                  Selected Invoice ID: {selectedInvoiceId || "Non selezionato"}
                </p>
                <p>Can Proceed: {canProceed() ? "Yes" : "No"}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

// Step Indicator - CLICKABLE
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
      className={`flex flex-col items-center gap-2 ${
        isClickable ? "cursor-pointer" : "cursor-not-allowed"
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
          isActive ? "text-bigster-text" : "text-bigster-text-muted"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
