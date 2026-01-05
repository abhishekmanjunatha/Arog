'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/modals'
import { toast } from '@/lib/toast'

interface TemplateActionsProps {
  templateId: string
  templateName: string
  isActive: boolean
  deactivateAction: (formData: FormData) => Promise<void>
  activateAction: (formData: FormData) => Promise<void>
}

export function TemplateActions({
  templateId,
  templateName,
  isActive,
  deactivateAction,
  activateAction,
}: TemplateActionsProps) {
  const router = useRouter()
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [showActivateModal, setShowActivateModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDeactivate = async () => {
    const formData = new FormData()
    
    try {
      await deactivateAction(formData)
      toast.success('Template Deactivated', `${templateName} has been deactivated successfully.`)
      setShowDeactivateModal(false)
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      toast.error('Failed to Deactivate', 'An error occurred while deactivating the template.')
    }
  }

  const handleActivate = async () => {
    const formData = new FormData()
    
    try {
      await activateAction(formData)
      toast.success('Template Activated', `${templateName} has been activated successfully.`)
      setShowActivateModal(false)
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      toast.error('Failed to Activate', 'An error occurred while activating the template.')
    }
  }

  return (
    <>
      {isActive ? (
        <Button
          variant="destructive"
          onClick={() => setShowDeactivateModal(true)}
          disabled={isPending}
        >
          Deactivate
        </Button>
      ) : (
        <Button
          onClick={() => setShowActivateModal(true)}
          disabled={isPending}
        >
          Activate
        </Button>
      )}

      <ConfirmationModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Template"
        message={`Are you sure you want to deactivate "${templateName}"? This template will no longer be available for document generation, but existing documents using this template will not be affected.`}
        confirmLabel="Deactivate"
        cancelLabel="Cancel"
        variant="destructive"
        loading={isPending}
      />

      <ConfirmationModal
        isOpen={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        onConfirm={handleActivate}
        title="Activate Template"
        message={`Activate "${templateName}" and make it available for document generation?`}
        confirmLabel="Activate"
        cancelLabel="Cancel"
        variant="default"
        loading={isPending}
      />
    </>
  )
}
