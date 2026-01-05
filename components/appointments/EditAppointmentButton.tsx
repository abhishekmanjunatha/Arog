'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AppointmentFormModal } from '@/components/modals/AppointmentFormModal'

interface Appointment {
  id: string
  appointment_date: string
  duration_minutes?: number | null
  status: string
  chief_complaint?: string | null
  diagnosis?: string | null
  notes?: string | null
  patient: {
    id: string
    name: string
  }
}

interface EditAppointmentButtonProps {
  appointment: Appointment
}

export function EditAppointmentButton({ appointment }: EditAppointmentButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
        Edit
      </Button>

      <AppointmentFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        appointment={appointment}
      />
    </>
  )
}
