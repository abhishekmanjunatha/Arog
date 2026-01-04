/**
 * Builder Utilities
 * Validation and helper functions for the Builder Engine
 */

import { 
  BuilderElement, 
  BuilderSchema, 
  ElementType,
  ElementPosition,
  PrefillConfig
} from '@/types/builder';

/**
 * Valid element types
 */
export const ELEMENT_TYPES: ElementType[] = [
  'text',
  'number',
  'paragraph',
  'dropdown',
  'radio',
  'date',
  'calculated',
  'divider',
  'header'
];

/**
 * Element type display names
 */
export const ELEMENT_TYPE_LABELS: Record<ElementType, string> = {
  text: 'Text Input',
  number: 'Number Input',
  paragraph: 'Paragraph',
  dropdown: 'Dropdown',
  radio: 'Radio Buttons',
  date: 'Date Picker',
  calculated: 'Calculated Field',
  divider: 'Divider',
  header: 'Header'
};

/**
 * Element type icons (using emoji for now, can be replaced with Lucide icons)
 */
export const ELEMENT_TYPE_ICONS: Record<ElementType, string> = {
  text: '📝',
  number: '🔢',
  paragraph: '📄',
  dropdown: '📋',
  radio: '🔘',
  date: '📅',
  calculated: '🧮',
  divider: '➖',
  header: '📌'
};

/**
 * Generate a unique ID for elements
 */
