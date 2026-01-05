'use client'

import Link from 'next/link'
import { Calendar, FileText, Clock, User, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type TimelineAppointment = {
  id: string
  appointment_date: string
  status: string
  chief_complaint?: string
  duration_minutes?: number
}

type TimelineDocument = {
  id: string
  document_name: string
  created_at: string
  template: {
    name: string
    category?: string
  }
  appointment?: {
    appointment_date: string
  }
}

type TimelineItem = {
  type: 'appointment' | 'document'
  date: string
  data: TimelineAppointment | TimelineDocument
}

interface PatientTimelineProps {
  appointments: TimelineAppointment[]
  documents: TimelineDocument[]
  maxItems?: number
}

export function PatientTimeline({ appointments, documents, maxItems = 20 }: PatientTimelineProps) {
  // Combine and sort timeline items
  const timeline: TimelineItem[] = [
    ...appointments.map(a => ({
      type: 'appointment' as const,
      date: a.appointment_date,
      data: a
    })),
    ...documents.map(d => ({
      type: 'document' as const,
      date: d.created_at,
      data: d
    }))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxItems)

  if (timeline.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Patient appointments and documents history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No activity recorded yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>
          Recent appointments and documents ({timeline.length} {timeline.length === 1 ? 'item' : 'items'})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeline.map((item, index) => {
            if (item.type === 'appointment') {
              const appointment = item.data as TimelineAppointment
              return (
                <Link
                  key={`appointment-${appointment.id}`}
                  href={`/appointments/${appointment.id}`}
                  className="block group"
                >
                  <div className="flex gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all">
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                        <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm">Appointment</h4>
                        <StatusBadge status={appointment.status} />
                      </div>
                      {appointment.chief_complaint && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                          {appointment.chief_complaint}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(appointment.appointment_date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {appointment.duration_minutes && (
                          <span>{appointment.duration_minutes} min</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 self-center">
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              )
            } else {
              const document = item.data as TimelineDocument
              return (
                <Link
                  key={`document-${document.id}`}
                  href={`/documents/${document.id}`}
                  className="block group"
                >
                  <div className="flex gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all">
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                        <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm">Document Generated</h4>
                        {document.template.category && (
                          <Badge variant="outline" className="text-xs">
                            {document.template.category.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                        {document.template.name}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(document.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })} at {new Date(document.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {document.appointment && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Linked to appointment
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 self-center">
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              )
            }
          })}
        </div>
        
        {(appointments.length + documents.length) > maxItems && (
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Showing {maxItems} most recent items of {appointments.length + documents.length} total
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
