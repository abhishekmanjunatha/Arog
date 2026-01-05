'use client';

/**
 * Properties Panel
 * Right panel for configuring selected element properties
 */

import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { BuilderElement, ElementType, PrefillSource, PrefillField } from '@/types/builder';
import { PREFILL_FIELDS, formatPrefillSource } from '@/lib/prefill-engine.client';
import { getAvailableCalculations } from '@/lib/calculation-engine';
import { canBePrefilled, canBeRequired } from '@/lib/builder-utils';
import { Settings, Sliders, Zap, AlertCircle, LayoutGrid, ChevronDown, Type, Hash, FileText, CheckSquare } from 'lucide-react';

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, icon, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[44px] px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors touch-manipulation"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-gray-900">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>
      {isOpen && (
        <div className="p-4 space-y-4 animate-slide-down">
          {children}
        </div>
      )}
    </div>
  );
}

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
    <div className="p-3 md:p-4 space-y-3">
      <div className="mb-4 pb-3 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-600" />
          Element Properties
        </h3>
        <p className="text-xs text-gray-500 mt-1">Configure selected element</p>
      </div>

      {/* Basic Properties */}
      <CollapsibleSection title="Basic" icon={<Type className="w-4 h-4 text-gray-600" />}>
        <BasicProperties element={selectedElement} onUpdate={updateElement} />
      </CollapsibleSection>

      {/* Layout Properties */}
      <CollapsibleSection title="Layout" icon={<LayoutGrid className="w-4 h-4 text-gray-600" />}>
        <LayoutProperties element={selectedElement} onUpdate={updateElement} />
      </CollapsibleSection>

      {/* Type-Specific Properties */}
      <CollapsibleSection title="Settings" icon={<Settings className="w-4 h-4 text-gray-600" />}>
        <TypeSpecificProperties element={selectedElement} onUpdate={updateElement} />
      </CollapsibleSection>

      {/* Prefill Configuration */}
      {canBePrefilled(selectedElement.type) && (
        <CollapsibleSection title="Auto-Fill" icon={<Zap className="w-4 h-4 text-cyan-600" />} defaultOpen={false}>
          <PrefillProperties element={selectedElement} onUpdate={updateElement} />
        </CollapsibleSection>
      )}

      {/* Validation */}
      {!['divider', 'header', 'calculated', 'image', 'footer'].includes(selectedElement.type) && (
        <CollapsibleSection title="Validation" icon={<CheckSquare className="w-4 h-4 text-gray-600" />} defaultOpen={false}>
          <ValidationProperties element={selectedElement} onUpdate={updateElement} />
        </CollapsibleSection>
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

  const isLayoutElement = ['divider', 'header', 'image', 'footer'].includes(element.type);

  return (
    <>
      {/* Label */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {isLayoutElement ? 'Text' : 'Label'}
        </label>
        <input
          type="text"
          value={element.label}
          onChange={(e) => handleChange('label', e.target.value)}
          className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-base touch-manipulation"
          placeholder={isLayoutElement ? 'Enter text' : 'Enter label'}
        />
      </div>

      {/* Field Name (not for layout elements) */}
      {!isLayoutElement && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Field Name
            <span className="ml-2 text-xs font-normal text-gray-500">(for data storage)</span>
          </label>
          <input
            type="text"
            value={element.name}
            onChange={(e) => handleChange('name', e.target.value.replace(/[^a-z0-9_]/gi, '_').toLowerCase())}
            className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-mono text-sm touch-manipulation"
            placeholder="field_name"
          />
          <p className="mt-1.5 text-xs text-gray-500 flex items-start gap-1">
            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            Only letters, numbers, and underscores allowed
          </p>
        </div>
      )}

      {/* Required Checkbox - Enhanced Toggle */}
      {canBeRequired(element.type) && (
        <label className="flex items-center gap-3 cursor-pointer min-h-[44px] p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors touch-manipulation">
          <div className="relative">
            <input
              type="checkbox"
              checked={element.required}
              onChange={(e) => handleChange('required', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:bg-cyan-600 transition-all"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">Required Field</div>
            <div className="text-xs text-gray-500">User must fill this field</div>
          </div>
        </label>
      )}
    </>
  );
}

// Layout Properties Section - Grid System
function LayoutProperties({ element, onUpdate }: PropertySectionProps) {
  const { recalculateLayout } = useBuilder();
  
  const handlePositionChange = (key: 'width' | 'col', value: number) => {
    onUpdate(element.id, {
      position: { ...element.position, [key]: value },
    });
    // Auto-recalculate layout when width changes
    setTimeout(() => recalculateLayout(), 0);
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
    <>
      {/* Width Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Element Width
        </label>
        <div className="grid grid-cols-2 gap-2">
          {widthOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePositionChange('width', option.value)}
              className={`min-h-[56px] p-3 text-xs rounded-lg border-2 transition-all touch-manipulation ${
                currentWidth === option.value
                  ? 'border-cyan-500 bg-cyan-50 text-cyan-700 font-semibold shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="mb-1.5 font-medium">{option.label}</div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all" 
                  style={{ width: `${(option.value / 12) * 100}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Width Slider */}
      <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Fine-Tune Width: <span className="text-cyan-600 font-bold">{currentWidth}/12</span>
        </label>
        <input
          type="range"
          min={1}
          max={12}
          value={currentWidth}
          onChange={(e) => handlePositionChange('width', Number(e.target.value))}
          className="w-full h-2 accent-cyan-600 cursor-pointer"
          style={{ touchAction: 'none' }}
        />
        <div className="flex justify-between text-xs font-medium text-gray-500 mt-2">
          <span>1</span>
          <span>6</span>
          <span>12</span>
        </div>
        
        {/* Width Preview */}
        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-2">Preview:</p>
          <div className="h-10 bg-gray-100 rounded-lg overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm transition-all" 
              style={{ width: `${(currentWidth / 12) * 100}%` }}
            >
              {Math.round((currentWidth / 12) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Recalculate Layout Button */}
      <button
        onClick={() => recalculateLayout()}
        className="w-full min-h-[44px] px-4 py-3 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 shadow-sm touch-manipulation"
      >
        <LayoutGrid className="w-4 h-4" />
        Recalculate Grid Layout
      </button>
      <p className="text-xs text-gray-500 flex items-start gap-1">
        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
        Auto-arranges elements into rows based on their widths
      </p>
    </>
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
      <>
        {/* Placeholder */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Placeholder Text
          </label>
          <input
            type="text"
            value={element.properties.placeholder || ''}
            onChange={(e) => handlePropertyChange('placeholder', e.target.value)}
            className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-base touch-manipulation"
            placeholder="Enter placeholder text"
          />
          <p className="mt-1.5 text-xs text-gray-500">Hint text shown when field is empty</p>
        </div>

        {/* Default Value */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Default Value
            <span className="ml-2 text-xs font-normal text-gray-500">(optional)</span>
          </label>
          <input
            type={element.type === 'number' ? 'number' : element.type === 'date' ? 'date' : 'text'}
            value={element.properties.defaultValue ?? ''}
            onChange={(e) => handlePropertyChange('defaultValue', e.target.value)}
            className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-base touch-manipulation"
          />
          <p className="mt-1.5 text-xs text-gray-500">Pre-fill field with this value</p>
        </div>

        {/* Date-specific: Use current date option */}
        {element.type === 'date' && (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={element.properties.useCurrentDate === true}
                onChange={(e) => handlePropertyChange('useCurrentDate', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Use current date as default</span>
                <p className="text-xs text-gray-500 mt-0.5">Automatically set to today's date when creating a document</p>
              </div>
            </label>
          </div>
        )}

        {/* Number-specific */}
        {element.type === 'number' && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block text-xs font-semibold text-gray-700 mb-3">Value Constraints</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Min</label>
                <input
                  type="number"
                  value={element.properties.min ?? ''}
                  onChange={(e) => handlePropertyChange('min', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full min-h-[40px] px-3 py-2 border border-gray-300 rounded-lg text-sm touch-manipulation focus:ring-2 focus:ring-cyan-500"
                  placeholder="-∞"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Max</label>
                <input
                  type="number"
                  value={element.properties.max ?? ''}
                  onChange={(e) => handlePropertyChange('max', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full min-h-[40px] px-3 py-2 border border-gray-300 rounded-lg text-sm touch-manipulation focus:ring-2 focus:ring-cyan-500"
                  placeholder="+∞"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Step</label>
                <input
                  type="number"
                  value={element.properties.step ?? 1}
                  onChange={(e) => handlePropertyChange('step', Number(e.target.value) || 1)}
                  className="w-full min-h-[40px] px-3 py-2 border border-gray-300 rounded-lg text-sm touch-manipulation focus:ring-2 focus:ring-cyan-500"
                  placeholder="1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Paragraph-specific */}
        {element.type === 'paragraph' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Textarea Height (rows)
            </label>
            <input
              type="number"
              min={2}
              max={20}
              value={element.properties.rows ?? 4}
              onChange={(e) => handlePropertyChange('rows', Number(e.target.value) || 4)}
              className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base touch-manipulation focus:ring-2 focus:ring-cyan-500"
            />
            <p className="mt-1.5 text-xs text-gray-500">Number of visible text lines</p>
          </div>
        )}
      </>
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
      <>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Available Options
            <span className="ml-2 text-xs font-normal text-gray-500">({options.length} total)</span>
          </label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-xs font-medium text-gray-600">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base touch-manipulation focus:ring-2 focus:ring-cyan-500"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  onClick={() => removeOption(index)}
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors touch-manipulation"
                  disabled={options.length <= 1}
                  aria-label="Remove option"
                >
                  <span className="text-lg">✕</span>
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <button
          onClick={addOption}
          className="w-full min-h-[44px] py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-cyan-500 hover:text-cyan-600 hover:bg-cyan-50 transition-colors touch-manipulation"
        >
          + Add Option
        </button>
      </>
    );
  }

  // Calculated Field
  if (element.type === 'calculated') {
    const calculations = getAvailableCalculations();
    
    return (
      <>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Calculation Type
          </label>
          <select
            value={element.properties.calculation || 'bmi'}
            onChange={(e) => handlePropertyChange('calculation', e.target.value)}
            className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base bg-white touch-manipulation focus:ring-2 focus:ring-cyan-500"
          >
            {calculations.map((calc) => (
              <option key={calc.value} value={calc.value}>
                {calc.label}
              </option>
            ))}
          </select>
          <p className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700 border border-blue-200">
            {calculations.find(c => c.value === element.properties.calculation)?.description}
          </p>
        </div>

        {element.properties.calculation === 'custom' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Custom Formula
            </label>
            <input
              type="text"
              value={element.properties.calculationFormula || ''}
              onChange={(e) => handlePropertyChange('calculationFormula', e.target.value)}
              className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg font-mono text-sm touch-manipulation focus:ring-2 focus:ring-cyan-500"
              placeholder="{weight} / ({height} * {height})"
            />
            <p className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-800 border border-amber-200 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>Use {'{field_name}'} to reference other fields. Supports +, -, *, /, ()</span>
            </p>
          </div>
        )}
      </>
    );
  }

  // Header
  if (element.type === 'header') {
    return (
      <>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Text Size
          </label>
          <select
            value={element.properties.fontSize || 'large'}
            onChange={(e) => handlePropertyChange('fontSize', e.target.value)}
            className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base bg-white touch-manipulation focus:ring-2 focus:ring-cyan-500"
          >
            <option value="large">Large (Main Heading)</option>
            <option value="medium">Medium (Subheading)</option>
            <option value="small">Small (Section Title)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Text Alignment
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['left', 'center', 'right'].map((align) => (
              <button
                key={align}
                onClick={() => handlePropertyChange('alignment', align)}
                className={`min-h-[44px] py-3 px-3 rounded-lg border-2 font-medium transition-all touch-manipulation ${
                  element.properties.alignment === align
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                }`}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Image
  if (element.type === 'image') {
    return (
      <>
        {/* Image URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={element.properties.src || ''}
            onChange={(e) => handlePropertyChange('src', e.target.value)}
            className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-base touch-manipulation"
            placeholder="https://example.com/image.jpg"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Enter URL of the image or upload to external hosting
          </p>
        </div>

        {/* Alt Text */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Alt Text
            <span className="ml-2 text-xs font-normal text-gray-500">(accessibility)</span>
          </label>
          <input
            type="text"
            value={element.properties.alt || ''}
            onChange={(e) => handlePropertyChange('alt', e.target.value)}
            className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-base touch-manipulation"
            placeholder="Describe the image"
          />
        </div>

        {/* Caption */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Caption
            <span className="ml-2 text-xs font-normal text-gray-500">(optional)</span>
          </label>
          <input
            type="text"
            value={element.properties.caption || ''}
            onChange={(e) => handlePropertyChange('caption', e.target.value)}
            className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-base touch-manipulation"
            placeholder="Image caption text"
          />
        </div>

        {/* Width & Height */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Width (px)</label>
            <input
              type="number"
              min={50}
              max={800}
              value={element.properties.width || 200}
              onChange={(e) => handlePropertyChange('width', Number(e.target.value) || 200)}
              className="w-full min-h-[44px] px-3 py-2.5 border border-gray-300 rounded-lg text-base touch-manipulation focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Height</label>
            <select
              value={element.properties.height === 'auto' ? 'auto' : 'custom'}
              onChange={(e) => handlePropertyChange('height', e.target.value === 'auto' ? 'auto' : 150)}
              className="w-full min-h-[44px] px-3 py-2.5 border border-gray-300 rounded-lg text-base bg-white touch-manipulation focus:ring-2 focus:ring-cyan-500"
            >
              <option value="auto">Auto</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        {element.properties.height !== 'auto' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Height (px)</label>
            <input
              type="number"
              min={50}
              max={600}
              value={typeof element.properties.height === 'number' ? element.properties.height : 150}
              onChange={(e) => handlePropertyChange('height', Number(e.target.value) || 150)}
              className="w-full min-h-[44px] px-3 py-2.5 border border-gray-300 rounded-lg text-base touch-manipulation focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        )}

        {/* Alignment */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Alignment
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['left', 'center', 'right'].map((align) => (
              <button
                key={align}
                onClick={() => handlePropertyChange('alignment', align)}
                className={`min-h-[44px] py-3 px-3 rounded-lg border-2 font-medium transition-all touch-manipulation ${
                  element.properties.alignment === align
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                }`}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Object Fit */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Object Fit
          </label>
          <select
            value={element.properties.objectFit || 'contain'}
            onChange={(e) => handlePropertyChange('objectFit', e.target.value)}
            className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base bg-white touch-manipulation focus:ring-2 focus:ring-cyan-500"
          >
            <option value="contain">Contain (fit inside)</option>
            <option value="cover">Cover (fill area)</option>
            <option value="fill">Fill (stretch)</option>
            <option value="none">None (original size)</option>
          </select>
        </div>

        {/* Border Radius */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Border Radius (px)
          </label>
          <input
            type="number"
            min={0}
            max={50}
            value={element.properties.borderRadius || 0}
            onChange={(e) => handlePropertyChange('borderRadius', Number(e.target.value) || 0)}
            className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base touch-manipulation focus:ring-2 focus:ring-cyan-500"
            placeholder="0"
          />
          <p className="mt-1.5 text-xs text-gray-500">Rounded corners (0 = sharp, 50 = very round)</p>
        </div>
      </>
    );
  }

  // Footer
  if (element.type === 'footer') {
    return (
      <>
        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Footer Content
          </label>
          <textarea
            value={element.properties.content || ''}
            onChange={(e) => handlePropertyChange('content', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-base touch-manipulation resize-y"
            placeholder="Enter footer text. Use new lines for multiple paragraphs."
          />
          <p className="mt-1.5 text-xs text-gray-500">Displayed at the bottom of the document</p>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Font Size
          </label>
          <select
            value={element.properties.fontSize || 'small'}
            onChange={(e) => handlePropertyChange('fontSize', e.target.value)}
            className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base bg-white touch-manipulation focus:ring-2 focus:ring-cyan-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        {/* Alignment */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Text Alignment
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['left', 'center', 'right'].map((align) => (
              <button
                key={align}
                onClick={() => handlePropertyChange('alignment', align)}
                className={`min-h-[44px] py-3 px-3 rounded-lg border-2 font-medium transition-all touch-manipulation ${
                  element.properties.alignment === align
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                }`}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Text Color
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={element.properties.textColor || '#666666'}
              onChange={(e) => handlePropertyChange('textColor', e.target.value)}
              className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer touch-manipulation"
            />
            <input
              type="text"
              value={element.properties.textColor || '#666666'}
              onChange={(e) => handlePropertyChange('textColor', e.target.value)}
              className="flex-1 min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg font-mono text-sm touch-manipulation focus:ring-2 focus:ring-cyan-500"
              placeholder="#666666"
            />
          </div>
        </div>

        {/* Background Color */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Background Color
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={element.properties.backgroundColor || '#ffffff'}
              onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
              className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer touch-manipulation"
            />
            <input
              type="text"
              value={element.properties.backgroundColor || 'transparent'}
              onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
              className="flex-1 min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg font-mono text-sm touch-manipulation focus:ring-2 focus:ring-cyan-500"
              placeholder="transparent"
            />
          </div>
        </div>

        {/* Show Line Toggle */}
        <label className="flex items-center gap-3 cursor-pointer min-h-[44px] p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors touch-manipulation">
          <div className="relative">
            <input
              type="checkbox"
              checked={element.properties.showLine !== false}
              onChange={(e) => handlePropertyChange('showLine', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:bg-cyan-600 transition-all"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">Show Separator Line</div>
            <div className="text-xs text-gray-500">Line above footer text</div>
          </div>
        </label>

        {/* Padding */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-xs font-semibold text-gray-700 mb-3">Spacing (padding)</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Top (px)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={element.properties.paddingTop || 16}
                onChange={(e) => handlePropertyChange('paddingTop', Number(e.target.value) || 16)}
                className="w-full min-h-[40px] px-3 py-2 border border-gray-300 rounded-lg text-sm touch-manipulation focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bottom (px)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={element.properties.paddingBottom || 8}
                onChange={(e) => handlePropertyChange('paddingBottom', Number(e.target.value) || 8)}
                className="w-full min-h-[40px] px-3 py-2 border border-gray-300 rounded-lg text-sm touch-manipulation focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  // Document Header
  if (element.type === 'documentHeader') {
    // Handle logo file upload and convert to base64
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          handlePropertyChange('logoSrc', reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <>
        {/* Logo Settings */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Logo Settings</h4>
          
          {/* Logo Preview */}
          {element.properties.logoSrc && (
            <div className="mb-3 p-2 bg-white rounded-lg border border-gray-200">
              <img 
                src={element.properties.logoSrc} 
                alt="Logo Preview" 
                className="max-h-20 object-contain mx-auto"
              />
            </div>
          )}
          
          {/* File Upload */}
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Logo (Recommended)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
            />
            <p className="text-xs text-gray-500 mt-1">Upload image for best PDF compatibility</p>
          </div>

          {/* Or URL Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Or Enter Logo URL
            </label>
            <input
              type="text"
              value={element.properties.logoSrc?.startsWith('data:') ? '' : (element.properties.logoSrc || '')}
              onChange={(e) => handlePropertyChange('logoSrc', e.target.value)}
              className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base touch-manipulation focus:ring-2 focus:ring-cyan-500"
              placeholder="https://example.com/logo.png"
            />
            <p className="text-xs text-gray-500 mt-1.5">Note: URL may not work in PDF due to CORS</p>
          </div>

          {/* Clear Logo */}
          {element.properties.logoSrc && (
            <button
              type="button"
              onClick={() => handlePropertyChange('logoSrc', '')}
              className="mt-2 text-sm text-red-600 hover:text-red-700"
            >
              Remove Logo
            </button>
          )}

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Width (px)</label>
              <input
                type="number"
                min={40}
                max={200}
                value={element.properties.logoWidth || 80}
                onChange={(e) => handlePropertyChange('logoWidth', Number(e.target.value) || 80)}
                className="w-full min-h-[44px] px-3 py-2.5 border border-gray-300 rounded-lg text-base touch-manipulation focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Height (px)</label>
              <input
                type="number"
                min={40}
                max={200}
                value={element.properties.logoHeight || 80}
                onChange={(e) => handlePropertyChange('logoHeight', Number(e.target.value) || 80)}
                className="w-full min-h-[44px] px-3 py-2.5 border border-gray-300 rounded-lg text-base touch-manipulation focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Doctor Information */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Doctor Information</h4>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor Name</label>
            <input
              type="text"
              value={element.properties.doctorName || ''}
              onChange={(e) => handlePropertyChange('doctorName', e.target.value)}
              className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base touch-manipulation focus:ring-2 focus:ring-cyan-500"
              placeholder="Dr. John Smith"
            />
          </div>

          <div className="mt-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Designation</label>
            <input
              type="text"
              value={element.properties.designation || ''}
              onChange={(e) => handlePropertyChange('designation', e.target.value)}
              className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base touch-manipulation focus:ring-2 focus:ring-cyan-500"
              placeholder="Consultant Physician"
            />
          </div>

          <div className="mt-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Education/Qualifications</label>
            <input
              type="text"
              value={element.properties.education || ''}
              onChange={(e) => handlePropertyChange('education', e.target.value)}
              className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base touch-manipulation focus:ring-2 focus:ring-cyan-500"
              placeholder="MBBS, MD"
            />
          </div>

          <div className="mt-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <input
              type="text"
              value={element.properties.phone || ''}
              onChange={(e) => handlePropertyChange('phone', e.target.value)}
              className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base touch-manipulation focus:ring-2 focus:ring-cyan-500"
              placeholder="+91 1234567890"
            />
          </div>

          <div className="mt-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={element.properties.email || ''}
              onChange={(e) => handlePropertyChange('email', e.target.value)}
              className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base touch-manipulation focus:ring-2 focus:ring-cyan-500"
              placeholder="doctor@clinic.com"
            />
          </div>
        </div>

        {/* Layout */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Header Layout</label>
          <select
            value={element.properties.headerLayout || 'logo-left'}
            onChange={(e) => handlePropertyChange('headerLayout', e.target.value)}
            className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base bg-white touch-manipulation focus:ring-2 focus:ring-cyan-500"
          >
            <option value="logo-left">Logo Left - Info Right</option>
            <option value="logo-right">Logo Right - Info Left</option>
            <option value="logo-center">Logo Center - Info Below</option>
            <option value="two-column">Two Column Layout</option>
          </select>
        </div>

        {/* Display Toggles */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Show/Hide Fields</label>
          
          {[
            { key: 'showDoctorName', label: 'Show Doctor Name' },
            { key: 'showDesignation', label: 'Show Designation' },
            { key: 'showEducation', label: 'Show Education' },
            { key: 'showPhone', label: 'Show Phone' },
            { key: 'showEmail', label: 'Show Email' },
          ].map((toggle) => (
            <label key={toggle.key} className="flex items-center gap-3 cursor-pointer min-h-[44px] p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors touch-manipulation">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={element.properties[toggle.key] !== false}
                  onChange={(e) => handlePropertyChange(toggle.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:bg-cyan-600 transition-all"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{toggle.label}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Styling */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Background Color</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={element.properties.headerBackgroundColor || '#ffffff'}
              onChange={(e) => handlePropertyChange('headerBackgroundColor', e.target.value)}
              className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer touch-manipulation"
            />
            <input
              type="text"
              value={element.properties.headerBackgroundColor || '#ffffff'}
              onChange={(e) => handlePropertyChange('headerBackgroundColor', e.target.value)}
              className="flex-1 min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg font-mono text-sm touch-manipulation focus:ring-2 focus:ring-cyan-500"
              placeholder="#ffffff"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Text Color</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={element.properties.headerTextColor || '#1f2937'}
              onChange={(e) => handlePropertyChange('headerTextColor', e.target.value)}
              className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer touch-manipulation"
            />
            <input
              type="text"
              value={element.properties.headerTextColor || '#1f2937'}
              onChange={(e) => handlePropertyChange('headerTextColor', e.target.value)}
              className="flex-1 min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg font-mono text-sm touch-manipulation focus:ring-2 focus:ring-cyan-500"
              placeholder="#1f2937"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Padding (px)</label>
          <input
            type="number"
            min={0}
            max={50}
            value={element.properties.headerPadding || 16}
            onChange={(e) => handlePropertyChange('headerPadding', Number(e.target.value) || 16)}
            className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base touch-manipulation focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer min-h-[44px] p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors touch-manipulation">
          <div className="relative">
            <input
              type="checkbox"
              checked={element.properties.showBottomBorder !== false}
              onChange={(e) => handlePropertyChange('showBottomBorder', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:bg-cyan-600 transition-all"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">Show Bottom Border</div>
            <div className="text-xs text-gray-500">Separator line below header</div>
          </div>
        </label>
      </>
    );
  }

  // Medical History
  if (element.type === 'medicalHistory') {
    return (
      <>
        {/* Format */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Input Format
          </label>
          <select
            value={element.properties.format || 'mixed'}
            onChange={(e) => handlePropertyChange('format', e.target.value)}
            className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base bg-white touch-manipulation focus:ring-2 focus:ring-cyan-500"
          >
            <option value="paragraph">Paragraph (free text)</option>
            <option value="bullets">Bullet Points</option>
            <option value="numbered">Numbered List</option>
            <option value="mixed">Mixed (auto-detect)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1.5">
            Mixed: Start line with - for bullets or 1. for numbers
          </p>
        </div>

        {/* Rows/Height */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Textarea Height (rows)
          </label>
          <input
            type="number"
            min={3}
            max={20}
            value={element.properties.rows || 6}
            onChange={(e) => handlePropertyChange('rows', Number(e.target.value))}
            className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base touch-manipulation focus:ring-2 focus:ring-cyan-500"
          />
          <p className="mt-1.5 text-xs text-gray-500">Number of visible lines in the input</p>
        </div>

        {/* Placeholder */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Placeholder Text
          </label>
          <textarea
            value={element.properties.placeholder || ''}
            onChange={(e) => handlePropertyChange('placeholder', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base touch-manipulation focus:ring-2 focus:ring-cyan-500 resize-y"
            placeholder="Enter placeholder text..."
          />
        </div>

        {/* Help text for formatting */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg text-xs text-blue-900 border border-blue-200">
          <strong className="flex items-center gap-1.5 text-sm mb-2">
            <FileText className="w-4 h-4" />
            Formatting Tips:
          </strong>
          <ul className="space-y-1.5 ml-1">
            <li className="flex items-start gap-2">
              <span className="text-cyan-600">•</span>
              <span>Start lines with <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono">-</code> or <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono">*</code> for bullet points</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-600">•</span>
              <span>Start lines with <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono">1.</code> for numbered lists</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-600">•</span>
              <span>Leave a blank line between paragraphs</span>
            </li>
          </ul>
        </div>
      </>
    );
  }

  // Patient Information Elements
  if (['patientName', 'patientEmail', 'patientPhone', 'patientAddress', 'patientAge', 'patientGender', 'patientBloodGroup'].includes(element.type)) {
    return (
      <>
        {/* Info message */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg text-xs text-blue-900 border border-blue-200">
          <strong className="flex items-center gap-1.5 text-sm mb-2">
            <Zap className="w-4 h-4" />
            Auto-Filled Field
          </strong>
          <p>This field is automatically populated with patient data and cannot be edited by users. Configure display options below.</p>
        </div>

        {/* Show Label */}
        <label className="flex items-center gap-3 cursor-pointer min-h-[44px] p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors touch-manipulation">
          <div className="relative">
            <input
              type="checkbox"
              checked={element.properties.showLabel !== false}
              onChange={(e) => handlePropertyChange('showLabel', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:bg-cyan-600 transition-all"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">Show Label</div>
            <div className="text-xs text-gray-500">Display field label above or beside value</div>
          </div>
        </label>

        {/* Label Position */}
        {element.properties.showLabel !== false && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Label Position
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'top', label: 'Top' },
                { value: 'left', label: 'Left' },
                { value: 'inline', label: 'Inline' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePropertyChange('labelPosition', option.value)}
                  className={`min-h-[44px] py-3 px-3 rounded-lg border-2 font-medium transition-all touch-manipulation ${
                    element.properties.labelPosition === option.value
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Font Weight */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Font Weight
          </label>
          <select
            value={element.properties.fontWeight || 'normal'}
            onChange={(e) => handlePropertyChange('fontWeight', e.target.value)}
            className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base bg-white touch-manipulation focus:ring-2 focus:ring-cyan-500"
          >
            <option value="normal">Normal</option>
            <option value="medium">Medium</option>
            <option value="semibold">Semi-Bold</option>
            <option value="bold">Bold</option>
          </select>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Font Size
          </label>
          <select
            value={element.properties.fontSize || 'medium'}
            onChange={(e) => handlePropertyChange('fontSize', e.target.value)}
            className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base bg-white touch-manipulation focus:ring-2 focus:ring-cyan-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        {/* Text Transform */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Text Transform
          </label>
          <select
            value={element.properties.textTransform || 'none'}
            onChange={(e) => handlePropertyChange('textTransform', e.target.value)}
            className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base bg-white touch-manipulation focus:ring-2 focus:ring-cyan-500"
          >
            <option value="none">None</option>
            <option value="uppercase">UPPERCASE</option>
            <option value="lowercase">lowercase</option>
            <option value="capitalize">Capitalize Each Word</option>
          </select>
        </div>

        {/* Alignment */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Text Alignment
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['left', 'center', 'right'].map((align) => (
              <button
                key={align}
                onClick={() => handlePropertyChange('alignment', align)}
                className={`min-h-[44px] py-3 px-3 rounded-lg border-2 font-medium transition-all touch-manipulation ${
                  element.properties.alignment === align
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                }`}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </>
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
    <>
      {/* Enable Toggle */}
      <label className="flex items-center gap-3 cursor-pointer min-h-[44px] p-3 rounded-lg border-2 border-cyan-200 bg-cyan-50 hover:bg-cyan-100 transition-colors touch-manipulation">
        <div className="relative">
          <input
            type="checkbox"
            checked={prefillEnabled}
            onChange={(e) => handlePrefillChange({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:bg-cyan-600 transition-all"></div>
          <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-cyan-600" />
            Enable Auto-Fill
          </div>
          <div className="text-xs text-gray-600">Automatically populate this field</div>
        </div>
      </label>

      {prefillEnabled && (
        <>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Data Source
            </label>
            <select
              value={prefillSource}
              onChange={(e) => handlePrefillChange({ 
                source: e.target.value as PrefillSource,
                field: undefined 
              })}
              className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base bg-white touch-manipulation focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="patient">👤 Patient</option>
              <option value="doctor">⚕️ Doctor</option>
              <option value="appointment">📅 Appointment</option>
              <option value="system">⚙️ System</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Field to Auto-Fill
            </label>
            <select
              value={prefillField || ''}
              onChange={(e) => handlePrefillChange({ field: e.target.value as keyof PrefillField })}
              className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base bg-white touch-manipulation focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">Select field...</option>
              {availableFields.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer min-h-[44px] p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors touch-manipulation">
            <div className="relative">
              <input
                type="checkbox"
                checked={prefillReadonly}
                onChange={(e) => handlePrefillChange({ readonly: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:bg-cyan-600 transition-all"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Read-Only Field</div>
              <div className="text-xs text-gray-500">Prevent users from editing</div>
            </div>
          </label>

          <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg text-xs text-blue-800 border border-blue-200">
            <AlertCircle className="w-4 h-4 inline mr-1.5" />
            This field will be automatically filled with {formatPrefillSource(prefillSource)} data
            {prefillReadonly && ' and users cannot modify it'}.
          </div>
        </>
      )}
    </>
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
    <>
      {/* Text length validation */}
      {['text', 'paragraph'].includes(element.type) && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-xs font-semibold text-gray-700 mb-3">Length Constraints</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Min Length
              </label>
              <input
                type="number"
                min={0}
                value={element.validation?.minLength ?? ''}
                onChange={(e) => handleValidationChange('minLength', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full min-h-[40px] px-3 py-2 border border-gray-300 rounded-lg text-sm touch-manipulation focus:ring-2 focus:ring-cyan-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Max Length
              </label>
              <input
                type="number"
                min={0}
                value={element.validation?.maxLength ?? ''}
                onChange={(e) => handleValidationChange('maxLength', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full min-h-[40px] px-3 py-2 border border-gray-300 rounded-lg text-sm touch-manipulation focus:ring-2 focus:ring-cyan-500"
                placeholder="∞"
              />
            </div>
          </div>
        </div>
      )}

      {/* Pattern validation */}
      {element.type === 'text' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pattern (Regular Expression)
          </label>
          <input
            type="text"
            value={element.validation?.pattern ?? ''}
            onChange={(e) => handleValidationChange('pattern', e.target.value)}
            className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg font-mono text-sm touch-manipulation focus:ring-2 focus:ring-cyan-500"
            placeholder="^[A-Za-z]+$"
          />
          <p className="mt-1.5 text-xs text-gray-500 flex items-start gap-1">
            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            Regular expression pattern for validation
          </p>
        </div>
      )}

      {/* Custom error message */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Custom Error Message
          <span className="ml-2 text-xs font-normal text-gray-500">(optional)</span>
        </label>
        <input
          type="text"
          value={element.validation?.message ?? ''}
          onChange={(e) => handleValidationChange('message', e.target.value)}
          className="w-full min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg text-base touch-manipulation focus:ring-2 focus:ring-cyan-500"
          placeholder="Please enter a valid value"
        />
        <p className="mt-1.5 text-xs text-gray-500">Shown when validation fails</p>
      </div>
    </>
  );
}

export default PropertiesPanel;
