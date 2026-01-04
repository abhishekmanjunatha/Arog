'use client';

/**
 * Migrate Button Component
 * Allows upgrading V1 templates to V2 Builder format
 */

import React, { useState } from 'react';
import { migrateTemplateToV2 } from '@/app/actions/templates';
import { Button } from '@/components/ui/button';
import { ArrowUpCircle, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface MigrateButtonProps {
  templateId: string;
}

export function MigrateButton({ templateId }: MigrateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    changes?: string[];
    warnings?: string[];
  } | null>(null);

  const handleMigrate = async () => {
    setIsMigrating(true);
    setResult(null);

    try {
      const migrationResult = await migrateTemplateToV2(templateId);
      setResult(migrationResult);
      
      // If successful, redirect after a short delay
      if (migrationResult.success) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setResult({ error: 'Migration failed unexpectedly' });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <ArrowUpCircle className="w-4 h-4" />
        Upgrade to V2
      </Button>

      {/* Migration Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 text-cyan-600" />
                Upgrade to Builder V2
              </h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setResult(null);
                }}
                className="text-gray-500 hover:text-gray-700"
                disabled={isMigrating}
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1">
              {!result ? (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    This will convert your V1 variable-based template to the new Builder V2 format.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">What will happen:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Variables will be converted to form elements</li>
                      <li>• Field types will be inferred from names (date, number, text)</li>
                      <li>• Prefill settings will be auto-detected where possible</li>
                      <li>• You can edit the template after migration</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Important:
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• The original template content/layout is not migrated</li>
                      <li>• You may need to configure elements after migration</li>
                      <li>• This action cannot be undone</li>
                    </ul>
                  </div>
                </div>
              ) : result.success ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="font-medium text-green-700">Migration Successful!</p>
                      <p className="text-sm text-green-600">Refreshing page...</p>
                    </div>
                  </div>

                  {result.changes && result.changes.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Changes made:</h4>
                      <ul className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded">
                        {result.changes.map((change, i) => (
                          <li key={i}>• {change}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.warnings && result.warnings.length > 0 && (
                    <div>
                      <h4 className="font-medium text-yellow-700 mb-2">Warnings:</h4>
                      <ul className="text-sm text-yellow-600 space-y-1 bg-yellow-50 p-3 rounded">
                        {result.warnings.map((warning, i) => (
                          <li key={i}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-medium">Migration Failed</p>
                  <p className="text-sm text-red-600 mt-1">{result.error}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              {!result?.success && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      setResult(null);
                    }}
                    disabled={isMigrating}
                  >
                    Cancel
                  </Button>
                  {!result?.error && (
                    <Button
                      onClick={handleMigrate}
                      disabled={isMigrating}
                      className="gap-2"
                    >
                      {isMigrating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Migrating...
                        </>
                      ) : (
                        <>
                          <ArrowUpCircle className="w-4 h-4" />
                          Start Migration
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
