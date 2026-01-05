'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, UserPlus, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PatientFormModal } from '@/components/modals'

interface Patient {
  id: string
  name: string
}

interface PatientSelectorProps {
  patients: Patient[]
  selectedPatientId?: string
  onPatientSelect: (patientId: string) => void
  onPatientAdded?: (patientId?: string) => void | Promise<void>
  disabled?: boolean
  required?: boolean
}

export function PatientSelector({ 
  patients, 
  selectedPatientId, 
  onPatientSelect,
  onPatientAdded,
  disabled = false,
  required = false 
}: PatientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [showAddPatient, setShowAddPatient] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedPatient = patients.find(p => p.id === selectedPatientId)

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectPatient = (patientId: string) => {
    onPatientSelect(patientId)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleAddPatientSuccess = async (newPatientId?: string) => {
    if (newPatientId) {
      // Call the callback to refresh patient list if provided
      if (onPatientAdded) {
        await onPatientAdded(newPatientId)
      } else {
        // Fallback: just select the new patient
        onPatientSelect(newPatientId)
      }
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Patient {required && <span className="text-destructive">*</span>}
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAddPatient(true)}
          disabled={disabled}
          className="h-auto py-1 px-2 text-xs"
        >
          <UserPlus className="h-3 w-3 mr-1" />
          Add Patient
        </Button>
      </div>

      <div className="relative" ref={dropdownRef}>
        {/* Selected Patient Display / Search Input */}
        <div
          className={`
            flex items-center gap-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${isOpen ? 'ring-2 ring-ring' : ''}
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          {selectedPatient ? (
            <>
              <span className="flex-1">{selectedPatient.name}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPatientSelect('')
                  }}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </>
          ) : (
            <>
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-muted-foreground">
                {isOpen ? 'Search patients...' : 'Select a patient'}
              </span>
            </>
          )}
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Hidden input for form submission */}
        <input
          type="hidden"
          name="patient_id"
          value={selectedPatientId || ''}
          required={required}
        />

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-80 overflow-hidden flex flex-col">
            {/* Search Input */}
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                  autoFocus
                />
              </div>
            </div>

            {/* Patient List */}
            <div className="overflow-y-auto flex-1">
              {filteredPatients.length > 0 ? (
                <div className="py-1">
                  {filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => handleSelectPatient(patient.id)}
                      className={`
                        w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors
                        ${patient.id === selectedPatientId ? 'bg-muted font-medium' : ''}
                      `}
                    >
                      {patient.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  <p className="mb-2">No patients found</p>
                  {searchTerm && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddPatient(true)
                        setIsOpen(false)
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add "{searchTerm}" as new patient
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Add Patient Footer */}
            <div className="p-2 border-t bg-muted/50">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddPatient(true)
                  setIsOpen(false)
                }}
                className="w-full justify-start"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Patient
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      <PatientFormModal
        isOpen={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        mode="create"
        onSuccess={handleAddPatientSuccess}
      />
    </div>
  )
}
