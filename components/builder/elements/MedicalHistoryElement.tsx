'use client';

/**
 * Medical History Element Renderer
 * Renders a rich text area with support for bullets, numbered lists, and paragraphs
 */

import React from 'react';
import { BuilderElement, PrefillData } from '@/types/builder';
import { getPrefillValue, isFieldReadOnly } from '@/lib/prefill-engine.client';
import { Lock, ClipboardList } from 'lucide-react';

interface MedicalHistoryElementProps {
  element: BuilderElement;
  value?: string;
  onChange?: (value: string) => void;
  prefillData?: PrefillData;
  disabled?: boolean;
  error?: string;
}

export function MedicalHistoryElement({ 
  element, 
  value, 
  onChange, 
  prefillData,
  disabled = false,
  error 
}: MedicalHistoryElementProps) {
  const isReadOnly = isFieldReadOnly(element.prefill);
  const prefillValue = prefillData && element.prefill 
    ? getPrefillValue(prefillData, element.prefill) 
    : undefined;
  
  const displayValue = value ?? (prefillValue !== undefined ? String(prefillValue) : '');
  const isDisabled = disabled || isReadOnly;
  const format = element.properties.format || 'mixed';

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isReadOnly && onChange) {
      onChange(e.target.value);
    }
  };

  // Get format-specific placeholder
  const getPlaceholder = () => {
    if (element.properties.placeholder) {
      return element.properties.placeholder;
    }
    switch (format) {
      case 'bullets':
        return '- First item\n- Second item\n- Third item';
      case 'numbered':
        return '1. First item\n2. Second item\n3. Third item';
      case 'paragraph':
        return 'Enter medical history details...';
      default:
        return 'Enter medical history (use - for bullets, 1. for numbered lists)';
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        <span className="flex items-center gap-1">
          <ClipboardList className="w-4 h-4 text-gray-500" />
          {element.label}
          {element.required && <span className="text-red-500 ml-1">*</span>}
          {isReadOnly && (
            <Lock className="inline w-3 h-3 ml-1 text-gray-400" />
          )}
        </span>
      </label>
      
      {/* Format hint */}
      {format !== 'paragraph' && (
        <p className="text-xs text-gray-500">
          {format === 'bullets' && 'Use bullet points for each item'}
          {format === 'numbered' && 'Use numbered list for items'}
          {format === 'mixed' && 'Supports paragraphs, bullets (-), and numbered lists (1.)'}
        </p>
      )}
      
      <div className="relative">
        <textarea
          name={element.name}
          value={displayValue}
          onChange={handleChange}
          disabled={isDisabled}
          placeholder={getPlaceholder()}
          rows={element.properties.rows ?? 6}
          minLength={element.validation?.minLength}
          maxLength={element.validation?.maxLength}
          required={element.required}
          className={`w-full px-3 py-2 border rounded-lg transition-colors resize-y font-mono text-sm ${
            error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-cyan-500 focus:border-cyan-500'
          } ${
            isDisabled 
              ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
              : 'bg-white focus:ring-2'
          }`}
        />
        
        {/* Character count */}
        {element.validation?.maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {displayValue.length}/{element.validation.maxLength}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      {/* Help text */}
      {element.properties.helpText && !error && (
        <p className="text-sm text-gray-500">{element.properties.helpText}</p>
      )}
    </div>
  );
}

export default MedicalHistoryElement;
