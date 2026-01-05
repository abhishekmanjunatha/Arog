'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { AppointmentInsert, AppointmentUpdate } from '@/types/models'

export async function createAppointment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const patientId = formData.get('patient_id') as string
  const appointmentDate = formData.get('appointment_date') as string
  const appointmentTime = formData.get('appointment_time') as string

  // Combine date and time into ISO timestamp
  const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`).toISOString()

  const newAppointment: AppointmentInsert = {
    doctor_id: user.id,
    patient_id: patientId,
    appointment_date: appointmentDateTime,
    duration_minutes: parseInt(formData.get('duration_minutes') as string) || 30,
    status: formData.get('status') as 'scheduled' | 'completed' | 'cancelled' | 'no_show' || 'scheduled',
    chief_complaint: formData.get('chief_complaint') as string || null,
    diagnosis: formData.get('diagnosis') as string || null,
    notes: formData.get('notes') as string || null,
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert(newAppointment)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/appointments')
  return data
}

export async function updateAppointment(appointmentId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const appointmentDate = formData.get('appointment_date') as string
  const appointmentTime = formData.get('appointment_time') as string
  const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`).toISOString()

  const updates: AppointmentUpdate = {
    appointment_date: appointmentDateTime,
    duration_minutes: parseInt(formData.get('duration_minutes') as string) || 30,
    status: formData.get('status') as 'scheduled' | 'completed' | 'cancelled' | 'no_show',
    chief_complaint: formData.get('chief_complaint') as string || null,
    diagnosis: formData.get('diagnosis') as string || null,
    notes: formData.get('notes') as string || null,
  }

  const { error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', appointmentId)
    .eq('doctor_id', user.id)

  if (error) {
    redirect(`/appointments/${appointmentId}/edit?error=` + encodeURIComponent(error.message))
  }

  revalidatePath('/appointments')
  revalidatePath(`/appointments/${appointmentId}`)
  redirect(`/appointments/${appointmentId}?success=true`)
}

export async function updateAppointmentStatus(appointmentId: string, status: 'scheduled' | 'completed' | 'cancelled' | 'no_show') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .eq('doctor_id', user.id)

  if (error) {
    redirect(`/appointments/${appointmentId}?error=` + encodeURIComponent(error.message))
  }

  revalidatePath('/appointments')
  revalidatePath(`/appointments/${appointmentId}`)
  redirect(`/appointments/${appointmentId}?status_updated=true`)
}
