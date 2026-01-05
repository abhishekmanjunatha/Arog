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
      className={`group relative rounded-xl border-2 transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:scale-[1.01]'
      }`}
      onClick={handleClick}
    >
      {/* Arrow Controls - Left Side (Touch-Optimized) */}
      <div className="absolute left-0 top-0 bottom-0 w-11 md:w-12 flex flex-col items-center justify-center gap-1.5 bg-gradient-to-b from-gray-50 to-gray-100/50 rounded-l-xl border-r border-gray-200">
        {/* Move Up */}
        <button
          onClick={handleMoveUp}
          disabled={!canMoveUp}
          className={`p-1.5 md:p-2 rounded-lg transition-all min-h-[36px] md:min-h-[40px] ${
            canMoveUp 
              ? 'hover:bg-gray-200 active:bg-gray-300 text-gray-700 hover:text-gray-900 hover:scale-110' 
              : 'text-gray-300 cursor-not-allowed opacity-40'
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
            className={`p-1 rounded-md transition-all min-h-[32px] min-w-[18px] ${
              canDecreaseWidth 
                ? 'hover:bg-primary/10 active:bg-primary/20 text-primary hover:text-primary-hover hover:scale-110' 
                : 'text-gray-300 cursor-not-allowed opacity-40'
            }`}
            title="Decrease Width"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={handleIncreaseWidth}
            disabled={!canIncreaseWidth}
            className={`p-1 rounded-md transition-all min-h-[32px] min-w-[18px] ${
              canIncreaseWidth 
                ? 'hover:bg-primary/10 active:bg-primary/20 text-primary hover:text-primary-hover hover:scale-110' 
                : 'text-gray-300 cursor-not-allowed opacity-40'
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
          className={`p-1.5 md:p-2 rounded-lg transition-all min-h-[36px] md:min-h-[40px] ${
            canMoveDown 
              ? 'hover:bg-gray-200 active:bg-gray-300 text-gray-700 hover:text-gray-900 hover:scale-110' 
              : 'text-gray-300 cursor-not-allowed opacity-40'
          }`}
          title="Move Down"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Element Content */}
      <div className="ml-11 md:ml-12 p-3 md:p-4">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-600">{ELEMENT_ICONS[element.type]}</span>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {element.type}
            </span>
            {element.required && (
              <span className="badge badge-destructive">
                Required
              </span>
            )}
            {isPrefilled && (
              <span className="badge badge-info flex items-center gap-1">
                {isReadOnly && <Lock className="w-3 h-3" />}
                Prefilled
              </span>
            )}
          </div>

          {/* Actions - Touch-optimized */}
          <div className={`flex items-center gap-1 ${
            isSelected ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
          } transition-all duration-200`}>
            <button
              onClick={handleDuplicate}
              className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all min-h-[36px] min-w-[36px]"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-destructive-light active:bg-destructive-light/80 text-gray-600 hover:text-destructive transition-all min-h-[36px] min-w-[36px]"
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
                <div className="px-4 py-3 bg-gradient-to-r from-warning-light to-warning-light/50 border border-warning/20 rounded-lg flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {element.properties.calculation === 'bmi' ? 'Body Mass Index (BMI)' : 
                       element.properties.calculation === 'age' ? 'Age Calculator' :
                       element.properties.calculation === 'bsa' ? 'Body Surface Area' :
                       element.properties.calculation === 'ibw' ? 'Ideal Body Weight' :
                       element.properties.calculation === 'crcl' ? 'Creatinine Clearance' :
                       'Custom Formula'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Auto-calculated field</p>
                  </div>
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

      {/* Selection Indicator - Enhanced */}
      {isSelected && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-primary via-primary-hover to-primary rounded-full shadow-sm animate-pulse" />
      )}
    </div>
  );
}

export default CanvasElement;
