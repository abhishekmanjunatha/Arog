'use client';

/**
 * Edit Builder Template Page
 * Edit V2 templates using the form builder interface
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { BuilderLayout } from '@/components/builder';
import { BuilderSchema, BuilderElement } from '@/types/builder';
import { isBuilderV2Enabled } from '@/lib/feature-flags';
import { ArrowLeft, Save, X, Loader2 } from 'lucide-react';
import { updateBuilderTemplate } from '@/app/actions/templates';
import { createClient } from '@/lib/supabase/client';

interface TemplateData {
  id: string;
  name: string;
  description: string | null;
  category: string;
  schema_json: {
    elements?: BuilderElement[];
    version?: string;
  };
  builder_version: number | null;
}

export default function EditBuilderTemplatePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState('prescription');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [pendingSchema, setPendingSchema] = useState<BuilderSchema | null>(null);

  // Load template data
  useEffect(() => {
    async function loadTemplate() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: templateData, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error || !templateData) {
        router.push('/templates');
        return;
      }

      setTemplate(templateData as TemplateData);
      setTemplateName(templateData.name);
      setTemplateDescription(templateData.description || '');
      setTemplateCategory(templateData.category);
      setLoading(false);
    }

    loadTemplate();
  }, [params.id, router]);

  // Check feature flag
  if (!isBuilderV2Enabled()) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Builder V2 is Disabled
            </h1>
            <Link href={`/templates/${params.id}/edit`} className="text-cyan-600 hover:underline">
              Edit with Legacy Editor
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 className="w-6 h-6 animate-spin" />
            Loading template...
          </div>
        </main>
      </>
    );
  }

  if (!template) {
    return null;
  }

  // Convert existing template to builder schema
  const initialSchema: BuilderSchema | undefined = template.schema_json?.elements
    ? {
        version: 2,
        elements: template.schema_json.elements,
      }
    : undefined;

  const handleSave = (schema: BuilderSchema) => {
    setPendingSchema(schema);
    setShowMetadataModal(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingSchema || !templateName.trim()) {
      setError('Template name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await updateBuilderTemplate(params.id, {
        name: templateName.trim(),
        description: templateDescription.trim() || null,
        category: templateCategory,
        schema: pendingSchema,
      });

      if (result.error) {
        setError(result.error);
        setIsSaving(false);
        return;
      }

      router.push(`/templates/${params.id}?success=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
      setIsSaving(false);
    }
  };

  const categories = [
    { value: 'prescription', label: 'Prescription' },
    { value: 'medical_certificate', label: 'Medical Certificate' },
    { value: 'lab_report', label: 'Lab Report' },
    { value: 'referral', label: 'Referral' },
    { value: 'discharge_summary', label: 'Discharge Summary' },
    { value: 'consultation_note', label: 'Consultation Note' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-100">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href={`/templates/${params.id}`}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Edit: {template.name}
                </h1>
                <p className="text-sm text-gray-500">
                  Modify form elements and configuration
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs font-medium bg-cyan-100 text-cyan-700 rounded">
                Builder V2
              </span>
            </div>
          </div>
        </div>

        {/* Builder */}
        <BuilderLayout 
          onSave={handleSave}
          templateName={templateName}
          initialSchema={initialSchema}
        />

        {/* Metadata Modal */}
        {showMetadataModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Update Template</h2>
                <button 
                  onClick={() => setShowMetadataModal(false)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="e.g., Patient Intake Form"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    rows={3}
                    placeholder="Brief description of this template"
                  />
                </div>

                <div className="text-sm text-gray-500">
                  <strong>{pendingSchema?.elements.length || 0}</strong> form elements configured
                </div>
              </div>

              <div className="flex gap-3 p-4 border-t bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => setShowMetadataModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSave}
                  disabled={isSaving || !templateName.trim()}
                  className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update Template
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
