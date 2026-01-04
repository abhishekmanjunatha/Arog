import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PDFViewer } from '@/components/pdf-viewer'
import { BuilderPDFViewer } from '@/components/builder-pdf-viewer'

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
      template:templates(name, builder_version)
    `)
    .eq('id', params.id)
    .eq('doctor_id', user.id)
    .single()

  if (!document) {
    notFound()
  }

  const documentData = document.data_json as any
  const title = `${document.template.name} - ${document.patient.name}`

  // Check if this is a Builder V2 document
  if (documentData?.builder_version === 2) {
    const elements = documentData?.template_schema?.elements || []
    const formData = documentData?.form_data || {}
    const patientName = documentData?.patient_info?.name || document.patient.name
    const doctorName = documentData?.doctor_info?.name || ''
    const clinicName = documentData?.doctor_info?.clinic_name || ''
    const createdAt = documentData?.created_at || document.created_at

    return (
      <BuilderPDFViewer 
        title={title}
        patientName={patientName}
        doctorName={doctorName}
        clinicName={clinicName}
        elements={elements}
        formData={formData}
        createdAt={createdAt}
      />
    )
  }

  // V1 document - use original text-based PDF
  const content = documentData?.content || ''
  return <PDFViewer content={content} title={title} />
}
