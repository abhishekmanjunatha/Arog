'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TemplateSelectionModal } from '@/components/documents/TemplateSelectionModal'
import { FileText } from 'lucide-react'

type Template = {
  id: string
  name: string
  description?: string
  category?: string
  builder_version?: number
  is_active: boolean
}

interface GenerateDocumentButtonProps {
  patientId: string
  templates: Template[]
}

export function GenerateDocumentButton({ patientId, templates }: GenerateDocumentButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)} 
        className="w-full sm:w-auto"
      >
        <FileText className="h-4 w-4 mr-2" />
        Generate Document
      </Button>

      {showModal && (
        <TemplateSelectionModal
          templates={templates}
          patientId={patientId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
