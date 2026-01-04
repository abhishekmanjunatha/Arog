import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateAppointment } from '@/app/actions/appointments'

export default async function EditAppointmentPage({
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
      patient:patients(id, name)
    `)
    .eq('id', params.id)
    .eq('doctor_id', user.id)
    .single()

  if (!appointment) {
    notFound()
  }

  const appointmentDate = new Date(appointment.appointment_date)
  const dateStr = appointmentDate.toISOString().split('T')[0]
  const timeStr = appointmentDate.toTimeString().slice(0, 5)

  const updateAction = updateAppointment.bind(null, appointment.id)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard">
            <h1 className="text-xl font-bold hover:text-primary transition-colors">
              Arog Doctor Platform
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/appointments" className="text-sm hover:text-primary">
              Appointments
            </Link>
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <form action="/api/auth/logout" method="post">
              <button className="text-sm text-primary hover:underline">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex-1 p-6">
        <div className="max-w-2xl space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Edit Appointment</h2>
            <p className="text-muted-foreground">
              Update appointment details
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription>
                Patient: {appointment.patient.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateAction} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointment_date">Date *</Label>
                    <Input
                      id="appointment_date"
                      name="appointment_date"
                      type="date"
                      defaultValue={dateStr}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointment_time">Time *</Label>
                    <Input
                      id="appointment_time"
                      name="appointment_time"
                      type="time"
                      defaultValue={timeStr}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                    <Input
                      id="duration_minutes"
                      name="duration_minutes"
                      type="number"
                      defaultValue={appointment.duration_minutes || 30}
                      min={5}
                      step={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      name="status"
                      defaultValue={appointment.status}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No Show</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chief_complaint">Chief Complaint</Label>
                  <textarea
                    id="chief_complaint"
                    name="chief_complaint"
                    rows={2}
                    defaultValue={appointment.chief_complaint || ''}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <textarea
                    id="diagnosis"
                    name="diagnosis"
                    rows={2}
                    defaultValue={appointment.diagnosis || ''}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    defaultValue={appointment.notes || ''}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit">
                    Save Changes
                  </Button>
                  <Link href={`/appointments/${appointment.id}`}>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
