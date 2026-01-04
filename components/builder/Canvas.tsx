'use client';

/**
 * Canvas
 * Center panel where elements are dropped and arranged
 */

import React from 'react';
import { useBuilder } from './BuilderContext';
import { CanvasElement } from './CanvasElement';
import { ElementType } from '@/types/builder';
import { Plus } from 'lucide-react';

export function Canvas() {
  const { state, addElement, dispatch, selectElement } = useBuilder();
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set to false if we're leaving the canvas, not entering a child
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const elementType = e.dataTransfer.getData('elementType') as ElementType;
    if (elementType) {
      addElement(elementType);
    }
    
    dispatch({ type: 'SET_DRAGGING', isDragging: false, elementType: null });
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Deselect when clicking on empty canvas area
    if (e.target === e.currentTarget) {
      selectElement(null);
    }
  };

  const isEmpty = state.schema.elements.length === 0;

  return (
    <div
      className={`min-h-full rounded-lg transition-all ${
        isDragOver 
          ? 'bg-cyan-50 border-2 border-dashed border-cyan-400' 
          : 'bg-white border border-gray-200'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
    >
      {isEmpty ? (
        // Empty State
        <div className="flex flex-col items-center justify-center h-96 text-gray-400">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
            isDragOver ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100'
          }`}>
            <Plus className="w-10 h-10" />
          </div>
          <p className="text-lg font-medium mb-2">
            {isDragOver ? 'Drop element here' : 'Start building your form'}
          </p>
          <p className="text-sm text-center max-w-xs">
            Drag elements from the left panel or click on them to add to your form
          </p>
        </div>
      ) : (
        // Elements List
        <div className="p-4 space-y-3">
          {state.schema.elements.map((element, index) => (
            <CanvasElement
              key={element.id}
              element={element}
              index={index}
              isSelected={element.id === state.selectedElementId}
            />
          ))}
          
          {/* Drop Zone at Bottom */}
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
              isDragOver 
                ? 'border-cyan-400 bg-cyan-50 text-cyan-600' 
                : 'border-gray-300 text-gray-400 hover:border-gray-400'
            }`}
          >
            <Plus className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">
              {isDragOver ? 'Drop here' : 'Drop or click to add element'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Canvas;
