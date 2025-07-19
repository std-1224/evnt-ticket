'use client'

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ProfileSettings } from "@/components/profile-settings"

export default function ProfileSettingsPage() {
  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/profile">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
      </div>

      <ProfileSettings />
    </div>
  )
}
