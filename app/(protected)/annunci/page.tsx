"use client"

import { useGetAnnouncementsQuery } from "@/lib/redux/features/announcements/announcementsApiSlice"
import { DataTable } from "./_components/data-table"
import { columns } from "./_components/columns"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnnouncementsPage() {
  const { data: announcementsData, isLoading, isError } = useGetAnnouncementsQuery({})

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !announcementsData) {
    return (
      <div className="container mx-auto flex h-full items-center justify-center py-10">
        <p className="text-red-500">Impossibile caricare gli annunci.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Gestione Annunci</h1>
      <DataTable columns={columns} data={announcementsData.data} />
    </div>
  )
}
