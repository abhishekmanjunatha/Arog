'use client';

/**
 * Builder Layout
 * Main responsive layout for the form builder
 * Desktop: 3-panel (palette | canvas | properties)
 * Tablet: 2-panel (canvas | collapsible properties)
 * Mobile: 1-panel (canvas + floating drawers)
 */

import React, { useState, useEffect } from 'react';
import { BuilderProvider } from './BuilderContext';
import { ElementPalette } from './ElementPalette';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { BuilderToolbar } from './BuilderToolbar';
import { BuilderSchema } from '@/types/builder';
import { Plus, Settings, X } from 'lucide-react';

interface BuilderLayoutProps {
  initialSchema?: BuilderSchema;
  onSave?: (schema: BuilderSchema) => void;
  templateName?: string;
}

export function BuilderLayout({ initialSchema, onSave, templateName }: BuilderLayoutProps) {
  // Mobile state management
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768); // < md breakpoint
      setIsTablet(width >= 768 && width < 1024); // md to lg
    };

    // Check on mount
    checkScreenSize();

    // Listen for resize
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close drawers when screen size changes to desktop
  useEffect(() => {
    if (!isMobile && !isTablet) {
      setIsPaletteOpen(false);
      setIsPropertiesOpen(false);
    }
  }, [isMobile, isTablet]);

  return (
    <BuilderProvider initialSchema={initialSchema}>
      <div className="flex flex-col h-[calc(100vh-120px)] bg-gray-50">
        {/* Toolbar */}
        <BuilderToolbar onSave={onSave} templateName={templateName} />
        
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left Panel - Element Palette (Desktop only) */}
          <div className="hidden lg:block w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <ElementPalette />
          </div>
          
          {/* Center Panel - Canvas */}
          <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-gray-100">
            <Canvas />
          </div>
          
          {/* Right Panel - Properties (Desktop only) */}
          <div className="hidden lg:block w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <PropertiesPanel />
          </div>

          {/* Mobile/Tablet: Floating Action Buttons */}
          {(isMobile || isTablet) && (
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
              {/* Add Element Button */}
              <button
                onClick={() => setIsPaletteOpen(true)}
                className="btn-primary shadow-lg rounded-full w-14 h-14 flex items-center justify-center"
                aria-label="Add Element"
              >
                <Plus className="w-6 h-6" />
              </button>

              {/* Properties Button (shows when element is selected) */}
              <button
                onClick={() => setIsPropertiesOpen(true)}
                className="btn-secondary shadow-lg rounded-full w-14 h-14 flex items-center justify-center"
                aria-label="Element Properties"
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* Mobile: Element Palette Drawer (Bottom Sheet) */}
          {(isMobile || isTablet) && isPaletteOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
                onClick={() => setIsPaletteOpen(false)}
              />
              
              {/* Bottom Sheet */}
              <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-xl z-50 animate-slide-up max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Add Element</h3>
                  <button
                    onClick={() => setIsPaletteOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Content */}
                <div className="overflow-y-auto flex-1">
                  <ElementPalette onElementAdded={() => setIsPaletteOpen(false)} />
                </div>
              </div>
            </>
          )}

          {/* Mobile/Tablet: Properties Drawer (Side Panel) */}
          {(isMobile || isTablet) && isPropertiesOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
                onClick={() => setIsPropertiesOpen(false)}
              />
              
              {/* Side Drawer */}
              <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl z-50 animate-slide-up overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white z-10">
                  <h3 className="text-lg font-semibold text-gray-900">Properties</h3>
                  <button
                    onClick={() => setIsPropertiesOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Content */}
                <PropertiesPanel />
              </div>
            </>
          )}
        </div>
      </div>
    </BuilderProvider>
  );
}

export default BuilderLayout;
