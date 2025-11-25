// ========================================================================
// app/(protected)/selezioni/[id]/_components/job-description/index.ts
// Export principale del modulo Job Description
// ========================================================================

export { JobDescriptionWizard } from "./JobDescriptionWizard";
export { JobDescriptionSection } from "./JobDescriptionSection";

// Re-export dei tipi per comodità
export type {
  JobDescriptionForm,
  JobDescriptionFormDO,
  JobDescriptionFormASO,
  JobDescriptionType,
  WizardSection,
} from "@/types/jobDescription";
