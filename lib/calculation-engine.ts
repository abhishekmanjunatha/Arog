/**
 * Calculation Engine
 * Handles calculated fields in the Builder Engine
 * Supports BMI, Age, and custom formula calculations
 */

import { FormData, CalculationFunction, CalculationRegistry } from '@/types/builder';

/**
 * Calculate BMI from weight (kg) and height (cm)
 * Formula: BMI = weight / (height/100)^2
 */
export function calculateBMI(data: FormData): number | string {
  // Try to find weight and height fields
  const weight = findNumericField(data, ['weight', 'weight_kg', 'wt', 'body_weight']);
  const height = findNumericField(data, ['height', 'height_cm', 'ht', 'body_height']);
  
  if (weight === null || height === null) {
    return 'Enter weight and height';
  }
  
  if (weight <= 0 || height <= 0) {
    return 'Invalid values';
  }
  
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  return Math.round(bmi * 10) / 10; // Round to 1 decimal place
}

/**
 * Get BMI category based on BMI value
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(data: FormData): number | string {
  // Try to find date of birth field
  const dob = findDateField(data, [
    'date_of_birth', 'dob', 'birth_date', 'birthdate', 
    'patient_dob', 'patient_date_of_birth'
  ]);
  
  if (!dob) {
    return 'Enter date of birth';
  }
  
  const birthDate = new Date(dob);
  const today = new Date();
  
  if (isNaN(birthDate.getTime())) {
    return 'Invalid date';
  }
  
  if (birthDate > today) {
    return 'Future date';
  }
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Calculate age in months (useful for pediatric patients)
 */
export function calculateAgeInMonths(data: FormData): number | string {
  const dob = findDateField(data, [
    'date_of_birth', 'dob', 'birth_date', 'birthdate',
    'patient_dob', 'patient_date_of_birth'
  ]);
  
  if (!dob) {
    return 'Enter date of birth';
  }
  
  const birthDate = new Date(dob);
  const today = new Date();
  
  if (isNaN(birthDate.getTime())) {
    return 'Invalid date';
  }
  
  const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
    (today.getMonth() - birthDate.getMonth());
  
  return months;
}

/**
 * Calculate days between two dates
 */
export function calculateDaysBetween(data: FormData): number | string {
  const startDate = findDateField(data, ['start_date', 'from_date', 'admission_date']);
  const endDate = findDateField(data, ['end_date', 'to_date', 'discharge_date']);
  
  if (!startDate || !endDate) {
    return 'Enter both dates';
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'Invalid date';
  }
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Calculate sum of numeric fields
 */
export function calculateSum(data: FormData, fieldNames: string[]): number {
  let sum = 0;
  
  for (const name of fieldNames) {
    const value = data[name];
    if (typeof value === 'number') {
      sum += value;
    } else if (typeof value === 'string') {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        sum += num;
      }
    }
  }
  
  return sum;
}

/**
 * Calculate average of numeric fields
 */
export function calculateAverage(data: FormData, fieldNames: string[]): number | string {
  const values: number[] = [];
  
  for (const name of fieldNames) {
    const value = data[name];
    if (typeof value === 'number') {
      values.push(value);
    } else if (typeof value === 'string') {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        values.push(num);
      }
    }
  }
  
  if (values.length === 0) {
    return 'No values';
  }
  
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

/**
 * Parse and evaluate a custom formula
 * Supports basic math operations: +, -, *, /, ()
 * Field references use curly braces: {field_name}
 * 
 * Example: "{weight} / ({height} * {height} / 10000)"
 */
export function evaluateCustomFormula(formula: string, data: FormData): number | string {
  try {
    // Replace field references with values
    let expression = formula;
    const fieldPattern = /\{([^}]+)\}/g;
    let match;
    
    while ((match = fieldPattern.exec(formula)) !== null) {
      const fieldName = match[1];
      const value = data[fieldName];
      
      if (value === undefined || value === null || value === '') {
        return `Missing: ${fieldName}`;
      }
      
      const numValue = typeof value === 'number' ? value : parseFloat(String(value));
      if (isNaN(numValue)) {
        return `Invalid: ${fieldName}`;
      }
      
      expression = expression.replace(match[0], String(numValue));
    }
    
    // Validate expression only contains safe characters
    if (!/^[\d\s+\-*/().]+$/.test(expression)) {
      return 'Invalid formula';
    }
    
    // Evaluate the expression
    // Using Function constructor for controlled evaluation
    const result = Function(`"use strict"; return (${expression})`)();
    
    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      return 'Calculation error';
    }
    
    return Math.round(result * 100) / 100;
  } catch (error) {
    return 'Formula error';
  }
}

/**
 * Helper: Find a numeric value from a list of possible field names
 */
function findNumericField(data: FormData, possibleNames: string[]): number | null {
  for (const name of possibleNames) {
    const value = data[name];
    if (value !== undefined && value !== null && value !== '') {
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      if (!isNaN(num)) {
        return num;
      }
    }
  }
  return null;
}

/**
 * Helper: Find a date value from a list of possible field names
 */
function findDateField(data: FormData, possibleNames: string[]): string | null {
  for (const name of possibleNames) {
    const value = data[name];
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }
  return null;
}

/**
 * Registry of built-in calculation functions
 */
export const calculationRegistry: CalculationRegistry = {
  bmi: calculateBMI,
  age: calculateAge,
  age_months: calculateAgeInMonths,
  days_between: calculateDaysBetween,
};

/**
 * Execute a calculation based on type
 */
export function executeCalculation(
  calculationType: string, 
  data: FormData,
  customFormula?: string
): number | string {
  // Handle custom formula
  if (calculationType === 'custom' && customFormula) {
    return evaluateCustomFormula(customFormula, data);
  }
  
  // Use built-in calculation
  const calculator = calculationRegistry[calculationType];
  if (calculator) {
    return calculator(data);
  }
  
  return 'Unknown calculation';
}

/**
 * Get available calculation types
 */
export function getAvailableCalculations(): { value: string; label: string; description: string }[] {
  return [
    { 
      value: 'bmi', 
      label: 'BMI', 
      description: 'Calculates BMI from weight (kg) and height (cm)' 
    },
    { 
      value: 'age', 
      label: 'Age (Years)', 
      description: 'Calculates age from date of birth' 
    },
    { 
      value: 'age_months', 
      label: 'Age (Months)', 
      description: 'Calculates age in months from date of birth' 
    },
    { 
      value: 'days_between', 
      label: 'Days Between', 
      description: 'Calculates days between start and end date' 
    },
    { 
      value: 'custom', 
      label: 'Custom Formula', 
      description: 'Define a custom calculation using field values' 
    },
  ];
}
