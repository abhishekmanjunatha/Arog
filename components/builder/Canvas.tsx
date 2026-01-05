'use client';

/**
 * Canvas
 * Center panel where elements are arranged
 * Click elements in the palette to add them
 */

import React from 'react';
import { useBuilder } from './BuilderContext';
import { CanvasElement } from './CanvasElement';
import { Plus } from 'lucide-react';

export function Canvas() {
  const { state, selectElement } = useBuilder();

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Deselect when clicking on empty canvas area
    if (e.target === e.currentTarget) {
      selectElement(null);
    }
  };

  const isEmpty = state.schema.elements.length === 0;
  const totalElements = state.schema.elements.length;

  return (
    <div
      className="min-h-full rounded-xl transition-all bg-white shadow-sm border border-gray-200 overflow-hidden"
      onClick={handleCanvasClick}
    >
      {isEmpty ? (
        // Empty State - Enhanced
        <div className="flex flex-col items-center justify-center h-96 px-4 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-dashed border-primary/20">
            <Plus className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Start building your form
          </h3>
          <p className="text-sm text-center max-w-sm text-gray-500 leading-relaxed">
            Click on elements from the palette to add them to your form. Use the arrow controls to arrange and resize.
          </p>
        </div>
      ) : (
        // Elements Grid Layout
        <div className="p-3 md:p-6">
          {/* 12-column CSS Grid */}
          <div className="grid grid-cols-12 gap-3 md:gap-4">
            {state.schema.elements.map((element, index) => {
              // Get element width (default to 12 = full width)
              const width = element.position?.width || 12;
              
              return (
                <div
                  key={element.id}
                  className="transition-all duration-200 animate-scale-in"
                  style={{ 
                    gridColumn: `span ${width} / span ${width}`,
                    animationDelay: `${index * 30}ms`
                  }}
                >
                  <CanvasElement
                    element={element}
                    index={index}
                    isSelected={element.id === state.selectedElementId}
                    totalElements={totalElements}
                  />
                </div>
              );
            })}
          </div>
          
          {/* Help Text - Enhanced */}
          <div className="mt-6 p-4 bg-gradient-to-r from-info-light to-primary/5 border border-primary/10 rounded-xl text-center">
            <p className="text-sm text-gray-700 font-medium">
              <span className="hidden md:inline">Use ↑↓ arrows to reorder • Use ←→ arrows to adjust width</span>
              <span className="md:hidden">Tap element to edit properties</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Canvas;
