import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import { createDocument } from '@/app/actions/documents'
import type { TemplateContent } from '@/types/template'
import { prepareDocumentData, substituteVariables } from '@/lib/document-utils'
import { DocumentForm } from '@/components/documents/DocumentForm'

export default async function NewDocumentPage({
  searchParams,
}: {
  searchParams: { templateId?: string; patientId?: string; appointmentId?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch active templates
  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .eq('doctor_id', user.id)
    .eq('is_active', true)
    .order('name')

  // Fetch active patients
  const { data: patients } = await supabase
    .from('patients')
    .select('id, name, phone')
    .eq('doctor_id', user.id)
    .eq('is_active', true)
    .order('name')

  // Fetch doctor profile for preview
  const { data: doctor } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', user.id)
    .single()

  const preselectedTemplateId = searchParams.templateId
  const preselectedPatientId = searchParams.patientId
  const preselectedAppointmentId = searchParams.appointmentId

  // If patient is preselected, fetch patient details
  let preselectedPatient = null
  if (preselectedPatientId) {
    const { data: patient } = await supabase
      .from('patients')
      .select('id, name, phone, email')
      .eq('id', preselectedPatientId)
      .single()
    preselectedPatient = patient
  }

  // If patient is preselected, fetch their appointments
  let appointments = null
  if (preselectedPatientId) {
    const { data: appts } = await supabase
      .from('appointments')
      .select('id, appointment_date, chief_complaint')
      .eq('doctor_id', user.id)
      .eq('patient_id', preselectedPatientId)
      .order('appointment_date', { ascending: false })
      .limit(10)

    appointments = appts
  }

  // Generate preview if template and patient are selected
  let preview = ''
  if (preselectedTemplateId && preselectedPatientId) {
    const { data: template } = await supabase
      .from('templates')
      .select('*')
      .eq('id', preselectedTemplateId)
      .single()

    const { data: patient } = await supabase
      .from('patients')
      .select('*')
      .eq('id', preselectedPatientId)
      .single()

    let appointment = null
    if (preselectedAppointmentId) {
      const { data: appt } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', preselectedAppointmentId)
        .single()
      appointment = appt
    }

    if (template && patient && doctor) {
      const documentData = prepareDocumentData(doctor, patient, appointment)
      const templateContent = template.schema_json as TemplateContent
      preview = substituteVariables(templateContent.content, documentData)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header userEmail={user.email} />

      <main className="container mx-auto flex-1 p-6">
        <div className="max-w-6xl space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Generate Document</h2>
            <p className="text-muted-foreground">
              {preselectedPatient 
                ? `Create a new medical document for ${preselectedPatient.name}`
                : 'Create a new medical document from a template'
              }
            </p>
          </div>

          {!templates || templates.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    You need to create at least one active template before generating documents.
                  </p>
                  <Link href="/templates/new">
                    <Button>Create Template</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : !patients || patients.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    You need to add at least one patient before generating documents.
                  </p>
                  <Link href="/patients/new">
                    <Button>Add Patient</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Document Details</CardTitle>
                  <CardDescription>
                    Select template and patient information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentForm
                    templates={templates}
                    patients={patients}
                    appointments={appointments}
                    preselectedTemplateId={preselectedTemplateId}
                    preselectedPatientId={preselectedPatientId}
                    preselectedAppointmentId={preselectedAppointmentId}
                    hasPreview={!!preview}
                    createDocumentAction={createDocument}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    Document preview with substituted values
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {preview ? (
                    <pre className="whitespace-pre-wrap text-xs bg-muted p-4 rounded-md overflow-auto max-h-[600px]">
                      {preview}
                    </pre>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Select a template and patient to see preview
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
