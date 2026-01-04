'use client';

/**
 * Paragraph Element Renderer
 * Renders a multi-line textarea in forms
 */

import React from 'react';
import { BuilderElement, PrefillData } from '@/types/builder';
import { getPrefillValue, isFieldReadOnly } from '@/lib/prefill-engine';
import { Lock } from 'lucide-react';

interface ParagraphElementProps {
  element: BuilderElement;
  value?: string;
  onChange?: (value: string) => void;
  prefillData?: PrefillData;
  disabled?: boolean;
  error?: string;
}

export function ParagraphElement({ 
  element, 
  value, 
  onChange, 
  prefillData,
  disabled = false,
  error 
}: ParagraphElementProps) {
  const isReadOnly = isFieldReadOnly(element.prefill);
  const prefillValue = prefillData && element.prefill 
    ? getPrefillValue(prefillData, element.prefill) 
    : undefined;
  
  const displayValue = value ?? (prefillValue !== undefined ? String(prefillValue) : '');
  const isDisabled = disabled || isReadOnly;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
        <textarea
          name={element.name}
          value={displayValue}
          onChange={handleChange}
          disabled={isDisabled}
          placeholder={element.properties.placeholder}
          rows={element.properties.rows ?? 4}
          minLength={element.validation?.minLength}
          maxLength={element.validation?.maxLength}
          required={element.required}
          className={`w-full px-3 py-2 border rounded-lg transition-colors resize-y ${
            error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-cyan-500 focus:border-cyan-500'
          } ${
            isDisabled 
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
              : 'bg-white'
          }`}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {element.properties.helpText && !error && (
        <p className="text-sm text-gray-500">{element.properties.helpText}</p>
      )}
      
      {element.validation?.maxLength && (
        <p className="text-xs text-gray-400 text-right">
          {displayValue.length} / {element.validation.maxLength}
        </p>
      )}
    </div>
  );
}

export default ParagraphElement;
