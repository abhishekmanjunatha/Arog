import { Database } from './database.types'

// Convenience types extracted from Database
export type Doctor = Database['public']['Tables']['doctors']['Row']
export type DoctorInsert = Database['public']['Tables']['doctors']['Insert']
export type DoctorUpdate = Database['public']['Tables']['doctors']['Update']

export type Patient = Database['public']['Tables']['patients']['Row']
export type PatientInsert = Database['public']['Tables']['patients']['Insert']
export type PatientUpdate = Database['public']['Tables']['patients']['Update']

export type Appointment = Database['public']['Tables']['appointments']['Row']
export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert']
export type AppointmentUpdate = Database['public']['Tables']['appointments']['Update']
export type AppointmentStatus = Database['public']['Tables']['appointments']['Row']['status']

export type Template = Database['public']['Tables']['templates']['Row']
export type TemplateInsert = Database['public']['Tables']['templates']['Insert']
export type TemplateUpdate = Database['public']['Tables']['templates']['Update']

export type Document = Database['public']['Tables']['documents']['Row']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert']
// Note: Documents are immutable - no Update type

// Template schema types
export interface TemplateElement {
  id: string
  type: 'text' | 'number' | 'paragraph' | 'dropdown' | 'radio' | 'date' | 'calculated' | 'divider'
  label: string
  required?: boolean
  readonly?: boolean
  prefill?: string // e.g., 'patient.name', 'doctor.clinic_name', 'appointment.date'
  options?: string[] // For dropdown/radio
  calculation?: string // For calculated fields e.g., 'bmi'
  defaultValue?: string | number
}

export interface TemplateSchema {
  version: string
  elements: TemplateElement[]
}

// Extended types with relations (for queries with joins)
export interface PatientWithStats extends Patient {
  appointment_count?: number
  document_count?: number
  last_appointment?: string
}

export interface AppointmentWithPatient extends Appointment {
  patient?: Patient
}

export interface DocumentWithRelations extends Document {
  patient?: Patient
  appointment?: Appointment
  template?: Template
}
