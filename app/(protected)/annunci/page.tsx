"use client"

import { useGetAnnouncementsQuery } from "@/lib/redux/features/announcements/announcementsApiSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { DataTable } from "./_components/data-table"
import { columns } from "./_components/columns"

export default function AnnunciPage() {
  const { data, error, isLoading } = useGetAnnouncementsQuery({})

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Errore nel caricamento degli annunci.</div>
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Gestione Annunci</CardTitle>
          <CardDescription>Visualizza, filtra e gestisci tutti gli annunci di lavoro.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data?.data || []} />
        </CardContent>
      </Card>
    </div>
  )
}
