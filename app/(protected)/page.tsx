"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/lib/redux/features/auth/authSlice";
import Link from "next/link";
import { motion } from "framer-motion";

// Redux hooks
import {
  useGetSelectionsQuery,
  useApproveSelectionMutation,
} from "@/lib/redux/features/selections/selectionsApiSlice";
import { useGetApplicationsQuery } from "@/lib/redux/features/applications/applicationsApiSlice";
import { useGetAnnouncementsQuery } from "@/lib/redux/features/announcements/announcementsApiSlice";

// UI Components
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

// Icons
import {
  AlertTriangle,
  CheckCircle,
  UserPlus,
  Users,
  Building,
  Clock,
  FileText,
  Briefcase,
  TrendingUp,
  Calendar,
  PlusCircle,
  BarChart,
  LineChart,
  PieChart,
} from "lucide-react";

// Types
import {
  User,
  Selection,
  SelectionWithRelations,
  SelectionStatus,
  Application,
  ApplicationStatus,
  Announcement,
  AnnouncementStatus,
} from "@/types";

// Custom Components
import { KpiCard } from "@/components/ui/bigster/KpiCard";
import { ChartCard } from "@/components/ui/bigster/ChartCard";
import { SelectionCard } from "@/components/ui/bigster/SelectionCard";
import { SelectionApprovalCard } from "@/components/ui/bigster/SelectionApprovalCard";
import { SectionHeader } from "@/components/ui/bigster/SectionHeader";
import { EmptyState } from "@/components/ui/bigster/EmptyState";
import { ProgressBar } from "@/components/ui/bigster/ProgressBar";

// Interface for data with counts
interface SelectionWithCounts extends SelectionWithRelations {
  _count?: {
    annunci?: number;
    candidature?: number;
  };
}

// CEO Dashboard
function CEODashboard() {
  const { data: selectionsData, isLoading: isLoadingSelections } =
    useGetSelectionsQuery({});
  const { data: applicationsData, isLoading: isLoadingApplications } =
    useGetApplicationsQuery();
  const [approveSelection] = useApproveSelectionMutation();

  const pendingSelections =
    selectionsData?.data.filter(
      (s: SelectionWithCounts) => s.stato === SelectionStatus.CREATA
    ) || [];
  const totalSelections = selectionsData?.data.length || 0;
  const activeSelections =
    selectionsData?.data.filter(
      (s: SelectionWithCounts) =>
        ![
          SelectionStatus.CHIUSA,
          SelectionStatus.ANNULLATA,
          SelectionStatus.CREATA,
        ].includes(s.stato)
    ).length || 0;
  const totalApplications = applicationsData?.length || 0;
  const hiredApplications =
    applicationsData?.filter((a: any) => a.stato === ApplicationStatus.ASSUNTO)
      .length || 0;
  const hiringRate =
    totalApplications > 0
      ? Math.round((hiredApplications / totalApplications) * 100)
      : 0;

  // Selezioni per reparto (per grafico)
  const departmentSelections: Record<string, number> = {};
  selectionsData?.data.forEach((selection: SelectionWithRelations) => {
    const dept = selection.reparto.nome;
    departmentSelections[dept] = (departmentSelections[dept] || 0) + 1;
  });

  if (isLoadingSelections || isLoadingApplications) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <motion.div
      className="bigster-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bigster-page-header">
        <motion.h1
          className="bigster-page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Dashboard Direzionale
        </motion.h1>
        <motion.p
          className="bigster-page-description"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Panoramica completa del processo di selezione aziendale.
        </motion.p>
      </div>

      {/* KPI Section */}
      <motion.div
        className="bigster-grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <KpiCard
          title="Selezioni Attive"
          value={activeSelections}
          description={`Su un totale di ${totalSelections} selezioni`}
          icon={Briefcase}
          colorScheme="blue"
          index={0}
        />
        <KpiCard
          title="In Attesa di Approvazione"
          value={pendingSelections.length}
          icon={AlertTriangle}
          colorScheme="yellow"
          index={1}
        />
        <KpiCard
          title="Candidature Totali"
          value={totalApplications}
          icon={Users}
          colorScheme="indigo"
          index={2}
        />
        <KpiCard
          title="Tasso di Assunzione"
          value={`${hiringRate}%`}
          description={`${hiredApplications} candidati assunti`}
          icon={TrendingUp}
          colorScheme="green"
          index={3}
        />
      </motion.div>

      {/* Pending Approvals Section */}
      <div className="bigster-section">
        <SectionHeader
          title="Selezioni in attesa di approvazione"
          viewAllLink={
            pendingSelections.length > 0
              ? "/selezioni?filter=pending"
              : undefined
          }
        />

        {pendingSelections.length > 0 ? (
          <div className="space-y-3">
            {pendingSelections
              .slice(0, 3)
              .map((selection: SelectionWithRelations, index: number) => (
                <SelectionApprovalCard
                  key={selection.id}
                  selection={selection}
                  onApprove={approveSelection}
                  index={index}
                />
              ))}
            {pendingSelections.length > 3 && (
              <motion.p
                className="text-sm text-center text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                + altre {pendingSelections.length - 3} selezioni in attesa
              </motion.p>
            )}
          </div>
        ) : (
          <EmptyState
            icon={CheckCircle}
            title="Nessuna selezione in attesa"
            description="Tutte le selezioni sono state approvate o assegnate."
          />
        )}
      </div>

      {/* Charts Section */}
      <div className="bigster-grid-cols-2">
        <ChartCard title="Selezioni per Reparto" icon={BarChart} index={0}>
          <div className="h-60 flex flex-col justify-center space-y-2 w-full">
            {Object.entries(departmentSelections).map(
              ([dept, count], index) => (
                <ProgressBar
                  key={dept}
                  label={dept}
                  value={count}
                  max={totalSelections}
                  colorClass="bg-primary"
                />
              )
            )}
          </div>
        </ChartCard>

        <ChartCard title="Andamento Selezioni" icon={LineChart} index={1}>
          <div className="h-60 flex items-center justify-center text-muted-foreground">
            <p className="text-center text-sm">
              Grafico andamento selezioni attive e concluse negli ultimi 6 mesi
            </p>
          </div>
        </ChartCard>
      </div>
    </motion.div>
  );
}

