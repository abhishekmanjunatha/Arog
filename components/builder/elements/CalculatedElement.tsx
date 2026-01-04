'use client';

/**
 * Calculated Element Renderer
 * Renders a calculated/computed field in forms
 */

import React, { useEffect, useState } from 'react';
import { BuilderElement, FormData } from '@/types/builder';
import { executeCalculation, getBMICategory } from '@/lib/calculation-engine';
import { Calculator, Info } from 'lucide-react';

interface CalculatedElementProps {
  element: BuilderElement;
  formData: FormData;
  disabled?: boolean;
}

export function CalculatedElement({ 
  element, 
  formData,
  disabled = false
}: CalculatedElementProps) {
  const [calculatedValue, setCalculatedValue] = useState<string | number>('—');

  useEffect(() => {
    const calculationType = element.properties.calculation || 'custom';
    const customFormula = element.properties.calculationFormula;
    
    const result = executeCalculation(calculationType, formData, customFormula);
    setCalculatedValue(result);
  }, [formData, element.properties.calculation, element.properties.calculationFormula]);

  const isBMI = element.properties.calculation === 'bmi';
  const bmiCategory = isBMI && typeof calculatedValue === 'number' 
    ? getBMICategory(calculatedValue) 
    : null;

  const getBMICategoryColor = (category: string | null) => {
    switch (category) {
      case 'Underweight': return 'text-blue-600 bg-blue-50';
      case 'Normal': return 'text-green-600 bg-green-50';
      case 'Overweight': return 'text-yellow-600 bg-yellow-50';
      case 'Obese': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
        <Calculator className="w-4 h-4 text-amber-500" />
        {element.label}
      </label>
      
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
        typeof calculatedValue === 'number' 
          ? 'border-amber-200 bg-amber-50' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex-1">
          <span className={`text-2xl font-bold ${
            typeof calculatedValue === 'number' ? 'text-gray-900' : 'text-gray-400'
          }`}>
            {calculatedValue}
          </span>
          
          {isBMI && bmiCategory && (
            <span className={`ml-3 px-2 py-1 rounded-full text-sm font-medium ${getBMICategoryColor(bmiCategory)}`}>
              {bmiCategory}
            </span>
          )}
          
          {element.properties.calculation === 'age' && typeof calculatedValue === 'number' && (
            <span className="ml-2 text-gray-500">years old</span>
          )}
        </div>
        
        <div className="flex items-center text-xs text-gray-500">
          <Info className="w-3 h-3 mr-1" />
          Auto-calculated
        </div>
      </div>
      
      {element.properties.helpText && (
        <p className="text-sm text-gray-500">{element.properties.helpText}</p>
      )}
      
      {/* Hidden input for form submission */}
      <input 
        type="hidden" 
        name={element.name} 
        value={typeof calculatedValue === 'number' ? calculatedValue : ''} 
      />
    </div>
  );
}

export default CalculatedElement;
