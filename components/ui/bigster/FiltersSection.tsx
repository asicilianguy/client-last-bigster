"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (departmentFilter !== "all") count++;
    if (figureFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    return count;
  };

  return (
    <motion.div
      className="overflow-hidden border-0 shadow-lg"
      style={{
        background:
          "linear-gradient(135deg, rgba(254, 241, 154, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%)",
        boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.08)",
        borderRadius: "8px",
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="p-4 bg-[#FFFAD8]">
        <div className="flex gap-3 items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Cerca per titolo, figura professionale o reparto..."
              className="pl-10 pr-4 py-2.5 text-base border border-gray-200 rounded-md shadow-sm transition-all duration-200 focus:shadow-md"
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

          {/* Filter Dialog Trigger */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="relative font-medium shadow-sm hover:shadow-md transition-all duration-200 border px-3 py-2.5 rounded-md bg-transparent"
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
                <Filter className="h-5 w-5" />
                {getActiveFiltersCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md md:max-w-lg">
              <DialogHeader>
                <DialogTitle
                  className="text-lg font-bold"
                  style={{ color: "#6c4e06" }}
                >
                  Filtri e Ordinamento
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                {/* Sort Options */}
                <div className="space-y-2">
                  <label
                    className="text-sm font-bold"
                    style={{ color: "#6c4e06" }}
                  >
                    Ordina per
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={sortBy === "recent" ? "default" : "outline"}
                      className={`flex items-center justify-center gap-2 py-2 rounded-md ${
                        sortBy === "recent"
                          ? "bg-yellow-100 text-amber-800 border border-yellow-200"
                          : "border border-gray-200"
                      }`}
                      onClick={() => setSortBy("recent")}
                    >
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Più recenti</span>
                    </Button>
                    <Button
                      variant={
                        sortBy === "applications" ? "default" : "outline"
                      }
                      className={`flex items-center justify-center gap-2 py-2 rounded-md ${
                        sortBy === "applications"
                          ? "bg-yellow-100 text-amber-800 border border-yellow-200"
                          : "border border-gray-200"
                      }`}
                      onClick={() => setSortBy("applications")}
                    >
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Più candidature</span>
                    </Button>
                    <Button
                      variant={
                        sortBy === "alphabetical" ? "default" : "outline"
                      }
                      className={`flex items-center justify-center gap-2 py-2 rounded-md ${
                        sortBy === "alphabetical"
                          ? "bg-yellow-100 text-amber-800 border border-yellow-200"
                          : "border border-gray-200"
                      }`}
                      onClick={() => setSortBy("alphabetical")}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Nome (A-Z)</span>
                    </Button>
                  </div>
                </div>

                {/* Filter Selects */}
                <div className="space-y-5">
                  {/* Department Filter */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label
                        className="text-sm font-bold"
                        style={{ color: "#6c4e06" }}
                      >
                        Reparto
                      </label>
                      {departmentFilter !== "all" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDepartmentFilter("all")}
                        >
                          <X className="h-3 w-3 mr-1" /> Rimuovi filtro
                        </Button>
                      )}
                    </div>
                    <div className="relative">
                      <Select
                        value={departmentFilter}
                        onValueChange={setDepartmentFilter}
                        disabled={
                          !(isCEO || (isResponsabile && user.reparto_id === 12))
                        }
                      >
                        <SelectTrigger
                          className="border rounded-md shadow-sm transition-all duration-200 hover:shadow-md py-2"
                          style={{
                            borderColor: "rgba(108, 78, 6, 0.2)",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                          }}
                        >
                          <SelectValue placeholder="Tutti i reparti" />
                        </SelectTrigger>
                        <SelectContent className="shadow-lg border rounded-md">
                          <SelectItem value="all">Tutti i reparti</SelectItem>
                          {departmentsData?.data.map((dept: any) => (
                            <SelectItem
                              key={dept.id}
                              value={dept.id.toString()}
                            >
                              {dept.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Professional Figure Filter */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label
                        className="text-sm font-bold"
                        style={{ color: "#6c4e06" }}
                      >
                        Figura Professionale
                      </label>
                      {figureFilter !== "all" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setFigureFilter("all")}
                        >
                          <X className="h-3 w-3 mr-1" /> Rimuovi filtro
                        </Button>
                      )}
                    </div>
                    <div className="relative">
                      <Select
                        value={figureFilter}
                        onValueChange={setFigureFilter}
                      >
                        <SelectTrigger
                          className="border rounded-md shadow-sm transition-all duration-200 hover:shadow-md py-2"
                          style={{
                            borderColor: "rgba(108, 78, 6, 0.2)",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                          }}
                        >
                          <SelectValue placeholder="Tutte le figure" />
                        </SelectTrigger>
                        <SelectContent className="shadow-lg border rounded-md">
                          <SelectItem value="all">Tutte le figure</SelectItem>
                          {professionalFiguresData?.data.map((figure: any) => (
                            <SelectItem
                              key={figure.id}
                              value={figure.id.toString()}
                            >
                              {figure.nome} ({figure.seniority})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label
                        className="text-sm font-bold"
                        style={{ color: "#6c4e06" }}
                      >
                        Stato
                      </label>
                      {statusFilter !== "all" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setStatusFilter("all")}
                        >
                          <X className="h-3 w-3 mr-1" /> Rimuovi filtro
                        </Button>
                      )}
                    </div>
                    <div className="relative">
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger
                          className="border rounded-md shadow-sm transition-all duration-200 hover:shadow-md py-2"
                          style={{
                            borderColor: "rgba(108, 78, 6, 0.2)",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                          }}
                        >
                          <SelectValue placeholder="Tutti gli stati" />
                        </SelectTrigger>
                        <SelectContent className="shadow-lg border rounded-md">
                          <SelectItem value="all">Tutti gli stati</SelectItem>
                          <SelectItem value="CREATA">Creata</SelectItem>
                          <SelectItem value="APPROVATA">Approvata</SelectItem>
                          <SelectItem value="IN_CORSO">In Corso</SelectItem>
                          <SelectItem value="ANNUNCI_PUBBLICATI">
                            Annunci Pubblicati
                          </SelectItem>
                          <SelectItem value="CANDIDATURE_RICEVUTE">
                            Candidature Ricevute
                          </SelectItem>
                          <SelectItem value="COLLOQUI_IN_CORSO">
                            Colloqui in Corso
                          </SelectItem>
                          <SelectItem value="COLLOQUI_CEO">
                            Colloqui CEO
                          </SelectItem>
                          <SelectItem value="CHIUSA">Chiusa</SelectItem>
                          <SelectItem value="ANNULLATA">Annullata</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 w-full mt-4 rounded-md font-semibold shadow-sm hover:shadow-md transition-all duration-200 border"
                    style={{
                      borderColor: "#ef4444",
                      color: "#ef4444",
                      backgroundColor: "rgba(239, 68, 68, 0.05)",
                    }}
                    onClick={() => {
                      clearAllFilters();
                      setIsDialogOpen(false);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(239, 68, 68, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(239, 68, 68, 0.05)";
                    }}
                  >
                    <X className="h-4 w-4" /> Cancella tutti i filtri
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Filters Chips */}
        {hasActiveFilters && (
          <motion.div
            className="flex flex-wrap gap-2 mt-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            {departmentFilter !== "all" && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 cursor-pointer px-3 py-1 rounded-md font-medium shadow-sm hover:shadow-md transition-all duration-200"
                style={{
                  backgroundColor: "rgba(228, 215, 43, 0.2)",
                  color: "#6c4e06",
                  border: "1px solid rgba(228, 215, 43, 0.3)",
                }}
                onClick={() => setDepartmentFilter("all")}
              >
                Reparto:{" "}
                {
                  departmentsData?.data.find(
                    (d: any) => d.id.toString() === departmentFilter
                  )?.nome
                }
                <X className="h-3 w-3 ml-1 hover:bg-red-100 rounded-sm" />
              </Badge>
            )}

            {figureFilter !== "all" && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 cursor-pointer px-3 py-1 rounded-md font-medium shadow-sm hover:shadow-md transition-all duration-200"
                style={{
                  backgroundColor: "rgba(228, 215, 43, 0.2)",
                  color: "#6c4e06",
                  border: "1px solid rgba(228, 215, 43, 0.3)",
                }}
                onClick={() => setFigureFilter("all")}
              >
                Figura:{" "}
                {
                  professionalFiguresData?.data.find(
                    (f: any) => f.id.toString() === figureFilter
                  )?.nome
                }
                <X className="h-3 w-3 ml-1 hover:bg-red-100 rounded-sm" />
              </Badge>
            )}

            {statusFilter !== "all" && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 cursor-pointer px-3 py-1 rounded-md font-medium shadow-sm hover:shadow-md transition-all duration-200"
                style={{
                  backgroundColor: "rgba(228, 215, 43, 0.2)",
                  color: "#6c4e06",
                  border: "1px solid rgba(228, 215, 43, 0.3)",
                }}
                onClick={() => setStatusFilter("all")}
              >
                Stato: {statusFilter.replace(/_/g, " ")}
                <X className="h-3 w-3 ml-1 hover:bg-red-100 rounded-sm" />
              </Badge>
            )}

            <Badge
              variant="outline"
              className="flex items-center gap-1 cursor-pointer px-3 py-1 rounded-md font-medium shadow-sm hover:shadow-md transition-all duration-200 border"
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
              Cancella <X className="h-3 w-3 ml-1" />
            </Badge>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
