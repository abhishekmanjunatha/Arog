'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/Header'
import { createAppointment } from '@/app/actions/appointments'

export default function NewAppointmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [patients, setPatients] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [selectedPatientName, setSelectedPatientName] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      const { data: patientsData } = await supabase
        .from('patients')
        .select('id, name, phone')
        .eq('doctor_id', user.id)
        .eq('is_active', true)
        .order('name')

      setPatients(patientsData || [])
      
      const preselectedPatientId = searchParams.get('patientId')
      if (preselectedPatientId && patientsData) {
        const preselected = patientsData.find(p => p.id === preselectedPatientId)
        if (preselected) {
          setSelectedPatientId(preselectedPatientId)
          setSelectedPatientName(preselected.name)
          setSearchTerm(preselected.name)
        }
      }
      
      setLoading(false)
    }

    loadData()
  }, [router, searchParams])

  const filteredPatients = searchTerm
    ? patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : patients

  const handleSelectPatient = (patient: any) => {
    setSelectedPatientId(patient.id)
    setSelectedPatientName(patient.name)
    setSearchTerm(patient.name)
    setShowDropdown(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setSelectedPatientId('')
    setSelectedPatientName('')
    setShowDropdown(true)
  }

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header userEmail={user.email} />

      <main className="container mx-auto flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Schedule Appointment</h2>
            <p className="text-muted-foreground mt-1">
              Create a new appointment for a patient
            </p>
          </div>

          {!patients || patients.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    You need to add at least one patient before scheduling appointments.
                  </p>
                  <Link href="/patients/new">
                    <Button>Add Patient</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle>Appointment Details</CardTitle>
                <CardDescription>
                  Select a patient and schedule the appointment
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form action={createAppointment} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="patient_search" className="text-sm font-medium">Patient *</Label>
                    <div className="relative">
                      <Input
                        id="patient_search"
                        type="text"
                        placeholder="🔍 Search or select patient by name or phone..."
                        value={searchTerm}
                        onChange={handleInputChange}
                        onFocus={() => setShowDropdown(true)}
                        className="pr-10"
                        autoComplete="off"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm('')
                            setSelectedPatientId('')
                            setSelectedPatientName('')
                            setShowDropdown(true)
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          ✕
                        </button>
                      )}
                      
                      {showDropdown && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-60 overflow-auto">
                          <div
                            onClick={() => {
                              window.open('/patients/new', '_blank')
                              setShowDropdown(false)
                            }}
                            className="flex items-center gap-2 px-4 py-3 hover:bg-accent cursor-pointer border-b"
                          >
                            <span className="text-primary font-medium">+ Add New Patient</span>
                          </div>
                          
                          {filteredPatients.length > 0 ? (
                            filteredPatients.map(patient => (
                              <div
                                key={patient.id}
                                onClick={() => handleSelectPatient(patient)}
                                className={`px-4 py-3 hover:bg-accent cursor-pointer border-b last:border-b-0 ${
                                  selectedPatientId === patient.id ? 'bg-accent' : ''
                                }`}
                              >
                                <div className="font-medium">{patient.name}</div>
                                {patient.phone && (
                                  <div className="text-sm text-muted-foreground">{patient.phone}</div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-muted-foreground">
                              No patients found. Add a new patient above.
                            </div>
                          )}
                        </div>
                      )}
                      
                      <input
                        type="hidden"
                        id="patient_id"
                        name="patient_id"
                        value={selectedPatientId}
                        required
                      />
                    </div>
                    {selectedPatientName && (
                      <p className="text-sm text-green-600">
                        ✓ Selected: {selectedPatientName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="appointment_date" className="text-sm font-medium">Date *</Label>
                      <Input
                        id="appointment_date"
                        name="appointment_date"
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appointment_time" className="text-sm font-medium">Time *</Label>
                      <Input
                        id="appointment_time"
                        name="appointment_time"
                        type="time"
                        required
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
                        defaultValue={30}
                        min={5}
                        step={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                      <select
                        id="status"
                        name="status"
                        defaultValue="scheduled"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no_show">No Show</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-4">Clinical Information</h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="chief_complaint" className="text-sm font-medium">Chief Complaint</Label>
                        <textarea
                          id="chief_complaint"
                          name="chief_complaint"
                          rows={2}
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                          placeholder="Patient's main concern or reason for visit"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="diagnosis" className="text-sm font-medium">Diagnosis</Label>
                        <textarea
                          id="diagnosis"
                          name="diagnosis"
                          rows={2}
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                          placeholder="Medical diagnosis (can be added later)"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                        <textarea
                          id="notes"
                          name="notes"
                          rows={3}
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                          placeholder="Additional notes, observations, or treatment plan"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 border-t">
                    <Button type="submit" className="min-w-[120px]">
                      Schedule Appointment
                    </Button>
                    <Link href="/appointments">
                      <Button type="button" variant="outline" className="min-w-[120px]">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
