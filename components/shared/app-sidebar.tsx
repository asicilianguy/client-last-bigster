"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, Building, Users } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Image from "next/image"

export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname.startsWith(path)

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 p-2">
          <Image src="/logo.png" alt="BigSter Logo" width={40} height={40} />
          <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">BigSter</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/selezioni")}>
              <Link href="/selezioni">
                <Briefcase />
                <span className="group-data-[collapsible=icon]:hidden">Selezioni</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <Collapsible className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                  <Building />
                  <span className="group-data-[collapsible=icon]:hidden">Gestione</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild isActive={isActive("/gestione/figure-professionali")}>
                    <Link href="/gestione/figure-professionali">
                      <Users />
                      <span>Figure Professionali</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                {/* Add more management links here */}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>{/* Footer content if needed */}</SidebarFooter>
    </Sidebar>
  )
}
