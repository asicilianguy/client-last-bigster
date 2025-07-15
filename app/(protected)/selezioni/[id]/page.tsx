"use client"

import { useParams } from "next/navigation"
import {
  useGetSelectionByIdQuery,
  useApproveSelectionMutation,
  useAssignHrMutation,
} from "@/lib/redux/features/selections/selectionsApiSlice"
import { useGetUsersByRoleQuery } from "@/lib/redux/features/users/usersApiSlice"
import { useSelector } from "react-redux"
import { selectCurrentUser } from "@/lib/redux/features/auth/authSlice"
import toast from "react-hot-toast"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
} from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { AnnouncementsSection } from "./_components/announcements-section"
import { ApplicationsSection } from "./_components/applications-section"
import { cn } from "@/lib/utils"
import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const StatusBadge = ({ status, className }: { status: string; className?: string }) => {
  const statusConfig = {
    CREATA: { label: "Creata", color: "bg-yellow-400/20 text-yellow-600 border-yellow-400/30" },
    APPROVATA: { label: "Approvata", color: "bg-sky-400/20 text-sky-600 border-sky-400/30" },
    IN_CORSO: { label: "In Corso", color: "bg-blue-400/20 text-blue-600 border-blue-400/30" },
    ANNUNCI_PUBBLICATI: { label: "Annunci Pubblicati", color: "bg-indigo-400/20 text-indigo-600 border-indigo-400/30" },
    CANDIDATURE_RICEVUTE: { label: "Candidature", color: "bg-purple-400/20 text-purple-600 border-purple-400/30" },
    COLLOQUI_IN_CORSO: { label: "Colloqui", color: "bg-pink-400/20 text-pink-600 border-pink-400/30" },
    COLLOQUI_CEO: { label: "Colloqui CEO", color: "bg-fuchsia-400/20 text-fuchsia-600 border-fuchsia-400/30" },
    CHIUSA: { label: "Chiusa", color: "bg-green-400/20 text-green-600 border-green-400/30" },
    ANNULLATA: { label: "Annullata", color: "bg-red-400/20 text-red-600 border-red-400/30" },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status.replace(/_/g, " "),
    color: "bg-gray-400/20 text-gray-600 border-gray-400/30",
  }

  return (
    <Badge variant="outline" className={cn("font-medium", config.color, className)}>
      {config.label}
    </Badge>
  )
}

