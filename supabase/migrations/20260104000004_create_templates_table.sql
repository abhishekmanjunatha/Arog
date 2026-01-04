-- Create templates table
-- Templates are reusable blueprints for document generation
-- Templates define structure using JSON schema

CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- e.g., 'prescription', 'medical_certificate', 'report'
    schema_json JSONB NOT NULL, -- JSON schema defining the template structure
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Validate JSON schema has required fields
    CONSTRAINT valid_schema CHECK (
        schema_json ? 'version' AND
        schema_json ? 'elements'
    )
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_templates_doctor_id ON public.templates(doctor_id);
CREATE INDEX IF NOT EXISTS idx_templates_is_active ON public.templates(is_active);
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_schema_json ON public.templates USING GIN(schema_json);

-- Enable Row Level Security
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Templates are scoped by doctor_id
CREATE POLICY "Doctors can view own templates"
    ON public.templates
    FOR SELECT
    USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create templates"
    ON public.templates
    FOR INSERT
    WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update own templates"
    ON public.templates
    FOR UPDATE
    USING (auth.uid() = doctor_id);

-- No DELETE policy - soft delete only (is_active = false)
-- Templates are never deleted, only deactivated

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON public.templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
