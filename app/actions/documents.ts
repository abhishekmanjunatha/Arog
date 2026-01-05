'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { DocumentInsert } from '@/types/models'
import type { TemplateContent } from '@/types/template'
import type { FormData as BuilderFormData } from '@/types/builder'
import { prepareDocumentData, substituteVariables } from '@/lib/document-utils'

/**
 * Create a document from a Builder V2 template
 */
export async function createBuilderDocument(data: {
  templateId: string
  patientId: string
  appointmentId: string | null
  formData: BuilderFormData
}): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Fetch template
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .select('*')
    .eq('id', data.templateId)
    .eq('doctor_id', user.id)
    .eq('is_active', true)
    .single()

  if (templateError || !template) {
    return { error: 'Template not found' }
  }

  // Verify it's a V2 template
  if (template.builder_version !== 2) {
    return { error: 'Template is not a Builder V2 template' }
  }

  // Fetch patient
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .eq('id', data.patientId)
    .eq('doctor_id', user.id)
    .single()

  if (patientError || !patient) {
    return { error: 'Patient not found' }
  }

  // Fetch appointment if provided
  let appointment = null
  if (data.appointmentId) {
    const { data: apptData } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', data.appointmentId)
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

  // Calculate age from date of birth
  let patientAge: number | null = null;
  if (patient.date_of_birth) {
    const birthDate = new Date(patient.date_of_birth);
    const today = new Date();
    patientAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      patientAge--;
    }
  }

  // Create the document
  const newDocument: DocumentInsert = {
    doctor_id: user.id,
    patient_id: data.patientId,
    appointment_id: data.appointmentId || null,
    template_id: data.templateId,
    document_name: template.name,
    document_type: template.category,
    data_json: {
      builder_version: 2,
      form_data: data.formData,
      template_schema: template.schema_json,
      patient_info: {
        id: patient.id,
        name: patient.name,
        phone: patient.phone,
        email: patient.email,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        age: patientAge,
        blood_group: patient.blood_group,
        address: patient.address,
      },
      doctor_info: doctor ? {
        id: doctor.id,
        name: doctor.name,
        clinic_name: doctor.clinic_name,
      } : null,
      appointment_info: appointment ? {
        id: appointment.id,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        chief_complaint: appointment.chief_complaint,
      } : null,
      created_at: new Date().toISOString(),
    } as any,
    created_by: user.id,
  }

  const { data: document, error } = await supabase
    .from('documents')
    .insert(newDocument)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/documents')
  return { id: document.id }
}

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
