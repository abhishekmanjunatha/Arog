'use client';

/**
 * Builder Toolbar
 * Top toolbar with save, undo, redo, and other actions
 */

import React from 'react';
import { useBuilder } from './BuilderContext';
import { BuilderSchema } from '@/types/builder';
import { validateSchema } from '@/lib/builder-utils';
import { 
  Undo2, 
  Redo2, 
  Save, 
  Trash2, 
  Eye,
  FileJson
} from 'lucide-react';

interface BuilderToolbarProps {
  onSave?: (schema: BuilderSchema) => void;
  templateName?: string;
}

export function BuilderToolbar({ onSave, templateName }: BuilderToolbarProps) {
  const { state, undo, redo, clearAll, canUndo, canRedo } = useBuilder();
  const [showPreview, setShowPreview] = React.useState(false);
  const [showJson, setShowJson] = React.useState(false);

  const handleSave = () => {
    const validation = validateSchema(state.schema);
    
    if (!validation.valid) {
      alert(`Schema validation errors:\n${validation.errors.join('\n')}`);
      return;
    }
    
    if (onSave) {
      onSave(state.schema);
    }
  };

  const handleClear = () => {
    if (state.schema.elements.length === 0) return;
    
    if (confirm('Are you sure you want to clear all elements? This action can be undone.')) {
      clearAll();
    }
  };

  const elementCount = state.schema.elements.length;

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        {/* Left side - Title and element count */}
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {templateName || 'Form Builder'}
            </h2>
            <p className="text-sm text-gray-500">
              {elementCount} {elementCount === 1 ? 'element' : 'elements'}
            </p>
          </div>
        </div>

        {/* Center - Actions */}
        <div className="flex items-center gap-2">
          {/* Undo */}
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-colors ${
              canUndo 
                ? 'hover:bg-gray-100 text-gray-700' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-5 h-5" />
          </button>

          {/* Redo */}
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-colors ${
              canRedo 
                ? 'hover:bg-gray-100 text-gray-700' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* Preview */}
          <button
            onClick={() => setShowPreview(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            title="Preview Form"
          >
            <Eye className="w-5 h-5" />
          </button>

          {/* View JSON */}
          <button
            onClick={() => setShowJson(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            title="View JSON Schema"
          >
            <FileJson className="w-5 h-5" />
          </button>

          {/* Clear All */}
          <button
            onClick={handleClear}
            disabled={elementCount === 0}
            className={`p-2 rounded-lg transition-colors ${
              elementCount > 0 
                ? 'hover:bg-red-50 text-red-600' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="Clear All Elements"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Right side - Save button */}
        <div className="flex items-center gap-2">
          {onSave && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Template
            </button>
          )}
        </div>
      </div>

      {/* JSON Modal */}
      {showJson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">JSON Schema</h3>
              <button
                onClick={() => setShowJson(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1">
              <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(state.schema, null, 2)}
              </pre>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(state.schema, null, 2));
                  alert('Copied to clipboard!');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setShowJson(false)}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Form Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-auto flex-1">
              {state.schema.elements.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No elements added yet. Add elements from the palette to see a preview.
                </p>
              ) : (
                <div className="space-y-4">
                  {state.schema.elements.map((element) => (
                    <div key={element.id} className="preview-element">
                      {element.type === 'header' ? (
                        <h3 className={`font-bold ${
                          element.properties.fontSize === 'large' ? 'text-xl' :
                          element.properties.fontSize === 'medium' ? 'text-lg' : 'text-base'
                        }`}>
                          {element.label}
                        </h3>
                      ) : element.type === 'divider' ? (
                        <hr className="border-gray-300" />
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {element.label}
                            {element.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {element.type === 'paragraph' ? (
                            <textarea
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              rows={element.properties.rows || 4}
                              placeholder={element.properties.placeholder}
                              disabled
                            />
                          ) : element.type === 'dropdown' ? (
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled>
                              <option value="">Select...</option>
                              {element.properties.options?.map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : element.type === 'radio' ? (
                            <div className="space-y-2">
                              {element.properties.options?.map((opt, i) => (
                                <label key={i} className="flex items-center gap-2">
                                  <input type="radio" name={element.name} disabled />
                                  <span>{opt}</span>
                                </label>
                              ))}
                            </div>
                          ) : element.type === 'calculated' ? (
                            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500">
                              [Calculated: {element.properties.calculation || 'custom'}]
                            </div>
                          ) : (
                            <input
                              type={element.type === 'number' ? 'number' : element.type === 'date' ? 'date' : 'text'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder={element.properties.placeholder}
                              disabled
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BuilderToolbar;
