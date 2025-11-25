// ============================================
// FILE: app/(protected)/selezioni/page.tsx
// MODIFICA: Aggiunta componente SelectionsDeadlinesMonitor
// ============================================

"use client";

import { useState, useMemo } from "react";
import { useGetSelectionsQuery } from "@/lib/redux/features/selections/selectionsApiSlice";
import { useUserRole } from "@/hooks/use-user-role";
import { motion } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
import { SelectionStatus } from "@/types/selection";
import { SelectionsKPI } from "./_components/SelectionsKPI";
import { SelectionsFilters } from "./_components/SelectionsFilters";
import { SelectionsGrid } from "./_components/SelectionsGrid";
import { SelectionsDeadlinesMonitor } from "./_components/SelectionsDeadlinesMonitor"; // ← NUOVO IMPORT

export default function SelezioniPage() {
  const { data: selectionsData, isLoading } = useGetSelectionsQuery({});
  const { hasFullAccess, isCEO, isHR, user } = useUserRole();

  // Stati per TUTTI i filtri possibili
  const [filters, setFilters] = useState({
    search: "",
    stato: "all" as SelectionStatus | "all",
    pacchetto: "all" as "all" | "BASE" | "MDO",
    hrId: "all",
    hrStatus: "all" as "all" | "assigned" | "unassigned",
    consulenteId: "all",
    figuraId: "all",
    companyId: "all",
    companyName: "",
    companyCitta: "",
    companyCap: "",
    companyEmail: "",
    dataCreazioneDa: "",
    dataCreazioneA: "",
    dataModificaDa: "",
    dataModificaA: "",
  });

  const [sortBy, setSortBy] = useState<
    "recent" | "oldest" | "title" | "company" | "applications"
  >("recent");

  // Filtra selezioni accessibili
  const accessibleSelections = useMemo(() => {
    if (!selectionsData) return [];
    return selectionsData.filter((selection: any) => {
      if (hasFullAccess || isCEO) return true;
      if (isHR) return selection.risorsa_umana_id === user?.id;
      return false;
    });
  }, [selectionsData, hasFullAccess, isCEO, isHR, user]);

  // Applica TUTTI i filtri
  const filteredSelections = useMemo(() => {
    let filtered = [...accessibleSelections];

    // Search globale
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(
        (s: any) =>
          s.titolo?.toLowerCase().includes(query) ||
          s.company?.nome?.toLowerCase().includes(query) ||
          s.consulente?.nome?.toLowerCase().includes(query) ||
          s.consulente?.cognome?.toLowerCase().includes(query) ||
          s.risorsa_umana?.nome?.toLowerCase().includes(query) ||
          s.risorsa_umana?.cognome?.toLowerCase().includes(query)
      );
    }

    if (filters.stato !== "all") {
      filtered = filtered.filter((s: any) => s.stato === filters.stato);
    }

    if (filters.pacchetto !== "all") {
      filtered = filtered.filter((s: any) => s.pacchetto === filters.pacchetto);
    }

    if (filters.hrId !== "all") {
      filtered = filtered.filter(
        (s: any) => s.risorsa_umana_id?.toString() === filters.hrId
      );
    }

    if (filters.hrStatus === "assigned") {
      filtered = filtered.filter((s: any) => s.risorsa_umana_id !== null);
    } else if (filters.hrStatus === "unassigned") {
      filtered = filtered.filter((s: any) => s.risorsa_umana_id === null);
    }

    if (filters.consulenteId !== "all") {
      filtered = filtered.filter(
        (s: any) => s.consulente_id?.toString() === filters.consulenteId
      );
    }

    if (filters.figuraId !== "all") {
      filtered = filtered.filter(
        (s: any) => s.figura_professionale_id?.toString() === filters.figuraId
      );
    }

    if (filters.companyId !== "all") {
      filtered = filtered.filter(
        (s: any) => s.company_id?.toString() === filters.companyId
      );
    }

    if (filters.companyName) {
      const query = filters.companyName.toLowerCase();
      filtered = filtered.filter((s: any) =>
        s.company?.nome?.toLowerCase().includes(query)
      );
    }

    if (filters.companyCitta) {
      const query = filters.companyCitta.toLowerCase();
      filtered = filtered.filter((s: any) =>
        s.company?.citta?.toLowerCase().includes(query)
      );
    }

    if (filters.companyCap) {
      filtered = filtered.filter((s: any) =>
        s.company?.cap?.includes(filters.companyCap)
      );
    }

    if (filters.companyEmail) {
      const query = filters.companyEmail.toLowerCase();
      filtered = filtered.filter((s: any) =>
        s.company?.email?.toLowerCase().includes(query)
      );
    }

    if (filters.dataCreazioneDa) {
      filtered = filtered.filter((s: any) => {
        const creationDate = new Date(s.data_creazione);
        const filterDate = new Date(filters.dataCreazioneDa);
        return creationDate >= filterDate;
      });
    }

    if (filters.dataCreazioneA) {
      filtered = filtered.filter((s: any) => {
        const creationDate = new Date(s.data_creazione);
        const filterDate = new Date(filters.dataCreazioneA);
        return creationDate <= filterDate;
      });
    }

    if (filters.dataModificaDa) {
      filtered = filtered.filter((s: any) => {
        const modDate = new Date(s.data_modifica);
        const filterDate = new Date(filters.dataModificaDa);
        return modDate >= filterDate;
      });
    }

    if (filters.dataModificaA) {
      filtered = filtered.filter((s: any) => {
        const modDate = new Date(s.data_modifica);
        const filterDate = new Date(filters.dataModificaA);
        return modDate <= filterDate;
      });
    }

    return filtered;
  }, [accessibleSelections, filters]);

  // Ordinamento
  const sortedSelections = useMemo(() => {
    const sorted = [...filteredSelections];

    switch (sortBy) {
      case "recent":
        return sorted.sort(
          (a: any, b: any) =>
            new Date(b.data_modifica).getTime() -
            new Date(a.data_modifica).getTime()
        );
      case "oldest":
        return sorted.sort(
          (a: any, b: any) =>
            new Date(a.data_creazione).getTime() -
            new Date(b.data_creazione).getTime()
        );
      case "title":
        return sorted.sort((a: any, b: any) =>
          a.titolo.localeCompare(b.titolo)
        );
      case "company":
        return sorted.sort((a: any, b: any) =>
          (a.company?.nome || "").localeCompare(b.company?.nome || "")
        );
      default:
        return sorted;
    }
  }, [filteredSelections, sortBy]);

  // Calcola KPI
  const kpiData = useMemo(() => {
    const byStatus: Record<SelectionStatus, number> = {
      [SelectionStatus.FATTURA_AV_SALDATA]: 0,
      [SelectionStatus.HR_ASSEGNATA]: 0,
      [SelectionStatus.PRIMA_CALL_COMPLETATA]: 0,
      [SelectionStatus.RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE]: 0,
      [SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE]: 0,
      [SelectionStatus.BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO]: 0,
      [SelectionStatus.ANNUNCIO_APPROVATO]: 0,
      [SelectionStatus.ANNUNCIO_PUBBLICATO]: 0,
      [SelectionStatus.CANDIDATURE_RICEVUTE]: 0,
      [SelectionStatus.COLLOQUI_IN_CORSO]: 0,
      [SelectionStatus.PROPOSTA_CANDIDATI]: 0,
      [SelectionStatus.SELEZIONI_IN_SOSTITUZIONE]: 0,
      [SelectionStatus.CHIUSA]: 0,
      [SelectionStatus.ANNULLATA]: 0,
    };

    let lastModified: any = null;

    accessibleSelections.forEach((s: any) => {
      byStatus[s.stato as SelectionStatus]++;

      if (
        !lastModified ||
        new Date(s.data_modifica) > new Date(lastModified.data_modifica)
      ) {
        lastModified = s;
      }
    });

    return {
      total: accessibleSelections.length,
      byStatus,
      lastModified,
    };
  }, [accessibleSelections]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.stato !== "all") count++;
    if (filters.pacchetto !== "all") count++;
    if (filters.hrId !== "all") count++;
    if (filters.hrStatus !== "all") count++;
    if (filters.consulenteId !== "all") count++;
    if (filters.figuraId !== "all") count++;
    if (filters.companyId !== "all") count++;
    if (filters.companyName) count++;
    if (filters.companyCitta) count++;
    if (filters.companyCap) count++;
    if (filters.companyEmail) count++;
    if (filters.dataCreazioneDa) count++;
    if (filters.dataCreazioneA) count++;
    if (filters.dataModificaDa) count++;
    if (filters.dataModificaA) count++;
    return count;
  }, [filters]);

  const clearAllFilters = () => {
    setFilters({
      search: "",
      stato: "all",
      pacchetto: "all",
      hrId: "all",
      hrStatus: "all",
      consulenteId: "all",
      figuraId: "all",
      companyId: "all",
      companyName: "",
      companyCitta: "",
      companyCap: "",
      companyEmail: "",
      dataCreazioneDa: "",
      dataCreazioneA: "",
      dataModificaDa: "",
      dataModificaA: "",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center bg-bigster-background">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bigster-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 p-6"
      >
        {/* KPI Dashboard */}
        <SelectionsKPI data={kpiData} />

        {/* Sistema Filtri */}
        <SelectionsFilters
          filters={filters}
          setFilters={setFilters}
          sortBy={sortBy}
          setSortBy={(sort: string) =>
            setSortBy(sort as "company" | "recent" | "oldest" | "title")
          }
          activeFiltersCount={activeFiltersCount}
          clearAllFilters={clearAllFilters}
          accessibleSelections={accessibleSelections}
        />

        {/* Grid Selezioni */}
        <SelectionsGrid
          selections={sortedSelections}
          filters={filters}
          activeFiltersCount={activeFiltersCount}
          clearAllFilters={clearAllFilters}
        />
      </motion.div>

      {/* ← NUOVO COMPONENTE FLOATING */}
      <SelectionsDeadlinesMonitor />
    </div>
  );
}
