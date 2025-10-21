// ============================================
// FILE: app/(protected)/selezioni/_components/SelectionsFilters.tsx
// ============================================

"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Search, Filter, X, ArrowUpDown, ChevronDown } from "lucide-react";
import { SelectionStatus } from "@/types/selection";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { StandardSelect } from "@/components/ui/StandardSelect";

const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors appearance-none";

const STATUS_OPTIONS = [
  { value: SelectionStatus.FATTURA_AV_SALDATA, label: "Fattura AV Saldata" },
  { value: SelectionStatus.HR_ASSEGNATA, label: "HR Assegnata" },
  {
    value: SelectionStatus.PRIMA_CALL_COMPLETATA,
    label: "Prima Call Completata",
  },
  {
    value: SelectionStatus.RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE,
    label: "Job in Approvazione",
  },
  {
    value: SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE,
    label: "Job Approvata",
  },
  {
    value: SelectionStatus.BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO,
    label: "Bozza in Approvazione CEO",
  },
  { value: SelectionStatus.ANNUNCIO_APPROVATO, label: "Annuncio Approvato" },
  { value: SelectionStatus.ANNUNCIO_PUBBLICATO, label: "Annuncio Pubblicato" },
  {
    value: SelectionStatus.CANDIDATURE_RICEVUTE,
    label: "Candidature Ricevute",
  },
  { value: SelectionStatus.COLLOQUI_IN_CORSO, label: "Colloqui in Corso" },
  { value: SelectionStatus.PROPOSTA_CANDIDATI, label: "Proposta Candidati" },
  { value: SelectionStatus.CHIUSA, label: "Chiusa" },
  { value: SelectionStatus.ANNULLATA, label: "Annullata" },
];

interface SelectionsFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  activeFiltersCount: number;
  clearAllFilters: () => void;
  accessibleSelections: any[];
}

