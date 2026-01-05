import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/Header'
import { createTemplate } from '@/app/actions/templates'
import { AVAILABLE_VARIABLES, DEFAULT_TEMPLATES } from '@/types/template'

export default async function NewTemplatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const allVariables = [
    ...AVAILABLE_VARIABLES.doctor,
    ...AVAILABLE_VARIABLES.patient,
    ...AVAILABLE_VARIABLES.appointment,
    ...AVAILABLE_VARIABLES.document,
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header userEmail={user.email} />

      <main className="container mx-auto flex-1 p-6">
        <div className="max-w-4xl space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Create Template</h2>
            <p className="text-muted-foreground">
              Design a new document template with variable placeholders
            </p>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base">Available Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Doctor</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {AVAILABLE_VARIABLES.doctor.map(v => (
                      <li key={v} className="font-mono">{`{{${v}}}`}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Patient</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {AVAILABLE_VARIABLES.patient.slice(0, 7).map(v => (
                      <li key={v} className="font-mono">{`{{${v}}}`}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Appointment</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {AVAILABLE_VARIABLES.appointment.map(v => (
                      <li key={v} className="font-mono">{`{{${v}}}`}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Document</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {AVAILABLE_VARIABLES.document.map(v => (
                      <li key={v} className="font-mono">{`{{${v}}}`}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Use double curly braces to insert variables: <code className="bg-white px-1 rounded">{`{{patient.name}}`}</code>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              <CardDescription>
                Fill in the template information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createTemplate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder="e.g., Standard Prescription"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      name="category"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="prescription">Prescription</option>
                      <option value="medical_certificate">Medical Certificate</option>
                      <option value="lab_report">Lab Report</option>
                      <option value="referral">Referral</option>
                      <option value="discharge_summary">Discharge Summary</option>
                      <option value="consultation_note">Consultation Note</option>
                      <option value="invoice">Invoice</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Brief description of this template"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="variables">Variables Used (comma-separated)</Label>
                  <Input
                    id="variables"
                    name="variables"
                    placeholder="e.g., doctor.name, patient.name, appointment.diagnosis"
                  />
                  <p className="text-xs text-muted-foreground">
                    List the variables you'll use in the content below
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Template Content *</Label>
                  <textarea
                    id="content"
                    name="content"
                    required
                    rows={20}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder={DEFAULT_TEMPLATES.prescription.content}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {`{{variable.name}}`} syntax to insert dynamic values
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit">
                    Create Template
                  </Button>
                  <Link href="/templates">
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
