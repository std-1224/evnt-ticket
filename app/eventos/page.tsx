'use client'

import { SharedLayout } from "@/components/shared-layout"
import { EventsPage } from "@/components/pages/events-page"
import { withAdminProtection } from "@/components/auth/with-role-protection"

function EventosPage() {
  return (
    <SharedLayout>
      <EventsPage />
    </SharedLayout>
  )
}

export default withAdminProtection(EventosPage)
