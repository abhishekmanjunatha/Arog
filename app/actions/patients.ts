'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { PatientInsert, PatientUpdate } from '@/types/models'

export async function createPatient(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const newPatient: PatientInsert = {
    doctor_id: user.id,
    name: formData.get('name') as string,
    phone: formData.get('phone') as string || null,
    email: formData.get('email') as string || null,
    date_of_birth: formData.get('date_of_birth') as string || null,
    gender: formData.get('gender') as 'male' | 'female' | 'other' || null,
    blood_group: formData.get('blood_group') as string || null,
    address: formData.get('address') as string || null,
    medical_history: formData.get('medical_history') as string || null,
    allergies: formData.get('allergies') as string || null,
  }

  const { data, error } = await supabase
    .from('patients')
    .insert(newPatient)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/patients')
  return data
}

export async function updatePatient(patientId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const updates: PatientUpdate = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string || null,
    email: formData.get('email') as string || null,
    date_of_birth: formData.get('date_of_birth') as string || null,
    gender: formData.get('gender') as 'male' | 'female' | 'other' || null,
    blood_group: formData.get('blood_group') as string || null,
    address: formData.get('address') as string || null,
    medical_history: formData.get('medical_history') as string || null,
    allergies: formData.get('allergies') as string || null,
  }

  const { error } = await supabase
    .from('patients')
    .update(updates)
    .eq('id', patientId)
    .eq('doctor_id', user.id)

  if (error) {
    redirect(`/patients/${patientId}/edit?error=` + encodeURIComponent(error.message))
  }

  revalidatePath('/patients')
  revalidatePath(`/patients/${patientId}`)
  redirect(`/patients/${patientId}?success=true`)
}

export async function softDeletePatient(patientId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('patients')
    .update({ is_active: false })
    .eq('id', patientId)
    .eq('doctor_id', user.id)

  if (error) {
    redirect(`/patients/${patientId}?error=` + encodeURIComponent(error.message))
  }

  revalidatePath('/patients')
  redirect('/patients?deleted=true')
}

export async function restorePatient(patientId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('patients')
    .update({ is_active: true })
    .eq('id', patientId)
    .eq('doctor_id', user.id)

  if (error) {
    redirect(`/patients/${patientId}?error=` + encodeURIComponent(error.message))
  }

  revalidatePath('/patients')
  redirect(`/patients/${patientId}?restored=true`)
}
