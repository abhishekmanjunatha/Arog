'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from './Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/lib/toast'
import { updatePatient, createPatient } from '@/app/actions/patients'

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

interface PatientFormModalProps {
  isOpen: boolean
  onClose: () => void
  patient?: Patient  // Optional for create mode
  mode?: 'create' | 'edit'
  onSuccess?: (patientId?: string) => void
}

export function PatientFormModal({
  isOpen,
  onClose,
  patient,
  mode = patient ? 'edit' : 'create',
  onSuccess,
}: PatientFormModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      if (mode === 'edit' && patient) {
        await updatePatient(patient.id, formData)
        toast.success('Patient Updated', `${formData.get('name')} has been updated successfully.`)
      } else {
        const result = await createPatient(formData)
        toast.success('Patient Created', `${formData.get('name')} has been added successfully.`)
        onSuccess?.(result?.id)
      }
      
      onClose()
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${mode} patient`
      setError(errorMessage)
      toast.error(`${mode === 'edit' ? 'Update' : 'Create'} Failed`, errorMessage)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Patient' : 'Add New Patient'}
      description={mode === 'edit' ? 'Update patient information' : 'Register a new patient'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={patient?.name || ''}
            required
            disabled={isPending}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={patient?.phone || ''}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={patient?.email || ''}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth" className="text-sm font-medium">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  defaultValue={patient?.date_of_birth || ''}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                <select
                  id="gender"
                  name="gender"
                  defaultValue={patient?.gender || ''}
                  disabled={isPending}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood_group" className="text-sm font-medium">Blood Group</Label>
                <Input
                  id="blood_group"
                  name="blood_group"
                  type="text"
                  defaultValue={patient?.blood_group || ''}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">Address</Label>
              <Input
                id="address"
                name="address"
                type="text"
                defaultValue={patient?.address || ''}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical_history" className="text-sm font-medium">Medical History</Label>
              <textarea
                id="medical_history"
                name="medical_history"
                rows={3}
                defaultValue={patient?.medical_history || ''}
                disabled={isPending}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies" className="text-sm font-medium">Allergies</Label>
              <textarea
                id="allergies"
                name="allergies"
                rows={2}
                defaultValue={patient?.allergies || ''}
                disabled={isPending}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t">
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Add Patient'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="w-full sm:w-auto">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}
