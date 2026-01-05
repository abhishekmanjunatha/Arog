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
  Heading,
  Image,
  FileText,
  ClipboardList
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
  {
    type: 'image',
    label: 'Image',
    description: 'Upload or embed image',
    icon: <Image className="w-5 h-5" />,
  },
  {
    type: 'footer',
    label: 'Footer',
    description: 'Document footer section',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    type: 'medicalHistory',
    label: 'Medical History',
    description: 'Rich text with bullets & lists',
    icon: <ClipboardList className="w-5 h-5" />,
  },
];

interface ElementPaletteProps {
  onElementAdded?: () => void;
}

export function ElementPalette({ onElementAdded }: ElementPaletteProps = {}) {
  const { addElement } = useBuilder();

  const handleClick = (type: ElementType) => {
    addElement(type);
    // Call callback when element is added (useful for closing mobile drawer)
    if (onElementAdded) {
      onElementAdded();
    }
  };

  return (
    <div className="p-3 md:p-4">
      <div className="mb-4 pb-3 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-cyan-600">+</span> Elements
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Click to add to your form
        </p>
      </div>
      
      {/* Grid layout for mobile, list for desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
        {ELEMENT_ITEMS.map((item, index) => (
          <button
            key={item.type}
            onClick={() => handleClick(item.type)}
            className="flex flex-col lg:flex-row items-center lg:items-start gap-2 lg:gap-3 p-3 bg-white lg:bg-gray-50 rounded-xl cursor-pointer hover:bg-cyan-50 hover:border-cyan-300 border-2 border-gray-200 lg:border-transparent transition-all group min-h-[88px] lg:min-h-[64px] touch-manipulation active:scale-95 shadow-sm lg:shadow-none hover:shadow-md"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-gray-50 to-white rounded-lg flex items-center justify-center text-gray-600 group-hover:text-cyan-600 group-hover:from-cyan-50 group-hover:to-cyan-100 transition-all shadow-sm group-hover:shadow-md border border-gray-200 group-hover:border-cyan-300">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0 text-center lg:text-left">
              <p className="text-sm font-semibold text-gray-900 group-hover:text-cyan-700 transition-colors">
                {item.label}
              </p>
              <p className="text-xs text-gray-500 group-hover:text-gray-600 truncate hidden lg:block mt-0.5">
                {item.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Tips - Desktop only */}
      <div className="hidden lg:block mt-6 p-3 bg-info-light rounded-lg">
        <h4 className="text-xs font-semibold text-info mb-2">Quick Tips</h4>
        <ul className="text-xs text-info/80 space-y-1">
          <li>• Click to add element to form</li>
          <li>• Use ↑↓ arrows to reorder</li>
          <li>• Use ←→ arrows to resize</li>
          <li>• Click element on canvas to edit</li>
        </ul>
      </div>
    </div>
  );
}

export default ElementPalette;
