'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AppointmentFormModal } from '@/components/modals'

interface Patient {
  id: string
  name: string
}

interface AddAppointmentButtonProps {
  patients: Patient[]
  preSelectedPatientId?: string
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
}

export function AddAppointmentButton({ 
  patients, 
  preSelectedPatientId,
  variant = 'default',
  size = 'default'
}: AddAppointmentButtonProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSuccess = (appointmentId?: string) => {
    if (appointmentId) {
      // Navigate to the new appointment's detail page
      router.push(`/appointments/${appointmentId}`)
    }
  }

  return (
    <>
      <Button 
        onClick={() => setIsModalOpen(true)}
        variant={variant}
        size={size}
      >
        New Appointment
      </Button>
      <AppointmentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patients={patients}
        preSelectedPatientId={preSelectedPatientId}
        mode="create"
        onSuccess={handleSuccess}
      />
    </>
  )
}
