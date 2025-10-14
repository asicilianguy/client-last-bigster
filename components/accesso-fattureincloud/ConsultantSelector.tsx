"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { User, Search, Filter, X, Briefcase, Mail, Pin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGetConsultantsQuery } from "@/lib/redux/features/external/externalApiSlice";
import type { Consultant } from "@/lib/redux/features/external/externalApiSlice";

type ConsultantSortOption =
  | "name-asc"
  | "name-desc"
  | "companies-desc"
  | "area";

interface ConsultantSelectorProps {
  onSelect: (consultantId: number) => void;
  selectedId?: number | null;
}

const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2";

export default function ConsultantSelector({
  onSelect,
  selectedId,
}: ConsultantSelectorProps) {
  const { data, isLoading, error } = useGetConsultantsQuery();
  const consultants = data?.consultants || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<ConsultantSortOption>("name-asc");
  const [areaFilter, setAreaFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const selectedConsultant = useMemo(
    () => consultants.find((cons) => cons.id === selectedId),
    [consultants, selectedId]
  );

  const filteredAndSortedConsultants = useMemo(() => {
    let filtered = [...consultants];

    // Rimuovi l'elemento selezionato dalla lista principale
    if (selectedId) {
      filtered = filtered.filter((cons) => cons.id !== selectedId);
    }

    if (areaFilter !== "ALL") {
      filtered = filtered.filter(
        (consultant) => consultant.area === areaFilter
      );
    }

    if (roleFilter !== "ALL") {
      filtered = filtered.filter(
        (consultant) => consultant.role === roleFilter
      );
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (consultant) =>
          consultant.fullName.toLowerCase().includes(search) ||
          consultant.email.toLowerCase().includes(search) ||
          consultant.area.toLowerCase().includes(search) ||
          consultant.role.toLowerCase().includes(search)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.fullName.localeCompare(b.fullName);
        case "name-desc":
          return b.fullName.localeCompare(a.fullName);
        case "companies-desc":
          return b.companies - a.companies;
        case "area":
          return a.area.localeCompare(b.area);
        default:
          return 0;
      }
    });

    return filtered;
  }, [consultants, areaFilter, roleFilter, searchTerm, sortBy, selectedId]);

  const uniqueAreas = useMemo(() => {
    const areas = new Set(
      consultants.map((c) => c.area).filter((a): a is string => !!a)
    );
    return Array.from(areas).sort();
  }, [consultants]);

  const uniqueRoles = useMemo(() => {
    const roles = new Set(
      consultants.map((c) => c.role).filter((r): r is string => !!r)
    );
    return Array.from(roles).sort();
  }, [consultants]);

  const areaStats = useMemo(() => {
    const stats: Record<string, number> = { ALL: consultants.length };
    consultants.forEach((consultant) => {
      if (consultant.area) {
        stats[consultant.area] = (stats[consultant.area] || 0) + 1;
      }
    });
    return stats;
  }, [consultants]);

  const roleStats = useMemo(() => {
    const stats: Record<string, number> = { ALL: consultants.length };
    consultants.forEach((consultant) => {
      if (consultant.role) {
        stats[consultant.role] = (stats[consultant.role] || 0) + 1;
      }
    });
    return stats;
  }, [consultants]);

  const activeFiltersCount =
    (areaFilter !== "ALL" ? 1 : 0) + (roleFilter !== "ALL" ? 1 : 0);

  const clearAllFilters = () => {
    setAreaFilter("ALL");
    setRoleFilter("ALL");
    setSearchTerm("");
    setSortBy("name-asc");
  };

  const hasActiveFilters =
    areaFilter !== "ALL" ||
    roleFilter !== "ALL" ||
    searchTerm ||
    sortBy !== "name-asc";

  const ConsultantCard = ({
    consultant,
    isPinned = false,
  }: {
    consultant: Consultant;
    isPinned?: boolean;
  }) => (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => onSelect(consultant.id)}
      className={`w-full p-4 text-left hover:bg-bigster-surface transition-colors ${
        isPinned ? "bg-bigster-surface" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {isPinned && <Pin className="h-4 w-4 text-bigster-text mt-1" />}
        <User className="h-5 w-5 text-bigster-text-muted flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-base text-bigster-text">
              {consultant.fullName}
            </h4>
            {isPinned && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-bigster-primary text-bigster-primary-text border border-yellow-200 rounded-none">
                Selezionato
              </span>
            )}
          </div>
          <div className="space-y-1">
            {consultant.email && (
              <div className="flex items-center gap-2 text-sm text-bigster-text-muted">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>{consultant.email}</span>
              </div>
            )}
            {consultant.role && (
              <p className="text-sm text-bigster-text-muted">
                <span className="font-medium text-bigster-text">Ruolo:</span>{" "}
                {consultant.role}
              </p>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              {consultant.area && (
                <span
                  className="inline-flex items-center px-2 py-1 text-xs font-semibold border border-bigster-border rounded-none"
                  style={{
                    backgroundColor: consultant.areaColor || "#f3f4f6",
                    color: consultant.areaColor ? "#000" : "#666",
                  }}
                >
                  {consultant.area}
                </span>
              )}
              {consultant.companies > 0 && (
                <div className="flex items-center gap-1 text-sm text-bigster-text-muted">
                  <Briefcase className="h-4 w-4 flex-shrink-0" />
                  <span>{consultant.companies} aziende</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-12 w-12 text-bigster-text" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="shadow-bigster-card border border-bigster-border rounded-none">
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-2">
            Errore nel caricamento dei consulenti
          </p>
          <p className="text-sm text-bigster-text-muted">
            {error && "data" in error
              ? JSON.stringify(error.data)
              : "Unknown error"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar Inline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-wrap items-center gap-4">
          <h3 className="text-[15px] font-semibold text-bigster-text">
            Consulenti
          </h3>

          <div className="relative">
            <span className="absolute left-2.5 top-2.5">
              <Search width={18} height={18} className="text-bigster-text" />
            </span>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca per nome, email, area..."
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
            onChange={(e) => setSortBy(e.target.value as ConsultantSortOption)}
            className={`${inputBase} !w-[200px]`}
          >
            <option value="name-asc">Nome (A-Z)</option>
            <option value="name-desc">Nome (Z-A)</option>
            <option value="companies-desc">Aziende (maggiore)</option>
            <option value="area">Area (A-Z)</option>
          </select>
        </div>
      </motion.div>

      {/* Modale Filtri */}
      {isFiltersOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bigster-surface border border-bigster-border rounded-none shadow-bigster-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-5 border-b border-bigster-border">
              <h2 className="text-lg font-semibold text-bigster-text">
                Filtra consulenti
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
                  Filtra per area
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Button
                    onClick={() => setAreaFilter("ALL")}
                    className={`rounded-none border ${
                      areaFilter === "ALL"
                        ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                        : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-surface"
                    }`}
                  >
                    Tutte ({areaStats.ALL})
                  </Button>
                  {uniqueAreas.map((area) => (
                    <Button
                      key={area}
                      onClick={() => setAreaFilter(area)}
                      className={`rounded-none border ${
                        areaFilter === area
                          ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                          : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-surface"
                      }`}
                    >
                      {area} ({areaStats[area] || 0})
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-bigster-text">
                  Filtra per ruolo
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Button
                    onClick={() => setRoleFilter("ALL")}
                    className={`rounded-none border ${
                      roleFilter === "ALL"
                        ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                        : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-surface"
                    }`}
                  >
                    Tutti ({roleStats.ALL})
                  </Button>
                  {uniqueRoles.map((role) => (
                    <Button
                      key={role}
                      onClick={() => setRoleFilter(role)}
                      className={`rounded-none border ${
                        roleFilter === role
                          ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                          : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-surface"
                      }`}
                    >
                      {role} ({roleStats[role] || 0})
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

      {/* Selezione Pinnata */}
      {selectedConsultant && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="shadow-bigster-card border-2 border-bigster-primary rounded-none">
            <CardHeader className="bg-bigster-primary">
              <CardTitle className="text-base font-semibold text-bigster-primary-text flex items-center gap-2">
                <Pin className="h-5 w-5" />
                Selezione corrente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ConsultantCard consultant={selectedConsultant} isPinned={true} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Consultants List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay: selectedConsultant ? 0.2 : 0.1,
        }}
      >
        <Card className="shadow-bigster-card border border-bigster-border rounded-none">
          <CardHeader className="bg-bigster-surface">
            <CardTitle className="text-lg font-semibold text-bigster-text">
              <span className="font-normal text-bigster-text-muted mr-2">
                {selectedConsultant ? "Altri consulenti:" : "Trovati:"}
              </span>
              {filteredAndSortedConsultants.length}
              {filteredAndSortedConsultants.length !==
                consultants.length - (selectedConsultant ? 1 : 0) && (
                <span className="text-sm font-normal text-bigster-text-muted ml-2">
                  su {consultants.length - (selectedConsultant ? 1 : 0)}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-bigster-border">
              {filteredAndSortedConsultants.map((consultant: Consultant) => (
                <ConsultantCard key={consultant.id} consultant={consultant} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
