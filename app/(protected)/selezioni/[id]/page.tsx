"use client";

import { useParams } from "next/navigation";
import {
  useGetSelectionByIdQuery,
  useApproveSelectionMutation,
  useAssignHrMutation,
} from "@/lib/redux/features/selections/selectionsApiSlice";
import { useGetUsersByRoleQuery } from "@/lib/redux/features/users/usersApiSlice";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/lib/redux/features/auth/authSlice";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  CheckCircle,
  UserPlus,
  Briefcase,
  Building,
  Calendar,
  User,
  FileText,
  Info,
  AlertTriangle,
  FileSignature,
  Users,
  AlertCircle,
  Clock,
  ClipboardCheck,
  ClockIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AnnouncementsSection } from "./_components/announcements-section";
import { ApplicationsSection } from "./_components/applications-section";
import { cn } from "@/lib/utils";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelectionPermissions } from "@/hooks/use-selection-permissions";
import SelectionTimeline from "@/components/ui/bigster/SelectionTimeline";
import StatusBadge from "@/components/ui/bigster/StatusBadge";
import { useUserRole } from "@/hooks/use-user-role";
import { SelectionStatus } from "@/types";
import Breadcrumb from "@/components/ui/bigster/BreadCrumb";

const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-4">
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold">{value || "N/A"}</p>
    </div>
  </div>
);

