import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import { softDeletePatient, restorePatient } from '@/app/actions/patients'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { PatientTimeline } from '@/components/patients/PatientTimeline'
import { GenerateDocumentButton } from '@/components/patients/GenerateDocumentButton'
import { PatientActions } from '@/components/patients/PatientActions'
import { EditPatientButton } from '@/components/patients/EditPatientButton'
import { AddAppointmentButton } from '@/components/appointments/AddAppointmentButton'
import { Calendar, FileText } from 'lucide-react'

export default async function PatientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', params.id)
    .eq('doctor_id', user.id)
    .single()

  if (!patient) {
    notFound()
  }

  // Fetch appointments for timeline
  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, appointment_date, status, chief_complaint, duration_minutes')
    .eq('patient_id', params.id)
    .order('appointment_date', { ascending: false })
    .limit(20)

  // Fetch documents for timeline
  const { data: documents } = await supabase
    .from('documents')
    .select(`
      id,
      document_name,
      created_at,
      template:templates(name, category),
      appointment:appointments(appointment_date)
    `)
    .eq('patient_id', params.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch active templates for document generation
  const { data: templates } = await supabase
    .from('templates')
    .select('id, name, description, category, builder_version, is_active')
    .eq('doctor_id', user.id)
    .eq('is_active', true)
    .order('name')

  // Fetch all patients for appointment modal
  const { data: allPatients } = await supabase
    .from('patients')
    .select('id, name')
    .eq('doctor_id', user.id)
    .eq('is_active', true)
    .order('name')

  const age = patient.date_of_birth
    ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
    : null

  const deleteAction = softDeletePatient.bind(null, patient.id)
  const restoreAction = restorePatient.bind(null, patient.id)
  
  const appointmentCount = appointments?.length || 0
  const documentCount = documents?.length || 0

  return (
    <div className="flex min-h-screen flex-col">
      <Header userEmail={user.email} />

      <main className="container mx-auto flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{patient.name}</h2>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-muted-foreground">Patient Details</p>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {appointmentCount} {appointmentCount === 1 ? 'Appointment' : 'Appointments'}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {documentCount} {documentCount === 1 ? 'Document' : 'Documents'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <EditPatientButton patient={patient} />
              <PatientActions
                patientId={patient.id}
                patientName={patient.name}
                isActive={patient.is_active}
                deleteAction={deleteAction}
                restoreAction={restoreAction}
              />
            </div>
          </div>

          {!patient.is_active && (
            <Alert variant="warning">
              This patient record is inactive
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Name</span>
                  <span className="text-sm">{patient.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Phone</span>
                  <span className="text-sm">{patient.phone || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Email</span>
                  <span className="text-sm">{patient.email || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Date of Birth</span>
                  <span className="text-sm">
                    {patient.date_of_birth 
                      ? new Date(patient.date_of_birth).toLocaleDateString() 
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Age</span>
                  <span className="text-sm">{age ? `${age} years` : '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Gender</span>
                  <span className="text-sm capitalize">{patient.gender || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Blood Group</span>
                  <span className="text-sm">{patient.blood_group || '-'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm font-medium">Address</span>
                  <span className="text-sm text-right">{patient.address || '-'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Medical History</h4>
                  <p className="text-sm text-muted-foreground">
                    {patient.medical_history || 'No medical history recorded'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Allergies</h4>
                  <p className="text-sm text-muted-foreground">
                    {patient.allergies || 'No allergies recorded'}
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Record Info</h4>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(patient.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Updated: {new Date(patient.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <PatientTimeline 
            appointments={appointments || []} 
            documents={documents || []} 
          />

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <AddAppointmentButton 
                  patients={allPatients || []}
                  preSelectedPatientId={patient.id}
                  variant="outline"
                />
                <GenerateDocumentButton 
                  patientId={patient.id} 
                  templates={templates || []} 
                />
                <Link href={`/documents?patientId=${patient.id}`}>
                  <Button variant="outline" className="w-full">
                    View All Documents
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
