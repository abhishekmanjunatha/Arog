-- Migration: Split patientAgeGender into patientAge and patientGender
-- This updates the template validation to:
-- 1. Add 'patientAge' element type
-- 2. Add 'patientGender' element type
-- 3. Remove 'patientAgeGender' element type

-- Drop existing constraint (it uses subqueries which aren't allowed)
ALTER TABLE public.templates
DROP CONSTRAINT IF EXISTS check_builder_schema;

-- Create a trigger function for validation instead
CREATE OR REPLACE FUNCTION validate_builder_schema()
RETURNS TRIGGER AS $$
DECLARE
  elem jsonb;
  valid_types text[] := ARRAY[
    'text',
    'number', 
    'paragraph',
    'dropdown',
    'radio',
    'date',
    'calculated',
    'divider',
    'header',
    'image',
    'footer',
    'medicalHistory',
    'documentHeader',
    'patientName',
    'patientEmail',
    'patientPhone',
    'patientAddress',
    'patientAge',
    'patientGender',
    'patientBloodGroup'
  ];
BEGIN
  -- Skip validation if not a builder v2 template
  IF NEW.schema_json IS NULL THEN
    RETURN NEW;
  END IF;
  
  IF (NEW.schema_json->>'builder_version')::int IS DISTINCT FROM 2 THEN
    RETURN NEW;
  END IF;
  
  -- Validate builder v2 schema structure
  IF NOT (NEW.schema_json ? 'elements') THEN
    RAISE EXCEPTION 'Builder v2 schema must have elements array';
  END IF;
  
  IF jsonb_typeof(NEW.schema_json->'elements') != 'array' THEN
    RAISE EXCEPTION 'Builder v2 elements must be an array';
  END IF;
  
  -- Validate each element
  FOR elem IN SELECT * FROM jsonb_array_elements(NEW.schema_json->'elements')
  LOOP
    IF NOT (elem ? 'id' AND elem ? 'type' AND elem ? 'name' AND elem ? 'label' AND elem ? 'properties') THEN
      RAISE EXCEPTION 'Each element must have id, type, name, label, and properties';
    END IF;
    
    IF NOT ((elem->>'type') = ANY(valid_types)) THEN
      RAISE EXCEPTION 'Invalid element type: %. Valid types are: %', elem->>'type', array_to_string(valid_types, ', ');
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS validate_builder_schema_trigger ON public.templates;

-- Create trigger for INSERT and UPDATE
CREATE TRIGGER validate_builder_schema_trigger
  BEFORE INSERT OR UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION validate_builder_schema();

-- Add helpful comment
COMMENT ON FUNCTION validate_builder_schema() IS 
  'Validates builder v2 template schemas. Updated 2026-01-06 to split patientAgeGender into patientAge and patientGender.';
