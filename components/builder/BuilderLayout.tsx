'use client';

/**
 * Builder Layout
 * Main 3-panel layout for the form builder
 * Left: Element Palette
 * Center: Canvas
 * Right: Properties Panel
 */

import React from 'react';
import { BuilderProvider } from './BuilderContext';
import { ElementPalette } from './ElementPalette';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { BuilderToolbar } from './BuilderToolbar';
import { BuilderSchema } from '@/types/builder';

interface BuilderLayoutProps {
  initialSchema?: BuilderSchema;
  onSave?: (schema: BuilderSchema) => void;
  templateName?: string;
}

export function BuilderLayout({ initialSchema, onSave, templateName }: BuilderLayoutProps) {
  return (
    <BuilderProvider initialSchema={initialSchema}>
      <div className="flex flex-col h-[calc(100vh-120px)] bg-gray-50">
        {/* Toolbar */}
        <BuilderToolbar onSave={onSave} templateName={templateName} />
        
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Element Palette */}
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <ElementPalette />
          </div>
          
          {/* Center Panel - Canvas */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
            <Canvas />
          </div>
          
          {/* Right Panel - Properties */}
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <PropertiesPanel />
          </div>
        </div>
      </div>
    </BuilderProvider>
  );
}

export default BuilderLayout;
