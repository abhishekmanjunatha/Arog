/**
 * Template JSON Schema for Medical Documents
 * 
 * Templates use a simple variable substitution system with markdown-like formatting.
 * Variables are referenced using {{variable.path}} syntax.
 * 
 * Available variables:
 * - doctor.* (name, email, phone, specialization, license_number, clinic_name, clinic_address)
 * - patient.* (name, email, phone, date_of_birth, age, gender, blood_group, address, emergency_contact)
 * - appointment.* (appointment_date, duration_minutes, chief_complaint, diagnosis, notes)
 * - document.* (date, id, doctor_signature)
 */

export interface TemplateContent {
  /**
   * Template format version
   */
  version: '1.0'
  
  /**
   * List of variables used in this template
   * Used for validation and UI hints
   */
  variables: string[]
  
  /**
   * Elements array (required by database constraint)
   */
  elements: any[]
  
  /**
   * Main content with variable placeholders
   * Uses {{variable.path}} syntax for substitution
   */
  content: string
  
  /**
   * Optional CSS styles for PDF generation
   */
  styles?: {
    fontSize?: number
    fontFamily?: string
    lineHeight?: number
    pageMargins?: [number, number, number, number] // [top, right, bottom, left]
  }
  
  /**
   * Page settings for PDF
   */
  pageSettings?: {
    size?: 'A4' | 'Letter'
    orientation?: 'portrait' | 'landscape'
  }
}

/**
 * Helper function to get all available template variables
 */
export const AVAILABLE_VARIABLES = {
  doctor: [
    'doctor.name',
    'doctor.email',
    'doctor.phone',
    'doctor.specialization',
    'doctor.license_number',
    'doctor.clinic_name',
    'doctor.clinic_address',
  ],
  patient: [
    'patient.name',
    'patient.email',
    'patient.phone',
    'patient.date_of_birth',
    'patient.age',
    'patient.gender',
    'patient.blood_group',
    'patient.address',
    'patient.emergency_contact',
    'patient.emergency_phone',
  ],
  appointment: [
    'appointment.appointment_date',
    'appointment.appointment_time',
    'appointment.duration_minutes',
    'appointment.chief_complaint',
    'appointment.diagnosis',
    'appointment.notes',
  ],
  document: [
    'document.date',
    'document.id',
    'document.created_at',
  ],
} as const

/**
 * Common template categories
 */
export const TEMPLATE_CATEGORIES = [
  'prescription',
  'medical_certificate',
  'lab_report',
  'referral',
  'discharge_summary',
  'consultation_note',
  'invoice',
  'other',
] as const

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number]

/**
 * Default template examples
 */
export const DEFAULT_TEMPLATES: Record<string, TemplateContent> = {
  prescription: {
    version: '1.0',
    variables: [
      'doctor.name',
      'doctor.specialization',
      'doctor.license_number',
      'doctor.clinic_name',
      'doctor.clinic_address',
      'doctor.phone',
      'patient.name',
      'patient.age',
      'patient.gender',
      'appointment.appointment_date',
      'appointment.diagnosis',
      'document.date',
    ],
    elements: [],
    content: `PRESCRIPTION

Dr. {{doctor.name}}
{{doctor.specialization}}
License No: {{doctor.license_number}}

{{doctor.clinic_name}}
{{doctor.clinic_address}}
Phone: {{doctor.phone}}

---

Date: {{document.date}}

Patient Name: {{patient.name}}
Age: {{patient.age}} years
Gender: {{patient.gender}}

Diagnosis: {{appointment.diagnosis}}

Rx:

1. [Medicine name, dosage, frequency]
2. [Medicine name, dosage, frequency]
3. [Medicine name, dosage, frequency]

Instructions:
- Take medicines as prescribed
- Follow up after [duration]

---

Dr. {{doctor.name}}
(Signature)`,
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
  },
  
  medical_certificate: {
    version: '1.0',
    variables: [
      'doctor.name',
      'doctor.specialization',
      'doctor.license_number',
      'doctor.clinic_name',
      'patient.name',
      'patient.age',
      'appointment.appointment_date',
      'appointment.diagnosis',
      'document.date',
    ],
    elements: [],
    content: `MEDICAL CERTIFICATE

This is to certify that {{patient.name}}, age {{patient.age}} years, was examined and treated by me on {{appointment.appointment_date}}.

Diagnosis: {{appointment.diagnosis}}

The patient is advised rest for [number] days from {{document.date}}.

Date: {{document.date}}

Dr. {{doctor.name}}
{{doctor.specialization}}
License No: {{doctor.license_number}}
{{doctor.clinic_name}}

(Signature)`,
    styles: {
      fontSize: 12,
      fontFamily: 'Helvetica',
      lineHeight: 1.6,
      pageMargins: [50, 80, 50, 80],
    },
    pageSettings: {
      size: 'A4',
      orientation: 'portrait',
    },
  },
}

/**
 * Validates template content structure
 */
export function validateTemplateContent(content: unknown): content is TemplateContent {
  if (typeof content !== 'object' || content === null) {
    return false
  }
  
  const template = content as TemplateContent
  
  return (
    template.version === '1.0' &&
    Array.isArray(template.variables) &&
    Array.isArray(template.elements) &&
    typeof template.content === 'string'
  )
}
