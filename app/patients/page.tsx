import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: { search?: string; showInactive?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const search = searchParams.search || ''
  const showInactive = searchParams.showInactive === 'true'

  let query = supabase
    .from('patients')
    .select('*')
    .eq('doctor_id', user.id)
    .order('created_at', { ascending: false })

  if (!showInactive) {
    query = query.eq('is_active', true)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data: patients } = await query

  return (
    <div className="flex min-h-screen flex-col">
      <Header userEmail={user.email || ''} />

      <main className="flex-1 gradient-bg">
        <div className="container mx-auto px-4 py-8 lg:px-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Patients</h1>
                <p className="text-lg text-muted-foreground">
                  Manage your patient records
                </p>
              </div>
              <Link href="/patients/new">
                <Button size="lg" className="w-full sm:w-auto shadow-md">+ Add New Patient</Button>
              </Link>
            </div>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <form method="get" className="flex-1">
                    <Input
                      type="search"
                      name="search"
                      placeholder="🔍 Search by name, phone, or email..."
                      defaultValue={search}
                      className="h-12 text-base"
                    />
                  </form>
                  <Link 
                    href={`/patients?${showInactive ? '' : 'showInactive=true'}`}
                    className="flex items-center justify-center px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20"
                  >
                    {showInactive ? 'Hide' : 'Show'} Inactive
                  </Link>
                </div>
              </CardContent>
            </Card>

            {patients && patients.length > 0 ? (
              <Card className="border-0 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Age</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Gender</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => {
                    const age = patient.date_of_birth
                      ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
                      : null

                    return (
                      <tr key={patient.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <Link 
                            href={`/patients/${patient.id}`}
                            className="font-medium hover:text-primary"
                          >
                            {patient.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm">{patient.phone || '-'}</td>
                        <td className="px-4 py-3 text-sm">{patient.email || '-'}</td>
                        <td className="px-4 py-3 text-sm">{age || '-'}</td>
                        <td className="px-4 py-3 text-sm capitalize">{patient.gender || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            patient.is_active
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-50 text-gray-700'
                          }`}>
                            {patient.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link 
                            href={`/patients/${patient.id}`}
                            className="text-sm text-primary hover:underline"
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
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold mb-2">No patients found</h3>
                  <p className="text-muted-foreground mb-6">
                    {search 
                      ? 'Try adjusting your search'
                      : 'Add your first patient to get started'}
                  </p>
                  {!search && (
                    <Link href="/patients/new">
                      <Button size="lg">Add First Patient</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