// Responsabile Reparto Dashboard
function ResponsabileDashboard({ user }: { user: User }) {
  const { data: selectionsData, isLoading: isLoadingSelections } =
    useGetSelectionsQuery({});

  const mySelections =
    selectionsData?.data.filter(
      (s: SelectionWithCounts) => s.responsabile_id === user.id
    ) || [];
  const activeSelections = mySelections.filter(
    (s: SelectionWithCounts) =>
      ![SelectionStatus.CHIUSA, SelectionStatus.ANNULLATA].includes(s.stato)
  ).length;
  const pendingSelections = mySelections.filter(
    (s: SelectionWithCounts) => s.stato === SelectionStatus.CREATA
  ).length;
  const closedSelections = mySelections.filter(
    (s: SelectionWithCounts) => s.stato === SelectionStatus.CHIUSA
  ).length;

  // Calcola il numero di candidature alle proprie selezioni
  const totalCandidatures = mySelections.reduce(
    (acc: number, sel: SelectionWithCounts) =>
      acc + (sel._count?.candidature || 0),
    0
  );

  if (isLoadingSelections) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <motion.div
      className="bigster-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bigster-page-header">
        <motion.h1
          className="bigster-page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Dashboard Responsabile
        </motion.h1>
        <motion.p
          className="bigster-page-description"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Gestione delle selezioni per il reparto {user.reparto?.nome || ""}
        </motion.p>
      </div>

      {/* KPI Section */}
      <motion.div
        className="bigster-grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <KpiCard
          title="Selezioni Attive"
          value={activeSelections}
          icon={Briefcase}
          colorScheme="blue"
          index={0}
        />
        <KpiCard
          title="In Attesa di Approvazione"
          value={pendingSelections}
          icon={Clock}
          colorScheme="yellow"
          index={1}
        />
        <KpiCard
          title="Candidature Ricevute"
          value={totalCandidatures}
          icon={Users}
          colorScheme="purple"
          index={2}
        />
        <KpiCard
          title="Selezioni Completate"
          value={closedSelections}
          icon={CheckCircle}
          colorScheme="green"
          index={3}
        />
      </motion.div>

      {/* Recent Selections Section */}
      <div className="bigster-section">
        <SectionHeader
          title="Le mie selezioni recenti"
          viewAllLink="/selezioni"
        />

        {mySelections.length > 0 ? (
          <div className="bigster-grid-cols-3">
            {mySelections
              .slice(0, 6)
              .map((selection: SelectionWithCounts, index: number) => (
                <SelectionCard
                  key={selection.id}
                  selection={selection}
                  index={index}
                />
              ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="Nessuna selezione attiva"
            description="Inizia creando una nuova selezione per il tuo reparto."
            action={
              <Button asChild>
                <Link href="/selezioni/nuova">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nuova Selezione
                </Link>
              </Button>
            }
          />
        )}
      </div>
    </motion.div>
  );
}

// HR Dashboard
function HRDashboard({ user }: { user: User }) {
  const { data: selectionsData, isLoading: isLoadingSelections } =
    useGetSelectionsQuery({});
  const { data: announcementsData, isLoading: isLoadingAnnouncements } =
    useGetAnnouncementsQuery();
  const { data: applicationsData, isLoading: isLoadingApplications } =
    useGetApplicationsQuery();

  const assignedSelections =
    selectionsData?.data.filter(
      (s: SelectionWithCounts) => s.risorsa_umana_id === user.id
    ) || [];
  const activeSelections = assignedSelections.filter(
    (s: SelectionWithCounts) =>
      ![SelectionStatus.CHIUSA, SelectionStatus.ANNULLATA].includes(s.stato)
  ).length;

  // Annunci gestiti dall'HR
  const myAnnouncements =
    announcementsData?.filter((a: any) =>
      assignedSelections.some((s: Selection) => s.id === a.selezione?.id)
    ) || [];
  const publishedAnnouncements = myAnnouncements.filter(
    (a: any) => a.stato === AnnouncementStatus.PUBBLICATO
  ).length;

  // Candidature da gestire
  const pendingApplications =
    applicationsData?.filter(
      (a: any) =>
        assignedSelections.some(
          (s: Selection) => s.id === a.annuncio?.selezione_id
        ) &&
        [
          ApplicationStatus.RICEVUTA,
          ApplicationStatus.TEST_COMPLETATO,
        ].includes(a.stato)
    ).length || 0;

  // Colloqui da programmare
  const scheduledInterviews =
    applicationsData?.filter(
      (a: any) =>
        assignedSelections.some(
          (s: Selection) => s.id === a.annuncio?.selezione_id
        ) &&
        [
          ApplicationStatus.PRIMO_COLLOQUIO_PROGRAMMATO,
          ApplicationStatus.COLLOQUIO_CEO_PROGRAMMATO,
        ].includes(a.stato)
    ).length || 0;

  if (isLoadingSelections || isLoadingAnnouncements || isLoadingApplications) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <motion.div
      className="bigster-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bigster-page-header">
        <motion.h1
          className="bigster-page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Dashboard HR
        </motion.h1>
        <motion.p
          className="bigster-page-description"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Gestione delle selezioni, annunci e candidature assegnate
        </motion.p>
      </div>

      {/* KPI Section */}
      <motion.div
        className="bigster-grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <KpiCard
          title="Selezioni Assegnate"
          value={activeSelections}
          icon={Briefcase}
          colorScheme="blue"
          index={0}
        />
        <KpiCard
          title="Annunci Pubblicati"
          value={publishedAnnouncements}
          icon={FileText}
          colorScheme="green"
          index={1}
        />
        <KpiCard
          title="Candidature da Valutare"
          value={pendingApplications}
          icon={Users}
          colorScheme="yellow"
          index={2}
        />
        <KpiCard
          title="Colloqui da Gestire"
          value={scheduledInterviews}
          icon={Calendar}
          colorScheme="purple"
          index={3}
        />
      </motion.div>

      {/* Assigned Selections */}
      <div className="bigster-section">
        <SectionHeader title="Selezioni assegnate" viewAllLink="/selezioni" />

        {assignedSelections.length > 0 ? (
          <div className="bigster-grid-cols-3">
            {assignedSelections
              .slice(0, 6)
              .map((selection: SelectionWithCounts, index: number) => (
                <SelectionCard
                  key={selection.id}
                  selection={selection}
                  action="Gestisci"
                  index={index}
                />
              ))}
          </div>
        ) : (
          <EmptyState
            icon={Clock}
            title="Nessuna selezione assegnata"
            description="Non hai ancora selezioni assegnate da gestire."
          />
        )}
      </div>

      {/* Tasks Section */}
      <div className="bigster-grid-cols-2">
        <ChartCard title="Attività Urgenti" icon={AlertTriangle} index={0}>
          <div className="space-y-3">
            {pendingApplications > 0 && (
              <motion.div
                className="flex items-center justify-between p-2 bg-yellow-50 rounded-md border border-yellow-200"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-yellow-600" />
                  <span>{pendingApplications} candidature da valutare</span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/candidature?filter=pending">Visualizza</Link>
                </Button>
              </motion.div>
            )}
            {scheduledInterviews > 0 && (
              <motion.div
                className="flex items-center justify-between p-2 bg-purple-50 rounded-md border border-purple-200"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span>{scheduledInterviews} colloqui da gestire</span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/candidature?filter=interviews">Visualizza</Link>
                </Button>
              </motion.div>
            )}
            {pendingApplications === 0 && scheduledInterviews === 0 && (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Non ci sono attività urgenti da completare
                </p>
              </div>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Performance Candidature" icon={PieChart} index={1}>
          <div className="h-60 flex items-center justify-center text-muted-foreground">
            <p className="text-center text-sm">
              Tasso di conversione delle candidature nelle tue selezioni
            </p>
          </div>
        </ChartCard>
      </div>
    </motion.div>
  );
}

// Main HomePage component
export default function HomePage() {
  const router = useRouter();
  const user = useSelector(selectCurrentUser) as User | null;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (token && user) {
      setIsLoaded(true);
    } else if (!token) {
      router.replace("/login");
    }
  }, [user, token, router]);

  if (!isLoaded || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-16 w-16" />
      </div>
    );
  }

  return (
    <>
      {user.ruolo === "CEO" && <CEODashboard />}
      {user.ruolo === "RESPONSABILE_REPARTO" && (
        <ResponsabileDashboard user={user} />
      )}
      {user.ruolo === "RISORSA_UMANA" && <HRDashboard user={user} />}
      {user.ruolo === "DEVELOPER" && <CEODashboard />}
    </>
  );
}
