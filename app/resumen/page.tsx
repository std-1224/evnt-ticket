'use client'

import { SharedLayout } from "@/components/shared-layout"
import { OverviewPage } from "@/components/pages/overview-page"
import { withScannerProtection } from "@/components/auth/with-role-protection"

function ResumenPage() {
  return (
    <SharedLayout>
      <OverviewPage />
    </SharedLayout>
  )
}

export default withScannerProtection(ResumenPage)
