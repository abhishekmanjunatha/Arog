'use client';

/**
 * Dropdown Element Renderer
 * Renders a select dropdown in forms
 */

import React from 'react';
import { BuilderElement, PrefillData } from '@/types/builder';
import { getPrefillValue, isFieldReadOnly } from '@/lib/prefill-engine.client';
import { Lock, ChevronDown } from 'lucide-react';

interface DropdownElementProps {
  element: BuilderElement;
  value?: string;
  onChange?: (value: string) => void;
  prefillData?: PrefillData;
  disabled?: boolean;
  error?: string;
}

export function DropdownElement({ 
  element, 
  value, 
  onChange, 
  prefillData,
  disabled = false,
  error 
}: DropdownElementProps) {
  const isReadOnly = isFieldReadOnly(element.prefill);
  const prefillValue = prefillData && element.prefill 
    ? getPrefillValue(prefillData, element.prefill) 
    : undefined;
  
  const displayValue = value ?? (prefillValue !== undefined ? String(prefillValue) : '');
  const isDisabled = disabled || isReadOnly;
  const options = element.properties.options || [];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!isReadOnly && onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {element.label}
        {element.required && <span className="text-red-500 ml-1">*</span>}
        {isReadOnly && (
          <Lock className="inline w-3 h-3 ml-1 text-gray-400" />
        )}
      </label>
      
      <div className="relative">
        <select
          name={element.name}
          value={displayValue}
          onChange={handleChange}
          disabled={isDisabled}
          required={element.required}
          className={`w-full px-3 py-2 border rounded-lg transition-colors appearance-none ${
            error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-cyan-500 focus:border-cyan-500'
          } ${
            isDisabled 
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
              : 'bg-white'
          }`}
        >
          <option value="">
            {element.properties.placeholder || 'Select an option...'}
          </option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
          {isReadOnly && (
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              Auto-filled
            </span>
          )}
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
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

export default DropdownElement;
