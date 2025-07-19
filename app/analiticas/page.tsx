'use client'

import { SharedLayout } from "@/components/shared-layout"
import { AnalyticsPage } from "@/components/pages/analytics-page"
import { withAdminProtection } from "@/components/auth/with-role-protection"

function AnaliticasPage() {
  return (
    <SharedLayout>
      <AnalyticsPage />
    </SharedLayout>
  )
}

export default withAdminProtection(AnaliticasPage)
