'use client';

/**
 * Canvas Element
 * Individual element rendered on the canvas
 * Uses arrow buttons for positioning instead of drag-drop
 */

import React from 'react';
import { useBuilder } from './BuilderContext';
import { BuilderElement } from '@/types/builder';
import { 
  Trash2, 
  Copy, 
  Lock,
  Type,
  Hash,
  AlignLeft,
  List,
  CircleDot,
  Calendar,
  Calculator,
  Minus,
  Heading,
  ClipboardList,
  Image,
  FileText,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface CanvasElementProps {
  element: BuilderElement;
  index: number;
  isSelected: boolean;
  totalElements: number;
}

const ELEMENT_ICONS: Record<string, React.ReactNode> = {
  text: <Type className="w-4 h-4" />,
  number: <Hash className="w-4 h-4" />,
  paragraph: <AlignLeft className="w-4 h-4" />,
  dropdown: <List className="w-4 h-4" />,
  radio: <CircleDot className="w-4 h-4" />,
  date: <Calendar className="w-4 h-4" />,
  calculated: <Calculator className="w-4 h-4" />,
  divider: <Minus className="w-4 h-4" />,
  header: <Heading className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  footer: <FileText className="w-4 h-4" />,
  medicalHistory: <ClipboardList className="w-4 h-4" />,
};

// Width steps for left/right controls
const WIDTH_STEPS = [3, 4, 6, 8, 9, 12];

export function CanvasElement({ element, index, isSelected, totalElements }: CanvasElementProps) {
  const { selectElement, deleteElement, duplicateElement, reorderElements, updateElement, recalculateLayout } = useBuilder();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this element?')) {
      deleteElement(element.id);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateElement(element.id);
  };

  // Move element up in order
  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index > 0) {
      reorderElements(index, index - 1);
    }
  };

  // Move element down in order
  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index < totalElements - 1) {
      reorderElements(index, index + 1);
    }
  };

  // Decrease width (make narrower)
  const handleDecreaseWidth = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentWidth = element.position?.width || 12;
    const currentIndex = WIDTH_STEPS.indexOf(currentWidth);
    if (currentIndex > 0) {
      const newWidth = WIDTH_STEPS[currentIndex - 1];
      updateElement(element.id, {
        position: { ...element.position, width: newWidth }
      });
      setTimeout(() => recalculateLayout(), 0);
    } else if (currentIndex === -1 && currentWidth > 3) {
      // If current width is not in steps, find the next smaller step
      const smallerStep = WIDTH_STEPS.filter(w => w < currentWidth).pop() || 3;
      updateElement(element.id, {
        position: { ...element.position, width: smallerStep }
      });
      setTimeout(() => recalculateLayout(), 0);
    }
  };

  // Increase width (make wider)
  const handleIncreaseWidth = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentWidth = element.position?.width || 12;
    const currentIndex = WIDTH_STEPS.indexOf(currentWidth);
    if (currentIndex >= 0 && currentIndex < WIDTH_STEPS.length - 1) {
      const newWidth = WIDTH_STEPS[currentIndex + 1];
      updateElement(element.id, {
        position: { ...element.position, width: newWidth }
      });
      setTimeout(() => recalculateLayout(), 0);
    } else if (currentIndex === -1 && currentWidth < 12) {
      // If current width is not in steps, find the next larger step
      const largerStep = WIDTH_STEPS.find(w => w > currentWidth) || 12;
      updateElement(element.id, {
        position: { ...element.position, width: largerStep }
      });
      setTimeout(() => recalculateLayout(), 0);
    }
  };

  const isPrefilled = element.prefill?.enabled;
  const isReadOnly = element.prefill?.enabled && element.prefill?.readonly;
  const currentWidth = element.position?.width || 12;
  const canMoveUp = index > 0;
  const canMoveDown = index < totalElements - 1;
  const canDecreaseWidth = currentWidth > 3;
  const canIncreaseWidth = currentWidth < 12;

  return (
    <div
      className={`group relative rounded-lg border-2 transition-all ${
        isSelected
          ? 'border-cyan-500 bg-cyan-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={handleClick}
    >
      {/* Arrow Controls - Left Side */}
      <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col items-center justify-center gap-1 bg-gray-50 rounded-l-lg border-r border-gray-200">
        {/* Move Up */}
        <button
          onClick={handleMoveUp}
          disabled={!canMoveUp}
          className={`p-1 rounded transition-colors ${
            canMoveUp 
              ? 'hover:bg-gray-200 text-gray-600 hover:text-gray-800' 
              : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Move Up"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        
        {/* Width Controls */}
        <div className="flex gap-0.5">
          <button
            onClick={handleDecreaseWidth}
            disabled={!canDecreaseWidth}
            className={`p-0.5 rounded transition-colors ${
              canDecreaseWidth 
                ? 'hover:bg-blue-100 text-blue-600 hover:text-blue-800' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="Decrease Width"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={handleIncreaseWidth}
            disabled={!canIncreaseWidth}
            className={`p-0.5 rounded transition-colors ${
              canIncreaseWidth 
                ? 'hover:bg-blue-100 text-blue-600 hover:text-blue-800' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="Increase Width"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        
        {/* Move Down */}
        <button
          onClick={handleMoveDown}
          disabled={!canMoveDown}
          className={`p-1 rounded transition-colors ${
            canMoveDown 
              ? 'hover:bg-gray-200 text-gray-600 hover:text-gray-800' 
              : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Move Down"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Element Content */}
      <div className="ml-10 p-4">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">{ELEMENT_ICONS[element.type]}</span>
            <span className="text-xs font-medium text-gray-500 uppercase">
              {element.type}
            </span>
            {element.required && (
              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                Required
              </span>
            )}
            {isPrefilled && (
              <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                {isReadOnly && <Lock className="w-3 h-3" />}
                Prefilled
              </span>
            )}
          </div>

          {/* Actions */}
          <div className={`flex items-center gap-1 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
            <button
              onClick={handleDuplicate}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded hover:bg-red-100 text-gray-500 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Element Preview */}
        <div className="mt-2">
          {element.type === 'header' ? (
            <h3 className={`font-bold text-gray-900 ${
              element.properties.fontSize === 'large' ? 'text-xl' :
              element.properties.fontSize === 'medium' ? 'text-lg' : 'text-base'
            }`}>
              {element.label || 'Header Text'}
            </h3>
          ) : element.type === 'divider' ? (
            <hr className="border-gray-300" />
          ) : (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {element.label || 'Untitled Field'}
              </label>
              
              {element.type === 'paragraph' ? (
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  rows={2}
                  placeholder={element.properties.placeholder || 'Enter text...'}
                  disabled
                />
              ) : element.type === 'dropdown' ? (
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  disabled
                >
                  <option>
                    {element.properties.options?.[0] || 'Select option...'}
                  </option>
                </select>
              ) : element.type === 'radio' ? (
                <div className="flex flex-wrap gap-4">
                  {(element.properties.options || ['Option 1', 'Option 2']).slice(0, 3).map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <input type="radio" disabled />
                      <span>{opt}</span>
                    </label>
                  ))}
                  {(element.properties.options?.length || 0) > 3 && (
                    <span className="text-sm text-gray-400">
                      +{(element.properties.options?.length || 0) - 3} more
                    </span>
                  )}
                </div>
              ) : element.type === 'calculated' ? (
                <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  <span>
                    Calculated: {element.properties.calculation === 'bmi' ? 'BMI' : 
                                  element.properties.calculation === 'age' ? 'Age' : 
                                  'Custom Formula'}
                  </span>
                </div>
              ) : element.type === 'medicalHistory' ? (
                <div className="space-y-2">
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    rows={element.properties.rows || 4}
                    placeholder={element.properties.placeholder || 'Enter medical history...'}
                    disabled
                  />
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <ClipboardList className="w-3 h-3" />
                    <span>Format: {element.properties.format || 'mixed'}</span>
                  </div>
                </div>
              ) : element.type === 'image' ? (
                <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg border border-dashed border-gray-300">
                  <Image className="w-8 h-8 text-gray-400" />
                  <span className="ml-2 text-gray-500 text-sm">Image placeholder</span>
                </div>
              ) : element.type === 'footer' ? (
                <div className="p-2 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-500">
                  {element.properties.content || 'Footer content'}
                </div>
              ) : (
                <input
                  type={element.type === 'number' ? 'number' : element.type === 'date' ? 'date' : 'text'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  placeholder={element.properties.placeholder || `Enter ${element.type}...`}
                  disabled
                />
              )}
              
              {/* Field Name (for developers) */}
              <p className="mt-1 text-xs text-gray-400">
                Field: <code className="bg-gray-100 px-1 rounded">{element.name}</code>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-500 rounded-full" />
      )}
    </div>
  );
}

export default CanvasElement;
