"use client"

import { useGetAnnouncementsQuery } from "@/lib/redux/features/announcements/announcementsApiSlice"
import { DataTable } from "./_components/data-table"
import { columns } from "./_components/columns"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnnouncementsPage() {
  const { data: announcementsData, isLoading, isError, error } = useGetAnnouncementsQuery({})

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

  if (isError) {
    return <div className="text-red-500">Error loading announcements: {JSON.stringify(error)}</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Gestione Annunci</h1>
      <DataTable columns={columns} data={announcementsData?.data || []} />
    </div>
  )
}
