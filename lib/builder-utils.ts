/**
 * Builder Utilities
 * Validation and helper functions for the Builder Engine
 */

import { 
  BuilderElement, 
  BuilderSchema, 
  ElementType,
  ElementPosition 
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
  
  if (!element.name) {
    errors.push('Element is missing a field name');
  }
  
  // Type-specific validation
  if ((element.type === 'dropdown' || element.type === 'radio')) {
    if (!element.properties.options || element.properties.options.length === 0) {
      errors.push(`${ELEMENT_TYPE_LABELS[element.type]} must have at least one option`);
    }
  }
  
  return errors;
}

/**
 * Validate a complete builder schema
 */
export function validateSchema(schema: BuilderSchema): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!schema) {
    return { valid: false, errors: ['Schema is empty'] };
  }
  
  if (schema.version !== 2) {
    errors.push('Invalid schema version');
  }
  
  if (!Array.isArray(schema.elements)) {
    errors.push('Elements must be an array');
    return { valid: false, errors };
  }
  
  // Check for duplicate field names
  const fieldNames = new Set<string>();
  
  schema.elements.forEach((element, index) => {
    const elementErrors = validateElement(element);
    elementErrors.forEach(err => {
      errors.push(`Element ${index + 1}: ${err}`);
    });
    
    if (element.name) {
      if (fieldNames.has(element.name)) {
        errors.push(`Duplicate field name: ${element.name}`);
      }
      fieldNames.add(element.name);
    }
  });
  
  return { valid: errors.length === 0, errors };
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
 * Convert legacy variable-based schema to builder schema
 * For migration purposes
 */
export function convertLegacySchema(legacySchema: any): BuilderSchema {
  const elements: BuilderElement[] = [];
  
  if (legacySchema?.variables && Array.isArray(legacySchema.variables)) {
    legacySchema.variables.forEach((variable: any, index: number) => {
      elements.push({
        id: generateElementId(),
        type: 'text',
        label: variable.label || variable.name || `Field ${index + 1}`,
        name: variable.name || `field_${index + 1}`,
        required: variable.required || false,
        properties: {
          placeholder: variable.placeholder || ''
        },
        position: { row: index, col: 0, width: 12 }
      });
    });
  }
  
  return {
    version: 2,
    elements
  };
}
