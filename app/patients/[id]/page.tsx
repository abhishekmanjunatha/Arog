import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { softDeletePatient, restorePatient } from '@/app/actions/patients'

export default async function PatientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', params.id)
    .eq('doctor_id', user.id)
    .single()

  if (!patient) {
    notFound()
  }

  const age = patient.date_of_birth
    ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
    : null

  const deleteAction = softDeletePatient.bind(null, patient.id)
  const restoreAction = restorePatient.bind(null, patient.id)

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
            <Link href="/patients" className="text-sm hover:text-primary">
              Patients
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
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{patient.name}</h2>
              <p className="text-muted-foreground">Patient Details</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/patients/${patient.id}/edit`}>
                <Button variant="outline">Edit</Button>
              </Link>
              {patient.is_active ? (
                <form action={deleteAction}>
                  <Button type="submit" variant="destructive">
                    Deactivate
                  </Button>
                </form>
              ) : (
                <form action={restoreAction}>
                  <Button type="submit">
                    Restore
                  </Button>
                </form>
              )}
            </div>
          </div>

          {!patient.is_active && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ This patient record is inactive
              </p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Name</span>
                  <span className="text-sm">{patient.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Phone</span>
                  <span className="text-sm">{patient.phone || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Email</span>
                  <span className="text-sm">{patient.email || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Date of Birth</span>
                  <span className="text-sm">
                    {patient.date_of_birth 
                      ? new Date(patient.date_of_birth).toLocaleDateString() 
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Age</span>
                  <span className="text-sm">{age ? `${age} years` : '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Gender</span>
                  <span className="text-sm capitalize">{patient.gender || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Blood Group</span>
                  <span className="text-sm">{patient.blood_group || '-'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm font-medium">Address</span>
                  <span className="text-sm text-right">{patient.address || '-'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Medical History</h4>
                  <p className="text-sm text-muted-foreground">
                    {patient.medical_history || 'No medical history recorded'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Allergies</h4>
                  <p className="text-sm text-muted-foreground">
                    {patient.allergies || 'No allergies recorded'}
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Record Info</h4>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(patient.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Updated: {new Date(patient.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <Link href={`/appointments/new?patientId=${patient.id}`}>
                  <Button variant="outline" className="w-full">
                    Schedule Appointment
                  </Button>
                </Link>
                <Link href={`/documents/new?patientId=${patient.id}`}>
                  <Button variant="outline" className="w-full">
                    Generate Document
                  </Button>
                </Link>
                <Link href={`/documents?patientId=${patient.id}`}>
                  <Button variant="outline" className="w-full">
                    View All Documents
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
