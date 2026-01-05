import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { Layers, FileText } from 'lucide-react'

export default async function DocumentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: document } = await supabase
    .from('documents')
    .select(`
      *,
      patient:patients(*),
      template:templates(*),
      appointment:appointments(*)
    `)
    .eq('id', params.id)
    .eq('doctor_id', user.id)
    .single()

  if (!document) {
    notFound()
  }

  const createdDate = new Date(document.created_at)
  const documentData = document.data_json as any
  const isBuilderV2 = documentData?.builder_version === 2
  const content = documentData?.content || ''

  return (
    <div className="flex min-h-screen flex-col">
      <Header userEmail={user.email} />

      <main className="container mx-auto flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl font-bold tracking-tight">Document Details</h2>
                {isBuilderV2 ? (
                  <Badge variant="info" className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    V2
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    V1
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Generated on {createdDate.toLocaleDateString()} at {createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/documents/${document.id}/pdf`} target="_blank">
                <Button>Download PDF</Button>
              </Link>
            </div>
          </div>

          <Alert variant="info">
            Documents are immutable and cannot be edited or deleted. This ensures the integrity of medical records.
          </Alert>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Template Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Template</span>
                  <Link 
                    href={`/templates/${document.template.id}`}
                    className="text-sm hover:text-primary hover:underline"
                  >
                    {document.template.name}
                  </Link>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Category</span>
                  <span className="text-sm capitalize">
                    {document.template.category?.replace('_', ' ')}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patient & Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Patient</span>
                  <Link 
                    href={`/patients/${document.patient.id}`}
                    className="text-sm hover:text-primary hover:underline"
                  >
                    {document.patient.name}
                  </Link>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Appointment</span>
                  {document.appointment ? (
                    <Link 
                      href={`/appointments/${document.appointment.id}`}
                      className="text-sm hover:text-primary hover:underline"
                    >
                      {new Date(document.appointment.appointment_date).toLocaleDateString()}
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground">No appointment</span>
                  )}
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm font-medium">Generated</span>
                  <span className="text-sm">
                    {createdDate.toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Document Content</CardTitle>
            </CardHeader>
            <CardContent>
              {isBuilderV2 ? (
                // Builder V2 - show form fields
                <div className="space-y-3">
                  {documentData.template_schema?.elements?.map((element: any, index: number) => {
                    if (element.type === 'divider') {
                      return <hr key={index} className="my-4" />
                    }
                    if (element.type === 'header') {
                      return (
                        <h3 key={index} className="text-lg font-semibold text-cyan-700 mt-4 mb-2">
                          {element.label}
                        </h3>
                      )
                    }
                    
                    const value = documentData.form_data?.[element.name]
                    const displayValue = value !== undefined && value !== null && value !== '' 
                      ? String(value) 
                      : '—'
                    
                    return (
                      <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">{element.label}</span>
                        <span className={`text-sm ${element.type === 'calculated' ? 'font-semibold text-amber-700' : 'text-gray-900'}`}>
                          {displayValue}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                // V1 - show text content
                <pre className="whitespace-pre-wrap text-sm bg-muted p-6 rounded-md overflow-auto max-h-[800px]">
                  {content}
                </pre>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <Link href={`/documents/${document.id}/pdf`} target="_blank">
                  <Button variant="outline" className="w-full">
                    View as PDF
                  </Button>
                </Link>
                <Link href={`/patients/${document.patient.id}`}>
                  <Button variant="outline" className="w-full">
                    View Patient
                  </Button>
                </Link>
                {document.appointment && (
                  <Link href={`/appointments/${document.appointment.id}`}>
                    <Button variant="outline" className="w-full">
                      View Appointment
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
