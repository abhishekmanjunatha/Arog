import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/Header'
import { updatePatient } from '@/app/actions/patients'

export default async function EditPatientPage({
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

  const updateAction = updatePatient.bind(null, patient.id)

  return (
    <div className="flex min-h-screen flex-col">
      <Header userEmail={user.email} />

      <main className="container mx-auto flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Edit Patient</h2>
            <p className="text-muted-foreground">
              Update patient information
            </p>
          </div>

          <Card className="border-0 shadow-md">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>
                Update the patient details below
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form action={updateAction} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={patient.name}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={patient.phone || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={patient.email || ''}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date_of_birth" className="text-sm font-medium">Date of Birth</Label>
                        <Input
                          id="date_of_birth"
                          name="date_of_birth"
                          type="date"
                          defaultValue={patient.date_of_birth || ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                        <select
                          id="gender"
                          name="gender"
                          defaultValue={patient.gender || ''}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="blood_group" className="text-sm font-medium">Blood Group</Label>
                        <Input
                          id="blood_group"
                          name="blood_group"
                          type="text"
                          defaultValue={patient.blood_group || ''}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        defaultValue={patient.address || ''}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medical_history" className="text-sm font-medium">Medical History</Label>
                      <textarea
                        id="medical_history"
                        name="medical_history"
                        rows={3}
                        defaultValue={patient.medical_history || ''}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="allergies" className="text-sm font-medium">Allergies</Label>
                      <textarea
                        id="allergies"
                        name="allergies"
                        rows={2}
                        defaultValue={patient.allergies || ''}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <Button type="submit">
                    Save Changes
                  </Button>
                  <Link href={`/patients/${patient.id}`}>
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
