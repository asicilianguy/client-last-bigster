"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Building2, Search, MapPin, Users, Filter, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGetCompaniesQuery } from "@/lib/redux/features/companies/companiesApiSlice";
import type { Company } from "@/types/company";

type CompanySortOption = "name-asc" | "name-desc" | "dipendenti-desc" | "citta";

interface CompanySelectorProps {
  onSelect: (companyId: number) => void;
  selectedId?: number | null; // NEW: per mostrare quale è selezionato
}

const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2";

export default function CompanySelector({
  onSelect,
  selectedId,
}: CompanySelectorProps) {
  const { data: companies = [], isLoading } = useGetCompaniesQuery();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<CompanySortOption>("name-asc");
  const [regionFilter, setRegionFilter] = useState<string>("ALL");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = [...companies];

    if (regionFilter !== "ALL") {
      filtered = filtered.filter((company) => company.regione === regionFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (company) =>
          company.nome.toLowerCase().includes(search) ||
          company.citta?.toLowerCase().includes(search) ||
          company.provincia?.toLowerCase().includes(search) ||
          company.partita_iva?.toLowerCase().includes(search)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.nome.localeCompare(b.nome);
        case "name-desc":
          return b.nome.localeCompare(a.nome);
        case "dipendenti-desc":
          return (b.numero_dipendenti || 0) - (a.numero_dipendenti || 0);
        case "citta":
          return (a.citta || "").localeCompare(b.citta || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [companies, regionFilter, searchTerm, sortBy]);

  const uniqueRegions = useMemo(() => {
    const regions = new Set(
      companies.map((c) => c.regione).filter((r): r is string => !!r)
    );
    return Array.from(regions).sort();
  }, [companies]);

  const regionStats = useMemo(() => {
    const stats: Record<string, number> = { ALL: companies.length };
    companies.forEach((company) => {
      if (company.regione) {
        stats[company.regione] = (stats[company.regione] || 0) + 1;
      }
    });
    return stats;
  }, [companies]);

  const activeFiltersCount = regionFilter !== "ALL" ? 1 : 0;

  const clearAllFilters = () => {
    setRegionFilter("ALL");
    setSearchTerm("");
    setSortBy("name-asc");
  };

  const hasActiveFilters =
    regionFilter !== "ALL" || searchTerm || sortBy !== "name-asc";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-12 w-12 text-bigster-text" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-wrap items-center gap-4">
          <h3 className="text-[15px] font-semibold text-bigster-text">
            Compagnie
          </h3>

          <div className="relative">
            <span className="absolute left-2.5 top-2.5">
              <Search width={18} height={18} className="text-bigster-text" />
            </span>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca per nome, città, P.IVA..."
              className={`${inputBase} pl-10 w-[500px]`}
            />
          </div>

          <Button
            variant="outline"
            className="relative rounded-none border border-bigster-border bg-bigster-surface text-bigster-text px-3 py-2 hover:bg-bigster-surface"
            onClick={() => setIsFiltersOpen(true)}
          >
            <Filter className="h-5 w-5" />
            {activeFiltersCount > 0 && (
              <span
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-bigster-primary-text text-xs flex items-center justify-center"
                style={{ backgroundColor: "#e4d72b" }}
              >
                {activeFiltersCount}
              </span>
            )}
          </Button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as CompanySortOption)}
            className={`${inputBase} w-[200px]`}
          >
            <option value="name-asc">Nome (A-Z)</option>
            <option value="name-desc">Nome (Z-A)</option>
            <option value="dipendenti-desc">Dipendenti (maggiore)</option>
            <option value="citta">Città (A-Z)</option>
          </select>
        </div>
      </motion.div>

      {isFiltersOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bigster-surface border border-bigster-border rounded-none shadow-bigster-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-5 border-b border-bigster-border">
              <h2 className="text-lg font-semibold text-bigster-text">
                Filtra compagnie
              </h2>
              <button
                onClick={() => setIsFiltersOpen(false)}
                className="text-bigster-text-muted hover:text-bigster-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-bigster-text">
                  Filtra per regione
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Button
                    onClick={() => setRegionFilter("ALL")}
                    className={`rounded-none border ${
                      regionFilter === "ALL"
                        ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                        : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-surface"
                    }`}
                  >
                    Tutte ({regionStats.ALL})
                  </Button>
                  {uniqueRegions.map((region) => (
                    <Button
                      key={region}
                      onClick={() => setRegionFilter(region)}
                      className={`rounded-none border ${
                        regionFilter === region
                          ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                          : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-surface"
                      }`}
                    >
                      {region} ({regionStats[region] || 0})
                    </Button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={() => {
                    clearAllFilters();
                    setIsFiltersOpen(false);
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
              )}
            </div>
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="shadow-bigster-card border border-bigster-border rounded-none">
          <CardHeader className="bg-bigster-surface">
            <CardTitle className="text-lg font-semibold text-bigster-text">
              <span className="font-normal text-bigster-text-muted mr-2">
                Trovate:
              </span>
              {filteredAndSortedCompanies.length}
              {filteredAndSortedCompanies.length !== companies.length && (
                <span className="text-sm font-normal text-bigster-text-muted ml-2">
                  su {companies.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-bigster-border">
              {filteredAndSortedCompanies.map(
                (company: Company, index: number) => (
                  <motion.button
                    key={company.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    onClick={() => onSelect(company.id)}
                    className={`w-full p-4 text-left hover:bg-bigster-surface transition-colors ${
                      selectedId === company.id ? "bg-bigster-surface" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-bigster-text-muted flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-base text-bigster-text">
                            {company.nome}
                          </h4>
                          {selectedId === company.id && (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-bigster-primary text-bigster-primary-text border border-yellow-200 rounded-none">
                              Selezionato
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {company.partita_iva && (
                            <p className="text-sm text-bigster-text-muted">
                              <span className="font-medium text-bigster-text">
                                P.IVA:
                              </span>{" "}
                              {company.partita_iva}
                            </p>
                          )}
                          {company.citta && (
                            <div className="flex items-center gap-2 text-sm text-bigster-text-muted">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span>
                                {company.citta}
                                {company.provincia && ` (${company.provincia})`}
                                {company.regione && ` - ${company.regione}`}
                              </span>
                            </div>
                          )}
                          {company.numero_dipendenti && (
                            <div className="flex items-center gap-2 text-sm text-bigster-text-muted">
                              <Users className="h-4 w-4 flex-shrink-0" />
                              <span>
                                {company.numero_dipendenti} dipendenti
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
