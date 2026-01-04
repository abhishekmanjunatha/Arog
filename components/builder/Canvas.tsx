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
      className="min-h-full rounded-lg transition-all bg-white border border-gray-200"
      onClick={handleCanvasClick}
    >
      {isEmpty ? (
        // Empty State
        <div className="flex flex-col items-center justify-center h-96 text-gray-400">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-gray-100">
            <Plus className="w-10 h-10" />
          </div>
          <p className="text-lg font-medium mb-2">
            Start building your form
          </p>
          <p className="text-sm text-center max-w-xs">
            Click on elements in the left panel to add them to your form
          </p>
        </div>
      ) : (
        // Elements Grid Layout
        <div className="p-4">
          {/* 12-column CSS Grid */}
          <div className="grid grid-cols-12 gap-3">
            {state.schema.elements.map((element, index) => {
              // Get element width (default to 12 = full width)
              const width = element.position?.width || 12;
              
              return (
                <div
                  key={element.id}
                  className="transition-all"
                  style={{ 
                    gridColumn: `span ${width} / span ${width}`,
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
          
          {/* Help Text */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
            <p>Use ↑↓ arrows to reorder • Use ←→ arrows to adjust width</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Canvas;
