import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { updateDoctorProfile } from '@/app/actions/profile'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: doctor } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen flex-col">
      <Header userEmail={user.email} />
      
      <main className="container mx-auto flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
            <p className="text-muted-foreground mt-1">
              Manage your professional information
            </p>
          </div>

          <Card className="border-0 shadow-md">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>
                This information will be used in generated documents and prescriptions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form action={updateDoctorProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={doctor?.name || ''}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialization" className="text-sm font-medium">Specialization</Label>
                    <Input
                      id="specialization"
                      name="specialization"
                      type="text"
                      placeholder="e.g., General Physician, Cardiologist"
                      defaultValue={doctor?.specialization || ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registration_number" className="text-sm font-medium">Medical Registration Number</Label>
                    <Input
                      id="registration_number"
                      name="registration_number"
                      type="text"
                      placeholder="e.g., MCI Registration Number"
                      defaultValue={doctor?.registration_number || ''}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinic_name" className="text-sm font-medium">Clinic/Hospital Name</Label>
                    <Input
                      id="clinic_name"
                      name="clinic_name"
                      type="text"
                      placeholder="e.g., City Health Clinic"
                      defaultValue={doctor?.clinic_name || ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_number" className="text-sm font-medium">Contact Number</Label>
                    <Input
                      id="contact_number"
                      name="contact_number"
                      type="tel"
                      placeholder="+91 1234567890"
                      defaultValue={doctor?.contact_number || ''}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">Clinic Address</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Full address with city and state"
                    defaultValue={doctor?.address || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input
                    id="contact_number"
                    name="contact_number"
                    type="tel"
                    placeholder="+91 1234567890"
                    defaultValue={doctor?.contact_number || ''}
                  />
                </div>

                <div className="flex gap-3 pt-6 border-t">
                  <Button type="submit" className="min-w-[120px]">
                    Save Changes
                  </Button>
                  <Link href="/dashboard">
                    <Button type="button" variant="outline" className="min-w-[120px]">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account details from Supabase Auth
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Email</span>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Account Created</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm font-medium">User ID</span>
                  <span className="text-sm text-muted-foreground font-mono text-xs break-all">
                    {user.id}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
