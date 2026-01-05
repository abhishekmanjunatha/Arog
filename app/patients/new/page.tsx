import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/Header'
import { createPatient } from '@/app/actions/patients'

export default async function NewPatientPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header userEmail={user.email} />

      <main className="container mx-auto flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Add New Patient</h2>
            <p className="text-muted-foreground mt-1">
              Create a patient record with medical information
            </p>
          </div>

          <Card className="border-0 shadow-md">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>
                Basic details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form action={createPatient} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
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
                      placeholder="+91 1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="patient@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth" className="text-sm font-medium">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                    <select
                      id="gender"
                      name="gender"
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
                      placeholder="A+, B-, O+, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Full address"
                  />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-4">Medical Information</h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="medical_history" className="text-sm font-medium">Medical History</Label>
                      <textarea
                        id="medical_history"
                        name="medical_history"
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                        placeholder="Previous conditions, surgeries, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="allergies" className="text-sm font-medium">Allergies</Label>
                      <textarea
                        id="allergies"
                        name="allergies"
                        rows={2}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                        placeholder="Drug allergies, food allergies, etc."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t">
                  <Button type="submit" className="min-w-[120px]">
                    Create Patient
                  </Button>
                  <Link href="/patients">
                    <Button type="button" variant="outline" className="min-w-[120px]">
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
