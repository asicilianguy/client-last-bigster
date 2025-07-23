"use client";

import { useState, useMemo } from "react";
import { useGetSelectionsQuery } from "@/lib/redux/features/selections/selectionsApiSlice";
import { useGetDepartmentsQuery } from "@/lib/redux/features/departments/departmentsApiSlice";
import { useGetAllProfessionalFiguresQuery } from "@/lib/redux/features/professional-figures/professionalFiguresApiSlice";
import { useUserRole } from "@/hooks/use-user-role";
import Link from "next/link";
import {
  PlusCircle,
  Users,
  FileText,
  ArrowRight,
  Briefcase,
  Building,
  Search,
  Filter,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";
import { SelectionCard } from "@/components/ui/bigster/SelectionCard";
import { EmptyState } from "@/components/ui/bigster/EmptyState";
import { SectionHeader } from "@/components/ui/bigster/SectionHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { KpiCard } from "@/components/ui/bigster/KpiCard";
import { Separator } from "@/components/ui/separator";

export default function SelezioniDashboardPage() {
  // Get data from Redux store
  const { data: selectionsData, error, isLoading } = useGetSelectionsQuery({});
  const { data: departmentsData } = useGetDepartmentsQuery({});
  const { data: professionalFiguresData } = useGetAllProfessionalFiguresQuery();
  const { isCEO, isResponsabile, isHR, isDeveloper, canCreateSelection, user } =
    useUserRole();

  // State for filtering and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [figureFilter, setFigureFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent"); // 'recent', 'applications', 'alphabetical'
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'active', 'pending', 'closed'

  // First, get all selections accessible to the user based on role
  const accessibleSelections = useMemo(() => {
    if (!selectionsData?.data) return [];

    return selectionsData.data.filter((selection: any) => {
      if (isCEO || isDeveloper) return true;
      if (isResponsabile) return selection.responsabile_id === user?.id;
      if (isHR) return selection.risorsa_umana_id === user?.id;
      return false;
    });
  }, [
    selectionsData?.data,
    isCEO,
    isResponsabile,
    isHR,
    isDeveloper,
    user?.id,
  ]);

  // Apply filters except tab filter to get base filtered selections
  const baseFilteredSelections = useMemo(() => {
    let filtered = [...accessibleSelections];

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (selection: any) =>
          selection.titolo.toLowerCase().includes(query) ||
          selection.figura_professionale.nome.toLowerCase().includes(query) ||
          selection.reparto.nome.toLowerCase().includes(query)
      );
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(
        (selection: any) => selection.reparto_id.toString() === departmentFilter
      );
    }

    // Apply professional figure filter
    if (figureFilter !== "all") {
      filtered = filtered.filter(
        (selection: any) =>
          selection.figura_professionale_id.toString() === figureFilter
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (selection: any) => selection.stato === statusFilter
      );
    }

    return filtered;
  }, [
    accessibleSelections,
    searchQuery,
    departmentFilter,
    figureFilter,
    statusFilter,
  ]);

  // Calculate counts for tabs based on base filtered selections
  const tabCounts = useMemo(() => {
    return {
      all: baseFilteredSelections.length,
      active: baseFilteredSelections.filter(
        (s) => !["CHIUSA", "ANNULLATA", "CREATA"].includes(s.stato)
      ).length,
      pending: baseFilteredSelections.filter((s) => s.stato === "CREATA")
        .length,
      closed: baseFilteredSelections.filter((s) =>
        ["CHIUSA", "ANNULLATA"].includes(s.stato)
      ).length,
    };
  }, [baseFilteredSelections]);

  // Then, apply tab filter to get final filtered selections
  const filteredSelections = useMemo(() => {
    let filtered = [...baseFilteredSelections];

    // Apply tab filter
    if (activeTab === "active") {
      filtered = filtered.filter(
        (selection: any) =>
          !["CHIUSA", "ANNULLATA", "CREATA"].includes(selection.stato)
      );
    } else if (activeTab === "pending") {
      filtered = filtered.filter(
        (selection: any) => selection.stato === "CREATA"
      );
    } else if (activeTab === "closed") {
      filtered = filtered.filter((selection: any) =>
        ["CHIUSA", "ANNULLATA"].includes(selection.stato)
      );
    }

    // Sort the filtered results
    return [...filtered].sort((a, b) => {
      if (sortBy === "recent") {
        return (
          new Date(b.data_creazione).getTime() -
          new Date(a.data_creazione).getTime()
        );
      } else if (sortBy === "applications") {
        return (b._count?.candidature || 0) - (a._count?.candidature || 0);
      } else if (sortBy === "alphabetical") {
        return a.titolo.localeCompare(b.titolo);
      }
      return 0;
    });
  }, [baseFilteredSelections, activeTab, sortBy]);

  // Calculate statistics based on currently filtered selections
  const stats = useMemo(() => {
    if (filteredSelections.length === 0) {
      return {
        total: 0,
        active: 0,
        pending: 0,
        closed: 0,
        byDepartment: {},
        byFigure: {},
        totalApplications: 0,
      };
    }

    const byDepartment: { [key: string]: number } = {};
    const byFigure: { [key: string]: number } = {};
    let totalApplications = 0;

    filteredSelections.forEach((selection: any) => {
      // Count by department
      const deptName = selection.reparto?.nome || "Unknown";
      byDepartment[deptName] = (byDepartment[deptName] || 0) + 1;

      // Count by figure
      const figureName = selection.figura_professionale?.nome || "Unknown";
      byFigure[figureName] = (byFigure[figureName] || 0) + 1;

      // Count applications
      totalApplications += selection._count?.candidature || 0;
    });

    return {
      total: filteredSelections.length,
      active: filteredSelections.filter(
        (s: any) => !["CHIUSA", "ANNULLATA", "CREATA"].includes(s.stato)
      ).length,
      pending: filteredSelections.filter((s: any) => s.stato === "CREATA")
        .length,
      closed: filteredSelections.filter((s: any) =>
        ["CHIUSA", "ANNULLATA"].includes(s.stato)
      ).length,
      byDepartment,
      byFigure,
      totalApplications,
    };
  }, [filteredSelections]);

  // Function to get action text based on user role and selection status
  const getActionText = (selection: any) => {
    if (isCEO && selection.stato === "CREATA") return "Approva";
    if (isCEO && selection.stato === "APPROVATA" && !selection.risorsa_umana_id)
      return "Assegna HR";
    if (isHR) return "Gestisci";
    if (isResponsabile) return "Visualizza";
    return "Gestisci";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-red-500">
        Errore nel caricamento delle selezioni.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 sm:p-8 animate-fade-in-up">
      {/* Header Section */}
      <SectionHeader
        title="Dashboard Selezioni"
        action={
          canCreateSelection && (
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              <Link href="/selezioni/nuova">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nuova Selezione
              </Link>
            </Button>
          )
        }
      />

      {/* KPI Cards - Now updated based on filtered selections */}
      <motion.div
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <KpiCard
          title="Totale Selezioni"
          value={stats.total}
          icon={Briefcase}
          colorScheme="blue"
          index={0}
        />
        <KpiCard
          title="Selezioni Attive"
          value={stats.active}
          icon={TrendingUp}
          colorScheme="green"
          index={1}
        />
        <KpiCard
          title="In Attesa"
          value={stats.pending}
          icon={Clock}
          colorScheme="yellow"
          index={2}
        />
        <KpiCard
          title="Candidature Totali"
          value={stats.totalApplications}
          icon={Users}
          colorScheme="purple"
          index={3}
        />
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        className="bg-background rounded-lg border shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per titolo, figura professionale o reparto..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Ordina per
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy("recent")}>
                    <Clock className="h-4 w-4 mr-2" />
                    Più recenti
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("applications")}>
                    <Users className="h-4 w-4 mr-2" />
                    Più candidature
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("alphabetical")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Nome (A-Z)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reparto</label>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tutti i reparti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i reparti</SelectItem>
                  {departmentsData?.data.map((dept: any) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Figura Professionale
              </label>
              <Select value={figureFilter} onValueChange={setFigureFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutte le figure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le figure</SelectItem>
                  {professionalFiguresData?.data.map((figure: any) => (
                    <SelectItem key={figure.id} value={figure.id.toString()}>
                      {figure.nome} ({figure.seniority})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Stato</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutti gli stati" />
                </SelectTrigger>
                <SelectContent>
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
                  <SelectItem value="COLLOQUI_CEO">Colloqui CEO</SelectItem>
                  <SelectItem value="CHIUSA">Chiusa</SelectItem>
                  <SelectItem value="ANNULLATA">Annullata</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter chips / Active filters display */}
          <div className="flex flex-wrap gap-2 mt-4">
            {departmentFilter !== "all" && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => setDepartmentFilter("all")}
              >
                Reparto:{" "}
                {
                  departmentsData?.data.find(
                    (d: any) => d.id.toString() === departmentFilter
                  )?.nome
                }
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {figureFilter !== "all" && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => setFigureFilter("all")}
              >
                Figura:{" "}
                {
                  professionalFiguresData?.data.find(
                    (f: any) => f.id.toString() === figureFilter
                  )?.nome
                }
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => setStatusFilter("all")}
              >
                Stato: {statusFilter.replace(/_/g, " ")}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {searchQuery && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => setSearchQuery("")}
              >
                Ricerca: {searchQuery}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}

            {/* Reset all filters button (only show if at least one filter is active) */}
            {(departmentFilter !== "all" ||
              figureFilter !== "all" ||
              statusFilter !== "all" ||
              searchQuery) && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 cursor-pointer border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => {
                  setDepartmentFilter("all");
                  setFigureFilter("all");
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
              >
                Cancella filtri
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs - Updated to show counts based on current filters */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Tutte ({tabCounts.all})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Attive ({tabCounts.active})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            In Attesa ({tabCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="closed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Chiuse ({tabCounts.closed})
          </TabsTrigger>
        </TabsList>

        {/* Tab Content - All tabs show the same content, but with different filters applied */}
        <TabsContent value={activeTab} className="mt-4">
          {filteredSelections.length > 0 ? (
            <>
              {/* Selection count and info */}
              <div className="mb-4 text-sm text-muted-foreground">
                Visualizzazione di {filteredSelections.length} selezioni
                {sortBy === "recent" && " (ordinate per data)"}
                {sortBy === "applications" &&
                  " (ordinate per numero candidature)"}
                {sortBy === "alphabetical" && " (ordinate alfabeticamente)"}
              </div>

              {/* Selections Grid */}
              <motion.div
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 },
                  },
                }}
                initial="hidden"
                animate="visible"
              >
                {filteredSelections.map((selection: any, index: number) => (
                  <SelectionCard
                    key={selection.id}
                    selection={selection}
                    action={getActionText(selection)}
                    actionIcon={<ArrowRight className="h-4 w-4 mr-2" />}
                    index={index}
                  />
                ))}
              </motion.div>
            </>
          ) : (
            <EmptyState
              icon={Briefcase}
              title="Nessuna selezione trovata"
              description={
                searchQuery ||
                departmentFilter !== "all" ||
                figureFilter !== "all" ||
                statusFilter !== "all"
                  ? "Prova a modificare i filtri per vedere più risultati."
                  : canCreateSelection
                  ? "Inizia creando una nuova selezione."
                  : "Non ci sono selezioni disponibili per te al momento."
              }
              action={
                searchQuery ||
                departmentFilter !== "all" ||
                figureFilter !== "all" ||
                statusFilter !== "all" ? (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setDepartmentFilter("all");
                      setFigureFilter("all");
                      setStatusFilter("all");
                      setSearchQuery("");
                    }}
                  >
                    Cancella filtri
                  </Button>
                ) : canCreateSelection ? (
                  <Button
                    asChild
                    className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  >
                    <Link href="/selezioni/nuova">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Crea la prima Selezione
                    </Link>
                  </Button>
                ) : null
              }
              className="col-span-full"
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Department and Figure Distribution - Only show if there are selections */}
      {filteredSelections.length > 0 && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mt-6">
          {/* Departments Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                Selezioni per Reparto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.byDepartment)
                  .sort((a, b) => b[1] - a[1]) // Sort by count (descending)
                  .map(([dept, count], index) => (
                    <div
                      key={dept}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-primary opacity-70" />
                        <span>{dept}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">{count}</span>
                        <span className="text-sm text-muted-foreground ml-1">
                          ({((count / stats.total) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Professional Figures Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Figure Professionali più Richieste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.byFigure)
                  .sort((a, b) => b[1] - a[1]) // Sort by count (descending)
                  .slice(0, 5) // Show only top 5
                  .map(([figure, count], index) => (
                    <div
                      key={figure}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-primary opacity-70" />
                        <span>{figure}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">{count}</span>
                        <span className="text-sm text-muted-foreground ml-1">
                          ({((count / stats.total) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Helper component for X icon
function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
