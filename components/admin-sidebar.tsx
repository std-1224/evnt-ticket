"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Home, Settings, BarChart3, Users, QrCode, Calendar, User, LifeBuoy, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

// Admin & Scanner menu items
const adminMenuItems = [
  {
    title: "Dashboard",
    url: "/resumen",
    icon: Home,
  },
  {
    title: "My Events",
    url: "/my-events",
    icon: Calendar,
  },
  {
    title: "Create Event",
    url: "/eventos",
    icon: Settings,
  },
  {
    title: "Attendees",
    url: "/asistentes",
    icon: Users,
  },
  {
    title: "Scanner",
    url: "/escaner",
    icon: QrCode,
  },
  {
    title: "Analytics",
    url: "/analiticas",
    icon: BarChart3,
  },
  {
    title: "Registration",
    url: "/registro",
    icon: User,
  },
]

const supportItems = [
  {
    title: "Support",
    url: "#",
    icon: LifeBuoy,
  },
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { signOut, userFullName, hasAnyRole } = useAuth()

  // Filter menu items based on role
  const isAdmin = hasAnyRole(['admin'])
  const menuItems = isAdmin 
    ? adminMenuItems 
    : adminMenuItems.filter(item => 
        !['Create Event', 'Analytics', 'Registration'].includes(item.title)
      )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Home className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Event Admin</span>
                  <span className="truncate text-xs">Management Portal</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/profile">
                <User />
                <span>{userFullName || 'Admin User'}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <LogOut />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}
