'use client';

/**
 * Document Form
 * Enhanced form component for filling out documents with server-side prefill
 */

import React, { useState, useEffect } from 'react';
import { BuilderSchema, FormData as BuilderFormData, PrefillData } from '@/types/builder';
import { FormRenderer } from '@/components/builder/FormRenderer';
import { usePrefill } from '@/hooks/usePrefill';
import { validateFormSubmission } from '@/app/actions/prefill';
import { Loader2, AlertCircle, CheckCircle, Lock } from 'lucide-react';

interface DocumentFormProps {
  schema: BuilderSchema;
  patientId?: string;
  appointmentId?: string;
  place?: string;
  onSubmit: (data: BuilderFormData) => Promise<void>;
  submitButtonText?: string;
}

export function DocumentForm({
  schema,
  patientId,
  appointmentId,
  place,
  onSubmit,
  submitButtonText = 'Save Document',
}: DocumentFormProps) {
  const { prefillData, formData: initialFormData, loading, error } = usePrefill({
    patientId,
    appointmentId,
    place,
    schema,
    autoFetch: true,
  });

  const [formData, setFormData] = useState<BuilderFormData>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Apply initial form data when prefill loads
  useEffect(() => {
    if (initialFormData && Object.keys(initialFormData).length > 0) {
      setFormData(initialFormData);
    }
  }, [initialFormData]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-cyan-600 animate-spin" />
          <div className="absolute inset-0 w-12 h-12 rounded-full bg-cyan-100 animate-ping opacity-20" />
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading form data...</p>
        <p className="text-sm text-gray-500 mt-1">Fetching patient and appointment details</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Error Loading Form</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const handleFormChange = (data: BuilderFormData) => {
    setFormData(data);
    // Clear any previous errors when user makes changes
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (data: BuilderFormData) => {
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Server-side validation with read-only field enforcement
      const validation = await validateFormSubmission(
        schema,
        data,
        patientId,
        appointmentId,
        place
      );

      if (!validation.valid) {
        setSubmitError(validation.errors.join('\n'));
        setSubmitting(false);
        return;
      }

      // Validation passed, proceed with submission

      // Use sanitized data (read-only fields are enforced server-side)
      await onSubmit(validation.sanitizedData || data);
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Form submission error:', err);
      setSubmitError('Failed to save document. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (submitSuccess) {
    return (
      <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl text-center shadow-sm">
        <div className="relative inline-block mb-4">
          <CheckCircle className="w-16 h-16 text-green-600" />
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-green-200 animate-ping opacity-20" />
        </div>
        <h3 className="text-xl font-bold text-green-900 mb-2">Document Saved Successfully!</h3>
        <p className="text-green-700">Your document has been saved and is ready for review.</p>
      </div>
    );
  }

  // Count prefilled fields
  const prefilledCount = schema.elements.filter(el => el.prefill?.enabled).length;
  const readOnlyCount = schema.elements.filter(el => el.prefill?.enabled && el.prefill?.readonly).length;

  return (
    <div className="space-y-4">
      {/* Prefill Info Banner */}
      {prefilledCount > 0 && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Auto-Fill Enabled
              </p>
              <p className="text-sm text-blue-700">
                <span className="font-medium">{prefilledCount} fields</span> are auto-filled from patient/doctor/appointment data.
                {readOnlyCount > 0 && (
                  <span className="ml-1">
                    {readOnlyCount} of these are <span className="font-medium">locked</span> and cannot be edited.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Error */}
      {submitError && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-xl animate-slide-down">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 mb-1">Validation Error</p>
              <pre className="text-sm text-red-700 whitespace-pre-wrap font-sans">{submitError}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <FormRenderer
        schema={schema}
        prefillData={prefillData || undefined}
        initialData={formData}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        disabled={submitting}
        submitButtonText={submitting ? 'Saving...' : submitButtonText}
      />
    </div>
  );
}

export default DocumentForm;
