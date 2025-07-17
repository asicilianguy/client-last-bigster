"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/lib/redux/features/auth/authSlice";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, LineChart, BarChart, PieChart } from "lucide-react";
import Link from "next/link";
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
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  useGetSelectionsQuery,
  useApproveSelectionMutation,
} from "@/lib/redux/features/selections/selectionsApiSlice";
import { useGetApplicationsQuery } from "@/lib/redux/features/applications/applicationsApiSlice";
import { useGetAnnouncementsQuery } from "@/lib/redux/features/announcements/announcementsApiSlice";
import toast from "react-hot-toast";
import {
  User,
  Selection,
  SelectionWithRelations,
  SelectionStatus,
  Application,
  ApplicationStatus,
  Announcement,
  AnnouncementStatus,
  Department,
  InterviewOutcome,
} from "@/types";

// KPI Card Component
function KpiCard({
  title,
  value,
  icon: Icon,
  description,
  color = "primary",
  className = "",
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  color?: string;
  className?: string;
}) {
  return (
    <Card
      className={`shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold mt-1">{value}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ChartCard Component
function ChartCard({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`shadow-sm ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// Interfaccia per i dati estesi di Selection con conteggi
interface SelectionWithCounts extends SelectionWithRelations {
  _count?: {
    annunci?: number;
    candidature?: number;
  };
}

// SelectionApprovalCard Component for CEO
function SelectionApprovalCard({
  selection,
  onApprove,
}: {
  selection: SelectionWithRelations;
  onApprove: (id: number) => Promise<any>;
}) {
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(selection.id);
      toast.success(`Selezione "${selection.titolo}" approvata con successo!`);
    } catch (error) {
      toast.error("Errore durante l'approvazione della selezione");
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Card className="shadow-sm border-l-4 border-l-yellow-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium">{selection.titolo}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800 border-yellow-300"
              >
                In attesa
              </Badge>
              <span className="text-xs text-muted-foreground">
                Reparto: {selection.reparto.nome}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Creata da: {selection.responsabile.nome}{" "}
              {selection.responsabile.cognome} il{" "}
              {new Date(selection.data_creazione).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/selezioni/${selection.id}`}>Dettagli</Link>
            </Button>
            <Button size="sm" onClick={handleApprove} disabled={isApproving}>
              {isApproving ? (
                <Spinner className="h-4 w-4 mr-1" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-1" />
              )}
              Approva
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
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
    applicationsData?.filter(
      (a: any) => a.stato === ApplicationStatus.ASSUNTO
    ).length || 0;
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
      <div className="flex justify-center p-12">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Direzionale
        </h1>
        <p className="text-muted-foreground">
          Panoramica completa del processo di selezione aziendale.
        </p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Selezioni Attive"
          value={activeSelections}
          description={`Su un totale di ${totalSelections} selezioni`}
          icon={Briefcase}
          color="blue"
        />
        <KpiCard
          title="In Attesa di Approvazione"
          value={pendingSelections.length}
          icon={AlertTriangle}
          color="yellow"
        />
        <KpiCard
          title="Candidature Totali"
          value={totalApplications}
          icon={Users}
          color="indigo"
        />
        <KpiCard
          title="Tasso di Assunzione"
          value={`${hiringRate}%`}
          description={`${hiredApplications} candidati assunti`}
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Pending Approvals Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Selezioni in attesa di approvazione
          </h2>
          {pendingSelections.length > 0 && (
            <Link href="/selezioni?filter=pending">
              <Button variant="ghost" size="sm">
                Visualizza tutte <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {pendingSelections.length > 0 ? (
          <div className="space-y-3">
            {pendingSelections
              .slice(0, 3)
              .map((selection: SelectionWithRelations) => (
                <SelectionApprovalCard
                  key={selection.id}
                  selection={selection}
                  onApprove={approveSelection}
                />
              ))}
            {pendingSelections.length > 3 && (
              <p className="text-sm text-center text-muted-foreground">
                + altre {pendingSelections.length - 3} selezioni in attesa
              </p>
            )}
          </div>
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
              <h3 className="text-lg font-medium">
                Nessuna selezione in attesa
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tutte le selezioni sono state approvate o assegnate.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Selezioni per Reparto" icon={BarChart}>
          <div className="h-60 flex items-center justify-center">
            {/* Placeholder per il grafico */}
            <div className="space-y-2 w-full">
              {Object.entries(departmentSelections).map(([dept, count]) => (
                <div key={dept} className="flex items-center">
                  <div className="w-24 text-sm">{dept}</div>
                  <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (count / totalSelections) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm font-medium">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Andamento Selezioni" icon={LineChart}>
          <div className="h-60 flex items-center justify-center text-muted-foreground">
            <p className="text-center text-sm">
              Grafico andamento selezioni attive e concluse negli ultimi 6 mesi
            </p>
          </div>
        </ChartCard>
      </div>
    </div>
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
      <div className="flex justify-center p-12">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Responsabile
        </h1>
        <p className="text-muted-foreground">
          Gestione delle selezioni per il reparto {user.reparto?.nome || ""}
        </p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Selezioni Attive"
          value={activeSelections}
          icon={Briefcase}
          color="blue"
        />
        <KpiCard
          title="In Attesa di Approvazione"
          value={pendingSelections}
          icon={Clock}
          color="yellow"
        />
        <KpiCard
          title="Candidature Ricevute"
          value={totalCandidatures}
          icon={Users}
          color="purple"
        />
        <KpiCard
          title="Selezioni Completate"
          value={closedSelections}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Recent Selections Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Le mie selezioni recenti</h2>
          <Link href="/selezioni">
            <Button variant="ghost" size="sm">
              Visualizza tutte <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {mySelections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mySelections.slice(0, 6).map((selection: SelectionWithCounts) => (
              <Card key={selection.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">
                      {selection.titolo}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={
                        selection.stato === SelectionStatus.CREATA
                          ? "bg-yellow-100 text-yellow-800"
                          : selection.stato === SelectionStatus.CHIUSA
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }
                    >
                      {selection.stato.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Figura:</span>
                      <span>{selection.figura_professionale?.nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Annunci:</span>
                      <span>{selection._count?.annunci || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Candidature:
                      </span>
                      <span>{selection._count?.candidature || 0}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href={`/selezioni/${selection.id}`}>Dettagli</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="p-6 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium">Nessuna selezione attiva</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Inizia creando una nuova selezione per il tuo reparto.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/selezioni/nuova">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nuova Selezione
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Interfaccia estesa per gli annunci con relazioni nidificate
interface AnnouncementWithNested extends Announcement {
  selezione?: Selection;
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
      <div className="flex justify-center p-12">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard HR</h1>
        <p className="text-muted-foreground">
          Gestione delle selezioni, annunci e candidature assegnate
        </p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Selezioni Assegnate"
          value={activeSelections}
          icon={Briefcase}
          color="blue"
        />
        <KpiCard
          title="Annunci Pubblicati"
          value={publishedAnnouncements}
          icon={FileText}
          color="green"
        />
        <KpiCard
          title="Candidature da Valutare"
          value={pendingApplications}
          icon={Users}
          color="yellow"
        />
        <KpiCard
          title="Colloqui da Gestire"
          value={scheduledInterviews}
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Assigned Selections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Selezioni assegnate</h2>
          <Link href="/selezioni">
            <Button variant="ghost" size="sm">
              Visualizza tutte <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {assignedSelections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedSelections
              .slice(0, 6)
              .map((selection: SelectionWithCounts) => (
                <Card key={selection.id} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">
                        {selection.titolo}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={
                          selection.stato === SelectionStatus.IN_CORSO
                            ? "bg-blue-100 text-blue-800"
                            : selection.stato ===
                              SelectionStatus.ANNUNCI_PUBBLICATI
                            ? "bg-indigo-100 text-indigo-800"
                            : selection.stato ===
                              SelectionStatus.CANDIDATURE_RICEVUTE
                            ? "bg-violet-100 text-violet-800"
                            : selection.stato ===
                              SelectionStatus.COLLOQUI_IN_CORSO
                            ? "bg-pink-100 text-pink-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {selection.stato.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reparto:</span>
                        <span>{selection.reparto?.nome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Annunci:</span>
                        <span>{selection._count?.annunci || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Candidature:
                        </span>
                        <span>{selection._count?.candidature || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link href={`/selezioni/${selection.id}`}>Gestisci</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="p-6 text-center">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium">
                Nessuna selezione assegnata
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Non hai ancora selezioni assegnate da gestire.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tasks Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Attività Urgenti" icon={AlertTriangle}>
          <div className="space-y-3">
            {pendingApplications > 0 && (
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-md border border-yellow-200">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-yellow-600" />
                  <span>{pendingApplications} candidature da valutare</span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/candidature?filter=pending">Visualizza</Link>
                </Button>
              </div>
            )}
            {scheduledInterviews > 0 && (
              <div className="flex items-center justify-between p-2 bg-purple-50 rounded-md border border-purple-200">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span>{scheduledInterviews} colloqui da gestire</span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/candidature?filter=interviews">Visualizza</Link>
                </Button>
              </div>
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

        <ChartCard title="Performance Candidature" icon={PieChart}>
          <div className="h-60 flex items-center justify-center text-muted-foreground">
            <p className="text-center text-sm">
              Tasso di conversione delle candidature nelle tue selezioni
            </p>
          </div>
        </ChartCard>
      </div>
    </div>
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
    <div className="container p-6 mx-auto">
      {user.ruolo === "CEO" && <CEODashboard />}
      {user.ruolo === "RESPONSABILE_REPARTO" && (
        <ResponsabileDashboard user={user} />
      )}
      {user.ruolo === "RISORSA_UMANA" && <HRDashboard user={user} />}
      {user.ruolo === "DEVELOPER" && <CEODashboard />}
    </div>
  );
}
