'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Search, X, Sparkles, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Template = {
  id: string
  name: string
  description?: string
  category?: string
  builder_version?: number
  is_active: boolean
}

interface TemplateSelectionModalProps {
  templates: Template[]
  patientId: string
  onClose: () => void
}

export function TemplateSelectionModal({ templates, patientId, onClose }: TemplateSelectionModalProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || template.category === selectedCategory
    return matchesSearch && matchesCategory && template.is_active
  })

  // Get unique categories
  const categories = Array.from(new Set(templates.map(t => t.category).filter(Boolean)))

  // Group by builder version
  const v1Templates = filteredTemplates.filter(t => !t.builder_version || t.builder_version === 1)
  const v2Templates = filteredTemplates.filter(t => t.builder_version === 2)

  const handleTemplateSelect = (templateId: string, builderVersion?: number) => {
    if (builderVersion === 2) {
      router.push(`/documents/new/builder?templateId=${templateId}&patientId=${patientId}`)
    } else {
      router.push(`/documents/new?templateId=${templateId}&patientId=${patientId}`)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Select Template</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a template to generate document for this patient
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category || null)}
                >
                  {category?.replace('_', ' ')}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No templates found</p>
              {searchTerm && (
                <Button
                  variant="link"
                  onClick={() => setSearchTerm('')}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Builder V2 Templates */}
              {v2Templates.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Builder V2 Templates</h3>
                    <Badge variant="info">Advanced Forms</Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {v2Templates.map(template => (
                      <Card
                        key={template.id}
                        className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all"
                        onClick={() => handleTemplateSelect(template.id, template.builder_version)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <Badge variant="secondary" className="shrink-0">V2</Badge>
                          </div>
                          {template.description && (
                            <CardDescription className="line-clamp-2">
                              {template.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        {template.category && (
                          <CardContent>
                            <Badge variant="outline" className="text-xs">
                              <Folder className="h-3 w-3 mr-1" />
                              {template.category.replace('_', ' ')}
                            </Badge>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* V1 Templates */}
              {v1Templates.length > 0 && (
                <div>
                  {v2Templates.length > 0 && <div className="border-t pt-6" />}
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold text-lg">Standard Templates</h3>
                    <Badge variant="outline">Variable-based</Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {v1Templates.map(template => (
                      <Card
                        key={template.id}
                        className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all"
                        onClick={() => handleTemplateSelect(template.id, template.builder_version)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <Badge variant="outline" className="shrink-0">V1</Badge>
                          </div>
                          {template.description && (
                            <CardDescription className="line-clamp-2">
                              {template.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        {template.category && (
                          <CardContent>
                            <Badge variant="outline" className="text-xs">
                              <Folder className="h-3 w-3 mr-1" />
                              {template.category.replace('_', ' ')}
                            </Badge>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-muted/30">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'} available
            </span>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
