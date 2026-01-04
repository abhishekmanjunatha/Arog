'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { TemplateInsert, TemplateUpdate } from '@/types/models'
import type { TemplateContent } from '@/types/template'
import { validateTemplateContent } from '@/types/template'

export async function createTemplate(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const contentStr = formData.get('content') as string
  const variablesStr = formData.get('variables') as string

  let content: TemplateContent
  try {
    // Parse variables (comma-separated)
    const variables = variablesStr
      ? variablesStr.split(',').map(v => v.trim()).filter(Boolean)
      : []

    content = {
      version: '1.0',
      variables,
      content: contentStr,
      elements: [], // Required by database constraint
      styles: {
        fontSize: 12,
        fontFamily: 'Helvetica',
        lineHeight: 1.5,
        pageMargins: [40, 60, 40, 60],
      },
      pageSettings: {
        size: 'A4',
        orientation: 'portrait',
      },
    }

    if (!validateTemplateContent(content)) {
      redirect('/templates/new?error=' + encodeURIComponent('Invalid template content'))
    }
  } catch (error) {
    redirect('/templates/new?error=' + encodeURIComponent('Failed to parse template'))
  }

  const newTemplate: TemplateInsert = {
    doctor_id: user.id,
    name: formData.get('name') as string,
    description: formData.get('description') as string || null,
    category: formData.get('category') as string,
    schema_json: content as any,
    is_active: true,
  }

  const { data, error } = await supabase
    .from('templates')
    .insert(newTemplate)
    .select()
    .single()

  if (error) {
    redirect('/templates/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/templates')
  redirect(`/templates/${data.id}`)
}

export async function updateTemplate(templateId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const contentStr = formData.get('content') as string
  const variablesStr = formData.get('variables') as string

  let content: TemplateContent
  try {
    const variables = variablesStr
      ? variablesStr.split(',').map(v => v.trim()).filter(Boolean)
      : []

    content = {
      version: '1.0',
      variables,
      content: contentStr,
      elements: [], // Required by database constraint
      styles: {
        fontSize: 12,
        fontFamily: 'Helvetica',
        lineHeight: 1.5,
        pageMargins: [40, 60, 40, 60],
      },
      pageSettings: {
        size: 'A4',
        orientation: 'portrait',
      },
    }

    if (!validateTemplateContent(content)) {
      redirect(`/templates/${templateId}/edit?error=` + encodeURIComponent('Invalid template content'))
    }
  } catch (error) {
    redirect(`/templates/${templateId}/edit?error=` + encodeURIComponent('Failed to parse template'))
  }

  const updates: TemplateUpdate = {
    name: formData.get('name') as string,
    description: formData.get('description') as string || null,
    category: formData.get('category') as string,
    schema_json: content as any,
  }

  const { error } = await supabase
    .from('templates')
    .update(updates)
    .eq('id', templateId)
    .eq('doctor_id', user.id)

  if (error) {
    redirect(`/templates/${templateId}/edit?error=` + encodeURIComponent(error.message))
  }

  revalidatePath('/templates')
  revalidatePath(`/templates/${templateId}`)
  redirect(`/templates/${templateId}?success=true`)
}

export async function toggleTemplateActive(templateId: string, isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('templates')
    .update({ is_active: isActive })
    .eq('id', templateId)
    .eq('doctor_id', user.id)

  if (error) {
    redirect(`/templates/${templateId}?error=` + encodeURIComponent(error.message))
  }

  revalidatePath('/templates')
  revalidatePath(`/templates/${templateId}`)
  redirect(`/templates/${templateId}?status_updated=true`)
}
