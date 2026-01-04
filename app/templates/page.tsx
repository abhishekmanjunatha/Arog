'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import { isBuilderV2Enabled } from '@/lib/feature-flags'
import { Layers, FileText, Plus, ChevronDown } from 'lucide-react'
import type { TemplateContent } from '@/types/template'
import type { User } from '@supabase/supabase-js'

export default function TemplatesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateMenu, setShowCreateMenu] = useState(false)

  const builderEnabled = isBuilderV2Enabled()
  const categoryFilter = searchParams.get('category') || ''
  const versionFilter = searchParams.get('version') || ''
  const showInactive = searchParams.get('showInactive') === 'true'

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      let query = supabase
        .from('templates')
        .select('*')
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false })

      if (categoryFilter) {
        query = query.eq('category', categoryFilter)
      }

      if (!showInactive) {
        query = query.eq('is_active', true)
      }

      // Filter by builder version if specified
      if (versionFilter === '1') {
        query = query.or('builder_version.is.null,builder_version.eq.1')
      } else if (versionFilter === '2') {
        query = query.eq('builder_version', 2)
      }

      const { data } = await query
      setTemplates(data || [])
      setLoading(false)
    }

    loadData()
  }, [categoryFilter, versionFilter, showInactive, router])

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'medical_certificate', label: 'Medical Certificate' },
    { value: 'lab_report', label: 'Lab Report' },
    { value: 'referral', label: 'Referral' },
    { value: 'discharge_summary', label: 'Discharge Summary' },
    { value: 'consultation_note', label: 'Consultation Note' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'other', label: 'Other' },
  ]

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    router.push(`/templates?${params.toString()}`)
  }

  const handleShowInactiveChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    if (checked) {
      params.set('showInactive', 'true')
    } else {
      params.delete('showInactive')
    }
    router.push(`/templates?${params.toString()}`)
  }

  const handleVersionChange = (version: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (version) {
      params.set('version', version)
    } else {
      params.delete('version')
    }
    router.push(`/templates?${params.toString()}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header userEmail={user.email || ''} />

      <main className="flex-1 gradient-bg">
        <div className="container mx-auto px-4 py-8 lg:px-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Document Templates</h1>
                <p className="text-lg text-muted-foreground">Create and manage reusable document templates</p>
              </div>
              
              {/* Create Template Button with Dropdown */}
              <div className="relative">
                {builderEnabled ? (
                  <>
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto shadow-md"
                      onClick={() => setShowCreateMenu(!showCreateMenu)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Template
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                    
                    {showCreateMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowCreateMenu(false)}
                        />
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border z-50">
                          <Link 
                            href="/templates/new/builder"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-t-lg"
                            onClick={() => setShowCreateMenu(false)}
                          >
                            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                              <Layers className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">Form Builder</div>
                              <div className="text-xs text-gray-500">Drag & drop designer</div>
                            </div>
                            <span className="ml-auto text-xs px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded">V2</span>
                          </Link>
                          <Link 
                            href="/templates/new"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-t rounded-b-lg"
                            onClick={() => setShowCreateMenu(false)}
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">Variable Template</div>
                              <div className="text-xs text-gray-500">Classic text editor</div>
                            </div>
                            <span className="ml-auto text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">V1</span>
                          </Link>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <Link href="/templates/new">
                    <Button size="lg" className="w-full sm:w-auto shadow-md">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Template
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex gap-4 items-center flex-wrap">
                  <select
                    name="category"
                    value={categoryFilter}
                    className="flex h-12 rounded-lg border border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[200px]"
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  
                  {builderEnabled && (
                    <select
                      name="version"
                      value={versionFilter}
                      className="flex h-12 rounded-lg border border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[150px]"
                      onChange={(e) => handleVersionChange(e.target.value)}
                    >
                      <option value="">All Versions</option>
                      <option value="1">V1 - Variable</option>
                      <option value="2">V2 - Builder</option>
                    </select>
                  )}
                  
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer px-4 py-2 rounded-lg hover:bg-accent transition-colors">
                    <input
                      type="checkbox"
                      name="showInactive"
                      checked={showInactive}
                      onChange={(e) => handleShowInactiveChange(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    Show inactive
                  </label>

                  {(categoryFilter || showInactive || versionFilter) && (
                    <Link href="/templates">
                      <Button type="button" variant="ghost" size="sm" className="ml-auto">
                        Clear filters
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {templates && templates.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => {
                  const content = template.schema_json as TemplateContent
                  const variableCount = content.variables?.length || 0
                  const elementCount = content.elements?.length || 0
                  const isBuilderV2 = template.builder_version === 2

                  return (
                    <Link
                      key={template.id}
                      href={`/templates/${template.id}`}
                      className="block group"
                    >
                      <Card className="card-hover border-0 shadow-md h-full">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {template.name}
                            </h3>
                            <div className="flex gap-2">
                              {isBuilderV2 ? (
                                <span className="status-badge bg-cyan-100 text-cyan-700 flex items-center gap-1">
                                  <Layers className="w-3 h-3" />
                                  V2
                                </span>
                              ) : (
                                <span className="status-badge bg-gray-100 text-gray-600">
                                  V1
                                </span>
                              )}
                              {!template.is_active && (
                                <span className="status-badge bg-gray-100 text-gray-600">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {template.description && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {template.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-sm">
                            <span className="status-badge bg-primary/10 text-primary">
                              {template.category || 'uncategorized'}
                            </span>
                            <span className="text-muted-foreground">
                              {isBuilderV2 
                                ? `${elementCount} element${elementCount !== 1 ? 's' : ''}`
                                : `${variableCount} variable${variableCount !== 1 ? 's' : ''}`
                              }
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold mb-2">No templates found</h3>
                  <p className="text-muted-foreground mb-6">Get started by creating your first template</p>
                  <Link href="/templates/new">
                    <Button size="lg">Create First Template</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
