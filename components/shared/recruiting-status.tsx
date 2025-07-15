"use client"

import { useGetSelectionsQuery } from "@/lib/redux/features/selections/selectionsApiSlice"
import { useGetAnnouncementsQuery } from "@/lib/redux/features/announcements/announcementsApiSlice"
import { useGetApplicationsQuery } from "@/lib/redux/features/applications/applicationsApiSlice"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Users, Briefcase, ChevronDown } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { StatusIndicator } from "../ui/status-indicator"
import { Badge } from "../ui/badge"

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

const selectionStatusConfig: { [key: string]: { label: string; color: string } } = {
  CREATA: { label: "Create", color: "bg-gray-400" },
  APPROVATA: { label: "Approvate", color: "bg-sky-500" },
  IN_CORSO: { label: "In Corso", color: "bg-blue-500" },
  ANNUNCI_PUBBLICATI: { label: "Annunci Pubblicati", color: "bg-indigo-500" },
  CANDIDATURE_RICEVUTE: { label: "Candidature", color: "bg-purple-500" },
  COLLOQUI_IN_CORSO: { label: "Colloqui", color: "bg-pink-500" },
  COLLOQUI_CEO: { label: "Colloqui CEO", color: "bg-fuchsia-500" },
  CHIUSA: { label: "Chiuse", color: "bg-green-500" },
}

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

const applicationStatusConfig: { [key: string]: { label: string; color: string } } = {
  RICEVUTA: { label: "Ricevute", color: "bg-gray-400" },
  TEST_INVIATO: { label: "Test Inviato", color: "bg-sky-500" },
  TEST_COMPLETATO: { label: "Test Completato", color: "bg-blue-500" },
  PRIMO_COLLOQUIO_PROGRAMMATO: { label: "1° Colloquio", color: "bg-indigo-500" },
  PRIMO_COLLOQUIO_EFFETTUATO: { label: "1° Colloquio Fatto", color: "bg-purple-500" },
  COLLOQUIO_CEO_PROGRAMMATO: { label: "Colloquio CEO", color: "bg-pink-500" },
  COLLOQUIO_CEO_EFFETTUATO: { label: "Colloquio CEO Fatto", color: "bg-fuchsia-500" },
  ASSUNTO: { label: "Assunti", color: "bg-green-500" },
}

const StatusFunnel = ({ title, icon: Icon, data, isLoading, statusOrder, statusConfig, link }: any) => {
  const pathname = usePathname()
  const isActive = pathname.startsWith(link)

  const counts = data?.reduce((acc: any, item: any) => {
    acc[item.stato] = (acc[item.stato] || 0) + 1
    return acc
  }, {})

  return (
    <Collapsible defaultOpen={isActive}>
      <CollapsibleTrigger asChild>
        <SidebarMenuItem>
          <SidebarMenuButton isActive={isActive} className="w-full justify-start font-semibold">
            <Icon className="h-5 w-5" />
            <span className="group-data-[collapsible=icon]:hidden">{title}</span>
            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180 group-data-[collapsible=icon]:hidden" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="relative ml-8 mt-2 mb-4 space-y-1 pl-5 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-border group-data-[collapsible=icon]:hidden">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full rounded-md" />)
            : statusOrder.map((status: any) => {
                const count = counts?.[status] || 0
                if (count === 0) return null
                const config = statusConfig[status]
                return (
                  <Link
                    href={`${link}?status=${status}`}
                    key={status}
                    className="group flex items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-accent"
                  >
                    <div className="flex items-center gap-2">
                      <StatusIndicator color={config.color} />
                      <span className="text-muted-foreground group-hover:text-accent-foreground">{config.label}</span>
                    </div>
                    <span className="font-medium text-foreground">{count}</span>
                  </Link>
                )
              })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function RecruitingStatus() {
  const { data: selectionsData, isLoading: isLoadingSelections } = useGetSelectionsQuery({})
  const { data: announcementsData, isLoading: isLoadingAnnouncements } = useGetAnnouncementsQuery({})
  const { data: applicationsData, isLoading: isLoadingApplications } = useGetApplicationsQuery({})
  const pathname = usePathname()

  return (
    <SidebarMenu className="pl-6">
      <StatusFunnel
        title="Selezioni"
        icon={Briefcase}
        data={selectionsData?.data}
        isLoading={isLoadingSelections}
        statusOrder={selectionStatusOrder}
        statusConfig={selectionStatusConfig}
        link="/selezioni"
      />

      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith("/annunci")} className="justify-start font-semibold">
          <Link href="/annunci">
            <FileText className="h-5 w-5" />
            <span className="group-data-[collapsible=icon]:hidden">Annunci</span>
            {isLoadingAnnouncements ? (
              <Skeleton className="ml-auto h-5 w-5 rounded-full" />
            ) : (
              <Badge variant="secondary" className="ml-auto group-data-[collapsible=icon]:hidden">
                {announcementsData?.data?.length || 0}
              </Badge>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <StatusFunnel
        title="Candidature"
        icon={Users}
        data={applicationsData?.data}
        isLoading={isLoadingApplications}
        statusOrder={applicationStatusOrder}
        statusConfig={applicationStatusConfig}
        link="/candidature"
      />
    </SidebarMenu>
  )
}
