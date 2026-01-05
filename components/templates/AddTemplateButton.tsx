'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TemplateFormModal } from '@/components/modals'

interface AddTemplateButtonProps {
  isModalOpen?: boolean
  onClose?: () => void
}

export function AddTemplateButton({ isModalOpen: externalIsOpen, onClose: externalOnClose }: AddTemplateButtonProps = {}) {
  const router = useRouter()
  const [internalIsOpen, setInternalIsOpen] = useState(false)

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const setIsOpen = externalOnClose !== undefined 
    ? externalOnClose 
    : (value: boolean) => setInternalIsOpen(value)

  const handleSuccess = (templateId?: string) => {
    if (templateId) {
      // Navigate to the new template's detail page
      router.push(`/templates/${templateId}`)
    }
  }

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose()
    } else {
      setInternalIsOpen(false)
    }
  }

  // Only render button if not externally controlled
  if (externalIsOpen !== undefined) {
    return (
      <TemplateFormModal
        isOpen={isOpen}
        onClose={handleClose}
        mode="create"
        onSuccess={handleSuccess}
      />
    )
  }

  return (
    <>
      <Button onClick={() => setInternalIsOpen(true)}>
        Create Template
      </Button>
      <TemplateFormModal
        isOpen={isOpen}
        onClose={handleClose}
        mode="create"
        onSuccess={handleSuccess}
      />
    </>
  )
}
