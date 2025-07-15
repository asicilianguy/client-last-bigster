"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, Building, Users, LayoutDashboard, ChevronDown } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Image from "next/image"
import { RecruitingStatus } from "./recruiting-status"
import { useState } from "react"

const AppSidebarLink = ({
  href,
  children,
  icon: Icon,
}: { href: string; children: React.ReactNode; icon: React.ElementType }) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} className="justify-start">
        <Link href={href}>
          <Icon className="h-5 w-5" />
          <span className="group-data-[collapsible=icon]:hidden">{children}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(() => {
    if (pathname.startsWith("/selezioni") || pathname.startsWith("/candidature") || pathname.startsWith("/annunci")) {
      return "recruiting"
    }
    if (pathname.startsWith("/gestione")) {
      return "management"
    }
    return null
  })

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 p-2">
          <Image src="/logo.png" alt="BigSter Logo" width={40} height={40} />
          <h1 className="text-xl font-semibold tracking-tighter group-data-[collapsible=icon]:hidden">BigSter</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <AppSidebarLink href="/" icon={LayoutDashboard}>
            Dashboard
          </AppSidebarLink>

          <Collapsible
            open={openCollapsible === "recruiting"}
            onOpenChange={(isOpen) => setOpenCollapsible(isOpen ? "recruiting" : null)}
            className="group/collapsible"
          >
            <CollapsibleTrigger asChild>
              <SidebarMenuItem className="group-data-[collapsible=icon]:justify-center">
                <SidebarMenuButton className="justify-start">
                  <Briefcase className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">Recruiting</span>
                  <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </CollapsibleTrigger>
            <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
              <RecruitingStatus />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={openCollapsible === "management"}
            onOpenChange={(isOpen) => setOpenCollapsible(isOpen ? "management" : null)}
            className="group/collapsible"
          >
            <CollapsibleTrigger asChild>
              <SidebarMenuItem className="group-data-[collapsible=icon]:justify-center">
                <SidebarMenuButton className="justify-start">
                  <Building className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">Gestione</span>
                  <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </CollapsibleTrigger>
            <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
              <SidebarMenu className="pl-6">
                <AppSidebarLink href="/gestione/figure-professionali" icon={Users}>
                  Figure Prof.
                </AppSidebarLink>
                {/* Add more management links here */}
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>{/* Footer content if needed */}</SidebarFooter>
    </Sidebar>
  )
}
