'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { executeCalculation, getAvailableCalculations } from '@/lib/calculation-engine';
import type { FormData, BuilderElement } from '@/types/builder';

interface UseCalculationOptions {
  /**
   * Debounce delay in milliseconds for recalculating
   * @default 100
   */
  debounceMs?: number;
  /**
   * Whether to auto-calculate on form data changes
   * @default true
   */
  autoCalculate?: boolean;
}

interface CalculationResult {
  value: number | string;
  isLoading: boolean;
  error: string | null;
}

interface UseCalculationReturn {
  /**
   * Map of element ID to calculation result
   */
  results: Record<string, CalculationResult>;
  /**
   * Manually trigger recalculation for all calculated fields
   */
  recalculateAll: () => void;
  /**
   * Manually trigger recalculation for a specific field
   */
  recalculateField: (elementId: string) => void;
  /**
   * Get the calculated value for a specific element
   */
  getValue: (elementId: string) => number | string | null;
  /**
   * Available calculation types
   */
  availableCalculations: ReturnType<typeof getAvailableCalculations>;
}

/**
 * Hook for managing real-time calculations in form builder
 * 
 * @example
 * ```tsx
 * const { results, recalculateAll, getValue } = useCalculation(
 *   elements,
 *   formData,
 *   { debounceMs: 150 }
 * );
 * 
 * // Get BMI value
 * const bmi = getValue('bmi_element_id');
 * ```
 */
export function useCalculation(
  elements: BuilderElement[],
  formData: FormData,
  options: UseCalculationOptions = {}
): UseCalculationReturn {
  const { debounceMs = 100, autoCalculate = true } = options;
  
  const [results, setResults] = useState<Record<string, CalculationResult>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Get all calculated elements
  const calculatedElements = useMemo(() => {
    return elements.filter(el => el.type === 'calculated');
  }, [elements]);
  
  // Available calculations list
  const availableCalculations = useMemo(() => {
    return getAvailableCalculations();
  }, []);
  
  /**
   * Calculate a single field
   */
  const calculateField = useCallback((element: BuilderElement): CalculationResult => {
    try {
      const calculationType = element.properties.calculation || 'custom';
      const customFormula = element.properties.calculationFormula;
      
      const value = executeCalculation(calculationType, formData, customFormula);
      
      return {
        value,
        isLoading: false,
        error: typeof value === 'string' && value.includes('error') ? value : null,
      };
    } catch (error) {
      return {
        value: 'Error',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Calculation failed',
      };
    }
  }, [formData]);
  
  /**
   * Recalculate a specific field by ID
   */
  const recalculateField = useCallback((elementId: string) => {
    const element = calculatedElements.find(el => el.id === elementId);
    if (!element) return;
    
    const result = calculateField(element);
    setResults(prev => ({
      ...prev,
      [elementId]: result,
    }));
  }, [calculatedElements, calculateField]);
  
  /**
   * Recalculate all calculated fields
   */
  const recalculateAll = useCallback(() => {
    setIsCalculating(true);
    
    const newResults: Record<string, CalculationResult> = {};
    
    for (const element of calculatedElements) {
      newResults[element.id] = calculateField(element);
    }
    
    setResults(newResults);
    setIsCalculating(false);
  }, [calculatedElements, calculateField]);
  
  /**
   * Get the calculated value for a specific element
   */
  const getValue = useCallback((elementId: string): number | string | null => {
    const result = results[elementId];
    if (!result) return null;
    return result.value;
  }, [results]);
  
  /**
   * Auto-recalculate on form data changes (debounced)
   */
  useEffect(() => {
    if (!autoCalculate || calculatedElements.length === 0) return;
    
    const timeoutId = setTimeout(() => {
      recalculateAll();
    }, debounceMs);
    
    return () => clearTimeout(timeoutId);
  }, [formData, autoCalculate, debounceMs, recalculateAll, calculatedElements.length]);
  
  /**
   * Initial calculation on mount
   */
  useEffect(() => {
    if (calculatedElements.length > 0) {
      recalculateAll();
    }
  // Only run on mount and when elements change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculatedElements]);
  
  return {
    results,
    recalculateAll,
    recalculateField,
    getValue,
    availableCalculations,
  };
}

/**
 * Hook for a single calculated field
 * Useful when you only need one calculation
 */
export function useSingleCalculation(
  calculationType: string,
  formData: FormData,
  customFormula?: string,
  debounceMs: number = 100
): CalculationResult {
  const [result, setResult] = useState<CalculationResult>({
    value: '',
    isLoading: true,
    error: null,
  });
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const value = executeCalculation(calculationType, formData, customFormula);
        setResult({
          value,
          isLoading: false,
          error: typeof value === 'string' && value.includes('error') ? value : null,
        });
      } catch (error) {
        setResult({
          value: 'Error',
          isLoading: false,
          error: error instanceof Error ? error.message : 'Calculation failed',
        });
      }
    }, debounceMs);
    
    return () => clearTimeout(timeoutId);
  }, [calculationType, formData, customFormula, debounceMs]);
  
  return result;
}
