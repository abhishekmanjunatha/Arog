'use client';

/**
 * Properties Panel
 * Right panel for configuring selected element properties
 */

import React from 'react';
import { useBuilder } from './BuilderContext';
import { BuilderElement, ElementType, PrefillSource, PrefillField } from '@/types/builder';
import { PREFILL_FIELDS, formatPrefillSource } from '@/lib/prefill-engine';
import { getAvailableCalculations } from '@/lib/calculation-engine';
import { canBePrefilled, canBeRequired } from '@/lib/builder-utils';
import { Settings, Sliders, Zap, AlertCircle, LayoutGrid } from 'lucide-react';

export function PropertiesPanel() {
  const { state, updateElement, getSelectedElement } = useBuilder();
  const selectedElement = getSelectedElement();

  if (!selectedElement) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-gray-400">
        <Settings className="w-12 h-12 mb-4" />
        <p className="text-center">
          Select an element on the canvas to edit its properties
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <Sliders className="w-4 h-4" />
        Element Properties
      </h3>

      {/* Basic Properties */}
      <BasicProperties element={selectedElement} onUpdate={updateElement} />

      {/* Layout Properties */}
      <LayoutProperties element={selectedElement} onUpdate={updateElement} />

      {/* Type-Specific Properties */}
      <TypeSpecificProperties element={selectedElement} onUpdate={updateElement} />

      {/* Prefill Configuration */}
      {canBePrefilled(selectedElement.type) && (
        <PrefillProperties element={selectedElement} onUpdate={updateElement} />
      )}

      {/* Validation */}
      {!['divider', 'header', 'calculated'].includes(selectedElement.type) && (
        <ValidationProperties element={selectedElement} onUpdate={updateElement} />
      )}
    </div>
  );
}

// Basic Properties Section
interface PropertySectionProps {
  element: BuilderElement;
  onUpdate: (id: string, updates: Partial<BuilderElement>) => void;
}

function BasicProperties({ element, onUpdate }: PropertySectionProps) {
  const handleChange = (field: keyof BuilderElement, value: any) => {
    onUpdate(element.id, { [field]: value });
  };

  const isLayoutElement = ['divider', 'header'].includes(element.type);

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase">Basic</h4>
      
      {/* Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isLayoutElement ? 'Text' : 'Label'}
        </label>
        <input
          type="text"
          value={element.label}
          onChange={(e) => handleChange('label', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          placeholder={isLayoutElement ? 'Enter text' : 'Enter label'}
        />
      </div>

      {/* Field Name (not for layout elements) */}
      {!isLayoutElement && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Name
          </label>
          <input
            type="text"
            value={element.name}
            onChange={(e) => handleChange('name', e.target.value.replace(/[^a-z0-9_]/gi, '_').toLowerCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-mono text-sm"
            placeholder="field_name"
          />
          <p className="mt-1 text-xs text-gray-500">
            Used in data storage. Only letters, numbers, underscores.
          </p>
        </div>
      )}

      {/* Required Checkbox */}
      {canBeRequired(element.type) && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={element.required}
            onChange={(e) => handleChange('required', e.target.checked)}
            className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
          />
          <span className="text-sm text-gray-700">Required field</span>
        </label>
      )}
    </div>
  );
}