const DetailItem = ({ icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-4">
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      {React.createElement(icon, { className: "h-5 w-5" })}
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold">{value || "N/A"}</p>
    </div>
  </div>
)

const SelectionDetailsCard = ({ selection }: { selection: any }) => {
  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">{selection.titolo}</CardTitle>
            <CardDescription>Dettagli della selezione e stato attuale.</CardDescription>
          </div>
          <StatusBadge status={selection.stato} className="text-sm" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
        <DetailItem icon={Building} label="Reparto" value={selection.reparto.nome} />
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
        <DetailItem icon={FileText} label="Tipo" value={selection.tipo} />
        {selection.note && (
          <div className="sm:col-span-2">
            <p className="text-sm font-medium text-foreground">Note Aggiuntive</p>
            <p className="mt-2 whitespace-pre-wrap rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground">
              {selection.note}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const SelectionActions = ({ selection, user }: { selection: any; user: any }) => {
  const [approveSelection, { isLoading: isApproving }] = useApproveSelectionMutation()
  const [assignHr, { isLoading: isAssigning }] = useAssignHrMutation()
  const { data: hrUsersData, isLoading: isLoadingHrUsers } = useGetUsersByRoleQuery("RISORSA_UMANA")
  const [selectedHr, setSelectedHr] = useState<string | null>(null)

  const handleApprove = async () => {
    try {
      await approveSelection(selection.id).unwrap()
      toast.success("Selezione approvata con successo!")
    } catch (err) {
      toast.error("Errore durante l'approvazione.")
    }
  }

  const handleAssignHr = async () => {
    if (!selectedHr) {
      toast.error("Seleziona una risorsa umana.")
      return
    }
    try {
      await assignHr({ id: selection.id, risorsa_umana_id: Number(selectedHr) }).unwrap()
      toast.success("Risorsa umana assegnata con successo!")
    } catch (err) {
      toast.error("Errore durante l'assegnazione.")
    }
  }

  if (!user) return null

  const showActions =
    (user.ruolo === "CEO" && (selection.stato === "CREATA" || selection.stato === "APPROVATA")) ||
    (user.ruolo === "RISORSA_UMANA" && selection.stato === "IN_CORSO")

  if (!showActions) return null

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <CardTitle>Azioni Rapide</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user.ruolo === "CEO" && selection.stato === "CREATA" && (
          <Alert className="border-yellow-400/50 bg-yellow-400/10 text-yellow-700">
            <AlertTriangle className="h-4 w-4 !text-yellow-600" />
            <AlertTitle className="font-semibold">In attesa di approvazione</AlertTitle>
            <AlertDescription>
              Questa selezione deve essere approvata per procedere.
              <Button
                onClick={handleApprove}
                disabled={isApproving}
                size="sm"
                className="mt-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                {isApproving ? <Spinner /> : <CheckCircle />}
                Approva Selezione
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {user.ruolo === "CEO" && selection.stato === "APPROVATA" && !selection.risorsa_umana_id && (
          <Alert className="border-blue-400/50 bg-blue-400/10 text-blue-700">
            <Info className="h-4 w-4 !text-blue-600" />
            <AlertTitle className="font-semibold">Assegna una Risorsa Umana</AlertTitle>
            <AlertDescription>
              <div className="flex flex-col gap-3">
                <p>Seleziona un membro del team HR per avviare la selezione.</p>
                <Select onValueChange={setSelectedHr} disabled={isLoadingHrUsers}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona HR" />
                  </SelectTrigger>
                  <SelectContent>
                    {hrUsersData?.data.map((hr: any) => (
                      <SelectItem key={hr.id} value={hr.id.toString()}>
                        {hr.nome} {hr.cognome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAssignHr}
                  disabled={isAssigning || !selectedHr}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                >
                  {isAssigning ? <Spinner /> : <UserPlus />}
                  Assegna HR
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {selection.stato === "APPROVATA" && selection.risorsa_umana_id && (
          <Alert className="border-green-400/50 bg-green-400/10 text-green-700">
            <CheckCircle className="h-4 w-4 !text-green-600" />
            <AlertTitle className="font-semibold">Pronta per Iniziare!</AlertTitle>
            <AlertDescription>
              La risorsa umana {selection.risorsa_umana.nome} {selection.risorsa_umana.cognome} può ora procedere con la
              creazione degli annunci.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default function SelezioneDetailPage() {
  const params = useParams()
  const id = params.id as string
  const user = useSelector(selectCurrentUser)

  const { data, error, isLoading, refetch } = useGetSelectionByIdQuery(id, {
    skip: !id,
  })

  if (isLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center">
        <Alert variant="destructive">
          <AlertTitle>Errore</AlertTitle>
          <AlertDescription>
            Errore nel caricamento della selezione o selezione non trovata.
            <Button onClick={() => refetch()} variant="secondary" size="sm" className="mt-2">
              Riprova
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const selection = data.data

  const canManageAnnouncements =
    (user.ruolo === "CEO" || user.id === selection.risorsa_umana_id) &&
    ["IN_CORSO", "ANNUNCI_PUBBLICATI", "CANDIDATURE_RICEVUTE", "COLLOQUI_IN_CORSO", "COLLOQUI_CEO"].includes(
      selection.stato,
    )

  const canViewApplications =
    user.ruolo === "CEO" ||
    user.ruolo === "DEVELOPER" ||
    user.id === selection.risorsa_umana_id ||
    user.id === selection.responsabile_id

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-full bg-transparent">
          <Link href="/selezioni">
            <ArrowLeft />
            <span className="sr-only">Torna alle Selezioni</span>
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-muted-foreground">
          <Link href="/selezioni" className="hover:text-primary">
            Selezioni
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{selection.titolo}</span>
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <SelectionDetailsCard selection={selection} />
          <SelectionActions selection={selection} user={user} />
        </div>
        <div className="lg:col-span-2">
          <Tabs defaultValue="announcements" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="announcements">
                <FileSignature className="mr-2 h-4 w-4" />
                Annunci
              </TabsTrigger>
              <TabsTrigger value="applications" disabled={!canViewApplications}>
                <Users className="mr-2 h-4 w-4" />
                Candidature
              </TabsTrigger>
            </TabsList>
            <TabsContent value="announcements">
              {canManageAnnouncements ? (
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
              {canViewApplications ? (
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
  )
}
