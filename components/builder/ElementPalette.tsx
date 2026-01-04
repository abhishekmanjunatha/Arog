'use client';

/**
 * Element Palette
 * Left panel showing draggable element types
 */

import React from 'react';
import { useBuilder } from './BuilderContext';
import { ElementType } from '@/types/builder';
import { 
  Type, 
  Hash, 
  AlignLeft, 
  List, 
  CircleDot, 
  Calendar, 
  Calculator, 
  Minus, 
  Heading 
} from 'lucide-react';

interface ElementItem {
  type: ElementType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const ELEMENT_ITEMS: ElementItem[] = [
  {
    type: 'text',
    label: 'Text Input',
    description: 'Single line text field',
    icon: <Type className="w-5 h-5" />,
  },
  {
    type: 'number',
    label: 'Number',
    description: 'Numeric input field',
    icon: <Hash className="w-5 h-5" />,
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    description: 'Multi-line text area',
    icon: <AlignLeft className="w-5 h-5" />,
  },
  {
    type: 'dropdown',
    label: 'Dropdown',
    description: 'Select from options',
    icon: <List className="w-5 h-5" />,
  },
  {
    type: 'radio',
    label: 'Radio Buttons',
    description: 'Single choice options',
    icon: <CircleDot className="w-5 h-5" />,
  },
  {
    type: 'date',
    label: 'Date Picker',
    description: 'Date selection field',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    type: 'calculated',
    label: 'Calculated',
    description: 'Auto-computed value',
    icon: <Calculator className="w-5 h-5" />,
  },
  {
    type: 'header',
    label: 'Header',
    description: 'Section heading',
    icon: <Heading className="w-5 h-5" />,
  },
  {
    type: 'divider',
    label: 'Divider',
    description: 'Visual separator',
    icon: <Minus className="w-5 h-5" />,
  },
];

export function ElementPalette() {
  const { addElement, dispatch } = useBuilder();

  const handleDragStart = (e: React.DragEvent, type: ElementType) => {
    e.dataTransfer.setData('elementType', type);
    e.dataTransfer.effectAllowed = 'copy';
    dispatch({ type: 'SET_DRAGGING', isDragging: true, elementType: type });
  };

  const handleDragEnd = () => {
    dispatch({ type: 'SET_DRAGGING', isDragging: false, elementType: null });
  };

  const handleClick = (type: ElementType) => {
    addElement(type);
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Elements</h3>
      <p className="text-xs text-gray-500 mb-4">
        Drag or click to add elements
      </p>
      
      <div className="space-y-2">
        {ELEMENT_ITEMS.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => handleDragStart(e, item.type)}
            onDragEnd={handleDragEnd}
            onClick={() => handleClick(item.type)}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-grab hover:bg-cyan-50 hover:border-cyan-200 border border-transparent transition-all group active:cursor-grabbing"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-600 group-hover:text-cyan-600 group-hover:bg-cyan-100 transition-colors shadow-sm">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 group-hover:text-cyan-900">
                {item.label}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="mt-6 p-3 bg-cyan-50 rounded-lg">
        <h4 className="text-xs font-semibold text-cyan-900 mb-2">Quick Tips</h4>
        <ul className="text-xs text-cyan-700 space-y-1">
          <li>• Click to add element at the end</li>
          <li>• Drag to position elements</li>
          <li>• Click element on canvas to edit</li>
        </ul>
      </div>
    </div>
  );
}

export default ElementPalette;
