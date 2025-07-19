'use client'

import { SharedLayout } from "@/components/shared-layout"
import { QRScannerPage } from "@/components/pages/qr-scanner-page"
import { withScannerProtection } from "@/components/auth/with-role-protection"

function EscanerPage() {
  return (
    <SharedLayout>
      <QRScannerPage />
    </SharedLayout>
  )
}

export default withScannerProtection(EscanerPage)
