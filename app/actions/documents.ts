'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { DocumentInsert } from '@/types/models'
import type { TemplateContent } from '@/types/template'
import { prepareDocumentData, substituteVariables } from '@/lib/document-utils'

export async function createDocument(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const templateId = formData.get('template_id') as string
  const patientId = formData.get('patient_id') as string
  const appointmentId = formData.get('appointment_id') as string | null
  const customContent = formData.get('custom_content') as string | null

  // Fetch template
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .eq('doctor_id', user.id)
    .eq('is_active', true)
    .single()

  if (templateError || !template) {
    redirect('/documents/new?error=' + encodeURIComponent('Template not found'))
  }

  // Fetch patient
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .eq('doctor_id', user.id)
    .single()

  if (patientError || !patient) {
    redirect('/documents/new?error=' + encodeURIComponent('Patient not found'))
  }

  // Fetch appointment if provided
  let appointment = null
  if (appointmentId) {
    const { data: apptData } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .eq('doctor_id', user.id)
      .single()

    appointment = apptData
  }

  // Fetch doctor profile
  const { data: doctor } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', user.id)
    .single()

  // Prepare document data
  const documentData = prepareDocumentData(doctor, patient, appointment)

  // Generate content
  const templateContent = template.schema_json as TemplateContent
  const generatedContent = customContent || substituteVariables(templateContent.content, documentData)

  const newDocument: DocumentInsert = {
    doctor_id: user.id,
    patient_id: patientId,
    appointment_id: appointmentId || null,
    template_id: templateId,
    document_name: template.name,
    document_type: template.category,
    data_json: {
      content: generatedContent,
      template: templateContent,
      generated_data: documentData,
    } as any,
    created_by: user.id,
  }

  const { data, error } = await supabase
    .from('documents')
    .insert(newDocument)
    .select()
    .single()

  if (error) {
    redirect('/documents/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/documents')
  redirect(`/documents/${data.id}`)
}

export async function deleteDocument(documentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Documents are immutable - we shouldn't actually delete them
  // But we can mark them somehow or just restrict access
  // For now, we'll just redirect back
  redirect('/documents?error=' + encodeURIComponent('Documents cannot be deleted (immutable)'))
}
