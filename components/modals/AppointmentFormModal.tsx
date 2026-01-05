'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from './Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/lib/toast'
import { updateAppointment, createAppointment } from '@/app/actions/appointments'

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

interface Patient {
  id: string
  name: string
}

interface AppointmentFormModalProps {
  isOpen: boolean
  onClose: () => void
  appointment?: Appointment  // Optional for create mode
  patients?: Patient[]  // For patient selection in create mode
  preSelectedPatientId?: string  // Optional pre-selected patient
  mode?: 'create' | 'edit'
  onSuccess?: (appointmentId?: string) => void
}

export function AppointmentFormModal({
  isOpen,
  onClose,
  appointment,
  patients = [],
  preSelectedPatientId,
  mode = appointment ? 'edit' : 'create',
  onSuccess,
}: AppointmentFormModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Parse appointment date and time (only for edit mode)
  const dateStr = appointment ? new Date(appointment.appointment_date).toISOString().split('T')[0] : ''
  const timeStr = appointment ? new Date(appointment.appointment_date).toTimeString().slice(0, 5) : ''

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      if (mode === 'edit' && appointment) {
        await updateAppointment(appointment.id, formData)
        toast.success('Appointment Updated', 'Appointment has been updated successfully.')
      } else {
        const result = await createAppointment(formData)
        toast.success('Appointment Created', 'New appointment has been scheduled successfully.')
        onSuccess?.(result?.id)
      }
      
      onClose()
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${mode} appointment`
      setError(errorMessage)
      toast.error(`${mode === 'edit' ? 'Update' : 'Create'} Failed`, errorMessage)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Appointment' : 'New Appointment'}
      description={mode === 'edit' && appointment ? `Patient: ${appointment.patient.name}` : 'Schedule a new appointment'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-2">
            <Label htmlFor="patient_id" className="text-sm font-medium">Patient *</Label>
            <select
              id="patient_id"
              name="patient_id"
              defaultValue={preSelectedPatientId || ''}
              required
              disabled={isPending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <option value="">Select a patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="appointment_date" className="text-sm font-medium">Date *</Label>
            <Input
              id="appointment_date"
              name="appointment_date"
              type="date"
              defaultValue={dateStr}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointment_time" className="text-sm font-medium">Time *</Label>
            <Input
              id="appointment_time"
              name="appointment_time"
              type="time"
              defaultValue={timeStr}
              required
              disabled={isPending}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration_minutes" className="text-sm font-medium">Duration (minutes)</Label>
            <Input
              id="duration_minutes"
              name="duration_minutes"
              type="number"
              defaultValue={appointment?.duration_minutes || 30}
              min={5}
              step={5}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={appointment?.status || 'scheduled'}
              disabled={isPending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-lg font-semibold mb-4">Clinical Information</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chief_complaint" className="text-sm font-medium">Chief Complaint</Label>
              <textarea
                id="chief_complaint"
                name="chief_complaint"
                rows={2}
                defaultValue={appointment?.chief_complaint || ''}
                disabled={isPending}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis" className="text-sm font-medium">Diagnosis</Label>
              <textarea
                id="diagnosis"
                name="diagnosis"
                rows={2}
                defaultValue={appointment?.diagnosis || ''}
                disabled={isPending}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={appointment?.notes || ''}
                disabled={isPending}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t">
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save Changes' : 'Create Appointment')}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="w-full sm:w-auto">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}
