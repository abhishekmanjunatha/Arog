'use client';

/**
 * Radio Element Renderer
 * Renders radio button options in forms
 */

import React from 'react';
import { BuilderElement, PrefillData } from '@/types/builder';
import { getPrefillValue, isFieldReadOnly } from '@/lib/prefill-engine';
import { Lock } from 'lucide-react';

interface RadioElementProps {
  element: BuilderElement;
  value?: string;
  onChange?: (value: string) => void;
  prefillData?: PrefillData;
  disabled?: boolean;
  error?: string;
}

export function RadioElement({ 
  element, 
  value, 
  onChange, 
  prefillData,
  disabled = false,
  error 
}: RadioElementProps) {
  const isReadOnly = isFieldReadOnly(element.prefill);
  const prefillValue = prefillData && element.prefill 
    ? getPrefillValue(prefillData, element.prefill) 
    : undefined;
  
  const displayValue = value ?? (prefillValue !== undefined ? String(prefillValue) : '');
  const isDisabled = disabled || isReadOnly;
  const options = element.properties.options || [];

  const handleChange = (optionValue: string) => {
    if (!isReadOnly && onChange) {
      onChange(optionValue);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {element.label}
        {element.required && <span className="text-red-500 ml-1">*</span>}
        {isReadOnly && (
          <Lock className="inline w-3 h-3 ml-1 text-gray-400" />
        )}
      </label>
      
      <div className="space-y-2">
        {options.map((option, index) => (
          <label 
            key={index} 
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
              displayValue === option 
                ? 'border-cyan-500 bg-cyan-50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <input
              type="radio"
              name={element.name}
              value={option}
              checked={displayValue === option}
              onChange={() => handleChange(option)}
              disabled={isDisabled}
              required={element.required && index === 0}
              className="w-4 h-4 text-cyan-600 border-gray-300 focus:ring-cyan-500"
            />
            <span className={`text-sm ${displayValue === option ? 'text-cyan-900 font-medium' : 'text-gray-700'}`}>
              {option}
            </span>
            {displayValue === option && isReadOnly && (
              <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                Auto-filled
              </span>
            )}
          </label>
        ))}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {element.properties.helpText && !error && (
        <p className="text-sm text-gray-500">{element.properties.helpText}</p>
      )}
    </div>
  );
}

export default RadioElement;
