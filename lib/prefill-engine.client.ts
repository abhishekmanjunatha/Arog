/**
 * Prefill Engine - Client Side Utilities
 * Safe to import in client components
 * 
 * For server-side data fetching, use '@/lib/prefill-engine.server'
 */

import { PrefillData, PrefillConfig, PrefillSource, PrefillField, BuilderElement, BuilderSchema } from '@/types/builder';

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
 * Get a prefill value from prefill data based on config
 */
export function getPrefillValue(
  prefillData: PrefillData | undefined,
  config: PrefillConfig
): string | number | undefined {
  if (!prefillData || !config.enabled) {
    return undefined;
  }

  const { source, field } = config;
  
  // Guard against undefined field
  if (!field) {
    return undefined;
  }
  
  switch (source) {
    case 'patient':
      return prefillData.patient?.[field.replace('patient_', '') as keyof typeof prefillData.patient];
    case 'doctor':
      return prefillData.doctor?.[field.replace('doctor_', '') as keyof typeof prefillData.doctor];
    case 'appointment':
      return prefillData.appointment?.[field.replace('appointment_', '') as keyof typeof prefillData.appointment];
    case 'system':
      return prefillData.system?.[field as keyof typeof prefillData.system];
    default:
      return undefined;
  }
}

/**
 * Apply prefill values to form elements
 * Returns a map of field name to prefilled value
 */
export function applyPrefillToForm(
  elements: BuilderElement[],
  prefillData: PrefillData
): Record<string, any> {
  const values: Record<string, any> = {};
  
  for (const element of elements) {
    // Handle date elements with useCurrentDate option
    if (element.type === 'date' && element.properties?.useCurrentDate) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      values[element.name] = today;
    }
    // Handle prefill configuration
    else if (element.prefill?.enabled) {
      const value = getPrefillValue(prefillData, element.prefill);
      if (value !== undefined) {
        values[element.name] = value;
      }
    }
  }
  
  return values;
}

/**
 * Get system data for prefilling (client-side)
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
 * Alias for getSystemData (client-side version)
 */
export const getSystemDataClient = getSystemData;

/**
 * Check if a field should be read-only (prefilled and locked)
 */
export function isFieldReadOnly(prefillConfig?: PrefillConfig): boolean {
  return prefillConfig?.enabled === true && prefillConfig?.readonly === true;
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

/**
 * Get read-only field names from a schema
 * Useful for frontend to know which fields to disable
 */
export function getReadOnlyFieldNames(schema: BuilderSchema): string[] {
  return schema.elements
    .filter(el => el.prefill?.enabled && el.prefill?.readonly)
    .map(el => el.name);
}

/**
 * Get prefill configuration summary for a schema
 * Shows which fields are prefilled and from what source
 */
export function getPrefillSummary(schema: BuilderSchema): Array<{
  fieldName: string;
  fieldLabel: string;
  source: string;
  field: string;
  readonly: boolean;
}> {
  return schema.elements
    .filter(el => el.prefill?.enabled)
    .map(el => ({
      fieldName: el.name,
      fieldLabel: el.label,
      source: el.prefill!.source,
      field: el.prefill!.field as string,
      readonly: el.prefill!.readonly,
    }));
}
