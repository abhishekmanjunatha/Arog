import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import { StatusBadge } from '@/components/ui/status-badge'
import { updateAppointmentStatus } from '@/app/actions/appointments'
import { EditAppointmentButton } from '@/components/appointments/EditAppointmentButton'
import { GenerateDocumentButton } from '@/components/patients/GenerateDocumentButton'

export default async function AppointmentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patients(*)
    `)
    .eq('id', params.id)
    .eq('doctor_id', user.id)
    .single()

  if (!appointment) {
    notFound()
  }

  // Fetch active templates for document generation
  const { data: templates } = await supabase
    .from('templates')
    .select('id, name, description, category, builder_version, is_active')
    .eq('doctor_id', user.id)
    .eq('is_active', true)
    .order('name')

  const appointmentDate = new Date(appointment.appointment_date)
  const isPast = appointmentDate < new Date()

  const markAsCompleted = updateAppointmentStatus.bind(null, appointment.id, 'completed')
  const markAsCancelled = updateAppointmentStatus.bind(null, appointment.id, 'cancelled')
  const markAsNoShow = updateAppointmentStatus.bind(null, appointment.id, 'no_show')

  return (
    <div className="flex min-h-screen flex-col">
      <Header userEmail={user.email} />

      <main className="container mx-auto flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Appointment Details</h2>
              <p className="text-muted-foreground">
                {appointmentDate.toLocaleDateString()} at {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex gap-2">
              <EditAppointmentButton appointment={appointment} />
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Status:</span>
                  <StatusBadge status={appointment.status} />
                </div>
                {appointment.status === 'scheduled' && (
                  <div className="flex gap-2">
                    <form action={markAsCompleted}>
                      <Button type="submit" size="sm" variant="outline">
                        Mark Completed
                      </Button>
                    </form>
                    <form action={markAsNoShow}>
                      <Button type="submit" size="sm" variant="outline">
                        No Show
                      </Button>
                    </form>
                    <form action={markAsCancelled}>
                      <Button type="submit" size="sm" variant="destructive">
                        Cancel
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Name</span>
                  <Link 
                    href={`/patients/${appointment.patient.id}`}
                    className="text-sm hover:text-primary hover:underline"
                  >
                    {appointment.patient.name}
                  </Link>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Phone</span>
                  <span className="text-sm">{appointment.patient.phone || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Email</span>
                  <span className="text-sm">{appointment.patient.email || '-'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm font-medium">Age</span>
                  <span className="text-sm">
                    {appointment.patient.date_of_birth
                      ? `${new Date().getFullYear() - new Date(appointment.patient.date_of_birth).getFullYear()} years`
                      : '-'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Date</span>
                  <span className="text-sm">{appointmentDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Time</span>
                  <span className="text-sm">
                    {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Duration</span>
                  <span className="text-sm">{appointment.duration_minutes} minutes</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm font-medium">Created</span>
                  <span className="text-sm">{new Date(appointment.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Clinical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Chief Complaint</h4>
                <p className="text-sm text-muted-foreground">
                  {appointment.chief_complaint || 'No chief complaint recorded'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Diagnosis</h4>
                <p className="text-sm text-muted-foreground">
                  {appointment.diagnosis || 'No diagnosis recorded'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {appointment.notes || 'No notes recorded'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <GenerateDocumentButton 
                  patientId={appointment.patient.id} 
                  templates={templates || []} 
                />
                <Link href={`/patients/${appointment.patient.id}`}>
                  <Button variant="outline" className="w-full">
                    View Patient Profile
                  </Button>
                </Link>
                <Link href={`/documents?patientId=${appointment.patient.id}`}>
                  <Button variant="outline" className="w-full">
                    Patient Documents
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
