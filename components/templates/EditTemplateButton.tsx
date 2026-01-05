'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TemplateFormModal } from '@/components/modals'
import type { TemplateContent } from '@/types/template'

interface Template {
  id: string
  name: string
  category: string
  description?: string | null
  schema_json: TemplateContent
}

interface EditTemplateButtonProps {
  template: Template
}

export function EditTemplateButton({ template }: EditTemplateButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        Edit
      </Button>
      <TemplateFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template={template}
        mode="edit"
      />
    </>
  )
}
