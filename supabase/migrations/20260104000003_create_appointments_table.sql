-- Create appointments table
-- Appointments are clinical events linking doctors and patients
-- All appointments are scoped by doctor_id

CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    appointment_date TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    chief_complaint TEXT,
    diagnosis TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure patient belongs to the same doctor
    CONSTRAINT fk_patient_doctor CHECK (
        EXISTS (
            SELECT 1 FROM public.patients 
            WHERE id = patient_id AND doctor_id = appointments.doctor_id
        )
    )
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- Enable Row Level Security
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Appointments are scoped by doctor_id
CREATE POLICY "Doctors can view own appointments"
    ON public.appointments
    FOR SELECT
    USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create appointments"
    ON public.appointments
    FOR INSERT
    WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update own appointments"
    ON public.appointments
    FOR UPDATE
    USING (auth.uid() = doctor_id);

-- No DELETE policy - soft delete or status change only
-- No hard deletes of clinical data

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
