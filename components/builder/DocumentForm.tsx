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

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading form data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">Error loading form</p>
        </div>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  // Success state
  if (submitSuccess) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800">Document Saved!</h3>
        <p className="mt-2 text-green-600">Your document has been saved successfully.</p>
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
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700">
            <Lock className="w-4 h-4" />
            <p className="text-sm">
              <span className="font-medium">{prefilledCount} fields</span> are auto-filled from patient/doctor/appointment data.
              {readOnlyCount > 0 && (
                <span className="ml-1">
                  {readOnlyCount} of these are locked and cannot be edited.
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Validation Error */}
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">Validation Error</p>
          </div>
          <pre className="text-sm text-red-600 whitespace-pre-wrap">{submitError}</pre>
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
