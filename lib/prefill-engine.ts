/**
 * Prefill Engine
 * Handles automatic field population from various data sources
 * Sources: Patient, Doctor, Appointment, System
 */

import { PrefillData, PrefillConfig, PrefillSource, PrefillField } from '@/types/builder';
import { createClient } from '@/lib/supabase/server';

/**
 * Available prefill fields by source
 */
export const PREFILL_FIELDS: Record<PrefillSource, { value: keyof PrefillField; label: string }[]> = {
  patient: [
    { value: 'patient_name', label: 'Patient Name' },
    { value: 'patient_phone', label: 'Phone Number' },
    { value: 'patient_email', label: 'Email Address' },
    { value: 'patient_id', label: 'Patient ID' },
    { value: 'patient_age', label: 'Age' },
    { value: 'patient_gender', label: 'Gender' },
  ],
  doctor: [
    { value: 'doctor_name', label: 'Doctor Name' },
    { value: 'doctor_clinic', label: 'Clinic Name' },
    { value: 'doctor_id', label: 'Doctor ID' },
  ],
  appointment: [
    { value: 'appointment_date', label: 'Appointment Date' },
    { value: 'appointment_time', label: 'Appointment Time' },
    { value: 'appointment_id', label: 'Appointment ID' },
  ],
  system: [
    { value: 'current_date', label: 'Current Date' },
    { value: 'current_time', label: 'Current Time' },
    { value: 'place', label: 'Place/Location' },
  ],
};

/**
 * Get all prefill fields as a flat list
 */
export function getAllPrefillFields(): { source: PrefillSource; value: keyof PrefillField; label: string }[] {
  const allFields: { source: PrefillSource; value: keyof PrefillField; label: string }[] = [];
  
  for (const [source, fields] of Object.entries(PREFILL_FIELDS)) {
    for (const field of fields) {
      allFields.push({
        source: source as PrefillSource,
        ...field
      });
    }
  }
  
  return allFields;
}

/**
 * Fetch patient data for prefilling
 */
export async function fetchPatientData(patientId: string): Promise<PrefillData['patient'] | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('patients')
      .select('id, name, phone, email, date_of_birth, gender')
      .eq('id', patientId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching patient:', error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      phone: data.phone || '',
      email: data.email || undefined,
      date_of_birth: data.date_of_birth || undefined,
      gender: data.gender || undefined,
    };
  } catch (error) {
    console.error('Error in fetchPatientData:', error);
    return null;
  }
}

/**
 * Fetch doctor data for prefilling
 */
export async function fetchDoctorData(doctorId: string): Promise<PrefillData['doctor'] | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('doctors')
      .select('id, name, clinic_name')
      .eq('id', doctorId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching doctor:', error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      clinic: data.clinic_name || undefined,
    };
  } catch (error) {
    console.error('Error in fetchDoctorData:', error);
    return null;
  }
}

/**
 * Fetch appointment data for prefilling
 */
export async function fetchAppointmentData(appointmentId: string): Promise<PrefillData['appointment'] | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('appointments')
      .select('id, appointment_date, appointment_time')
      .eq('id', appointmentId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching appointment:', error);
      return null;
    }
    
    return {
      id: data.id,
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time || undefined,
    };
  } catch (error) {
    console.error('Error in fetchAppointmentData:', error);
    return null;
  }
}

/**
 * Get system data for prefilling
 */
