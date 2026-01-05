'use client';

/**
 * Create Document from Builder V2 Template
 * Interactive form-based document creation
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { FormRenderer } from '@/components/builder/FormRenderer';
import { BuilderSchema, PrefillData, FormData } from '@/types/builder';
import { ArrowLeft, FileText, Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createBuilderDocument } from '@/app/actions/documents';

interface TemplateData {
  id: string;
  name: string;
  description: string | null;
  category: string;
  schema_json: {
    elements?: any[];
    version?: string;
  };
  builder_version: number | null;
}

interface PatientData {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  gender: string | null;
}

interface AppointmentData {
  id: string;
  appointment_date: string;
  appointment_time: string | null;
  chief_complaint: string | null;
}

interface DoctorData {
  id: string;
  name: string | null;
  clinic_name: string | null;
}

export default function NewBuilderDocumentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  
  // Selection state
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  
  const [selectedTemplateId, setSelectedTemplateId] = useState(searchParams.get('templateId') || '');
  const [selectedPatientId, setSelectedPatientId] = useState(searchParams.get('patientId') || '');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(searchParams.get('appointmentId') || '');

  // Load initial data
  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch doctor profile
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id, name, clinic_name')
        .eq('id', user.id)
        .single();
      
      setDoctor(doctorData);

      // Fetch V2 templates
      const { data: templateData } = await supabase
        .from('templates')
        .select('*')
        .eq('doctor_id', user.id)
        .eq('is_active', true)
        .eq('builder_version', 2)
        .order('name');
      
      setTemplates((templateData || []) as TemplateData[]);

      // Fetch patients
      const { data: patientData } = await supabase
        .from('patients')
        .select('id, name, phone, email, date_of_birth, gender')
        .eq('doctor_id', user.id)
        .eq('is_active', true)
        .order('name');
      
      setPatients((patientData || []) as PatientData[]);

      // If template is preselected
      if (searchParams.get('templateId')) {
        const tmpl = (templateData || []).find(t => t.id === searchParams.get('templateId'));
        if (tmpl) setTemplate(tmpl as TemplateData);
      }

      // If patient is preselected
      if (searchParams.get('patientId')) {
        const pat = (patientData || []).find(p => p.id === searchParams.get('patientId'));
        if (pat) setPatient(pat as PatientData);
        
        // Fetch appointments for this patient
        const { data: apptData } = await supabase
          .from('appointments')
          .select('id, appointment_date, appointment_time, chief_complaint')
          .eq('patient_id', searchParams.get('patientId'))
          .order('appointment_date', { ascending: false })
          .limit(10);
        
        setAppointments((apptData || []) as AppointmentData[]);

        // If appointment is preselected
        if (searchParams.get('appointmentId')) {
          const appt = (apptData || []).find(a => a.id === searchParams.get('appointmentId'));
          if (appt) setAppointment(appt as AppointmentData);
        }
      }

      setLoading(false);
    }

    loadData();
  }, [router, searchParams]);

  // Handle template change
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = templates.find(t => t.id === templateId);
    setTemplate(tmpl || null);
  };

  // Handle patient change
  const handlePatientChange = async (patientId: string) => {
    setSelectedPatientId(patientId);
    const pat = patients.find(p => p.id === patientId);
    setPatient(pat || null);
    setAppointment(null);
    setSelectedAppointmentId('');

    if (patientId) {
      const supabase = createClient();
      const { data: apptData } = await supabase
        .from('appointments')
        .select('id, appointment_date, appointment_time, chief_complaint')
        .eq('patient_id', patientId)
        .order('appointment_date', { ascending: false })
        .limit(10);
      
      setAppointments((apptData || []) as AppointmentData[]);
    } else {
      setAppointments([]);
    }
  };

  // Handle appointment change
  const handleAppointmentChange = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    const appt = appointments.find(a => a.id === appointmentId);
    setAppointment(appt || null);
  };

  // Build prefill data
  const buildPrefillData = (): PrefillData => {
    return {
      patient: patient ? {
        id: patient.id,
        name: patient.name,
        phone: patient.phone || '',
        email: patient.email || undefined,
        date_of_birth: patient.date_of_birth || undefined,
        gender: patient.gender || undefined,
      } : undefined,
      doctor: doctor ? {
        id: doctor.id,
        name: doctor.name || '',
        clinic: doctor.clinic_name || undefined,
      } : undefined,
      appointment: appointment ? {
        id: appointment.id,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time || undefined,
      } : undefined,
      system: {
        current_date: new Date().toISOString().split('T')[0],
        current_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        place: doctor?.clinic_name || undefined,
      },
    };
  };

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    if (!template || !patient) {
      setError('Please select a template and patient');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await createBuilderDocument({
        templateId: template.id,
        patientId: patient.id,
        appointmentId: appointment?.id || null,
        formData,
      });

      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/documents/${result.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create document');
      setSubmitting(false);
    }
  };

  // Build schema from template
  const getBuilderSchema = (): BuilderSchema | null => {
    if (!template?.schema_json?.elements) return null;
    return {
      version: 2,
      elements: template.schema_json.elements,
    };
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 className="w-6 h-6 animate-spin" />
            Loading...
          </div>
        </main>
      </>
    );
  }

  if (success) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Document Created!</h2>
            <p className="text-gray-600">Redirecting to document view...</p>
          </div>
        </main>
      </>
    );
  }

  const schema = getBuilderSchema();
  const prefillData = buildPrefillData();
  const canShowForm = template && patient && schema;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-100">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Link 
              href="/documents" 
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Create Document
              </h1>
              <p className="text-sm text-gray-500">
                {patient 
                  ? `Creating document for ${patient.name}`
                  : 'Fill out the form to generate a new document'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          {/* Selection Form */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Document Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template *
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Select template</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {templates.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    No V2 templates available.{' '}
                    <Link href="/templates/new/builder" className="text-cyan-600 hover:underline">
                      Create one
                    </Link>
                  </p>
                )}
              </div>

              {/* Patient Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient *
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handlePatientChange(e.target.value)}
                  disabled={!!searchParams.get('patientId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.phone ? `- ${p.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Appointment Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment
                </label>
                <select
                  value={selectedAppointmentId}
                  onChange={(e) => handleAppointmentChange(e.target.value)}
                  disabled={!patient}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">No appointment</option>
                  {appointments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {new Date(a.appointment_date).toLocaleDateString()} - {a.chief_complaint || 'No complaint'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Form or Placeholder */}
          {canShowForm ? (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {template.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    For: {patient.name}
                  </p>
                </div>
              </div>

              <FormRenderer
                schema={schema}
                prefillData={prefillData}
                onSubmit={handleSubmit}
                disabled={submitting}
                submitButtonText={submitting ? 'Creating Document...' : 'Create Document'}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select Template and Patient
              </h3>
              <p className="text-gray-500">
                Choose a Builder V2 template and patient to start filling out the form.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
