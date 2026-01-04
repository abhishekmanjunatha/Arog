import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PDFViewer } from '@/components/pdf-viewer'

export default async function DocumentPDFPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: document } = await supabase
    .from('documents')
    .select(`
      *,
      patient:patients(name),
      template:templates(name)
    `)
    .eq('id', params.id)
    .eq('doctor_id', user.id)
    .single()

  if (!document) {
    notFound()
  }

  const documentData = document.data_json as any
  const content = documentData?.content || ''
  const title = `${document.template.name} - ${document.patient.name}`

  return <PDFViewer content={content} title={title} />
}