const SelectionDetailsCard = ({ selection }: { selection: any }) => {
  return (
    <Card className="shadow-sm border-0 rounded-none !border-outline">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {selection.titolo}
            </CardTitle>
            <CardDescription>
              Dettagli della selezione e stato attuale.
            </CardDescription>
          </div>
          <StatusBadge status={selection.stato} className="text-sm" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
        <DetailItem
          icon={Building}
          label="Reparto"
          value={selection.reparto.nome}
        />
        <DetailItem
          icon={Briefcase}
          label="Figura Professionale"
          value={`${selection.figura_professionale.nome} (${selection.figura_professionale.seniority})`}
        />
        <DetailItem
          icon={User}
          label="Responsabile Reparto"
          value={`${selection.responsabile.nome} ${selection.responsabile.cognome}`}
        />
        <DetailItem
          icon={UserPlus}
          label="HR Assegnato"
          value={
            selection.risorsa_umana
              ? `${selection.risorsa_umana.nome} ${selection.risorsa_umana.cognome}`
              : "Non assegnato"
          }
        />
        <DetailItem
          icon={Calendar}
          label="Data Creazione"
          value={new Date(selection.data_creazione).toLocaleDateString()}
        />
        <DetailItem
          icon={Clock}
          label="Ultima Modifica"
          value={new Date(selection.data_modifica).toLocaleDateString()}
        />
        <DetailItem icon={FileText} label="Tipo" value={selection.tipo} />
        {selection.note && (
          <div className="sm:col-span-2">
            <p className="text-sm font-medium text-foreground">
              Note Aggiuntive
            </p>
            <p className="mt-2 whitespace-pre-wrap rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground">
              {selection.note}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SelectionActions = ({
  selection,
  user,
}: {
  selection: any;
  user: any;
}) => {
  const { isResponsabileHR } = useUserRole();
  const [approveSelection, { isLoading: isApproving }] =
    useApproveSelectionMutation();
  const [assignHr, { isLoading: isAssigning }] = useAssignHrMutation();
  const { data: hrUsersData, isLoading: isLoadingHrUsers } =
    useGetUsersByRoleQuery("RISORSA_UMANA");
  const [selectedHr, setSelectedHr] = useState<string | null>(null);

  // Use the useSelectionPermissions hook with the user passed as parameter
  const { canApprove, canAssignHR } = useSelectionPermissions(selection, user);

  const handleApprove = async () => {
    try {
      await approveSelection(selection.id).unwrap();
      toast.success("Selezione approvata con successo!");
    } catch (err) {
      toast.error("Errore durante l'approvazione.");
    }
  };

  const handleAssignHr = async () => {
    if (!selectedHr) {
      toast.error("Seleziona una risorsa umana.");
      return;
    }
    try {
      await assignHr({
        id: selection.id,
        risorsa_umana_id: Number(selectedHr),
      }).unwrap();
      toast.success("Risorsa umana assegnata con successo!");
    } catch (err) {
      toast.error("Errore durante l'assegnazione.");
    }
  };

  if (
    !canApprove &&
    !canAssignHR &&
    !(selection.stato === "APPROVATA" && selection.risorsa_umana_id)
  ) {
    return null;
  }

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <CardTitle>Azioni Rapide</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {canApprove && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-xl border-0 mb-6"
            style={{
              background:
                "linear-gradient(135deg, rgba(234, 179, 8, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)",
              boxShadow: "0px 8px 24px rgba(234, 179, 8, 0.12)",
            }}
          >
            {/* Header con gradiente */}
            <div
              className="px-6 py-4 border-b flex items-center gap-3"
              style={{
                background:
                  "linear-gradient(90deg, rgba(234, 179, 8, 0.12) 0%, rgba(254, 240, 138, 0.12) 100%)",
                borderColor: "rgba(234, 179, 8, 0.15)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #eab308 0%, #fde047 100%)",
                }}
              >
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: "#854d0e" }}>
                  In attesa di approvazione
                </h3>
                <p className="text-sm text-amber-600/80">
                  Questa selezione richiede la tua revisione
                </p>
              </div>
            </div>

            {/* Contenuto */}
            <div className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-100 p-1 mt-0.5">
                    <Info className="h-4 w-4 text-amber-600" />
                  </div>
                  <p className="text-amber-800">
                    Questa selezione è stata creata da un responsabile di
                    reparto e necessita della tua approvazione per poter
                    procedere con il processo di selezione.
                  </p>
                </div>

                {/* Button con effetti migliorati */}
                <Button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className={`mt-2 rounded-xl py-2.5 px-4 transition-all duration-300 shadow-sm transform 
                     ${
                       !isApproving
                         ? "hover:shadow-md hover:-translate-y-0.5"
                         : ""
                     }
                     ${
                       isApproving ? "bg-amber-400" : "bg-amber-500"
                     } text-white`}
                >
                  {isApproving ? (
                    <div className="flex items-center justify-center gap-2">
                      <Spinner className="h-4 w-4 text-white" />
                      <span>Approvazione in corso...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Approva Selezione</span>
                    </div>
                  )}
                </Button>

                {/* Nota aggiuntiva */}
                <div className="mt-1 text-xs text-amber-600/70 flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  <span>
                    Assicurati di aver rivisto attentamente i dettagli della
                    selezione prima di approvarla.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {canAssignHR && !selection.risorsa_umana_id && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-xl border-0 mb-6"
            style={{
              background:
                "linear-gradient(135deg, rgba(46, 126, 255, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)",
              boxShadow: "0px 8px 24px rgba(46, 126, 255, 0.12)",
            }}
          >
            {/* Header con gradiente */}
            <div
              className="px-6 py-4 border-b flex items-center gap-3"
              style={{
                background:
                  "linear-gradient(90deg, rgba(46, 126, 255, 0.12) 0%, rgba(214, 230, 255, 0.12) 100%)",
                borderColor: "rgba(46, 126, 255, 0.15)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #2e7eff 0%, #75a9ff 100%)",
                }}
              >
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: "#1e429f" }}>
                  Assegna una Risorsa Umana
                </h3>
                <p className="text-sm text-blue-600/80">
                  La selezione è pronta per essere gestita
                </p>
              </div>
            </div>

            {/* Contenuto */}
            <div className="p-6">
              <div className="flex flex-col gap-4">
                <p className="text-blue-800">
                  Seleziona un membro del team HR per avviare il processo di
                  selezione e gestire le candidature.
                </p>

                {/* Select con stile migliorato */}
                <div className="relative">
                  <Select
                    onValueChange={setSelectedHr}
                    disabled={isLoadingHrUsers}
                  >
                    <SelectTrigger
                      className="w-full border-2 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md py-3 pl-12"
                      style={{
                        borderColor: "rgba(46, 126, 255, 0.2)",
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      <SelectValue placeholder="Seleziona un HR Manager" />
                    </SelectTrigger>
                    <SelectContent className="shadow-xl border-0 rounded-xl">
                      {isLoadingHrUsers ? (
                        <div className="px-4 py-3 flex items-center justify-center">
                          <Spinner className="h-4 w-4 mr-2 text-blue-600" />
                          <span>Caricamento...</span>
                        </div>
                      ) : hrUsersData?.data.length === 0 ? (
                        <div className="px-4 py-3 text-center text-gray-500">
                          Nessun HR disponibile
                        </div>
                      ) : isResponsabileHR ? (
                        [...hrUsersData?.data, user].map((hr: any) => (
                          <SelectItem
                            key={hr.id}
                            value={hr.id.toString()}
                            className="rounded-lg py-2.5 px-3 hover:bg-blue-50 cursor-pointer"
                          >
                            {hr.nome} {hr.cognome}
                          </SelectItem>
                        ))
                      ) : (
                        hrUsersData?.data.map((hr: any) => (
                          <SelectItem
                            key={hr.id}
                            value={hr.id.toString()}
                            className="rounded-lg py-2.5 px-3 hover:bg-blue-50 cursor-pointer"
                          >
                            {hr.nome} {hr.cognome}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                </div>

                {/* Button con effetti migliorati */}
                <Button
                  onClick={handleAssignHr}
                  disabled={isAssigning || !selectedHr}
                  className={`rounded-xl py-2.5 px-4 transition-all duration-300 shadow-sm transform 
                     ${
                       selectedHr && !isAssigning
                         ? "hover:shadow-md hover:-translate-y-0.5"
                         : ""
                     }
                     ${!selectedHr ? "opacity-60 cursor-not-allowed" : ""}
                     ${isAssigning ? "bg-blue-400" : "bg-blue-600"} text-white`}
                >
                  {isAssigning ? (
                    <div className="flex items-center justify-center gap-2">
                      <Spinner className="h-4 w-4 text-white" />
                      <span>Assegnazione in corso...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      <span>Assegna HR</span>
                    </div>
                  )}
                </Button>

                {/* Informazioni aggiuntive */}
                <div className="mt-2 text-xs text-blue-600/70 flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-blue-400" />
                  <span>
                    Una volta assegnato, l'HR riceverà una notifica e potrà
                    iniziare a gestire la selezione.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {selection.stato === SelectionStatus.IN_CORSO &&
          selection.risorsa_umana_id && (
            <Alert className="border-green-400/50 bg-green-400/10 text-green-700">
              <CheckCircle className="h-4 w-4 !text-green-600" />
              <AlertTitle className="font-semibold">
                Pronta per Iniziare!
              </AlertTitle>
              <AlertDescription>
                La risorsa umana {selection.risorsa_umana.nome}{" "}
                {selection.risorsa_umana.cognome} può ora procedere con la
                creazione degli annunci.
              </AlertDescription>
            </Alert>
          )}

        {/* Messaggio di default quando non ci sono azioni disponibili */}
        {!canApprove &&
          !(canAssignHR && !selection.risorsa_umana_id) &&
          !(
            selection.stato === SelectionStatus.IN_CORSO &&
            selection.risorsa_umana_id
          ) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden rounded-xl border-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(148, 163, 184, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)",
                boxShadow: "0px 4px 16px rgba(148, 163, 184, 0.12)",
              }}
            >
              <div
                className="px-6 py-4 border-b flex items-center gap-3"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(148, 163, 184, 0.12) 0%, rgba(226, 232, 240, 0.12) 100%)",
                  borderColor: "rgba(148, 163, 184, 0.15)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)",
                  }}
                >
                  <ClipboardCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-700">
                    Nessuna azione richiesta
                  </h3>
                  <p className="text-sm text-slate-500">
                    Questa selezione sta procedendo normalmente
                  </p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-slate-100 p-1 mt-0.5">
                    <Info className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-slate-700">
                      {(() => {
                        switch (selection.stato) {
                          case "CHIUSA":
                            return "Questa selezione è stata completata. Non sono richieste ulteriori azioni.";
                          case "ANNULLATA":
                            return "Questa selezione è stata annullata. Non sono richieste ulteriori azioni.";
                          case "ANNUNCI_PUBBLICATI":
                            return "Gli annunci per questa selezione sono stati pubblicati. Il processo è attualmente gestito dalla risorsa umana assegnata.";
                          case "CANDIDATURE_RICEVUTE":
                            return "Sono state ricevute candidature per questa selezione. La risorsa umana assegnata sta gestendo il processo di screening.";
                          case "COLLOQUI_IN_CORSO":
                            return "I colloqui per questa selezione sono in corso. La risorsa umana assegnata sta gestendo il processo.";
                          case "COLLOQUI_CEO":
                            return "I colloqui finali con il CEO per questa selezione sono in corso.";
                          default:
                            return "Non ci sono azioni da intraprendere in questo momento. Lo stato della selezione è attualmente gestito dal personale assegnato.";
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
      </CardContent>
    </Card>
  );
};

export default function SelezioneDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const user = useSelector(selectCurrentUser);

  const { data, error, isLoading, refetch } = useGetSelectionByIdQuery(id, {
    skip: !id,
  });

  if (isLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center">
        <Alert variant="destructive">
          <AlertTitle>Errore</AlertTitle>
          <AlertDescription>
            Errore nel caricamento della selezione o selezione non trovata.
            <Button
              onClick={() => refetch()}
              variant="secondary"
              size="sm"
              className="mt-2"
            >
              Riprova
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const selection = data.data;

  // Use the selection permissions with user passed as parameter
  const { canCreateAnnouncements, canManageApplications } =
    useSelectionPermissions(selection, user);

  console.log({ canCreateAnnouncements, canManageApplications });

  return (
    <div className="animate-fade-in-up space-y-6">
      <Breadcrumb name="Selezioni" path="/selezioni" />
      <div className="p-5 !mt-0 space-y-5">
        {" "}
        <SelectionTimeline
          selection={selection}
          className="shadow-sm border-0"
        />
        <div className="grid gap-6 lg:grid-cols-6">
          <div className="space-y-6 lg:col-span-3">
            <SelectionDetailsCard selection={selection} />
            <SelectionActions selection={selection} user={user} />
          </div>
          <div className="lg:col-span-3">
            <Tabs defaultValue="announcements" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="announcements">
                  <FileSignature className="mr-2 h-4 w-4" />
                  Annunci
                </TabsTrigger>
                <TabsTrigger
                  value="applications"
                  disabled={!canManageApplications}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Candidature
                </TabsTrigger>
              </TabsList>
              <TabsContent value="announcements">
                {canCreateAnnouncements ? (
                  <AnnouncementsSection selectionId={selection.id} />
                ) : (
                  <Card className="shadow-sm border-0 mt-4">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      Non hai i permessi per gestire gli annunci.
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              <TabsContent value="applications">
                {canManageApplications ? (
                  <ApplicationsSection selectionId={selection.id} />
                ) : (
                  <Card className="shadow-sm border-0 mt-4">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      Non hai i permessi per visualizzare le candidature.
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
