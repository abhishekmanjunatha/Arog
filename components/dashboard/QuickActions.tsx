'use client'

import { UserPlus, CalendarPlus, FilePlus, PlusCircle, ArrowRight } from 'lucide-react'
import { AddPatientButton } from '@/components/patients/AddPatientButton'
import { AddAppointmentButton } from '@/components/appointments/AddAppointmentButton'
import Link from 'next/link'

interface Patient {
  id: string
  name: string
}

interface QuickActionsProps {
  patients: Patient[]
}

export function QuickActions({ patients }: QuickActionsProps) {
  const actions = [
    {
      title: 'Add Patient',
      description: 'Register a new patient',
      icon: UserPlus,
      color: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/50',
      component: <AddPatientButton key="patient" />
    },
    {
      title: 'New Appointment',
      description: 'Schedule appointment',
      icon: CalendarPlus,
      color: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/50',
      component: <AddAppointmentButton key="appointment" patients={patients} />
    },
    {
      title: 'Create Template',
      description: 'Design new document',
      icon: FilePlus,
      color: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50/50',
      href: '/templates/new'
    },
    {
      title: 'Generate Document',
      description: 'Create from template',
      icon: PlusCircle,
      color: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50',
      href: '/documents/new'
    }
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon
        
        if (action.component) {
          return (
            <div
              key={action.title}
              className={`group flex flex-col gap-3 rounded-xl border-2 p-6 transition-all duration-200 ${action.color}`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-muted/50 group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                {action.component}
              </div>
            </div>
          )
        }

        return (
          <Link
            key={action.title}
            href={action.href!}
            className={`group flex flex-col gap-3 rounded-xl border-2 p-6 transition-all duration-200 ${action.color}`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-muted/50 group-hover:scale-110 transition-transform">
                <Icon className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
