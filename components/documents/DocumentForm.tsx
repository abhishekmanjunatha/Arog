'use client';

/**
 * Document Form Component (Client)
 * Handles template and patient selection with interactive updates
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

interface Template {
  id: string;
  name: string;
  category?: string;
}

interface Patient {
  id: string;
  name: string;
  phone?: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  chief_complaint?: string;
}

interface DocumentFormProps {
  templates: Template[];
  patients: Patient[];
  appointments: Appointment[] | null;
  preselectedTemplateId?: string;
  preselectedPatientId?: string;
  preselectedAppointmentId?: string;
  hasPreview: boolean;
  createDocumentAction: (formData: FormData) => Promise<void>;
}

export function DocumentForm({
  templates,
  patients,
  appointments,
  preselectedTemplateId,
  preselectedPatientId,
  preselectedAppointmentId,
  hasPreview,
  createDocumentAction,
}: DocumentFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('templateId', e.target.value);
    router.push(`/documents/new?${params.toString()}`);
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('patientId', e.target.value);
    if (preselectedTemplateId) {
      params.set('templateId', preselectedTemplateId);
    }
    router.push(`/documents/new?${params.toString()}`);
  };

  const handleAppointmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (preselectedTemplateId) params.set('templateId', preselectedTemplateId);
    if (preselectedPatientId) params.set('patientId', preselectedPatientId);
    if (e.target.value) {
      params.set('appointmentId', e.target.value);
    } else {
      params.delete('appointmentId');
    }
    router.push(`/documents/new?${params.toString()}`);
  };

  return (
    <form action={createDocumentAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="template_id">Template *</Label>
        <select
          id="template_id"
          name="template_id"
          required
          defaultValue={preselectedTemplateId || ''}
          onChange={handleTemplateChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Select a template</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name} ({template.category?.replace('_', ' ')})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="patient_id">Patient *</Label>
        <select
          id="patient_id"
          name="patient_id"
          required
          defaultValue={preselectedPatientId || ''}
          onChange={handlePatientChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Select a patient</option>
          {patients.map(patient => (
            <option key={patient.id} value={patient.id}>
              {patient.name} {patient.phone ? `- ${patient.phone}` : ''}
            </option>
          ))}
        </select>
      </div>

      {appointments && appointments.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="appointment_id">Appointment (Optional)</Label>
          <select
            id="appointment_id"
            name="appointment_id"
            defaultValue={preselectedAppointmentId || ''}
            onChange={handleAppointmentChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">No appointment</option>
            {appointments.map(appt => (
              <option key={appt.id} value={appt.id}>
                {new Date(appt.appointment_date).toLocaleDateString()} - {appt.chief_complaint || 'No complaint'}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={!hasPreview}>
          Generate Document
        </Button>
        <Link href="/documents">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
