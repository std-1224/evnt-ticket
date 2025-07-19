'use client'

import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { User, Building, ShoppingBag } from 'lucide-react'

const roleConfig = {
  admin: {
    label: 'Admin',
    variant: 'default' as const,
    icon: Building,
    description: 'Can manage events and users'
  },
  scanner: {
    label: 'Scanner',
    variant: 'secondary' as const,
    icon: ShoppingBag,
    description: 'Can scan and validate tickets'
  },
  buyer: {
    label: 'Buyer',
    variant: 'outline' as const,
    icon: User,
    description: 'Can purchase and manage tickets'
  }
}

interface UserRoleBadgeProps {
  showIcon?: boolean
  showDescription?: boolean
  className?: string
}

export function UserRoleBadge({ showIcon = true, showDescription = false, className }: UserRoleBadgeProps) {
  const { userRole } = useAuth()

  if (!userRole || !(userRole in roleConfig)) {
    return null
  }

  const config = roleConfig[userRole as keyof typeof roleConfig]
  const Icon = config.icon

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={config.variant} className="flex items-center gap-1">
        {showIcon && <Icon className="h-3 w-3" />}
        {config.label}
      </Badge>
      {showDescription && (
        <span className="text-sm text-muted-foreground">
          {config.description}
        </span>
      )}
    </div>
  )
}
