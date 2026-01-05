'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PatientFormModal } from '@/components/modals/PatientFormModal'

interface Patient {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  date_of_birth?: string | null
  gender?: string | null
  blood_group?: string | null
  address?: string | null
  medical_history?: string | null
  allergies?: string | null
}

interface EditPatientButtonProps {
  patient: Patient
}

export function EditPatientButton({ patient }: EditPatientButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setShowModal(true)}>
        Edit
      </Button>

      <PatientFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        patient={patient}
      />
    </>
  )
}
