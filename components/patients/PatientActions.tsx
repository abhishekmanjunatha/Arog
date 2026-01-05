'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/modals'
import { toast } from '@/lib/toast'

interface PatientActionsProps {
  patientId: string
  patientName: string
  isActive: boolean
  deleteAction: (formData: FormData) => Promise<void>
  restoreAction: (formData: FormData) => Promise<void>
}

export function PatientActions({
  patientId,
  patientName,
  isActive,
  deleteAction,
  restoreAction,
}: PatientActionsProps) {
  const router = useRouter()
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDeactivate = async () => {
    const formData = new FormData()
    
    try {
      await deleteAction(formData)
      toast.success('Patient Deactivated', `${patientName} has been deactivated successfully.`)
      setShowDeactivateModal(false)
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      toast.error('Failed to Deactivate', 'An error occurred while deactivating the patient.')
    }
  }

  const handleRestore = async () => {
    const formData = new FormData()
    
    try {
      await restoreAction(formData)
      toast.success('Patient Restored', `${patientName} has been restored successfully.`)
      setShowRestoreModal(false)
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      toast.error('Failed to Restore', 'An error occurred while restoring the patient.')
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
          onClick={() => setShowRestoreModal(true)}
          disabled={isPending}
        >
          Restore
        </Button>
      )}

      <ConfirmationModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Patient"
        message={`Are you sure you want to deactivate ${patientName}? This will hide the patient from active lists but preserve all medical records.`}
        confirmLabel="Deactivate"
        cancelLabel="Cancel"
        variant="destructive"
        loading={isPending}
      />

      <ConfirmationModal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        onConfirm={handleRestore}
        title="Restore Patient"
        message={`Restore ${patientName} to active status?`}
        confirmLabel="Restore"
        cancelLabel="Cancel"
        variant="default"
        loading={isPending}
      />
    </>
  )
}
