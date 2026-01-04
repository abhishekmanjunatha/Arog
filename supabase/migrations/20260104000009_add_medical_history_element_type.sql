-- Migration: Add medicalHistory element type to builder schema validation
-- This updates the validate_builder_schema function to include the new element type

-- Drop the constraint first
ALTER TABLE templates
DROP CONSTRAINT IF EXISTS check_builder_schema;

-- Update the validation function to include medicalHistory type
CREATE OR REPLACE FUNCTION validate_builder_schema(schema jsonb)
RETURNS BOOLEAN AS $$
DECLARE
  element jsonb;
  element_type text;
  version_val text;
BEGIN
  -- Check if schema has version and elements
  IF NOT (schema ? 'version' AND schema ? 'elements') THEN
    RETURN FALSE;
  END IF;

  -- Check version is 2 (handle both integer and string formats like "2" or "2.0")
  version_val := schema->>'version';
  IF version_val IS NULL OR (version_val != '2' AND version_val != '2.0' AND version_val::numeric < 2) THEN
    RETURN FALSE;
  END IF;

  -- Validate each element
  FOR element IN SELECT * FROM jsonb_array_elements(schema->'elements')
  LOOP
    -- Check required fields
    IF NOT (element ? 'id' AND element ? 'type' AND element ? 'name') THEN
      RETURN FALSE;
    END IF;

    -- Validate element type - now includes medicalHistory
    element_type := element->>'type';
    IF element_type NOT IN ('text', 'number', 'paragraph', 'dropdown', 'radio', 'date', 'calculated', 'divider', 'header', 'image', 'footer', 'medicalHistory') THEN
      RETURN FALSE;
    END IF;
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Re-add the constraint
ALTER TABLE templates
ADD CONSTRAINT check_builder_schema
CHECK (
  builder_version = 1 OR
  (builder_version = 2 AND validate_builder_schema(schema_json))
);
