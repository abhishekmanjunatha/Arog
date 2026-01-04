import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: { patientId?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const patientFilter = searchParams.patientId

  let query = supabase
    .from('documents')
    .select(`
      *,
      patient:patients(id, name),
      template:templates(id, name, category),
      appointment:appointments(id, appointment_date)
    `)
    .eq('doctor_id', user.id)
    .order('created_at', { ascending: false })

  if (patientFilter) {
    query = query.eq('patient_id', patientFilter)
  }

  const { data: documents } = await query

  return (
    <div className="flex min-h-screen flex-col">
      <Header userEmail={user.email || ''} />

      <main className="flex-1 gradient-bg">
        <div className="container mx-auto px-4 py-8 lg:px-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Documents</h1>
                <p className="text-lg text-muted-foreground">
                  View and manage generated medical documents
                </p>
              </div>
              <Link href="/documents/new">
                <Button size="lg" className="w-full sm:w-auto shadow-md">+ Generate Document</Button>
              </Link>
            </div>

            {patientFilter && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Filtered by patient
                  </span>
                  <Link href="/documents">
                    <Button variant="ghost" size="sm">
                      Clear Filter
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

          {documents && documents.length > 0 ? (
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Generated</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Template</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Patient</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Appointment</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => {
                    const createdDate = new Date(doc.created_at)

                    return (
                      <tr key={doc.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium">
                            {createdDate.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium">
                            {doc.template.name}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {doc.template.category?.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link 
                            href={`/patients/${doc.patient.id}`}
                            className="text-sm hover:text-primary hover:underline"
                          >
                            {doc.patient.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {doc.appointment ? (
                            <Link 
                              href={`/appointments/${doc.appointment.id}`}
                              className="hover:text-primary hover:underline"
                            >
                              {new Date(doc.appointment.appointment_date).toLocaleDateString()}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link 
                              href={`/documents/${doc.id}`}
                              className="text-sm text-primary hover:underline"
                            >
                              View
                            </Link>
                            <Link 
                              href={`/documents/${doc.id}/pdf`}
                              className="text-sm text-primary hover:underline"
                              target="_blank"
                            >
                              PDF
                            </Link>
                          </div>
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
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold mb-2">No documents found</h3>
                <p className="text-muted-foreground mb-6">
                  {patientFilter
                    ? 'No documents found for this patient.'
                    : 'Generate your first document to get started.'}
                </p>
                {!patientFilter && (
                  <Link href="/documents/new">
                    <Button size="lg">Generate Document</Button>
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
