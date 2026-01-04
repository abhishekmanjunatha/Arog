import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateTemplate } from '@/app/actions/templates'
import { AVAILABLE_VARIABLES } from '@/types/template'
import type { TemplateContent } from '@/types/template'

export default async function EditTemplatePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: template } = await supabase
    .from('templates')
    .select('*')
    .eq('id', params.id)
    .eq('doctor_id', user.id)
    .single()

  if (!template) {
    notFound()
  }

  const content = template.schema_json as TemplateContent
  const updateAction = updateTemplate.bind(null, template.id)

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
            <Link href="/templates" className="text-sm hover:text-primary">
              Templates
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
        <div className="max-w-4xl space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Edit Template</h2>
            <p className="text-muted-foreground">
              Update template information and content
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              <CardDescription>
                Update the template information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateAction} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      defaultValue={template.name}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      name="category"
                      required
                      defaultValue={template.category}
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
                    defaultValue={template.description || ''}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="variables">Variables Used (comma-separated)</Label>
                  <Input
                    id="variables"
                    name="variables"
                    defaultValue={content.variables?.join(', ') || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Template Content *</Label>
                  <textarea
                    id="content"
                    name="content"
                    required
                    rows={20}
                    defaultValue={content.content}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit">
                    Save Changes
                  </Button>
                  <Link href={`/templates/${template.id}`}>
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
