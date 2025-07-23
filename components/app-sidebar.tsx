"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Home, Ticket, Calendar, User, LifeBuoy, LogOut, Settings, BarChart3, Users, QrCode, ShoppingCart, Receipt } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { useAuth } from "@/contexts/auth-context"
import { UserRoleBadge } from "./user-role-badge"

// Client-side menu items (for event browsing and ticket purchasing)
const clientMenuItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Browse Events",
    url: "/events",
    icon: Calendar,
  },
  {
    title: "My Tickets",
    url: "/tickets",
    icon: Ticket,
  },
  {
    title: "My Orders",
    url: "/orders",
    icon: Receipt,
  },
  {
    title: "Shopping Cart",
    url: "/cart",
    icon: ShoppingCart,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
]

// Admin menu items (for event management)
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

export function AppSidebar() {
  const pathname = usePathname()
  const { signOut, userFullName, hasAnyRole } = useAuth()

  // Determine which menu to show based on user role
  const isAdmin = hasAnyRole(['admin', 'organizer'])
  const menuItems = isAdmin ? adminMenuItems : clientMenuItems

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-lime-400 rounded-lg" />
            <h1 className="text-xl font-bold">{isAdmin ? 'Event Admin' : 'EventTickets'}</h1>
          </div>
          {userFullName && (
            <div className="text-sm text-muted-foreground">
              Hello, <span className="font-medium text-foreground">{userFullName}</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.url}>
                    <SidebarMenuButton isActive={pathname === item.url} tooltip={item.title}>
                      <item.icon className="h-5 w-5" />
                      <span className="group-data-[state=collapsed]:hidden">{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 space-y-2">
          <UserRoleBadge showIcon={true} className="justify-center" />
          <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
            <LifeBuoy className="h-5 w-5" />
            <span>Help</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
