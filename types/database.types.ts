// Database types matching Supabase schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'

export interface Database {
  public: {
    Tables: {
      doctors: {
        Row: {
          id: string
          email: string
          name: string
          clinic_name: string | null
          contact_number: string | null
          address: string | null
          specialization: string | null
          registration_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          clinic_name?: string | null
          contact_number?: string | null
          address?: string | null
          specialization?: string | null
          registration_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          clinic_name?: string | null
          contact_number?: string | null
          address?: string | null
          specialization?: string | null
          registration_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          doctor_id: string
          name: string
          phone: string | null
          email: string | null
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | null
          blood_group: string | null
          address: string | null
          medical_history: string | null
          allergies: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          doctor_id: string
          name: string
          phone?: string | null
          email?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          blood_group?: string | null
          address?: string | null
          medical_history?: string | null
          allergies?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          doctor_id?: string
          name?: string
          phone?: string | null
          email?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          blood_group?: string | null
          address?: string | null
          medical_history?: string | null
          allergies?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          doctor_id: string
          patient_id: string
          appointment_date: string
          duration_minutes: number | null
          status: AppointmentStatus
          chief_complaint: string | null
          diagnosis: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          doctor_id: string
          patient_id: string
          appointment_date: string
          duration_minutes?: number | null
          status?: AppointmentStatus
          chief_complaint?: string | null
          diagnosis?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          doctor_id?: string
          patient_id?: string
          appointment_date?: string
          duration_minutes?: number | null
          status?: AppointmentStatus
          chief_complaint?: string | null
          diagnosis?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          doctor_id: string
          name: string
          description: string | null
          category: string | null
          schema_json: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          doctor_id: string
          name: string
          description?: string | null
          category?: string | null
          schema_json: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          doctor_id?: string
          name?: string
          description?: string | null
          category?: string | null
          schema_json?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          doctor_id: string
          patient_id: string
          appointment_id: string | null
          template_id: string
          document_name: string
          document_type: string | null
          data_json: Json
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          doctor_id: string
          patient_id: string
          appointment_id?: string | null
          template_id: string
          document_name: string
          document_type?: string | null
          data_json: Json
          created_at?: string
          created_by: string
        }
        // Documents are immutable - no Update type
      }
    }
  }
}
