import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { createDocument } from '@/app/actions/documents'
import type { TemplateContent } from '@/types/template'
import { prepareDocumentData, substituteVariables } from '@/lib/document-utils'

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
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard">
            <h1 className="text-xl font-bold hover:text-primary transition-colors">
              Arog Doctor Platform
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/documents" className="text-sm hover:text-primary">
              Documents
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
        <div className="max-w-6xl space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Generate Document</h2>
            <p className="text-muted-foreground">
              Create a new medical document from a template
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
                  <form action={createDocument} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="template_id">Template *</Label>
                      <select
                        id="template_id"
                        name="template_id"
                        required
                        defaultValue={preselectedTemplateId || ''}
                        onChange={(e) => {
                          const url = new URL(window.location.href)
                          url.searchParams.set('templateId', e.target.value)
                          window.location.href = url.toString()
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Select a template</option>
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name} ({template.category?.replace('_', ' ')})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="patient_id">Patient *</Label>
                      <select
                        id="patient_id"
                        name="patient_id"
                        required
                        defaultValue={preselectedPatientId || ''}
                        onChange={(e) => {
                          const url = new URL(window.location.href)
                          url.searchParams.set('patientId', e.target.value)
                          if (preselectedTemplateId) {
                            url.searchParams.set('templateId', preselectedTemplateId)
                          }
                          window.location.href = url.toString()
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Select a patient</option>
                        {patients.map(patient => (
                          <option key={patient.id} value={patient.id}>
                            {patient.name} {patient.phone ? `- ${patient.phone}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {appointments && appointments.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="appointment_id">Appointment (Optional)</Label>
                        <select
                          id="appointment_id"
                          name="appointment_id"
                          defaultValue={preselectedAppointmentId || ''}
                          onChange={(e) => {
                            const url = new URL(window.location.href)
                            if (preselectedTemplateId) url.searchParams.set('templateId', preselectedTemplateId)
                            if (preselectedPatientId) url.searchParams.set('patientId', preselectedPatientId)
                            if (e.target.value) url.searchParams.set('appointmentId', e.target.value)
                            window.location.href = url.toString()
                          }}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">No appointment</option>
                          {appointments.map(appt => (
                            <option key={appt.id} value={appt.id}>
                              {new Date(appt.appointment_date).toLocaleDateString()} - {appt.chief_complaint || 'No complaint'}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <Button type="submit" disabled={!preview}>
                        Generate Document
                      </Button>
                      <Link href="/documents">
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
