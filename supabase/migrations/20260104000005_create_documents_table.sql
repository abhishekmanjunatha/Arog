-- Create documents table
-- Documents are generated from templates and are IMMUTABLE
-- Once created, documents cannot be modified (only new versions can be created)

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE RESTRICT,
    
    -- Document metadata
    document_name TEXT NOT NULL,
    document_type TEXT, -- e.g., 'prescription', 'certificate', 'report'
    
    -- Document data (structured JSON from filled template)
    data_json JSONB NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    
    -- Ensure patient belongs to the same doctor
    CONSTRAINT fk_document_patient_doctor CHECK (
        EXISTS (
            SELECT 1 FROM public.patients 
            WHERE id = patient_id AND doctor_id = documents.doctor_id
        )
    ),
    
    -- Ensure appointment belongs to the same doctor and patient
    CONSTRAINT fk_document_appointment CHECK (
        appointment_id IS NULL OR
        EXISTS (
            SELECT 1 FROM public.appointments 
            WHERE id = appointment_id 
            AND doctor_id = documents.doctor_id 
            AND patient_id = documents.patient_id
        )
    )
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_documents_doctor_id ON public.documents(doctor_id);
CREATE INDEX IF NOT EXISTS idx_documents_patient_id ON public.documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_documents_appointment_id ON public.documents(appointment_id);
CREATE INDEX IF NOT EXISTS idx_documents_template_id ON public.documents(template_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_data_json ON public.documents USING GIN(data_json);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Documents are scoped by doctor_id
CREATE POLICY "Doctors can view own documents"
    ON public.documents
    FOR SELECT
    USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create documents"
    ON public.documents
    FOR INSERT
    WITH CHECK (auth.uid() = doctor_id AND auth.uid() = created_by);

-- CRITICAL: No UPDATE policy - documents are IMMUTABLE
-- CRITICAL: No DELETE policy - documents are permanent audit records
-- To correct a document, create a new version

-- Prevent any updates to documents (enforce immutability)
CREATE OR REPLACE FUNCTION prevent_document_update()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Documents are immutable and cannot be modified. Create a new document instead.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_document_immutability
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION prevent_document_update();

-- Prevent any deletes to documents (permanent audit trail)
CREATE OR REPLACE FUNCTION prevent_document_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Documents cannot be deleted. They are permanent audit records.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_document_permanence
    BEFORE DELETE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION prevent_document_delete();
