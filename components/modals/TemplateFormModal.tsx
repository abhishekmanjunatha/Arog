'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from './Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/lib/toast'
import { createTemplate, updateTemplate } from '@/app/actions/templates'
import { AVAILABLE_VARIABLES, DEFAULT_TEMPLATES } from '@/types/template'
import type { TemplateContent } from '@/types/template'

interface Template {
  id: string
  name: string
  category: string
  description?: string | null
  schema_json: TemplateContent
}

interface TemplateFormModalProps {
  isOpen: boolean
  onClose: () => void
  template?: Template  // Optional for create mode
  mode?: 'create' | 'edit'
  onSuccess?: (templateId?: string) => void
}

export function TemplateFormModal({
  isOpen,
  onClose,
  template,
  mode = template ? 'edit' : 'create',
  onSuccess,
}: TemplateFormModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showVariables, setShowVariables] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      if (mode === 'edit' && template) {
        await updateTemplate(template.id, formData)
        toast.success('Template Updated', 'Template has been updated successfully.')
      } else {
        const result = await createTemplate(formData)
        toast.success('Template Created', `${formData.get('name')} has been created successfully.`)
        onSuccess?.(result?.id)
      }
      
      onClose()
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${mode} template`
      setError(errorMessage)
      toast.error(`${mode === 'edit' ? 'Update' : 'Create'} Failed`, errorMessage)
    }
  }

  const content = template?.schema_json

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Template' : 'Create New Template'}
      description={mode === 'edit' ? 'Update template information and content' : 'Design a new document template with variable placeholders'}
      size="full"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Variable Reference - Collapsible */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="cursor-pointer" onClick={() => setShowVariables(!showVariables)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Available Variables</CardTitle>
              <span className="text-sm text-muted-foreground">
                {showVariables ? '▼ Hide' : '▶ Show'}
              </span>
            </div>
          </CardHeader>
          {showVariables && (
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
          )}
        </Card>

        {/* Template Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Template Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={template?.name || ''}
              placeholder="e.g., Standard Prescription"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
            <select
              id="category"
              name="category"
              defaultValue={template?.category || 'prescription'}
              required
              disabled={isPending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
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
          <Label htmlFor="description" className="text-sm font-medium">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={template?.description || ''}
            placeholder="Brief description of this template"
            disabled={isPending}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="variables" className="text-sm font-medium">Variables Used (comma-separated)</Label>
          <Input
            id="variables"
            name="variables"
            type="text"
            defaultValue={content?.variables?.join(', ') || ''}
            placeholder="e.g., doctor.name, patient.name, appointment.diagnosis"
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">
            List the variables you'll use in the content below
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className="text-sm font-medium">Template Content *</Label>
          <textarea
            id="content"
            name="content"
            rows={20}
            defaultValue={content?.content || ''}
            placeholder={DEFAULT_TEMPLATES.prescription.content}
            required
            disabled={isPending}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />
          <p className="text-xs text-muted-foreground">
            Use {`{{variable.name}}`} syntax to insert dynamic values
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t">
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save Changes' : 'Create Template')}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="w-full sm:w-auto">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}
