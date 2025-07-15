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
import { ArrowLeft, CheckCircle, UserPlus, Briefcase, Building, Calendar, User, FileText } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { AnnouncementsSection } from "./_components/announcements-section"
import { cn } from "@/lib/utils"
import React from "react"

const StatusBadge = ({ status, className }: { status: string; className?: string }) => {
  const statusConfig = {
    CREATA: { label: "Creata", color: "bg-yellow-500", textColor: "text-yellow-500" },
    APPROVATA: { label: "Approvata", color: "bg-sky-500", textColor: "text-sky-500" },
    IN_CORSO: { label: "In Corso", color: "bg-blue-500", textColor: "text-blue-500" },
    ANNUNCI_PUBBLICATI: { label: "Annunci Pubblicati", color: "bg-indigo-500", textColor: "text-indigo-500" },
    CANDIDATURE_RICEVUTE: { label: "Candidature Ricevute", color: "bg-purple-500", textColor: "text-purple-500" },
    COLLOQUI_IN_CORSO: { label: "Colloqui in Corso", color: "bg-pink-500", textColor: "text-pink-500" },
    COLLOQUI_CEO: { label: "Colloqui CEO", color: "bg-fuchsia-500", textColor: "text-fuchsia-500" },
    CHIUSA: { label: "Chiusa", color: "bg-green-500", textColor: "text-green-500" },
    ANNULLATA: { label: "Annullata", color: "bg-red-500", textColor: "text-red-500" },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status.replace(/_/g, " "),
    color: "bg-gray-500",
    textColor: "text-gray-500",
  }

  return (
    <Badge
      variant="outline"
      className={cn("border-0 bg-opacity-10 text-xs", config.textColor, config.color, className)}
    >
      <span className={cn("mr-2 h-2 w-2 rounded-full", config.color)}></span>
      {config.label}
    </Badge>
  )
}

const DetailItem = ({ icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-4">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
      {React.createElement(icon, { className: "h-5 w-5" })}
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "N/A"}</p>
    </div>
  </div>
)

const SelectionDetailsCard = ({ selection }: { selection: any }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-2xl">{selection.titolo}</CardTitle>
            <CardDescription>Dettagli della selezione e stato attuale.</CardDescription>
          </div>
          <StatusBadge status={selection.stato} className="text-sm" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
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
            <p className="mt-1 whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
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
    <Card>
      <CardHeader>
        <CardTitle>Azioni Rapide</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user.ruolo === "CEO" && selection.stato === "CREATA" && (
          <Alert variant="warning">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>In attesa di approvazione</AlertTitle>
            <AlertDescription>
              Questa selezione deve essere approvata per procedere.
              <Button onClick={handleApprove} disabled={isApproving} size="sm" className="mt-2">
                {isApproving ? <Spinner /> : <CheckCircle />}
                Approva Selezione
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {user.ruolo === "CEO" && selection.stato === "APPROVATA" && !selection.risorsa_umana_id && (
          <Alert variant="info">
            <UserPlus className="h-4 w-4" />
            <AlertTitle>Assegna una Risorsa Umana</AlertTitle>
            <AlertDescription>
              <div className="flex flex-col gap-2">
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
                <Button onClick={handleAssignHr} disabled={isAssigning || !selectedHr} size="sm">
                  {isAssigning ? <Spinner /> : <UserPlus />}
                  Assegna HR
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {selection.stato === "APPROVATA" && selection.risorsa_umana_id && (
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Pronta per Iniziare!</AlertTitle>
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
        <Spinner className="h-10 w-10" />
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/selezioni">
            <ArrowLeft />
            <span className="sr-only">Torna alle Selezioni</span>
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-muted-foreground">
          <Link href="/selezioni" className="hover:underline">
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
          {canManageAnnouncements && <AnnouncementsSection selectionId={selection.id} />}
        </div>
      </div>
    </div>
  )
}
