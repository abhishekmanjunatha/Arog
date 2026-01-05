'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/status-badge'
import { AddAppointmentButton } from '@/components/appointments/AddAppointmentButton'
import { Calendar } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

function AppointmentsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const statusFilter = searchParams.get('status') || ''
  const dateFilter = searchParams.get('date') || ''

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Fetch patients for the appointment form
      const { data: patientsData } = await supabase
        .from('patients')
        .select('id, name')
        .eq('doctor_id', user.id)
        .eq('is_active', true)
        .order('name')

      setPatients(patientsData || [])

      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(id, name, phone, email)
        `)
        .eq('doctor_id', user.id)
        .order('appointment_date', { ascending: false })

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      if (dateFilter) {
        const startOfDay = new Date(dateFilter)
        const endOfDay = new Date(dateFilter)
        endOfDay.setDate(endOfDay.getDate() + 1)
        
        query = query
          .gte('appointment_date', startOfDay.toISOString())
          .lt('appointment_date', endOfDay.toISOString())
      }

      const { data } = await query
      setAppointments(data || [])
      setLoading(false)
    }

    loadData()
  }, [statusFilter, dateFilter, router])

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no_show', label: 'No Show' },
  ]

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status) {
      params.set('status', status)
    } else {
      params.delete('status')
    }
    router.push(`/appointments?${params.toString()}`)
  }

  const handleDateChange = (date: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (date) {
      params.set('date', date)
    } else {
      params.delete('date')
    }
    router.push(`/appointments?${params.toString()}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header userEmail={user.email} />

      <main className="flex-1 gradient-bg">
        <div className="container mx-auto px-4 py-8 lg:px-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Appointments</h1>
              <p className="text-lg text-muted-foreground">
                Manage your appointment schedule
              </p>
            </div>
            <AddAppointmentButton patients={patients} size="lg" />
          </div>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="date"
                    name="date"
                    value={dateFilter}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
                <select
                  name="status"
                  value={statusFilter}
                  className="flex h-12 rounded-lg border border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[200px]"
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {(statusFilter || dateFilter) && (
                  <Link href="/appointments">
                    <Button type="button" variant="ghost" size="sm" className="h-12">
                      Clear filters
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {appointments && appointments.length > 0 ? (
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground">Date & Time</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground">Patient</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground">Contact</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground">Duration</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => {
                    const appointmentDate = new Date(appointment.appointment_date)

                    return (
                      <tr key={appointment.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="text-sm font-medium text-foreground">
                            {appointmentDate.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Link 
                            href={`/patients/${appointment.patient.id}`}
                            className="font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {appointment.patient.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-muted-foreground">{appointment.patient.phone || '-'}</td>
                        <td className="px-4 py-3.5 text-sm text-muted-foreground">{appointment.duration_minutes} min</td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={appointment.status} />
                        </td>
                        <td className="px-4 py-3.5">
                          <Link 
                            href={`/appointments/${appointment.id}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              </div>
            </Card>
          ) : (
            <Card className="border-0 shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <EmptyState
                  icon={Calendar}
                  title="No appointments found"
                  description={statusFilter || dateFilter
                    ? 'Try adjusting your filters'
                    : 'Schedule your first appointment to get started'}
                  action={!statusFilter && !dateFilter ? {
                    label: 'Schedule First Appointment',
                    href: '/appointments/new'
                  } : undefined}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </main>
    </div>
  )
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <AppointmentsContent />
    </Suspense>
  )
}
