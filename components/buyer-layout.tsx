"use client"

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { BuyerSidebar } from "@/components/buyer-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"

interface BuyerLayoutProps {
  children: React.ReactNode
}

export function BuyerLayout({ children }: BuyerLayoutProps) {
  const pathname = usePathname()

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs = []

    // Add home
    breadcrumbs.push({ label: 'Home', href: '/', isActive: pathname === '/' })

    // Map path segments to readable names
    const pathMap: Record<string, string> = {
      'events': 'Browse Events',
      'event': 'Event Details',
      'tickets': 'My Tickets',
      'cart': 'Shopping Cart',
      'payment': 'Payment',
      'confirmation': 'Order Confirmation',
      'profile': 'Profile'
    }

    pathSegments.forEach((segment, index) => {
      const label = pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      const href = '/' + pathSegments.slice(0, index + 1).join('/')
      const isActive = index === pathSegments.length - 1
      
      // Skip adding home again if we're already on home
      if (!(segment === '' && pathname === '/')) {
        breadcrumbs.push({ label, href, isActive })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <SidebarProvider>
      <BuyerSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center">
                    {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                    <BreadcrumbItem className="hidden md:block">
                      {crumb.isActive ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