export function generateElementId(): string {
  return `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a field name from a label
 */
export function generateFieldName(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
}

/**
 * Create a new element with default values
 */
export function createDefaultElement(type: ElementType): BuilderElement {
  const id = generateElementId();
  const label = ELEMENT_TYPE_LABELS[type];
  
  const baseElement: BuilderElement = {
    id,
    type,
    label,
    name: generateFieldName(label),
    required: false,
    properties: {},
    position: { row: 0, col: 0, width: 12 }
  };
  
  // Add type-specific defaults
  switch (type) {
    case 'paragraph':
      baseElement.properties.rows = 4;
      break;
    case 'dropdown':
    case 'radio':
      baseElement.properties.options = ['Option 1', 'Option 2', 'Option 3'];
      break;
    case 'header':
      baseElement.properties.fontSize = 'large';
      baseElement.properties.alignment = 'left';
      break;
    case 'calculated':
      baseElement.properties.calculation = 'bmi';
      break;
    case 'number':
      baseElement.properties.step = 1;
      break;
    default:
      break;
  }
  
  return baseElement;
}

/**
 * Create an empty builder schema
 */
export function createEmptySchema(): BuilderSchema {
  return {
    version: 2,
    elements: []
  };
}

/**
 * Validate a builder element
 */
export function validateElement(element: BuilderElement): string[] {
  const errors: string[] = [];
  
  if (!element.id) {
    errors.push('Element is missing an ID');
  }
  
  if (!element.type || !ELEMENT_TYPES.includes(element.type)) {
    errors.push(`Invalid element type: ${element.type}`);
  }
  
  if (!element.name && !['divider', 'header'].includes(element.type)) {
    errors.push('Element is missing a field name');
  }
  
  // Validate field name format
  if (element.name && !/^[a-z][a-z0-9_]*$/.test(element.name)) {
    errors.push(`Invalid field name format: "${element.name}" (must start with letter, contain only lowercase letters, numbers, and underscores)`);
  }
  
  // Validate label
  if (!element.label && !['divider'].includes(element.type)) {
    errors.push('Element is missing a label');
  }
  
  // Type-specific validation
  if ((element.type === 'dropdown' || element.type === 'radio')) {
    if (!element.properties.options || element.properties.options.length === 0) {
      errors.push(`${ELEMENT_TYPE_LABELS[element.type]} must have at least one option`);
    }
    // Check for empty options
    if (element.properties.options?.some(opt => !opt || opt.trim() === '')) {
      errors.push(`${ELEMENT_TYPE_LABELS[element.type]} has empty option values`);
    }
    // Check for duplicate options
    const uniqueOptions = new Set(element.properties.options);
    if (uniqueOptions.size !== element.properties.options?.length) {
      errors.push(`${ELEMENT_TYPE_LABELS[element.type]} has duplicate options`);
    }
  }
  
  // Number validation
  if (element.type === 'number') {
    if (element.properties.min !== undefined && element.properties.max !== undefined) {
      if (element.properties.min > element.properties.max) {
        errors.push('Number field: min value is greater than max value');
      }
    }
  }
  
  // Calculated field validation
  if (element.type === 'calculated') {
    if (!element.properties.calculation) {
      errors.push('Calculated field must have a calculation type');
    }
    if (element.properties.calculation === 'custom' && !element.properties.calculationFormula) {
      errors.push('Custom calculation requires a formula');
    }
  }
  
  return errors;
}

/**
 * Validation result type with warnings
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a complete builder schema
 */
export function validateSchema(schema: BuilderSchema): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!schema) {
    return { valid: false, errors: ['Schema is empty'], warnings: [] };
  }
  
  if (schema.version !== 2) {
    errors.push('Invalid schema version');
  }
  
  if (!Array.isArray(schema.elements)) {
    errors.push('Elements must be an array');
    return { valid: false, errors, warnings };
  }
  
  // Warning for empty form
  if (schema.elements.length === 0) {
    warnings.push('Form has no elements - users will see an empty form');
  }
  
  // Check for duplicate field names
  const fieldNames = new Map<string, number>();
  
  schema.elements.forEach((element, index) => {
    const elementErrors = validateElement(element);
    elementErrors.forEach(err => {
      errors.push(`Element ${index + 1} (${element.label || element.type}): ${err}`);
    });
    
    // Track duplicate field names
    if (element.name) {
      const existingIndex = fieldNames.get(element.name);
      if (existingIndex !== undefined) {
        errors.push(`Duplicate field name "${element.name}" used by Element ${existingIndex + 1} and Element ${index + 1}`);
      } else {
        fieldNames.set(element.name, index);
      }
    }
    
    // Warnings
    if (element.required && element.prefill?.enabled && element.prefill.readonly) {
      // Required + prefilled + readonly is fine, but worth noting
    }
    
    // Warn about missing labels on input fields
    if (!element.label && isInputElement(element.type) && element.type !== 'divider') {
      warnings.push(`Element ${index + 1}: Input field has no label - users may be confused`);
    }
  });
  
  // Check for forms with no required fields
  const hasRequiredFields = schema.elements.some(el => el.required);
  if (!hasRequiredFields && schema.elements.length > 0) {
    warnings.push('Form has no required fields - consider marking important fields as required');
  }
  
  // Check for calculated fields without source fields
  const calculatedFields = schema.elements.filter(el => el.type === 'calculated');
  const inputFieldNames = schema.elements
    .filter(el => isInputElement(el.type) && el.type !== 'calculated')
    .map(el => el.name);
    
  calculatedFields.forEach(calc => {
    if (calc.properties.calculation === 'bmi') {
      const hasWeight = inputFieldNames.some(n => n?.includes('weight'));
      const hasHeight = inputFieldNames.some(n => n?.includes('height'));
      if (!hasWeight || !hasHeight) {
        warnings.push(`BMI calculation may not work - ensure you have fields named with 'weight' and 'height'`);
      }
    }
    if (calc.properties.calculation === 'age') {
      const hasDob = inputFieldNames.some(n => n?.includes('dob') || n?.includes('birth') || n?.includes('date_of_birth'));
      if (!hasDob) {
        warnings.push(`Age calculation may not work - ensure you have a date field for date of birth`);
      }
    }
  });
  
  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Check if an element is an input type (can hold values)
 */
export function isInputElement(type: ElementType): boolean {
  return !['divider', 'header'].includes(type);
}

/**
 * Check if an element can be prefilled
 */
export function canBePrefilled(type: ElementType): boolean {
  return ['text', 'number', 'date', 'dropdown'].includes(type);
}

/**
 * Check if an element can be required
 */
export function canBeRequired(type: ElementType): boolean {
  return isInputElement(type) && type !== 'calculated';
}

/**
 * Calculate grid position for a new element
 */
export function calculateNextPosition(elements: BuilderElement[]): ElementPosition {
  if (elements.length === 0) {
    return { row: 0, col: 0, width: 12 };
  }
  
  const lastElement = elements[elements.length - 1];
  return {
    row: lastElement.position.row + 1,
    col: 0,
    width: 12
  };
}

/**
 * Reorder elements by moving an element to a new index
 */
export function reorderElements(
  elements: BuilderElement[], 
  fromIndex: number, 
  toIndex: number
): BuilderElement[] {
  const result = [...elements];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  
  // Update positions
  return result.map((el, index) => ({
    ...el,
    position: { ...el.position, row: index }
  }));
}

/**
 * Clone an element with a new ID
 */
export function cloneElement(element: BuilderElement): BuilderElement {
  return {
    ...element,
    id: generateElementId(),
    name: `${element.name}_copy`,
    position: {
      ...element.position,
      row: element.position.row + 1
    }
  };
}

/**
 * Convert legacy variable-based schema (V1) to builder schema (V2)
 * For migration purposes
 * 
 * V1 schema structure:
 * - variables: string[] (list of variable names like ["patient_name", "diagnosis"])
 * - content: string (template content with {{variable}} placeholders)
 * 
 * V2 schema structure:
 * - version: 2
 * - elements: BuilderElement[] (full form elements)
 */
export function convertLegacySchema(legacySchema: any): BuilderSchema {
  const elements: BuilderElement[] = [];
  
  // Handle V1 schema with variables array of strings
  if (legacySchema?.variables && Array.isArray(legacySchema.variables)) {
    legacySchema.variables.forEach((variable: any, index: number) => {
      // Handle both string variables and object variables
      const variableName = typeof variable === 'string' ? variable : variable.name;
      const variableLabel = typeof variable === 'string' 
        ? formatVariableAsLabel(variable) 
        : (variable.label || formatVariableAsLabel(variable.name));
      
      // Infer element type from variable name
      const elementType = inferElementType(variableName);
      
      const element: BuilderElement = {
        id: generateElementId(),
        type: elementType,
        label: variableLabel,
        name: variableName || `field_${index + 1}`,
        required: typeof variable === 'object' ? (variable.required || false) : false,
        properties: {
          placeholder: typeof variable === 'object' ? (variable.placeholder || '') : '',
        },
        position: { row: index, col: 0, width: 12 }
      };
      
      // Add type-specific properties
      if (elementType === 'paragraph') {
        element.properties.rows = 4;
      } else if (elementType === 'number') {
        element.properties.step = 1;
      }
      
      // Infer prefill settings from variable name
      const prefillConfig = inferPrefillConfig(variableName);
      if (prefillConfig) {
        element.prefill = prefillConfig;
      }
      
      elements.push(element);
    });
  }
  
  return {
    version: 2,
    elements
  };
}

/**
 * Format a variable name as a human-readable label
 * e.g., "patient_name" -> "Patient Name"
 */
function formatVariableAsLabel(variableName: string): string {
  return variableName
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Infer element type from variable name
 */
function inferElementType(variableName: string): ElementType {
  const lowerName = variableName.toLowerCase();
  
  // Date fields
  if (lowerName.includes('date') || lowerName.includes('dob') || lowerName.includes('birth')) {
    return 'date';
  }
  
  // Number fields
  if (
    lowerName.includes('age') ||
    lowerName.includes('weight') ||
    lowerName.includes('height') ||
    lowerName.includes('count') ||
    lowerName.includes('quantity') ||
    lowerName.includes('amount') ||
    lowerName.includes('number') ||
    lowerName.includes('dose') ||
    lowerName.includes('duration')
  ) {
    return 'number';
  }
  
  // Paragraph/long text fields
  if (
    lowerName.includes('notes') ||
    lowerName.includes('description') ||
    lowerName.includes('comments') ||
    lowerName.includes('remarks') ||
    lowerName.includes('history') ||
    lowerName.includes('complaint') ||
    lowerName.includes('examination') ||
    lowerName.includes('findings') ||
    lowerName.includes('diagnosis') ||
    lowerName.includes('prescription') ||
    lowerName.includes('advice') ||
    lowerName.includes('instructions')
  ) {
    return 'paragraph';
  }
  
  // Default to text
  return 'text';
}

/**
 * Infer prefill configuration from variable name
 */
function inferPrefillConfig(variableName: string): PrefillConfig | null {
  const lowerName = variableName.toLowerCase();
  
  // Patient fields
  if (lowerName.includes('patient_name') || lowerName === 'patient') {
    return { enabled: true, source: 'patient', field: 'patient_name', readonly: true };
  }
  if (lowerName.includes('patient_phone') || lowerName.includes('phone')) {
    return { enabled: true, source: 'patient', field: 'patient_phone', readonly: true };
  }
  if (lowerName.includes('patient_age') || (lowerName.includes('age') && lowerName.includes('patient'))) {
    return { enabled: true, source: 'patient', field: 'patient_age', readonly: true };
  }
  if (lowerName.includes('patient_gender') || lowerName.includes('gender')) {
    return { enabled: true, source: 'patient', field: 'patient_gender', readonly: true };
  }
  
  // Doctor fields
  if (lowerName.includes('doctor_name') || lowerName === 'doctor') {
    return { enabled: true, source: 'doctor', field: 'doctor_name', readonly: true };
  }
  if (lowerName.includes('clinic')) {
    return { enabled: true, source: 'doctor', field: 'doctor_clinic', readonly: true };
  }
  
  // System fields
  if (lowerName === 'current_date' || lowerName === 'date' || lowerName === 'today') {
    return { enabled: true, source: 'system', field: 'current_date', readonly: true };
  }
  if (lowerName.includes('place') || lowerName.includes('location')) {
    return { enabled: true, source: 'system', field: 'place', readonly: false };
  }
  
  return null;
}

/**
 * Migration result interface
 */
export interface MigrationResult {
  success: boolean;
  originalSchema: any;
  newSchema: BuilderSchema;
  warnings: string[];
  changes: string[];
}

/**
 * Migrate a V1 template schema to V2 with detailed report
 */
export function migrateSchemaWithReport(legacySchema: any): MigrationResult {
  const warnings: string[] = [];
  const changes: string[] = [];
  
  // Check if already V2
  if (legacySchema?.version === 2 || legacySchema?.version === '2.0') {
    return {
      success: true,
      originalSchema: legacySchema,
      newSchema: legacySchema as BuilderSchema,
      warnings: ['Schema is already V2 format'],
      changes: []
    };
  }
  
  // Track original variables
  const originalVariables = legacySchema?.variables || [];
  changes.push(`Found ${originalVariables.length} variables to migrate`);
  
  // Convert
  const newSchema = convertLegacySchema(legacySchema);
  
  // Report changes
  newSchema.elements.forEach((el, i) => {
    const original = typeof originalVariables[i] === 'string' 
      ? originalVariables[i] 
      : originalVariables[i]?.name;
    
    if (el.type !== 'text') {
      changes.push(`Converted "${original}" to ${el.type} element (inferred from name)`);
    }
    
    if (el.prefill?.enabled) {
      changes.push(`Added prefill for "${original}" from ${el.prefill.source}.${el.prefill.field}`);
    }
  });
  
  // Warnings
  if (legacySchema?.content) {
    warnings.push('Original template content was not migrated - only form fields. You may need to recreate the document layout.');
  }
  
  if (originalVariables.length === 0) {
    warnings.push('No variables found in original schema');
  }
  
  return {
    success: true,
    originalSchema: legacySchema,
    newSchema,
    warnings,
    changes
  };
}
