'use client';

/**
 * Patient Info Element Renderer
 * Renders patient information fields (name, email, phone, address, etc.)
 * These are display-only fields that auto-fill from patient data
 */

import React from 'react';
import { BuilderElement, PrefillData } from '@/types/builder';
import { User, Mail, Phone, MapPin, UserCircle, Droplet, Calendar } from 'lucide-react';

interface PatientInfoElementProps {
  element: BuilderElement;
  prefillData?: PrefillData;
  disabled?: boolean;
}

const ICONS = {
  patientName: User,
  patientEmail: Mail,
  patientPhone: Phone,
  patientAddress: MapPin,
  patientAge: Calendar,
  patientGender: UserCircle,
  patientBloodGroup: Droplet,
};

export function PatientInfoElement({ 
  element, 
  prefillData,
}: PatientInfoElementProps) {
  const Icon = ICONS[element.type as keyof typeof ICONS] || User;

  // Get patient data value
  const getValue = () => {
    if (!prefillData?.patient) {
      return '';
    }

    const patient = prefillData.patient;
    
    switch (element.type) {
      case 'patientName':
        return patient.name || '';
      case 'patientEmail':
        return patient.email || '';
      case 'patientPhone':
        return patient.phone || '';
      case 'patientAddress':
        return patient.address || '';
      case 'patientAge':
        return patient.age ? `${patient.age} years` : '';
      case 'patientGender':
        return patient.gender || '';
      case 'patientBloodGroup':
        return patient.blood_group || '';
      default:
        return '';
    }
  };

  const value = getValue();
  const showLabel = element.properties.showLabel !== false;
  const labelPosition = element.properties.labelPosition || 'top';
  const fontWeight = element.properties.fontWeight || 'normal';
  const fontSize = element.properties.fontSize || 'medium';
  const textTransform = element.properties.textTransform || 'none';
  const alignment = element.properties.alignment || 'left';

  const fontWeightClass = 
    fontWeight === 'bold' ? 'font-bold' :
    fontWeight === 'semibold' ? 'font-semibold' :
    fontWeight === 'medium' ? 'font-medium' : 'font-normal';

  const fontSizeClass = 
    fontSize === 'large' ? 'text-lg' :
    fontSize === 'small' ? 'text-sm' : 'text-base';

  const textTransformClass =
    textTransform === 'uppercase' ? 'uppercase' :
    textTransform === 'lowercase' ? 'lowercase' :
    textTransform === 'capitalize' ? 'capitalize' : '';

  const alignmentClass = 
    alignment === 'center' ? 'text-center' :
    alignment === 'right' ? 'text-right' : 'text-left';

  return (
    <div className={`mb-4 ${alignmentClass}`}>
      {showLabel && labelPosition === 'top' && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {element.label}
        </label>
      )}

      <div className={`flex items-center gap-2 ${
        labelPosition === 'left' ? 'flex-row' : ''
      }`}>
        {showLabel && labelPosition === 'left' && (
          <label className="text-sm font-medium text-gray-700 mr-2">
            {element.label}:
          </label>
        )}

        <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-50/30 border border-blue-200/50 rounded-lg flex-1">
          <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
          
          {showLabel && labelPosition === 'inline' && (
            <span className="text-sm text-gray-600 mr-2">
              {element.label}:
            </span>
          )}

          <span className={`${fontWeightClass} ${fontSizeClass} ${textTransformClass} text-gray-800 flex-1`}>
            {value || <span className="text-gray-400 italic">Not provided</span>}
          </span>
        </div>
      </div>
    </div>
  );
}

export default PatientInfoElement;
