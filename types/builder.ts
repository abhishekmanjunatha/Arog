// Builder Engine Types
// Complete type definitions for the form builder system

export type ElementType = 
  | 'text'
  | 'number'
  | 'paragraph'
  | 'dropdown'
  | 'radio'
  | 'date'
  | 'calculated'
  | 'divider'
  | 'header'

export type PrefillSource = 'patient' | 'doctor' | 'appointment' | 'system'

export type PrefillField = {
  // Patient fields
  patient_name?: string
  patient_phone?: string
  patient_id?: string
  patient_email?: string
  patient_age?: number
  patient_gender?: string
  
  // Doctor fields
  doctor_name?: string
  doctor_clinic?: string
  doctor_id?: string
  
  // Appointment fields
  appointment_date?: string
  appointment_time?: string
  appointment_id?: string
  
  // System fields
  current_date?: string
  current_time?: string
  place?: string
}

export interface PrefillConfig {
  enabled: boolean
  source: PrefillSource
  field: keyof PrefillField
  readonly: boolean
}

export interface ElementValidation {
  pattern?: string
  message?: string
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
}

export interface ElementPosition {
  row: number
  col: number
  width: number // 1-12 for grid system
}

export interface ElementProperties {
  placeholder?: string
  options?: string[] // For dropdown/radio
  calculation?: 'bmi' | 'age' | 'custom' // For calculated fields
  calculationFormula?: string // Custom formula
  helpText?: string
  defaultValue?: string | number
  min?: number
  max?: number
  step?: number
  minLength?: number
  maxLength?: number
  rows?: number // For paragraph
  fontSize?: 'small' | 'medium' | 'large' // For header/divider
  alignment?: 'left' | 'center' | 'right'
}

export interface BuilderElement {
  id: string
  type: ElementType
  label: string
  name: string
  required: boolean
  prefill?: PrefillConfig
  properties: ElementProperties
  validation?: ElementValidation
  position: ElementPosition
}

export interface BuilderSchema {
  version: 2
  elements: BuilderElement[]
  variables?: any[] // Legacy support
}

export interface TemplateWithBuilder {
  id: string
  doctor_id: string
  name: string
  description: string
  category: string
  schema_json: BuilderSchema
  builder_version: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Prefill data structure
export interface PrefillData {
  patient?: {
    id: string
    name: string
    phone: string
    email?: string
    date_of_birth?: string
    gender?: string
  }
  doctor?: {
    id: string
    name: string
    clinic?: string
  }
  appointment?: {
    id: string
    appointment_date: string
    appointment_time?: string
  }
  system?: {
    current_date: string
    current_time: string
    place?: string
  }
}

// Form submission data
export interface FormData {
  [fieldName: string]: string | number | boolean
}

// Calculated field helpers
export type CalculationFunction = (data: FormData) => number | string

export interface CalculationRegistry {
  bmi: CalculationFunction
  age: CalculationFunction
  [key: string]: CalculationFunction
}
