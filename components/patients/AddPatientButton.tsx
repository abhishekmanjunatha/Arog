'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PatientFormModal } from '@/components/modals'

export function AddPatientButton() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSuccess = (patientId?: string) => {
    if (patientId) {
      // Navigate to the new patient's detail page
      router.push(`/patients/${patientId}`)
    }
  }

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        Add Patient
      </Button>
      <PatientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="create"
        onSuccess={handleSuccess}
      />
    </>
  )
}
