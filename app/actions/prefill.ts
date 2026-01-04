'use server';

/**
 * Prefill Server Actions
 * Server-side actions for fetching prefill data and validating form submissions
 */

import { createClient } from '@/lib/supabase/server';
import { PrefillData, BuilderElement, BuilderSchema } from '@/types/builder';
import { 
  fetchPatientData, 
  fetchDoctorData, 
  fetchAppointmentData, 
  getSystemData,
  getPrefillValue 
} from '@/lib/prefill-engine';

/**
 * Fetch all prefill data for a document
 */
export async function fetchPrefillDataAction(
  patientId?: string,
  appointmentId?: string,
  place?: string
): Promise<{ success: boolean; data?: PrefillData; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Get current doctor from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const doctorId = user.id;

    // Build prefill data
    const prefillData: PrefillData = {
      system: getSystemData(place),
    };

    // Fetch in parallel
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

    return { success: true, data: prefillData };
  } catch (error) {
    console.error('Error fetching prefill data:', error);
    return { success: false, error: 'Failed to fetch prefill data' };
  }
}

/**
 * Validate that read-only prefilled fields haven't been tampered with
 * This is critical for security - prevents users from modifying prefilled data
 */
export async function validateReadOnlyFields(
  schema: BuilderSchema,
  submittedData: Record<string, any>,
  prefillData: PrefillData
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  for (const element of schema.elements) {
    // Skip elements without prefill or non-readonly prefill
    if (!element.prefill?.enabled || !element.prefill?.readonly) {
      continue;
    }

    const expectedValue = getPrefillValue(prefillData, element.prefill);
    const submittedValue = submittedData[element.name];

    // Compare values (convert to string for comparison)
    const expectedStr = expectedValue !== undefined ? String(expectedValue) : '';
    const submittedStr = submittedValue !== undefined ? String(submittedValue) : '';

    if (expectedStr !== submittedStr) {
      errors.push(
        `Field "${element.label}" is read-only and cannot be modified. ` +
        `Expected: "${expectedStr}", Received: "${submittedStr}"`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get prefilled form data for a new document
 * Returns initial form values based on prefill configuration
 */
export async function getPrefilledFormData(
  schema: BuilderSchema,
  patientId?: string,
  appointmentId?: string,
  place?: string
): Promise<{ success: boolean; formData?: Record<string, any>; prefillData?: PrefillData; error?: string }> {
  try {
    // Fetch prefill data
    const result = await fetchPrefillDataAction(patientId, appointmentId, place);
    
    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }

    const prefillData = result.data;
    const formData: Record<string, any> = {};

    // Apply prefill values to form data
    for (const element of schema.elements) {
      if (element.prefill?.enabled) {
        const value = getPrefillValue(prefillData, element.prefill);
        if (value !== undefined) {
          formData[element.name] = value;
        }
      }

      // Apply default values for non-prefilled fields
      if (!element.prefill?.enabled && element.properties.defaultValue !== undefined) {
        formData[element.name] = element.properties.defaultValue;
      }
    }

    return { success: true, formData, prefillData };
  } catch (error) {
    console.error('Error getting prefilled form data:', error);
    return { success: false, error: 'Failed to get prefilled form data' };
  }
}

/**
 * Validate and sanitize form submission
 * Ensures read-only fields are preserved and validates all data
 */
export async function validateFormSubmission(
  schema: BuilderSchema,
  submittedData: Record<string, any>,
  patientId?: string,
  appointmentId?: string,
  place?: string
): Promise<{
  valid: boolean;
  sanitizedData?: Record<string, any>;
  errors: string[];
}> {
  const errors: string[] = [];

  // First, fetch the expected prefill data
  const prefillResult = await fetchPrefillDataAction(patientId, appointmentId, place);
  
  if (!prefillResult.success || !prefillResult.data) {
    return { valid: false, errors: ['Failed to validate prefill data'] };
  }

  const prefillData = prefillResult.data;

  // Validate read-only fields
  const readOnlyValidation = await validateReadOnlyFields(schema, submittedData, prefillData);
  if (!readOnlyValidation.valid) {
    errors.push(...readOnlyValidation.errors);
  }

  // Validate required fields
  for (const element of schema.elements) {
    // Skip non-input elements
    if (['divider', 'header', 'calculated'].includes(element.type)) {
      continue;
    }

    const value = submittedData[element.name];

    // Required validation
    if (element.required && (value === undefined || value === null || value === '')) {
      errors.push(`${element.label} is required`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Sanitize data - enforce read-only values from prefill
  const sanitizedData: Record<string, any> = { ...submittedData };
  
  for (const element of schema.elements) {
    if (element.prefill?.enabled && element.prefill?.readonly) {
      // Always use the server-side prefill value for read-only fields
      const prefillValue = getPrefillValue(prefillData, element.prefill);
      if (prefillValue !== undefined) {
        sanitizedData[element.name] = prefillValue;
      }
    }
  }

  return { valid: true, sanitizedData, errors: [] };
}

// Note: Utility functions like getReadOnlyFieldNames and getPrefillSummary
// are now in @/lib/prefill-engine.ts since 'use server' files require all
// exported functions to be async server actions.
