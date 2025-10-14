"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ArrowRight,
  User,
  Building2,
  FileText,
  AlertCircle,
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
import type { CreateSelectionPayload } from "@/types/selection";
import { PackageType } from "@/types/enums";

type CreationStep = "consultant" | "company" | "invoice" | "form";

export default function CreateSelectionPage() {
  const router = useRouter();
  const [createSelection, { isLoading }] = useCreateSelectionMutation();

  // Queries per ottenere i dati completi
  const { data: consultantsData } = useGetConsultantsQuery();
  const { data: companies } = useGetCompaniesQuery();

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

  // Ottieni i dati completi per il riepilogo
  const selectedConsultant = consultantsData?.consultants?.find(
    (c) => c.id === selectedConsultantId
  );
  const selectedCompany = companies?.find((c) => c.id === selectedCompanyId);

  const handleConsultantSelect = (consultantId: number) => {
    setSelectedConsultantId(consultantId);
  };

  const handleCompanySelect = (companyId: number) => {
    setSelectedCompanyId(companyId);
  };

  const handleInvoiceSelect = (invoiceId: number) => {
    setSelectedInvoiceId(invoiceId);
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

      {/* Progress Indicator - PIÙ EVIDENTE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <Card className="shadow-bigster-card border-2 border-bigster-border rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <StepIndicator
                step={1}
                label="Consulente"
                isActive={currentStep === "consultant"}
                isCompleted={selectedConsultantId !== null}
                onClick={() => setCurrentStep("consultant")}
                isClickable={true}
              />
              <div className="flex-1 h-1 bg-bigster-border rounded-none" />
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
              <div className="flex-1 h-1 bg-bigster-border rounded-none" />
              <StepIndicator
                step={3}
                label="Fattura"
                isActive={currentStep === "invoice"}
                isCompleted={selectedInvoiceId !== null}
                onClick={() => selectedCompanyId && setCurrentStep("invoice")}
                isClickable={selectedCompanyId !== null}
              />
              <div className="flex-1 h-1 bg-bigster-border rounded-none" />
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

      {/* RIEPILOGO SELEZIONI - SEMPRE VISIBILE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-6"
      >
        <Card className="shadow-bigster-card border border-bigster-border rounded-none bg-bigster-primary">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-bigster-primary-text mb-4">
              📋 Riepilogo Selezione
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Consulente */}
              <div className="bg-bigster-surface border border-bigster-border rounded-none p-4">
                <div className="flex items-center gap-2 mb-2">
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
                      <p className="text-xs text-bigster-text-muted mt-1">
                        {selectedConsultant.area}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-bigster-text-muted">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Non selezionato</span>
                  </div>
                )}
              </div>

              {/* Compagnia */}
              <div className="bg-bigster-surface border border-bigster-border rounded-none p-4">
                <div className="flex items-center gap-2 mb-2">
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
                    <p className="text-xs text-bigster-text-muted mt-1">
                      {selectedCompany.citta} - CAP {selectedCompany.cap}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-bigster-text-muted">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Non selezionata</span>
                  </div>
                )}
              </div>

              {/* Fattura */}
              <div className="bg-bigster-surface border border-bigster-border rounded-none p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-bigster-text-muted" />
                  <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                    Fattura
                  </span>
                </div>
                {selectedInvoiceId ? (
                  <div>
                    <p className="font-semibold text-sm text-bigster-text">
                      Fattura #{selectedInvoiceId}
                    </p>
                    <p className="text-xs text-bigster-text-muted mt-1">
                      Selezionata
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-bigster-text-muted">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Non selezionata</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Step Description Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
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

// Step Indicator - PIÙ GRANDE E EVIDENTE
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
        isClickable
          ? "cursor-pointer hover:scale-105"
          : "cursor-not-allowed opacity-60"
      }`}
    >
      <motion.div
        animate={{
          scale: isActive ? 1.1 : 1,
        }}
        transition={{ duration: 0.2 }}
        className={`w-14 h-14 flex items-center justify-center font-bold text-base border-3 transition-all rounded-none ${
          isCompleted
            ? "bg-bigster-primary border-yellow-200 text-bigster-primary-text shadow-md"
            : isActive
            ? "bg-bigster-surface border-bigster-text text-bigster-text shadow-lg ring-2 ring-bigster-text ring-offset-2"
            : "bg-bigster-surface border-bigster-border text-bigster-text-muted"
        }`}
      >
        {isCompleted ? <Check className="h-6 w-6" /> : step}
      </motion.div>
      <span
        className={`text-sm font-semibold text-center ${
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
