"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FiltersSection } from "@/components/ui/bigster/FiltersSection";
import { SelectionTabs } from "@/components/ui/bigster/SelectionTabs";
import { CreateSelectionModal } from "./[id]/_components/create-selection-modal";
import { User } from "@/types";

export default function SelezioniDashboardPage() {
  // Get data from Redux store
  const {
    data: selectionsData,
    error,
    isLoading,
  } = useGetSelectionsQuery({}, { refetchOnMountOrArgChange: true });
  const { data: departmentsData } = useGetDepartmentsQuery({});
  console.log({ departmentsData });

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

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (document.querySelector("main")) {
      document.querySelector("main")!.style.padding = "0px";
    }

    return () => {
      if (document.querySelector("main"))
        document.querySelector("main")!.style.padding = "1rem";
    };
  }, []);

  // First, get all selections accessible to the user based on role
  const accessibleSelections = useMemo(() => {
    if (!selectionsData?.data) return [];

    return selectionsData.data.filter((selection: any) => {
      // Prima verifica ruoli con accesso completo

      if (isCEO || isDeveloper) return true;

      // Caso speciale per responsabile risorse umane
      if (isResponsabile && Number(user?.reparto_id) === 12) return true;

      // Altri ruoli con accesso limitato
      if (isResponsabile) return selection.responsabile_id === user?.id;
      if (isHR) return selection.risorsa_umana_id === user?.id;

      return false;
    });
  }, [
    selectionsData,
    selectionsData?.data,
    isCEO,
    isResponsabile,
    isHR,
    isDeveloper,
    user?.id,
    user?.reparto_id,
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

  // Function to get action text based on user role and selection status
  // const getActionText = (selection: any) => {
  //   if (isCEO && selection.stato === "CREATA") return "Approva";
  //   if (isCEO && selection.stato === "APPROVATA" && !selection.risorsa_umana_id)
  //     return "Assegna HR";
  //   if (isHR) return "Gestisci";
  //   if (isResponsabile) return "Visualizza";
  //   return "Gestisci";
  // };

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
    <div className="space-y-6  animate-fade-in-up">
      {/* Header Section */}
      {/* <SectionHeader
        title="Dashboard Selezioni"
        action={
          canCreateSelection && (
            <div>
              <Button onClick={() => setIsModalOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Nuova Selezione
              </Button>

              <CreateSelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {}}
                userData={user as User}
              />
            </div>
          )
        }
      /> */}

      {/* Filters and Search */}
      <motion.div
        style={{
          boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.08)",
        }}
        initial={{ opacity: 0, transform: "translateY(-20px)" }}
        animate={{ opacity: 1, transform: "translateY(0)" }}
        transition={{
          duration: 0.3, // Durata ridotta
          ease: "easeOut", // Curva di easing più fluida
          opacity: { duration: 0.2 }, // Animazione opacity più veloce
          transform: { type: "spring", stiffness: 300, damping: 30 }, // Animazione spring per il movimento
        }}
        className="p-4 sm:p-6 !py-[10px] overflow-hidden border-0 sticky top[60px] z-10 shadow-lg flex bg-bigster-background items-center justify-between will-change-transform"
      >
        <FiltersSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          departmentFilter={departmentFilter}
          setDepartmentFilter={setDepartmentFilter}
          figureFilter={figureFilter}
          setFigureFilter={setFigureFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          departmentsData={departmentsData}
          professionalFiguresData={professionalFiguresData}
          user={user as User}
        />{" "}
        {canCreateSelection && (
          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2.5 px-2.5 py-2.5 border-none font-medium text-[15px] bg-bigster-primary text-bigster-text"
            >
              <PlusCircle className="h-4 w-4" />
              Nuova Selezione
            </button>

            <CreateSelectionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSuccess={() => {}}
              userData={user as User}
            />
          </div>
        )}
      </motion.div>

      {filteredSelections.length > 0 ? (
        <>
          {/* Selections Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-5 pt-0"
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
                // action={getActionText(selection)}
                // actionIcon={<ArrowRight className="h-4 w-4 mr-2" />}
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
