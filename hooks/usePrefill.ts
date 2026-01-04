'use client';

/**
 * Prefill Hook
 * Client-side hook for fetching and managing prefill data
 */

import { useState, useEffect, useCallback } from 'react';
import { PrefillData, BuilderSchema } from '@/types/builder';
import { fetchPrefillDataAction, getPrefilledFormData } from '@/app/actions/prefill';
import { getSystemDataClient } from '@/lib/prefill-engine';

interface UsePrefillOptions {
  patientId?: string;
  appointmentId?: string;
  place?: string;
  schema?: BuilderSchema;
  autoFetch?: boolean;
}

interface UsePrefillResult {
  prefillData: PrefillData | null;
  formData: Record<string, any>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage prefill data
 */
export function usePrefill({
  patientId,
  appointmentId,
  place,
  schema,
  autoFetch = true,
}: UsePrefillOptions): UsePrefillResult {
  const [prefillData, setPrefillData] = useState<PrefillData | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // If no IDs provided, just use system data
    if (!patientId && !appointmentId) {
      setPrefillData({
        system: getSystemDataClient(place),
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (schema) {
        // Fetch prefilled form data with schema
        const result = await getPrefilledFormData(
          schema,
          patientId,
          appointmentId,
          place
        );

        if (result.success) {
          setPrefillData(result.prefillData || null);
          setFormData(result.formData || {});
        } else {
          setError(result.error || 'Failed to fetch prefill data');
        }
      } else {
        // Just fetch prefill data without schema
        const result = await fetchPrefillDataAction(
          patientId,
          appointmentId,
          place
        );

        if (result.success) {
          setPrefillData(result.data || null);
        } else {
          setError(result.error || 'Failed to fetch prefill data');
        }
      }
    } catch (err) {
      console.error('Error in usePrefill:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [patientId, appointmentId, place, schema]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    prefillData,
    formData,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook to get read-only field status
 */
export function useReadOnlyFields(schema: BuilderSchema): Set<string> {
  const [readOnlyFields, setReadOnlyFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fields = new Set<string>();
    
    for (const element of schema.elements) {
      if (element.prefill?.enabled && element.prefill?.readonly) {
        fields.add(element.name);
      }
    }
    
    setReadOnlyFields(fields);
  }, [schema]);

  return readOnlyFields;
}

export default usePrefill;
