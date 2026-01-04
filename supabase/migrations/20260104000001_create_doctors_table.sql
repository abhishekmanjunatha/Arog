-- Create doctors table
-- This table stores doctor/practitioner profiles
-- Each doctor is linked to a Supabase auth user

CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    clinic_name TEXT,
    contact_number TEXT,
    address TEXT,
    specialization TEXT,
    registration_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_doctors_email ON public.doctors(email);

-- Enable Row Level Security
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Doctors can only read/update their own record
CREATE POLICY "Doctors can view own profile"
    ON public.doctors
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Doctors can update own profile"
    ON public.doctors
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Doctors can insert own profile"
    ON public.doctors
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create doctor profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.doctors (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Doctor')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create doctor profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
