"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Clock,
  Users,
  FileText,
  X,
  Filter,
} from "lucide-react";
import { User } from "@/types";
import { useUserRole } from "@/hooks/use-user-role";

interface FiltersSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (filter: string) => void;
  figureFilter: string;
  setFigureFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  departmentsData?: any;
  professionalFiguresData?: any;
  user: User;
}

export function FiltersSection({
  searchQuery,
  setSearchQuery,
  departmentFilter,
  setDepartmentFilter,
  figureFilter,
  setFigureFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  departmentsData,
  professionalFiguresData,
  user,
}: FiltersSectionProps) {
  const { isCEO, isResponsabile } = useUserRole();

  const hasActiveFilters =
    departmentFilter !== "all" ||
    figureFilter !== "all" ||
    statusFilter !== "all" ||
    searchQuery;

  const clearAllFilters = () => {
    setDepartmentFilter("all");
    setFigureFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
  };

  return (
    <motion.div
      className="overflow-hidden border-0 shadow-xl"
      style={{
        background:
          "linear-gradient(135deg, rgba(254, 241, 154, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%)",
        boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.08)",
        borderRadius: "12px",
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Header with gradient */}
      <div
        className="px-6 py-4 border-b"
        style={{
          background:
            "linear-gradient(90deg, rgba(228, 215, 43, 0.1) 0%, rgba(254, 241, 154, 0.1) 100%)",
          borderColor: "rgba(108, 78, 6, 0.1)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #e4d72b 0%, #fef19a 100%)",
            }}
          >
            <Filter className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg" style={{ color: "#6c4e06" }}>
              Filtri e Ricerca
            </h3>
            <p className="text-sm" style={{ color: "#666666" }}>
              Trova rapidamente le selezioni che ti interessano
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Search and Sort Row */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-6">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="🔍 Cerca per titolo, figura professionale o reparto..."
              className="pl-12 pr-4 py-3 text-base border-2 rounded-xl shadow-sm transition-all duration-200 focus:shadow-md"
              style={{
                borderColor: "rgba(108, 78, 6, 0.2)",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = "#e4d72b";
                e.target.style.backgroundColor = "#ffffff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(108, 78, 6, 0.2)";
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
              }}
            />
          </div>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="font-semibold shadow-sm hover:shadow-md transition-all duration-200 border-2 px-6 py-3 rounded-xl bg-transparent"
                style={{
                  borderColor: "rgba(108, 78, 6, 0.2)",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  color: "#6c4e06",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(228, 215, 43, 0.1)";
                  e.currentTarget.style.borderColor = "#e4d72b";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(255, 255, 255, 0.8)";
                  e.currentTarget.style.borderColor = "rgba(108, 78, 6, 0.2)";
                }}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Ordina per
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 shadow-xl border-0 rounded-xl p-2">
              <DropdownMenuItem
                onClick={() => setSortBy("recent")}
                className="rounded-lg p-3 cursor-pointer hover:bg-yellow-50 transition-colors"
              >
                <Clock className="h-4 w-4 mr-3" style={{ color: "#6c4e06" }} />
                <span className="font-medium">Più recenti</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy("applications")}
                className="rounded-lg p-3 cursor-pointer hover:bg-yellow-50 transition-colors"
              >
                <Users className="h-4 w-4 mr-3" style={{ color: "#6c4e06" }} />
                <span className="font-medium">Più candidature</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy("alphabetical")}
                className="rounded-lg p-3 cursor-pointer hover:bg-yellow-50 transition-colors"
              >
                <FileText
                  className="h-4 w-4 mr-3"
                  style={{ color: "#6c4e06" }}
                />
                <span className="font-medium">Nome (A-Z)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filter Selects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Department Filter */}
          <div className="space-y-3">
            <label
              className="text-sm font-bold flex items-center gap-2"
              style={{ color: "#6c4e06" }}
            >
              🏢 Reparto
            </label>
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
              disabled={!(isCEO || (isResponsabile && user.reparto_id === 544))}
            >
              <SelectTrigger
                className="border-2 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md py-3"
                style={{
                  borderColor: "rgba(108, 78, 6, 0.2)",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                }}
              >
                <SelectValue placeholder="Tutti i reparti" />
              </SelectTrigger>
              <SelectContent className="shadow-xl border-0 rounded-xl">
                <SelectItem value="all" className="rounded-lg">
                  Tutti i reparti
                </SelectItem>
                {departmentsData?.data.map((dept: any) => (
                  <SelectItem
                    key={dept.id}
                    value={dept.id.toString()}
                    className="rounded-lg"
                  >
                    {dept.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Professional Figure Filter */}
          <div className="space-y-3">
            <label
              className="text-sm font-bold flex items-center gap-2"
              style={{ color: "#6c4e06" }}
            >
              💼 Figura Professionale
            </label>
            <Select value={figureFilter} onValueChange={setFigureFilter}>
              <SelectTrigger
                className="border-2 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md py-3"
                style={{
                  borderColor: "rgba(108, 78, 6, 0.2)",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                }}
              >
                <SelectValue placeholder="Tutte le figure" />
              </SelectTrigger>
              <SelectContent className="shadow-xl border-0 rounded-xl">
                <SelectItem value="all" className="rounded-lg">
                  Tutte le figure
                </SelectItem>
                {professionalFiguresData?.data.map((figure: any) => (
                  <SelectItem
                    key={figure.id}
                    value={figure.id.toString()}
                    className="rounded-lg"
                  >
                    {figure.nome} ({figure.seniority})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <label
              className="text-sm font-bold flex items-center gap-2"
              style={{ color: "#6c4e06" }}
            >
              📊 Stato
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                className="border-2 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md py-3"
                style={{
                  borderColor: "rgba(108, 78, 6, 0.2)",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                }}
              >
                <SelectValue placeholder="Tutti gli stati" />
              </SelectTrigger>
              <SelectContent className="shadow-xl border-0 rounded-xl">
                <SelectItem value="all" className="rounded-lg">
                  Tutti gli stati
                </SelectItem>
                <SelectItem value="CREATA" className="rounded-lg">
                  Creata
                </SelectItem>
                <SelectItem value="APPROVATA" className="rounded-lg">
                  Approvata
                </SelectItem>
                <SelectItem value="IN_CORSO" className="rounded-lg">
                  In Corso
                </SelectItem>
                <SelectItem value="ANNUNCI_PUBBLICATI" className="rounded-lg">
                  Annunci Pubblicati
                </SelectItem>
                <SelectItem value="CANDIDATURE_RICEVUTE" className="rounded-lg">
                  Candidature Ricevute
                </SelectItem>
                <SelectItem value="COLLOQUI_IN_CORSO" className="rounded-lg">
                  Colloqui in Corso
                </SelectItem>
                <SelectItem value="COLLOQUI_CEO" className="rounded-lg">
                  Colloqui CEO
                </SelectItem>
                <SelectItem value="CHIUSA" className="rounded-lg">
                  Chiusa
                </SelectItem>
                <SelectItem value="ANNULLATA" className="rounded-lg">
                  Annullata
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Chips */}
        {hasActiveFilters && (
          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            {departmentFilter !== "all" && (
              <Badge
                variant="secondary"
                className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full font-medium shadow-sm hover:shadow-md transition-all duration-200"
                style={{
                  backgroundColor: "rgba(228, 215, 43, 0.2)",
                  color: "#6c4e06",
                  border: "1px solid rgba(228, 215, 43, 0.3)",
                }}
                onClick={() => setDepartmentFilter("all")}
              >
                🏢 Reparto:{" "}
                {
                  departmentsData?.data.find(
                    (d: any) => d.id.toString() === departmentFilter
                  )?.nome
                }
                <X className="h-3 w-3 ml-1 hover:bg-red-100 rounded-full" />
              </Badge>
            )}

            {figureFilter !== "all" && (
              <Badge
                variant="secondary"
                className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full font-medium shadow-sm hover:shadow-md transition-all duration-200"
                style={{
                  backgroundColor: "rgba(228, 215, 43, 0.2)",
                  color: "#6c4e06",
                  border: "1px solid rgba(228, 215, 43, 0.3)",
                }}
                onClick={() => setFigureFilter("all")}
              >
                💼 Figura:{" "}
                {
                  professionalFiguresData?.data.find(
                    (f: any) => f.id.toString() === figureFilter
                  )?.nome
                }
                <X className="h-3 w-3 ml-1 hover:bg-red-100 rounded-full" />
              </Badge>
            )}

            {statusFilter !== "all" && (
              <Badge
                variant="secondary"
                className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full font-medium shadow-sm hover:shadow-md transition-all duration-200"
                style={{
                  backgroundColor: "rgba(228, 215, 43, 0.2)",
                  color: "#6c4e06",
                  border: "1px solid rgba(228, 215, 43, 0.3)",
                }}
                onClick={() => setStatusFilter("all")}
              >
                📊 Stato: {statusFilter.replace(/_/g, " ")}
                <X className="h-3 w-3 ml-1 hover:bg-red-100 rounded-full" />
              </Badge>
            )}

            {searchQuery && (
              <Badge
                variant="secondary"
                className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full font-medium shadow-sm hover:shadow-md transition-all duration-200"
                style={{
                  backgroundColor: "rgba(228, 215, 43, 0.2)",
                  color: "#6c4e06",
                  border: "1px solid rgba(228, 215, 43, 0.3)",
                }}
                onClick={() => setSearchQuery("")}
              >
                🔍 Ricerca: {searchQuery}
                <X className="h-3 w-3 ml-1 hover:bg-red-100 rounded-full" />
              </Badge>
            )}

            {/* Clear All Filters */}
            <Badge
              variant="outline"
              className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full font-bold shadow-sm hover:shadow-md transition-all duration-200 border-2"
              style={{
                borderColor: "#ef4444",
                color: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.05)",
              }}
              onClick={clearAllFilters}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(239, 68, 68, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(239, 68, 68, 0.05)";
              }}
            >
              🗑️ Cancella tutto
              <X className="h-3 w-3 ml-1" />
            </Badge>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
