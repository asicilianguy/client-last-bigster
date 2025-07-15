"use client"

import type React from "react"

import { useGetSelectionsQuery } from "@/lib/redux/features/selections/selectionsApiSlice"
import { useGetApplicationsQuery } from "@/lib/redux/features/applications/applicationsApiSlice"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { Skeleton } from "@/components/ui/skeleton"
import { Briefcase, FileSignature, UserCheck } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const selectionStatusOrder = [
  "CREATA",
  "APPROVATA",
  "IN_CORSO",
  "ANNUNCI_PUBBLICATI",
  "CANDIDATURE_RICEVUTE",
  "COLLOQUI_IN_CORSO",
  "COLLOQUI_CEO",
  "CHIUSA",
]

const applicationStatusOrder = [
  "RICEVUTA",
  "TEST_INVIATO",
  "TEST_COMPLETATO",
  "PRIMO_COLLOQUIO_PROGRAMMATO",
  "PRIMO_COLLOQUIO_EFFETTUATO",
  "COLLOQUIO_CEO_PROGRAMMATO",
  "COLLOQUIO_CEO_EFFETTUATO",
  "ASSUNTO",
]

const StatusLink = ({
  href,
  icon: Icon,
  children,
  count,
}: { href: string; icon: React.ElementType; children: React.ReactNode; count: number }) => {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="flex-grow">{children}</span>
      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{count}</span>
    </Link>
  )
}

export function RecruitingStatus() {
  const { data: selectionsData, isLoading: isLoadingSelections } = useGetSelectionsQuery({})
  const { data: applicationsData, isLoading: isLoadingApplications } = useGetApplicationsQuery({})

  const selectionCounts = selectionsData?.data.reduce((acc: { [key: string]: number }, selection: any) => {
    acc[selection.stato] = (acc[selection.stato] || 0) + 1
    return acc
  }, {})

  const applicationCounts = applicationsData?.data.reduce((acc: { [key: string]: number }, application: any) => {
    acc[application.stato] = (acc[application.stato] || 0) + 1
    return acc
  }, {})

  if (isLoadingSelections || isLoadingApplications) {
    return (
      <div className="space-y-4 p-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-2">
      <div>
        <StatusLink href="/selezioni" icon={Briefcase} count={selectionsData?.data.length || 0}>
          Selezioni
        </StatusLink>
        {selectionCounts && (
          <div className="mt-2 pl-5">
            <StatusIndicator
              statuses={selectionStatusOrder}
              counts={selectionCounts}
              labels={{
                CREATA: "Create",
                APPROVATA: "Approvate",
                IN_CORSO: "In Corso",
                ANNUNCI_PUBBLICATI: "Annunci Pubblicati",
                CANDIDATURE_RICEVUTE: "Candidature",
                COLLOQUI_IN_CORSO: "Colloqui",
                COLLOQUI_CEO: "Colloqui CEO",
                CHIUSA: "Chiuse",
              }}
            />
          </div>
        )}
      </div>

      <div>
        <StatusLink href="/annunci" icon={FileSignature} count={0}>
          Annunci
        </StatusLink>
      </div>

      <div>
        <StatusLink href="/candidature" icon={UserCheck} count={applicationsData?.data.length || 0}>
          Candidature
        </StatusLink>
        {applicationCounts && (
          <div className="mt-2 pl-5">
            <StatusIndicator
              statuses={applicationStatusOrder}
              counts={applicationCounts}
              labels={{
                RICEVUTA: "Ricevute",
                TEST_INVIATO: "Test Inviato",
                TEST_COMPLETATO: "Test Completato",
                PRIMO_COLLOQUIO_PROGRAMMATO: "1° Colloquio",
                PRIMO_COLLOQUIO_EFFETTUATO: "1° Colloquio Fatto",
                COLLOQUIO_CEO_PROGRAMMATO: "Colloquio CEO",
                COLLOQUIO_CEO_EFFETTUATO: "Colloquio CEO Fatto",
                ASSUNTO: "Assunti",
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