export function getSystemData(place?: string): PrefillData['system'] {
  const now = new Date();
  
  return {
    current_date: now.toISOString().split('T')[0], // YYYY-MM-DD
    current_time: now.toTimeString().split(' ')[0].substring(0, 5), // HH:MM
    place: place || undefined,
  };
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Fetch all prefill data at once
 */
export async function fetchAllPrefillData(
  patientId?: string,
  doctorId?: string,
  appointmentId?: string,
  place?: string
): Promise<PrefillData> {
  const prefillData: PrefillData = {
    system: getSystemData(place),
  };
  
  // Fetch in parallel for performance
  const promises: Promise<void>[] = [];
  
  if (patientId) {
    promises.push(
      fetchPatientData(patientId).then(patient => {
        if (patient) {
          prefillData.patient = patient;
        }
      })
    );
  }
  
  if (doctorId) {
    promises.push(
      fetchDoctorData(doctorId).then(doctor => {
        if (doctor) {
          prefillData.doctor = doctor;
        }
      })
    );
  }
  
  if (appointmentId) {
    promises.push(
      fetchAppointmentData(appointmentId).then(appointment => {
        if (appointment) {
          prefillData.appointment = appointment;
        }
      })
    );
  }
  
  await Promise.all(promises);
  
  return prefillData;
}

/**
 * Get prefill value for a specific field
 */
export function getPrefillValue(
  prefillData: PrefillData, 
  prefillConfig: PrefillConfig
): string | number | undefined {
  if (!prefillConfig.enabled) {
    return undefined;
  }
  
  const { source, field } = prefillConfig;
  
  switch (source) {
    case 'patient':
      if (!prefillData.patient) return undefined;
      switch (field) {
        case 'patient_name': return prefillData.patient.name;
        case 'patient_phone': return prefillData.patient.phone;
        case 'patient_email': return prefillData.patient.email;
        case 'patient_id': return prefillData.patient.id;
        case 'patient_gender': return prefillData.patient.gender;
        case 'patient_age':
          if (prefillData.patient.date_of_birth) {
            return calculateAge(prefillData.patient.date_of_birth);
          }
          return undefined;
      }
      break;
      
    case 'doctor':
      if (!prefillData.doctor) return undefined;
      switch (field) {
        case 'doctor_name': return prefillData.doctor.name;
        case 'doctor_clinic': return prefillData.doctor.clinic;
        case 'doctor_id': return prefillData.doctor.id;
      }
      break;
      
    case 'appointment':
      if (!prefillData.appointment) return undefined;
      switch (field) {
        case 'appointment_date': return prefillData.appointment.appointment_date;
        case 'appointment_time': return prefillData.appointment.appointment_time;
        case 'appointment_id': return prefillData.appointment.id;
      }
      break;
      
    case 'system':
      if (!prefillData.system) return undefined;
      switch (field) {
        case 'current_date': return prefillData.system.current_date;
        case 'current_time': return prefillData.system.current_time;
        case 'place': return prefillData.system.place;
      }
      break;
  }
  
  return undefined;
}

/**
 * Apply prefill values to form data
 * Returns an object with field names as keys and prefilled values
 */
export function applyPrefillToForm(
  elements: Array<{ name: string; prefill?: PrefillConfig }>,
  prefillData: PrefillData
): Record<string, string | number> {
  const formValues: Record<string, string | number> = {};
  
  for (const element of elements) {
    if (element.prefill && element.prefill.enabled) {
      const value = getPrefillValue(prefillData, element.prefill);
      if (value !== undefined) {
        formValues[element.name] = value;
      }
    }
  }
  
  return formValues;
}

/**
 * Check if a field should be read-only (prefilled and locked)
 */
export function isFieldReadOnly(prefillConfig?: PrefillConfig): boolean {
  return prefillConfig?.enabled === true && prefillConfig?.readonly === true;
}

/**
 * Client-side version of getSystemData (for use in client components)
 */
export function getSystemDataClient(place?: string): PrefillData['system'] {
  const now = new Date();
  
  return {
    current_date: now.toISOString().split('T')[0],
    current_time: now.toTimeString().split(' ')[0].substring(0, 5),
    place: place || undefined,
  };
}

/**
 * Format prefill source for display
 */
export function formatPrefillSource(source: PrefillSource): string {
  const labels: Record<PrefillSource, string> = {
    patient: 'Patient',
    doctor: 'Doctor',
    appointment: 'Appointment',
    system: 'System',
  };
  return labels[source];
}

/**
 * Get icon for prefill source
 */
export function getPrefillSourceIcon(source: PrefillSource): string {
  const icons: Record<PrefillSource, string> = {
    patient: '👤',
    doctor: '⚕️',
    appointment: '📅',
    system: '⚙️',
  };
  return icons[source];
}
