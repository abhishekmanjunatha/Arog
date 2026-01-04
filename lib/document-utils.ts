/**
 * Document generation utilities
 * Handles variable substitution and data prefilling
 */

import type { TemplateContent } from '@/types/template'

export interface DocumentData {
  doctor: {
    name?: string
    email?: string
    phone?: string
    specialization?: string
    license_number?: string
    clinic_name?: string
    clinic_address?: string
  }
  patient: {
    name?: string
    email?: string
    phone?: string
    date_of_birth?: string
    age?: number
    gender?: string
    blood_group?: string
    address?: string
    emergency_contact?: string
    emergency_phone?: string
  }
  appointment?: {
    appointment_date?: string
    appointment_time?: string
    duration_minutes?: number
    chief_complaint?: string
    diagnosis?: string
    notes?: string
  }
  document: {
    date: string
    id?: string
    created_at?: string
  }
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format time for display
 */
export function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Substitute variables in template content with actual data
 */
export function substituteVariables(content: string, data: DocumentData): string {
  let result = content

  // Helper function to get nested property value
  const getNestedValue = (obj: any, path: string): string => {
    const value = path.split('.').reduce((curr, prop) => curr?.[prop], obj)
    return value !== undefined && value !== null ? String(value) : '[Not provided]'
  }

  // Find all {{variable}} patterns
  const regex = /\{\{([^}]+)\}\}/g
  const matches = content.match(regex)

  if (matches) {
    matches.forEach((match) => {
      const variablePath = match.slice(2, -2).trim() // Remove {{ and }}
      const value = getNestedValue(data, variablePath)
      result = result.replace(match, value)
    })
  }

  return result
}

/**
 * Prepare document data from database records
 */
export function prepareDocumentData(
  doctor: any,
  patient: any,
  appointment: any | null,
  documentId?: string
): DocumentData {
  const now = new Date()

  // Calculate patient age if DOB exists
  const patientAge = patient.date_of_birth
    ? calculateAge(patient.date_of_birth)
    : undefined

  // Format appointment date and time if appointment exists
  const appointmentData = appointment
    ? {
        appointment_date: formatDate(appointment.appointment_date),
        appointment_time: formatTime(appointment.appointment_date),
        duration_minutes: appointment.duration_minutes,
        chief_complaint: appointment.chief_complaint || undefined,
        diagnosis: appointment.diagnosis || undefined,
        notes: appointment.notes || undefined,
      }
    : undefined

  return {
    doctor: {
      name: doctor.name || undefined,
      email: doctor.email || undefined,
      phone: doctor.phone || undefined,
      specialization: doctor.specialization || undefined,
      license_number: doctor.license_number || undefined,
      clinic_name: doctor.clinic_name || undefined,
      clinic_address: doctor.clinic_address || undefined,
    },
    patient: {
      name: patient.name,
      email: patient.email || undefined,
      phone: patient.phone || undefined,
      date_of_birth: patient.date_of_birth
        ? formatDate(patient.date_of_birth)
        : undefined,
      age: patientAge,
      gender: patient.gender || undefined,
      blood_group: patient.blood_group || undefined,
      address: patient.address || undefined,
      emergency_contact: patient.emergency_contact || undefined,
      emergency_phone: patient.emergency_phone || undefined,
    },
    appointment: appointmentData,
    document: {
      date: formatDate(now.toISOString()),
      id: documentId,
      created_at: now.toISOString(),
    },
  }
}

/**
 * Validate that all required variables in template are available in data
 */
export function validateTemplateData(
  template: TemplateContent,
  data: DocumentData
): { valid: boolean; missingVariables: string[] } {
  const missingVariables: string[] = []

  if (template.variables) {
    template.variables.forEach((variable) => {
      const value = variable.split('.').reduce((curr: any, prop) => curr?.[prop], data)
      if (value === undefined || value === null) {
        missingVariables.push(variable)
      }
    })
  }

  return {
    valid: missingVariables.length === 0,
    missingVariables,
  }
}