export function SelectionsFilters({
  filters,
  setFilters,
  sortBy,
  setSortBy,
  activeFiltersCount,
  clearAllFilters,
  accessibleSelections,
}: SelectionsFiltersProps) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isSortDialogOpen, setIsSortDialogOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    base: true,
    hr: false,
    company: false,
    dates: false,
  });

  // Lista HR unici
  const hrList = useMemo(() => {
    const map = new Map();
    accessibleSelections.forEach((s: any) => {
      if (s.risorsa_umana) {
        map.set(s.risorsa_umana.id, s.risorsa_umana);
      }
    });
    return Array.from(map.values());
  }, [accessibleSelections]);

  // Lista consulenti unici
  const consulentiList = useMemo(() => {
    const map = new Map();
    accessibleSelections.forEach((s: any) => {
      if (s.consulente) {
        map.set(s.consulente.id, s.consulente);
      }
    });
    return Array.from(map.values());
  }, [accessibleSelections]);

  // Lista figure professionali uniche
  const figureList = useMemo(() => {
    const map = new Map();
    accessibleSelections.forEach((s: any) => {
      if (s.figura_professionale) {
        map.set(s.figura_professionale.id, s.figura_professionale);
      }
    });
    return Array.from(map.values());
  }, [accessibleSelections]);

  // Lista companies uniche
  const companiesList = useMemo(() => {
    const map = new Map();
    accessibleSelections.forEach((s: any) => {
      if (s.company) {
        map.set(s.company.id, s.company);
      }
    });
    return Array.from(map.values());
  }, [accessibleSelections]);

  // Lista città uniche dalle companies
  const cittaList = useMemo(() => {
    const cittaSet = new Set<string>();
    companiesList.forEach((c: any) => {
      if (c.citta) {
        cittaSet.add(c.citta);
      }
    });
    return Array.from(cittaSet).sort();
  }, [companiesList]);

  // Lista CAP unici dalle companies
  const capList = useMemo(() => {
    const capSet = new Set<string>();
    companiesList.forEach((c: any) => {
      if (c.cap) {
        capSet.add(c.cap);
      }
    });
    return Array.from(capSet).sort();
  }, [companiesList]);

  // Opzioni per StandardSelect - Status
  const statusOptions = useMemo(
    () =>
      STATUS_OPTIONS.map((opt) => ({
        value: opt.value,
        label: opt.label,
      })),
    []
  );

  // Opzioni per StandardSelect - Pacchetto
  const packageOptions = useMemo(
    () => [
      { value: "BASE", label: "BASE" },
      { value: "MDO", label: "MDO" },
    ],
    []
  );

  // Opzioni per StandardSelect - HR Status
  const hrStatusOptions = useMemo(
    () => [
      { value: "assigned", label: "Solo assegnate" },
      { value: "unassigned", label: "Solo non assegnate" },
    ],
    []
  );

  // Opzioni per StandardSelect - Figure
  const figureOptions = useMemo(
    () =>
      figureList.map((f: any) => ({
        value: f.id.toString(),
        label: `${f.nome} - ${f.seniority}`,
      })),
    [figureList]
  );

  // Opzioni per SearchableSelect - Consulenti
  const consulentiOptions = useMemo(
    () =>
      consulentiList.map((c: any) => ({
        value: c.id.toString(),
        label: `${c.nome} ${c.cognome}`,
      })),
    [consulentiList]
  );

  // Opzioni per SearchableSelect - HR
  const hrOptions = useMemo(
    () =>
      hrList.map((hr: any) => ({
        value: hr.id.toString(),
        label: `${hr.nome} ${hr.cognome}`,
      })),
    [hrList]
  );

  // Opzioni per SearchableSelect - Companies
  const companiesOptions = useMemo(
    () =>
      companiesList.map((c: any) => ({
        value: c.id.toString(),
        label: c.nome,
      })),
    [companiesList]
  );

  // Opzioni per SearchableSelect - Città
  const cittaOptions = useMemo(
    () =>
      cittaList.map((citta) => ({
        value: citta,
        label: citta,
      })),
    [cittaList]
  );

  // Opzioni per SearchableSelect - CAP
  const capOptions = useMemo(
    () =>
      capList.map((cap) => ({
        value: cap,
        label: cap,
      })),
    [capList]
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="bg-bigster-surface border border-bigster-border p-5 shadow-bigster-card">
      {/* Toolbar */}
      <div className="flex items-center gap-4">
        {/* Titolo */}
        <h3 className="text-sm font-bold text-bigster-text whitespace-nowrap">
          Filtri e Ordinamento
        </h3>

        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search className="h-4 w-4 text-bigster-text-muted" />
          </span>
          <input
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Cerca per titolo, cliente, consulente, HR..."
            className={`${inputBase} pl-10`}
          />
        </div>

        {/* Pulsante Filtri */}
        <Button
          variant="outline"
          onClick={() => setIsFilterDialogOpen(true)}
          className="relative rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-background px-4 py-2"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtri Avanzati
          {activeFiltersCount > 0 && (
            <span
              className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full"
              style={{ backgroundColor: "#e4d72b", color: "#000" }}
            >
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {/* Pulsante Ordinamento */}
        <Button
          variant="outline"
          onClick={() => setIsSortDialogOpen(true)}
          className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-background px-4 py-2"
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Ordina
        </Button>

        {/* Clear filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="rounded-none border font-semibold"
            style={{
              borderColor: "#ef4444",
              color: "#ef4444",
              backgroundColor: "rgba(239,68,68,0.05)",
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Cancella ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Modale Filtri */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="rounded-md bg-bigster-surface border border-bigster-border max-w-2xl max-h-[80vh] overflow-y-auto shadow-lg">
          <DialogHeader
            title="Filtra Selezioni"
            onClose={() => setIsFilterDialogOpen(false)}
          />

          <div className="space-y-5 p-5 pt-0">
            {/* SEZIONE: Filtri Base */}
            <div className="border border-bigster-border">
              <button
                onClick={() => toggleSection("base")}
                className="w-full flex items-center justify-between p-4 bg-bigster-background hover:bg-bigster-surface transition-colors"
              >
                <span className="font-semibold text-bigster-text">
                  Filtri Base
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-bigster-text transition-transform ${
                    expandedSections.base ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedSections.base && (
                <div className="p-4 space-y-4">
                  {/* Stato */}
                  <StandardSelect
                    label="Stato Selezione"
                    value={filters.stato}
                    onChange={(value) =>
                      setFilters({ ...filters, stato: value })
                    }
                    options={statusOptions}
                    emptyLabel="Tutti gli stati"
                  />

                  {/* Pacchetto */}
                  <StandardSelect
                    label="Tipo Pacchetto"
                    value={filters.pacchetto}
                    onChange={(value) =>
                      setFilters({ ...filters, pacchetto: value })
                    }
                    options={packageOptions}
                    emptyLabel="Tutti i pacchetti"
                  />

                  {/* Figura Professionale */}
                  <StandardSelect
                    label="Figura Professionale"
                    value={filters.figuraId}
                    onChange={(value) =>
                      setFilters({ ...filters, figuraId: value })
                    }
                    options={figureOptions}
                    emptyLabel="Tutte le figure"
                  />
                </div>
              )}
            </div>

            {/* SEZIONE: HR e Consulente */}
            <div className="border border-bigster-border">
              <button
                onClick={() => toggleSection("hr")}
                className="w-full flex items-center justify-between p-4 bg-bigster-background hover:bg-bigster-surface transition-colors"
              >
                <span className="font-semibold text-bigster-text">
                  HR e Consulente
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-bigster-text transition-transform ${
                    expandedSections.hr ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedSections.hr && (
                <div className="p-4 space-y-4">
                  {/* HR Status */}
                  <StandardSelect
                    label="Stato Assegnazione HR"
                    value={filters.hrStatus}
                    onChange={(value) =>
                      setFilters({ ...filters, hrStatus: value })
                    }
                    options={hrStatusOptions}
                    emptyLabel="Tutte"
                  />

                  {/* HR Specifica - SEARCHABLE */}
                  <SearchableSelect
                    label="Risorsa Umana Specifica"
                    value={filters.hrId}
                    onChange={(value) =>
                      setFilters({ ...filters, hrId: value })
                    }
                    options={hrOptions}
                    placeholder="Cerca HR per nome..."
                    emptyLabel="Tutte le HR"
                  />

                  {/* Consulente - SEARCHABLE */}
                  <SearchableSelect
                    label="Consulente"
                    value={filters.consulenteId}
                    onChange={(value) =>
                      setFilters({ ...filters, consulenteId: value })
                    }
                    options={consulentiOptions}
                    placeholder="Cerca consulente per nome..."
                    emptyLabel="Tutti i consulenti"
                  />
                </div>
              )}
            </div>

            {/* SEZIONE: Company */}
            <div className="border border-bigster-border">
              <button
                onClick={() => toggleSection("company")}
                className="w-full flex items-center justify-between p-4 bg-bigster-background hover:bg-bigster-surface transition-colors"
              >
                <span className="font-semibold text-bigster-text">
                  Filtri Cliente (Company)
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-bigster-text transition-transform ${
                    expandedSections.company ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedSections.company && (
                <div className="p-4 space-y-4">
                  {/* Company ID - SEARCHABLE */}
                  <SearchableSelect
                    label="Cliente Specifico"
                    value={filters.companyId}
                    onChange={(value) =>
                      setFilters({ ...filters, companyId: value })
                    }
                    options={companiesOptions}
                    placeholder="Cerca cliente per nome..."
                    emptyLabel="Tutti i clienti"
                  />

                  {/* Company Nome - INPUT LIBERO */}
                  <div>
                    <label className="text-sm font-semibold text-bigster-text block mb-2">
                      Nome Cliente (ricerca)
                    </label>
                    <input
                      type="text"
                      value={filters.companyName}
                      onChange={(e) =>
                        setFilters({ ...filters, companyName: e.target.value })
                      }
                      placeholder="Es: Studio Dentistico..."
                      className={inputBase}
                    />
                  </div>

                  {/* Company Città - SEARCHABLE */}
                  <SearchableSelect
                    label="Città Cliente"
                    value={filters.companyCitta}
                    onChange={(value) =>
                      setFilters({ ...filters, companyCitta: value })
                    }
                    options={cittaOptions}
                    placeholder="Cerca città..."
                    emptyLabel="Tutte le città"
                  />

                  {/* Company CAP - SEARCHABLE */}
                  <SearchableSelect
                    label="CAP Cliente"
                    value={filters.companyCap}
                    onChange={(value) =>
                      setFilters({ ...filters, companyCap: value })
                    }
                    options={capOptions}
                    placeholder="Cerca CAP..."
                    emptyLabel="Tutti i CAP"
                  />

                  {/* Company Email - INPUT LIBERO */}
                  <div>
                    <label className="text-sm font-semibold text-bigster-text block mb-2">
                      Email Cliente
                    </label>
                    <input
                      type="text"
                      value={filters.companyEmail}
                      onChange={(e) =>
                        setFilters({ ...filters, companyEmail: e.target.value })
                      }
                      placeholder="Es: info@studio..."
                      className={inputBase}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SEZIONE: Date */}
            <div className="border border-bigster-border">
              <button
                onClick={() => toggleSection("dates")}
                className="w-full flex items-center justify-between p-4 bg-bigster-background hover:bg-bigster-surface transition-colors"
              >
                <span className="font-semibold text-bigster-text">
                  Filtri per Data
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-bigster-text transition-transform ${
                    expandedSections.dates ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedSections.dates && (
                <div className="p-4 space-y-4">
                  {/* Data Creazione */}
                  <div>
                    <label className="text-sm font-semibold text-bigster-text block mb-2">
                      Data Creazione - Da
                    </label>
                    <input
                      type="date"
                      value={filters.dataCreazioneDa}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          dataCreazioneDa: e.target.value,
                        })
                      }
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-bigster-text block mb-2">
                      Data Creazione - A
                    </label>
                    <input
                      type="date"
                      value={filters.dataCreazioneA}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          dataCreazioneA: e.target.value,
                        })
                      }
                      className={inputBase}
                    />
                  </div>

                  {/* Data Modifica */}
                  <div>
                    <label className="text-sm font-semibold text-bigster-text block mb-2">
                      Data Modifica - Da
                    </label>
                    <input
                      type="date"
                      value={filters.dataModificaDa}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          dataModificaDa: e.target.value,
                        })
                      }
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-bigster-text block mb-2">
                      Data Modifica - A
                    </label>
                    <input
                      type="date"
                      value={filters.dataModificaA}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          dataModificaA: e.target.value,
                        })
                      }
                      className={inputBase}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer modale */}
          {activeFiltersCount > 0 && (
            <div className="p-5 pt-0">
              <Button
                variant="outline"
                onClick={() => {
                  clearAllFilters();
                  setIsFilterDialogOpen(false);
                }}
                className="w-full rounded-none border font-semibold"
                style={{
                  borderColor: "#ef4444",
                  color: "#ef4444",
                  backgroundColor: "rgba(239,68,68,0.05)",
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancella tutti i filtri
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modale Ordinamento */}
      <Dialog open={isSortDialogOpen} onOpenChange={setIsSortDialogOpen}>
        <DialogContent className="rounded-md bg-bigster-surface border border-bigster-border max-w-md shadow-lg">
          <DialogHeader
            title="Ordina per"
            onClose={() => setIsSortDialogOpen(false)}
          />

          <div className="space-y-3 p-5 pt-0">
            <button
              onClick={() => {
                setSortBy("recent");
                setIsSortDialogOpen(false);
              }}
              className={`w-full p-4 text-left border rounded-md transition-all duration-200 ${
                sortBy === "recent"
                  ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                  : "bg-bigster-surface hover:bg-bigster-background border-gray-200"
              }`}
            >
              <p className="font-semibold">Più Recenti</p>
              <p className="text-xs opacity-80">
                Per data di modifica decrescente
              </p>
            </button>

            <button
              onClick={() => {
                setSortBy("oldest");
                setIsSortDialogOpen(false);
              }}
              className={`w-full p-4 text-left border rounded-md transition-all duration-200 ${
                sortBy === "oldest"
                  ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                  : "bg-bigster-surface hover:bg-bigster-background border-gray-200"
              }`}
            >
              <p className="font-semibold">Più Vecchie</p>
              <p className="text-xs opacity-80">
                Per data di creazione crescente
              </p>
            </button>

            <button
              onClick={() => {
                setSortBy("title");
                setIsSortDialogOpen(false);
              }}
              className={`w-full p-4 text-left border rounded-md transition-all duration-200 ${
                sortBy === "title"
                  ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                  : "bg-bigster-surface hover:bg-bigster-background border-gray-200"
              }`}
            >
              <p className="font-semibold">Titolo (A-Z)</p>
              <p className="text-xs opacity-80">Ordine alfabetico per titolo</p>
            </button>

            <button
              onClick={() => {
                setSortBy("company");
                setIsSortDialogOpen(false);
              }}
              className={`w-full p-4 text-left border rounded-md transition-all duration-200 ${
                sortBy === "company"
                  ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                  : "bg-bigster-surface hover:bg-bigster-background border-gray-200"
              }`}
            >
              <p className="font-semibold">Cliente (A-Z)</p>
              <p className="text-xs opacity-80">
                Ordine alfabetico per nome cliente
              </p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
