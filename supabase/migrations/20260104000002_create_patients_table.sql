-- Create patients table
-- This table stores patient information
-- All patients are scoped by doctor_id (isolation)

CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    blood_group TEXT,
    address TEXT,
    medical_history TEXT,
    allergies TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON public.patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patients_is_active ON public.patients(is_active);
CREATE INDEX IF NOT EXISTS idx_patients_name ON public.patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Patients are scoped by doctor_id
CREATE POLICY "Doctors can view own patients"
    ON public.patients
    FOR SELECT
    USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create patients"
    ON public.patients
    FOR INSERT
    WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update own patients"
    ON public.patients
    FOR UPDATE
    USING (auth.uid() = doctor_id);

-- Note: No DELETE policy - we use soft delete (is_active = false)
-- No hard deletes of medical data as per architecture principles

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
