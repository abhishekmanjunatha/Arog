'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { TemplateInsert, TemplateUpdate } from '@/types/models'
import type { TemplateContent } from '@/types/template'
import type { BuilderSchema } from '@/types/builder'
import { validateTemplateContent } from '@/types/template'

// Extended insert type to include builder_version (added in migration)
interface BuilderTemplateInsert extends TemplateInsert {
  builder_version?: number
}

interface BuilderTemplateUpdate extends TemplateUpdate {
  builder_version?: number
}

/**
 * Create a Builder V2 template
 */
export async function createBuilderTemplate(data: {
  name: string
  description: string | null
  category: string
  schema: BuilderSchema
}): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Validate schema
  if (!data.schema || !data.schema.elements) {
    return { error: 'Invalid schema structure' }
  }

  if (data.schema.elements.length === 0) {
    return { error: 'Template must have at least one element' }
  }

  // Create template with builder schema
  const newTemplate: BuilderTemplateInsert = {
    doctor_id: user.id,
    name: data.name,
    description: data.description,
    category: data.category,
    schema_json: {
      version: '2.0',
      variables: [], // V2 uses elements instead
      content: '', // V2 generates content from elements
      elements: data.schema.elements as any,
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
    } as any,
    is_active: true,
    builder_version: 2,
  }

  const { data: template, error } = await supabase
    .from('templates')
    .insert(newTemplate as any)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/templates')
  return { id: template.id }
}

/**
 * Update a Builder V2 template
 */
export async function updateBuilderTemplate(
  templateId: string,
  data: {
    name: string
    description: string | null
    category: string
    schema: BuilderSchema
  }
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('templates')
    .select('id, doctor_id, builder_version')
    .eq('id', templateId)
    .single()

  if (!existing || existing.doctor_id !== user.id) {
    return { error: 'Template not found or access denied' }
  }

  // Update template
  const updates: BuilderTemplateUpdate = {
    name: data.name,
    description: data.description,
    category: data.category,
    schema_json: {
      version: '2.0',
      variables: [],
      content: '',
      elements: data.schema.elements as any,
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
    } as any,
    builder_version: 2,
  }

  const { error } = await supabase
    .from('templates')
    .update(updates as any)
    .eq('id', templateId)
    .eq('doctor_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/templates')
  revalidatePath(`/templates/${templateId}`)
  return { success: true }
}

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