// Layout Properties Section - Grid System
function LayoutProperties({ element, onUpdate }: PropertySectionProps) {
  const handlePositionChange = (key: 'width' | 'col', value: number) => {
    onUpdate(element.id, {
      position: { ...element.position, [key]: value },
    });
  };

  const widthOptions = [
    { value: 12, label: 'Full Width (12/12)', preview: 'w-full' },
    { value: 6, label: 'Half Width (6/12)', preview: 'w-1/2' },
    { value: 4, label: 'Third Width (4/12)', preview: 'w-1/3' },
    { value: 3, label: 'Quarter Width (3/12)', preview: 'w-1/4' },
    { value: 8, label: 'Two-Thirds (8/12)', preview: 'w-2/3' },
    { value: 9, label: 'Three-Quarters (9/12)', preview: 'w-3/4' },
  ];

  const currentWidth = element.position?.width || 12;

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
        <LayoutGrid className="w-3 h-3" />
        Layout
      </h4>
      
      {/* Width Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Element Width
        </label>
        <div className="grid grid-cols-2 gap-2">
          {widthOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePositionChange('width', option.value)}
              className={`p-2 text-xs rounded-lg border transition-all ${
                currentWidth === option.value
                  ? 'border-cyan-500 bg-cyan-50 text-cyan-700 font-medium'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <div className="mb-1">{option.label}</div>
              <div className="h-2 bg-gray-200 rounded overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded" 
                  style={{ width: `${(option.value / 12) * 100}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Width Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Custom Width: {currentWidth}/12
        </label>
        <input
          type="range"
          min={1}
          max={12}
          value={currentWidth}
          onChange={(e) => handlePositionChange('width', Number(e.target.value))}
          className="w-full accent-cyan-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1</span>
          <span>6</span>
          <span>12</span>
        </div>
      </div>

      {/* Width Preview */}
      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 mb-2">Preview:</p>
        <div className="h-8 bg-gray-200 rounded overflow-hidden">
          <div 
            className="h-full bg-cyan-500 rounded flex items-center justify-center text-white text-xs font-medium" 
            style={{ width: `${(currentWidth / 12) * 100}%` }}
          >
            {Math.round((currentWidth / 12) * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}

// Type-Specific Properties
function TypeSpecificProperties({ element, onUpdate }: PropertySectionProps) {
  const handlePropertyChange = (key: string, value: any) => {
    onUpdate(element.id, {
      properties: { ...element.properties, [key]: value },
    });
  };

  // Text, Number, Date, Paragraph
  if (['text', 'number', 'date', 'paragraph'].includes(element.type)) {
    return (
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase">Input Settings</h4>
        
        {/* Placeholder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placeholder
          </label>
          <input
            type="text"
            value={element.properties.placeholder || ''}
            onChange={(e) => handlePropertyChange('placeholder', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="Enter placeholder text"
          />
        </div>

        {/* Default Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Value
          </label>
          <input
            type={element.type === 'number' ? 'number' : element.type === 'date' ? 'date' : 'text'}
            value={element.properties.defaultValue ?? ''}
            onChange={(e) => handlePropertyChange('defaultValue', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>

        {/* Number-specific */}
        {element.type === 'number' && (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min</label>
              <input
                type="number"
                value={element.properties.min ?? ''}
                onChange={(e) => handlePropertyChange('min', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Max</label>
              <input
                type="number"
                value={element.properties.max ?? ''}
                onChange={(e) => handlePropertyChange('max', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Step</label>
              <input
                type="number"
                value={element.properties.step ?? 1}
                onChange={(e) => handlePropertyChange('step', Number(e.target.value) || 1)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        )}

        {/* Paragraph-specific */}
        {element.type === 'paragraph' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rows
            </label>
            <input
              type="number"
              min={2}
              max={20}
              value={element.properties.rows ?? 4}
              onChange={(e) => handlePropertyChange('rows', Number(e.target.value) || 4)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        )}
      </div>
    );
  }

  // Dropdown & Radio - Options
  if (['dropdown', 'radio'].includes(element.type)) {
    const options = element.properties.options || [];
    
    const addOption = () => {
      handlePropertyChange('options', [...options, `Option ${options.length + 1}`]);
    };
    
    const updateOption = (index: number, value: string) => {
      const newOptions = [...options];
      newOptions[index] = value;
      handlePropertyChange('options', newOptions);
    };
    
    const removeOption = (index: number) => {
      const newOptions = options.filter((_, i) => i !== index);
      handlePropertyChange('options', newOptions);
    };

    return (
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase">Options</h4>
        
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder={`Option ${index + 1}`}
              />
              <button
                onClick={() => removeOption(index)}
                className="p-2 text-gray-400 hover:text-red-500"
                disabled={options.length <= 1}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        
        <button
          onClick={addOption}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-cyan-400 hover:text-cyan-600"
        >
          + Add Option
        </button>
      </div>
    );
  }

  // Calculated Field
  if (element.type === 'calculated') {
    const calculations = getAvailableCalculations();
    
    return (
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase">Calculation</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Calculation Type
          </label>
          <select
            value={element.properties.calculation || 'bmi'}
            onChange={(e) => handlePropertyChange('calculation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            {calculations.map((calc) => (
              <option key={calc.value} value={calc.value}>
                {calc.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {calculations.find(c => c.value === element.properties.calculation)?.description}
          </p>
        </div>

        {element.properties.calculation === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Formula
            </label>
            <input
              type="text"
              value={element.properties.calculationFormula || ''}
              onChange={(e) => handlePropertyChange('calculationFormula', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder="{weight} / ({height} * {height})"
            />
            <p className="mt-1 text-xs text-gray-500">
              Use {'{field_name}'} to reference other fields. Supports +, -, *, /, ()
            </p>
          </div>
        )}
      </div>
    );
  }

  // Header
  if (element.type === 'header') {
    return (
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase">Header Style</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Size
          </label>
          <select
            value={element.properties.fontSize || 'large'}
            onChange={(e) => handlePropertyChange('fontSize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="large">Large</option>
            <option value="medium">Medium</option>
            <option value="small">Small</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alignment
          </label>
          <div className="flex gap-2">
            {['left', 'center', 'right'].map((align) => (
              <button
                key={align}
                onClick={() => handlePropertyChange('alignment', align)}
                className={`flex-1 py-2 px-3 rounded-lg border ${
                  element.properties.alignment === align
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Prefill Properties
function PrefillProperties({ element, onUpdate }: PropertySectionProps) {
  const prefillEnabled = element.prefill?.enabled || false;
  const prefillSource = element.prefill?.source || 'patient';
  const prefillField = element.prefill?.field;
  const prefillReadonly = element.prefill?.readonly || false;

  const handlePrefillChange = (updates: Partial<typeof element.prefill>) => {
    onUpdate(element.id, {
      prefill: { 
        enabled: prefillEnabled,
        source: prefillSource,
        field: prefillField as keyof PrefillField,
        readonly: prefillReadonly,
        ...updates 
      },
    });
  };

  const availableFields = PREFILL_FIELDS[prefillSource] || [];

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
        <Zap className="w-3 h-3" />
        Auto-Fill (Prefill)
      </h4>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={prefillEnabled}
          onChange={(e) => handlePrefillChange({ enabled: e.target.checked })}
          className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
        />
        <span className="text-sm text-gray-700">Enable auto-fill</span>
      </label>

      {prefillEnabled && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Source
            </label>
            <select
              value={prefillSource}
              onChange={(e) => handlePrefillChange({ 
                source: e.target.value as PrefillSource,
                field: undefined 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="patient">👤 Patient</option>
              <option value="doctor">⚕️ Doctor</option>
              <option value="appointment">📅 Appointment</option>
              <option value="system">⚙️ System</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field
            </label>
            <select
              value={prefillField || ''}
              onChange={(e) => handlePrefillChange({ field: e.target.value as keyof PrefillField })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select field...</option>
              {availableFields.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={prefillReadonly}
              onChange={(e) => handlePrefillChange({ readonly: e.target.checked })}
              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
            />
            <span className="text-sm text-gray-700">Read-only (cannot be edited)</span>
          </label>

          <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            This field will be automatically filled with {formatPrefillSource(prefillSource)} data
            {prefillReadonly && ' and users cannot modify it'}.
          </div>
        </>
      )}
    </div>
  );
}

// Validation Properties
function ValidationProperties({ element, onUpdate }: PropertySectionProps) {
  const handleValidationChange = (key: string, value: any) => {
    onUpdate(element.id, {
      validation: { ...element.validation, [key]: value },
    });
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase">Validation</h4>

      {/* Text length validation */}
      {['text', 'paragraph'].includes(element.type) && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Min Length
            </label>
            <input
              type="number"
              min={0}
              value={element.validation?.minLength ?? ''}
              onChange={(e) => handleValidationChange('minLength', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Max Length
            </label>
            <input
              type="number"
              min={0}
              value={element.validation?.maxLength ?? ''}
              onChange={(e) => handleValidationChange('maxLength', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      )}

      {/* Pattern validation */}
      {element.type === 'text' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pattern (Regex)
          </label>
          <input
            type="text"
            value={element.validation?.pattern ?? ''}
            onChange={(e) => handleValidationChange('pattern', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
            placeholder="^[A-Za-z]+$"
          />
          <p className="mt-1 text-xs text-gray-500">
            Regular expression for validation
          </p>
        </div>
      )}

      {/* Custom error message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Error Message
        </label>
        <input
          type="text"
          value={element.validation?.message ?? ''}
          onChange={(e) => handleValidationChange('message', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="Please enter a valid value"
        />
      </div>
    </div>
  );
}

export default PropertiesPanel;
