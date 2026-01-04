import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
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
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard">
            <h1 className="text-xl font-bold hover:text-primary transition-colors">
              Arog Doctor Platform
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
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
            <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
            <p className="text-muted-foreground">
              Manage your professional information
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>
                This information will be used in generated documents and prescriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateDoctorProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={doctor?.name || ''}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    name="specialization"
                    type="text"
                    placeholder="e.g., General Physician, Cardiologist"
                    defaultValue={doctor?.specialization || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_number">Medical Registration Number</Label>
                  <Input
                    id="registration_number"
                    name="registration_number"
                    type="text"
                    placeholder="e.g., MCI Registration Number"
                    defaultValue={doctor?.registration_number || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinic_name">Clinic/Hospital Name</Label>
                  <Input
                    id="clinic_name"
                    name="clinic_name"
                    type="text"
                    placeholder="e.g., City Health Clinic"
                    defaultValue={doctor?.clinic_name || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Clinic Address</Label>
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

                <div className="flex gap-4 pt-4">
                  <Button type="submit">
                    Save Changes
                  </Button>
                  <Link href="/dashboard">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account details from Supabase Auth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between py-2">
                <span className="text-sm font-medium">Email</span>
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm font-medium">Account Created</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm font-medium">User ID</span>
                <span className="text-sm text-muted-foreground font-mono text-xs">
                  {user.id}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
