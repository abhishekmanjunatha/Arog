-- Upgrade templates table to support Builder Engine
-- This migration extends the existing templates schema to support:
-- 1. Form builder elements (Text, Number, Dropdown, Radio, Date, etc.)
-- 2. Prefill engine configuration
-- 3. Calculated fields
-- 4. Element properties and validation

-- First, let's add a new column for builder configuration
ALTER TABLE templates
ADD COLUMN IF NOT EXISTS builder_version INT DEFAULT 2;

-- Add comment to track migration
COMMENT ON COLUMN templates.builder_version IS 'Version 1: Variable-based, Version 2: Builder Engine';

-- The schema_json will now support the new builder structure:
-- {
--   "version": 2,
--   "elements": [
--     {
--       "id": "unique-id",
--       "type": "text|number|paragraph|dropdown|radio|date|calculated|divider|header",
--       "label": "Field Label",
--       "name": "field_name",
--       "required": boolean,
--       "prefill": {
--         "enabled": boolean,
--         "source": "patient|doctor|appointment|system",
--         "field": "name|phone|date|etc",
--         "readonly": boolean
--       },
--       "properties": {
--         // Type-specific properties
--         "placeholder": "...",
--         "options": ["opt1", "opt2"], // for dropdown/radio
--         "calculation": "bmi", // for calculated fields
--         "minLength": 0,
--         "maxLength": 100,
--         "min": 0,
--         "max": 999,
--         "defaultValue": "..."
--       },
--       "validation": {
--         "pattern": "regex",
--         "message": "error message"
--       },
--       "position": {
--         "row": 0,
--         "col": 0,
--         "width": 12 // 12-column grid
--       }
--     }
--   ],
--   "variables": [] // Legacy support
-- }

-- Create an index on builder_version for filtering
CREATE INDEX IF NOT EXISTS idx_templates_builder_version ON templates(builder_version);

-- Add a function to validate builder schema
CREATE OR REPLACE FUNCTION validate_builder_schema(schema JSONB)
RETURNS BOOLEAN AS $$
DECLARE
  element JSONB;
  element_type TEXT;
BEGIN
  -- Check if version exists
  IF NOT (schema ? 'version') THEN
    RETURN FALSE;
  END IF;

  -- Check if elements array exists
  IF NOT (schema ? 'elements') THEN
    RETURN FALSE;
  END IF;

  -- Validate each element
  FOR element IN SELECT * FROM jsonb_array_elements(schema->'elements')
  LOOP
    -- Check required fields
    IF NOT (element ? 'id' AND element ? 'type' AND element ? 'name') THEN
      RETURN FALSE;
    END IF;

    -- Validate element type
    element_type := element->>'type';
    IF element_type NOT IN ('text', 'number', 'paragraph', 'dropdown', 'radio', 'date', 'calculated', 'divider', 'header') THEN
      RETURN FALSE;
    END IF;
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add check constraint for builder v2 templates
ALTER TABLE templates
ADD CONSTRAINT check_builder_schema
CHECK (
  builder_version = 1 OR
  (builder_version = 2 AND validate_builder_schema(schema_json))
);

-- Create a view for builder templates
CREATE OR REPLACE VIEW builder_templates AS
SELECT 
  id,
  doctor_id,
  name,
  description,
  category,
  schema_json,
  builder_version,
  is_active,
  created_at,
  updated_at,
  jsonb_array_length(schema_json->'elements') as element_count
FROM templates
WHERE builder_version = 2;

-- Grant access to the view
GRANT SELECT ON builder_templates TO authenticated;

COMMENT ON TABLE templates IS 'Stores document templates - Version 1: Variable-based, Version 2: Builder Engine with form elements, prefills, and calculations';
