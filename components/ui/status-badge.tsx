import * as React from "react"
import { Badge } from "./badge"

/**
 * StatusBadge - Centralized status badge component
 * Maps common status values to consistent badge variants
 */

type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show'
type PatientStatus = 'active' | 'inactive'
type TemplateStatus = 'active' | 'inactive'

export interface StatusBadgeProps {
  status: AppointmentStatus | PatientStatus | TemplateStatus | string
  className?: string
}

const STATUS_VARIANT_MAP: Record<string, any> = {
  // Appointment statuses
  scheduled: 'scheduled',
  completed: 'completed',
  cancelled: 'cancelled',
  'no-show': 'destructive',
  // Patient/Template statuses
  active: 'active',
  inactive: 'inactive',
  // Generic fallback
  default: 'secondary',
}

const STATUS_LABEL_MAP: Record<string, string> = {
  'no-show': 'No Show',
  // Others use default formatting
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = STATUS_VARIANT_MAP[status.toLowerCase()] || STATUS_VARIANT_MAP.default
  const label = STATUS_LABEL_MAP[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1)
  
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}
