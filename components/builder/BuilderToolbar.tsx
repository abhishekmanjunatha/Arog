'use client';

/**
 * Builder Toolbar
 * Top toolbar with save, undo, redo, and other actions
 */

import React from 'react';
import { useBuilder } from './BuilderContext';
import { BuilderSchema } from '@/types/builder';
import { validateSchema, ValidationResult } from '@/lib/builder-utils';
import { 
  Undo2, 
  Redo2, 
  Save, 
  Trash2, 
  Eye,
  FileJson,
  AlertCircle,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface BuilderToolbarProps {
  onSave?: (schema: BuilderSchema) => void;
  templateName?: string;
}

export function BuilderToolbar({ onSave, templateName }: BuilderToolbarProps) {
  const { state, undo, redo, clearAll, canUndo, canRedo } = useBuilder();
  const [showPreview, setShowPreview] = React.useState(false);
  const [showJson, setShowJson] = React.useState(false);
  const [showValidation, setShowValidation] = React.useState(false);
  const [validationResult, setValidationResult] = React.useState<ValidationResult | null>(null);

  const handleSave = () => {
    const validation = validateSchema(state.schema);
    
    if (!validation.valid) {
      // Show validation modal with errors
      setValidationResult(validation);
      setShowValidation(true);
      return;
    }
    
    // Show warnings if any, but allow save
    if (validation.warnings.length > 0) {
      setValidationResult(validation);
      setShowValidation(true);
      return;
    }
    
    // All good, save directly
    if (onSave) {
      onSave(state.schema);
    }
  };

  const handleConfirmSave = () => {
    setShowValidation(false);
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

      {/* Validation Modal */}
      {showValidation && validationResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {validationResult.valid ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Validation Warnings
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Validation Errors
                  </>
                )}
              </h3>
              <button
                onClick={() => setShowValidation(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1 space-y-4">
              {/* Errors */}
              {validationResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Errors ({validationResult.errors.length})
                  </h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <ul className="space-y-1 text-sm text-red-700">
                      {validationResult.errors.map((error, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-xs text-gray-500">
                    Please fix these errors before saving the template.
                  </p>
                </div>
              )}

              {/* Warnings */}
              {validationResult.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Warnings ({validationResult.warnings.length})
                  </h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <ul className="space-y-1 text-sm text-yellow-700">
                      {validationResult.warnings.map((warning, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {validationResult.valid && (
                    <p className="text-xs text-gray-500">
                      These are suggestions. You can still save the template.
                    </p>
                  )}
                </div>
              )}

              {/* Success state */}
              {validationResult.valid && validationResult.warnings.length === 0 && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="font-medium text-green-700">Schema is valid!</p>
                    <p className="text-sm text-green-600">Your form is ready to be saved.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowValidation(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {validationResult.valid ? 'Cancel' : 'Close'}
              </button>
              {validationResult.valid && (
                <button
                  onClick={handleConfirmSave}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Anyway
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BuilderToolbar;
