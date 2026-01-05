import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { isBuilderV2Enabled } from '@/lib/feature-flags'
import { EmptyState } from '@/components/ui/empty-state'
import { Layers, FileText } from 'lucide-react'

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
  const builderEnabled = isBuilderV2Enabled()

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
              <div className="flex gap-2">
                {builderEnabled && (
                  <Link href="/documents/new/builder">
                    <Button size="lg" variant="default" className="w-full sm:w-auto shadow-md">
                      <Layers className="w-4 h-4 mr-2" />
                      Form Document
                    </Button>
                  </Link>
                )}
                <Link href="/documents/new">
                  <Button size="lg" variant={builderEnabled ? "outline" : "default"} className="w-full sm:w-auto shadow-md">
                    <FileText className="w-4 h-4 mr-2" />
                    {builderEnabled ? 'Variable Document' : '+ Generate Document'}
                  </Button>
                </Link>
              </div>
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
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground">Generated</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground">Template</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground">Patient</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground">Appointment</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => {
                    const createdDate = new Date(doc.created_at)

                    return (
                      <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="text-sm font-medium text-foreground">
                            {createdDate.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-sm font-medium text-foreground">
                            {doc.template.name}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {doc.template.category?.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Link 
                            href={`/patients/${doc.patient.id}`}
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors hover:underline"
                          >
                            {doc.patient.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-muted-foreground">
                          {doc.appointment ? (
                            <Link 
                              href={`/appointments/${doc.appointment.id}`}
                              className="hover:text-primary transition-colors hover:underline"
                            >
                              {new Date(doc.appointment.appointment_date).toLocaleDateString()}
                            </Link>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex gap-3">
                            <Link 
                              href={`/documents/${doc.id}`}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              View
                            </Link>
                            <Link 
                              href={`/documents/${doc.id}/pdf`}
                              className="text-sm font-medium text-primary hover:underline"
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
                <EmptyState
                  icon={FileText}
                  title="No documents found"
                  description={patientFilter
                    ? 'No documents found for this patient.'
                    : 'Generate your first document to get started.'}
                  action={!patientFilter ? {
                    label: 'Generate Document',
                    href: '/documents/new'
                  } : undefined}
                />
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      </main>
    </div>
  )
}
