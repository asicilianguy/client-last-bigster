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
import { ArrowLeft, CheckCircle, UserPlus } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { AnnouncementsSection } from "./_components/announcements-section"

const SelectionDetailsCard = ({ selection }: { selection: any }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVATA":
      case "IN_CORSO":
      case "ANNUNCI_PUBBLICATI":
      case "CANDIDATURE_RICEVUTE":
      case "COLLOQUI_IN_CORSO":
      case "COLLOQUI_CEO":
        return "success"
      case "CHIUSA":
        return "secondary"
      case "ANNULLATA":
        return "destructive"
      case "CREATA":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{selection.titolo}</CardTitle>
            <CardDescription>Dettagli della selezione e stato attuale.</CardDescription>
          </div>
          <Badge variant={getStatusVariant(selection.stato)} className="text-sm">
            {selection.stato.replace(/_/g, " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div>
          <strong>Reparto:</strong> {selection.reparto.nome}
        </div>
        <div>
          <strong>Figura Professionale:</strong> {selection.figura_professionale.nome} (
          {selection.figura_professionale.seniority})
        </div>
        <div>
          <strong>Tipo:</strong> {selection.tipo}
        </div>
        <div>
          <strong>Responsabile Reparto:</strong> {selection.responsabile.nome} {selection.responsabile.cognome}
        </div>
        <div>
          <strong>Data Creazione:</strong> {new Date(selection.data_creazione).toLocaleDateString()}
        </div>
        {selection.risorsa_umana && (
          <div>
            <strong>HR Assegnato:</strong> {selection.risorsa_umana.nome} {selection.risorsa_umana.cognome}
          </div>
        )}
        {selection.note && (
          <div className="md:col-span-2">
            <strong>Note:</strong> <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selection.note}</p>
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
          <div className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="flex-1 font-medium">Questa selezione è in attesa di approvazione.</p>
            <Button onClick={handleApprove} disabled={isApproving}>
              {isApproving ? <Spinner /> : <CheckCircle className="mr-2" />}
              Approva Selezione
            </Button>
          </div>
        )}

        {user.ruolo === "CEO" && selection.stato === "APPROVATA" && !selection.risorsa_umana_id && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex-1 space-y-2">
              <p className="font-medium">Assegna una risorsa umana per avviare la selezione.</p>
              <Select onValueChange={setSelectedHr} disabled={isLoadingHrUsers}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un membro del team HR" />
                </SelectTrigger>
                <SelectContent>
                  {hrUsersData?.data.map((hr: any) => (
                    <SelectItem key={hr.id} value={hr.id.toString()}>
                      {hr.nome} {hr.cognome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAssignHr} disabled={isAssigning || !selectedHr} className="w-full sm:w-auto">
              {isAssigning ? <Spinner /> : <UserPlus className="mr-2" />}
              Assegna HR
            </Button>
          </div>
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
      <div className="flex justify-center items-center h-full">
        <Spinner className="h-10 w-10" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-red-500 text-center">
        <p>Errore nel caricamento della selezione o selezione non trovata.</p>
        <Button onClick={() => refetch()} className="mt-4">
          Riprova
        </Button>
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
      <Button variant="outline" size="sm" asChild>
        <Link href="/selezioni">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alle Selezioni
        </Link>
      </Button>

      <SelectionDetailsCard selection={selection} />
      <SelectionActions selection={selection} user={user} />
      {canManageAnnouncements && <AnnouncementsSection selectionId={selection.id} />}
    </div>
  )
}
