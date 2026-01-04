'use client';

/**
 * Builder Test Page
 * Test the form builder functionality
 */

import React, { useState } from 'react';
import { BuilderLayout } from '@/components/builder';
import { FormRenderer } from '@/components/builder/FormRenderer';
import { BuilderSchema } from '@/types/builder';
import { isBuilderV2Enabled } from '@/lib/feature-flags';
import { Header } from '@/components/layout/Header';
import { ArrowLeft, Eye, Edit3 } from 'lucide-react';
import Link from 'next/link';

export default function BuilderTestPage() {
  const [savedSchema, setSavedSchema] = useState<BuilderSchema | null>(null);
  const [mode, setMode] = useState<'build' | 'preview'>('build');

  const handleSave = (schema: BuilderSchema) => {
    setSavedSchema(schema);
    console.log('Schema saved:', schema);
    alert('Template saved! Check the console for the schema.');
  };

  const handleFormSubmit = (data: Record<string, any>) => {
    console.log('Form submitted:', data);
    alert('Form submitted! Check the console for the data.');
  };

  // Mock prefill data for testing
  const mockPrefillData = {
    patient: {
      id: 'patient-123',
      name: 'John Doe',
      phone: '+1 234 567 8900',
      email: 'john.doe@email.com',
      date_of_birth: '1990-05-15',
      gender: 'Male',
    },
    doctor: {
      id: 'doctor-456',
      name: 'Dr. Sarah Smith',
      clinic: 'City Medical Center',
    },
    appointment: {
      id: 'appt-789',
      appointment_date: '2026-01-04',
      appointment_time: '10:30',
    },
    system: {
      current_date: new Date().toISOString().split('T')[0],
      current_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      place: 'Consultation Room 3',
    },
  };

  if (!isBuilderV2Enabled()) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Builder V2 is Disabled
            </h1>
            <p className="text-gray-600 mb-6">
              The Builder Engine V2 is currently disabled. Enable it by setting
              <code className="mx-1 px-2 py-1 bg-gray-100 rounded">
                NEXT_PUBLIC_ENABLE_BUILDER_V2=true
              </code>
              in your .env.local file.
            </p>
            <Link href="/dashboard" className="text-cyan-600 hover:underline">
              Return to Dashboard
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-100">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Form Builder Test
                </h1>
                <p className="text-sm text-gray-500">
                  Create and test form templates
                </p>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setMode('build')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  mode === 'build'
                    ? 'bg-white text-cyan-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                Build
              </button>
              <button
                onClick={() => setMode('preview')}
                disabled={!savedSchema}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  mode === 'preview'
                    ? 'bg-white text-cyan-700 shadow-sm'
                    : savedSchema
                      ? 'text-gray-600 hover:text-gray-900'
                      : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <Eye className="w-4 h-4" />
                Fill Form
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {mode === 'build' ? (
          <BuilderLayout 
            onSave={handleSave} 
            templateName="Test Template"
            initialSchema={savedSchema || undefined}
          />
        ) : (
          <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Fill Form Preview
                </h2>
                <p className="text-sm text-gray-500">
                  This is how the form will appear when filling out a document.
                  Prefill data is automatically populated.
                </p>
              </div>

              {savedSchema ? (
                <FormRenderer
                  schema={savedSchema}
                  prefillData={mockPrefillData}
                  onSubmit={handleFormSubmit}
                  submitButtonText="Submit Document"
                />
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Save a template first to preview the form.
                </p>
              )}
            </div>

            {/* Prefill Data Debug */}
            <div className="mt-6 bg-gray-900 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">
                Mock Prefill Data (for testing)
              </h3>
              <pre className="text-xs text-green-400 overflow-auto">
                {JSON.stringify(mockPrefillData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
