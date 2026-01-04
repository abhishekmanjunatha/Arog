'use client';

/**
 * Form Renderer
 * Renders a complete form from a builder schema
 * Used when filling out documents
 */

import React, { useState, useEffect } from 'react';
import { BuilderSchema, BuilderElement, FormData, PrefillData } from '@/types/builder';
import {
  TextElement,
  NumberElement,
  ParagraphElement,
  DropdownElement,
  RadioElement,
  DateElement,
  CalculatedElement,
  HeaderElement,
  DividerElement,
} from './elements';
import { applyPrefillToForm } from '@/lib/prefill-engine';
import { validateSchema } from '@/lib/builder-utils';

interface FormRendererProps {
  schema: BuilderSchema;
  prefillData?: PrefillData;
  onSubmit?: (data: FormData) => void;
  onChange?: (data: FormData) => void;
  initialData?: FormData;
  disabled?: boolean;
  showSubmitButton?: boolean;
  submitButtonText?: string;
}

export function FormRenderer({
  schema,
  prefillData,
  onSubmit,
  onChange,
  initialData = {},
  disabled = false,
  showSubmitButton = true,
  submitButtonText = 'Submit',
}: FormRendererProps) {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Apply prefill values on mount
  useEffect(() => {
    if (prefillData) {
      const prefillValues = applyPrefillToForm(schema.elements, prefillData);
      setFormData((prev) => ({ ...prefillValues, ...prev }));
    }
  }, [prefillData, schema.elements]);

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange(formData);
    }
  }, [formData, onChange]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    for (const element of schema.elements) {
      // Skip non-input elements
      if (['divider', 'header', 'calculated'].includes(element.type)) {
        continue;
      }

      const value = formData[element.name];

      // Required validation
      if (element.required && (value === undefined || value === null || value === '')) {
        newErrors[element.name] = element.validation?.message || 'This field is required';
        continue;
      }

      // Skip further validation if field is empty and not required
      if (value === undefined || value === null || value === '') {
        continue;
      }

      // Min/Max length for text
      if (element.type === 'text' || element.type === 'paragraph') {
        const strValue = String(value);
        if (element.validation?.minLength && strValue.length < element.validation.minLength) {
          newErrors[element.name] = `Minimum ${element.validation.minLength} characters required`;
        }
        if (element.validation?.maxLength && strValue.length > element.validation.maxLength) {
          newErrors[element.name] = `Maximum ${element.validation.maxLength} characters allowed`;
        }
        // Pattern validation
        if (element.validation?.pattern) {
          const regex = new RegExp(element.validation.pattern);
          if (!regex.test(strValue)) {
            newErrors[element.name] = element.validation.message || 'Invalid format';
          }
        }
      }

      // Min/Max for numbers
      if (element.type === 'number') {
        const numValue = Number(value);
        if (element.properties.min !== undefined && numValue < element.properties.min) {
          newErrors[element.name] = `Minimum value is ${element.properties.min}`;
        }
        if (element.properties.max !== undefined && numValue > element.properties.max) {
          newErrors[element.name] = `Maximum value is ${element.properties.max}`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderElement = (element: BuilderElement) => {
    const commonProps = {
      element,
      prefillData,
      disabled,
      error: errors[element.name],
    };

    switch (element.type) {
      case 'text':
        return (
          <TextElement
            {...commonProps}
            value={formData[element.name] as string}
            onChange={(value) => handleFieldChange(element.name, value)}
          />
        );

      case 'number':
        return (
          <NumberElement
            {...commonProps}
            value={formData[element.name] as number}
            onChange={(value) => handleFieldChange(element.name, value)}
          />
        );

      case 'paragraph':
        return (
          <ParagraphElement
            {...commonProps}
            value={formData[element.name] as string}
            onChange={(value) => handleFieldChange(element.name, value)}
          />
        );

      case 'dropdown':
        return (
          <DropdownElement
            {...commonProps}
            value={formData[element.name] as string}
            onChange={(value) => handleFieldChange(element.name, value)}
          />
        );

      case 'radio':
        return (
          <RadioElement
            {...commonProps}
            value={formData[element.name] as string}
            onChange={(value) => handleFieldChange(element.name, value)}
          />
        );

      case 'date':
        return (
          <DateElement
            {...commonProps}
            value={formData[element.name] as string}
            onChange={(value) => handleFieldChange(element.name, value)}
          />
        );

      case 'calculated':
        return (
          <CalculatedElement
            element={element}
            formData={formData}
            disabled={disabled}
          />
        );

      case 'header':
        return <HeaderElement element={element} />;

      case 'divider':
        return <DividerElement element={element} />;

      default:
        return null;
    }
  };

  // Validate schema
  const schemaValidation = validateSchema(schema);
  if (!schemaValidation.valid) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-medium">Invalid form schema</p>
        <ul className="mt-2 text-sm text-red-600">
          {schemaValidation.errors.map((error, i) => (
            <li key={i}>• {error}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (schema.elements.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>This form has no fields configured.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {schema.elements.map((element) => (
        <div key={element.id}>
          {renderElement(element)}
        </div>
      ))}

      {showSubmitButton && onSubmit && (
        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={disabled || isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              disabled || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-cyan-600 text-white hover:bg-cyan-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : submitButtonText}
          </button>
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            Please fix the errors above before submitting.
          </p>
        </div>
      )}
    </form>
  );
}

export default FormRenderer;
