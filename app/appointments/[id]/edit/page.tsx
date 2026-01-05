import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/Header'
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
      <Header userEmail={user.email} />

      <main className="container mx-auto flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Edit Appointment</h2>
            <p className="text-muted-foreground">
              Update appointment details
            </p>
          </div>

          <Card className="border-0 shadow-md">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription>
                Patient: {appointment.patient.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form action={updateAction} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointment_date" className="text-sm font-medium">Date *</Label>
                    <Input
                      id="appointment_date"
                      name="appointment_date"
                      type="date"
                      defaultValue={dateStr}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointment_time" className="text-sm font-medium">Time *</Label>
                    <Input
                      id="appointment_time"
                      name="appointment_time"
                      type="time"
                      defaultValue={timeStr}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration_minutes" className="text-sm font-medium">Duration (minutes)</Label>
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
                    <Label htmlFor="status" className="text-sm font-medium">Status</Label>
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

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-4">Clinical Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="chief_complaint" className="text-sm font-medium">Chief Complaint</Label>
                      <textarea
                        id="chief_complaint"
                        name="chief_complaint"
                        rows={2}
                        defaultValue={appointment.chief_complaint || ''}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="diagnosis" className="text-sm font-medium">Diagnosis</Label>
                      <textarea
                        id="diagnosis"
                        name="diagnosis"
                        rows={2}
                        defaultValue={appointment.diagnosis || ''}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        defaultValue={appointment.notes || ''}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t">
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
