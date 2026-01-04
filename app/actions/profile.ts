'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateDoctorProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const updates = {
    name: formData.get('name') as string,
    clinic_name: formData.get('clinic_name') as string,
    contact_number: formData.get('contact_number') as string,
    address: formData.get('address') as string,
    specialization: formData.get('specialization') as string,
    registration_number: formData.get('registration_number') as string,
  }

  const { error } = await supabase
    .from('doctors')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    redirect('/profile?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/profile')
  redirect('/profile?success=true')
}
