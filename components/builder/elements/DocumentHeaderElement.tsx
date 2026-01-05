'use client';

/**
 * Document Header Element Renderer
 * Renders a professional document header with logo, doctor info, and contact details
 */

import React from 'react';
import { BuilderElement, PrefillData } from '@/types/builder';
import { Building2, Phone, Mail } from 'lucide-react';

interface DocumentHeaderElementProps {
  element: BuilderElement;
  prefillData?: PrefillData;
}

export function DocumentHeaderElement({ 
  element,
  prefillData
}: DocumentHeaderElementProps) {
  
  // Get properties with defaults
  const logoSrc = element.properties.logoSrc;
  const logoWidth = element.properties.logoWidth || 80;
  const logoHeight = element.properties.logoHeight || 80;
  const logoPosition = element.properties.logoPosition || 'left';
  const headerLayout = element.properties.headerLayout || 'logo-left';
  
  // Doctor information - use element properties FIRST, then auto-fill from prefillData
  // This matches the PDF rendering logic for consistency
  const doctorName = element.properties.doctorName || prefillData?.doctor?.name || 'Dr. [Name]';
  const designation = element.properties.designation || '';
  const education = element.properties.education || '';
  const phone = element.properties.phone || '';
  const email = element.properties.email || '';
  
  // Display toggles
  const showDoctorName = element.properties.showDoctorName !== false;
  const showDesignation = element.properties.showDesignation !== false;
  const showEducation = element.properties.showEducation !== false;
  const showPhone = element.properties.showPhone !== false;
  const showEmail = element.properties.showEmail !== false;
  
  // Styling
  const backgroundColor = element.properties.headerBackgroundColor || '#ffffff';
  const textColor = element.properties.headerTextColor || '#1f2937';
  const padding = element.properties.headerPadding || 16;
  const showBottomBorder = element.properties.showBottomBorder !== false;
  const alignment = element.properties.alignment || 'left';

  // Render logo
  const renderLogo = () => {
    if (!logoSrc) {
      return (
        <div 
          className="flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300"
          style={{ width: logoWidth, height: logoHeight }}
        >
          <Building2 className="w-8 h-8 text-gray-400" />
        </div>
      );
    }

    return (
      <img 
        src={logoSrc}
        alt="Clinic Logo"
        className="rounded-lg object-contain"
        style={{ width: logoWidth, height: logoHeight }}
      />
    );
  };

  // Render doctor info
  const renderDoctorInfo = () => (
    <div className={`flex-1 ${
      alignment === 'center' ? 'text-center' :
      alignment === 'right' ? 'text-right' : 'text-left'
    }`}>
      {showDoctorName && (
        <h2 
          className="text-2xl font-bold mb-1"
          style={{ color: textColor }}
        >
          {doctorName}
        </h2>
      )}
      {showDesignation && designation && (
        <p 
          className="text-sm font-medium mb-1"
          style={{ color: textColor, opacity: 0.8 }}
        >
          {designation}
        </p>
      )}
      {showEducation && education && (
        <p 
          className="text-xs mb-2"
          style={{ color: textColor, opacity: 0.7 }}
        >
          {education}
        </p>
      )}
      <div className="flex gap-3 flex-wrap mt-2" style={{
        justifyContent: alignment === 'center' ? 'center' :
                        alignment === 'right' ? 'flex-end' : 'flex-start'
      }}>
        {showPhone && phone && (
          <div className="flex items-center gap-1 text-sm" style={{ color: textColor, opacity: 0.8 }}>
            <Phone className="w-3.5 h-3.5" />
            <span>{phone}</span>
          </div>
        )}
        {showEmail && email && (
          <div className="flex items-center gap-1 text-sm" style={{ color: textColor, opacity: 0.8 }}>
            <Mail className="w-3.5 h-3.5" />
            <span>{email}</span>
          </div>
        )}
      </div>
    </div>
  );

  // Render based on layout
  const renderContent = () => {
    switch (headerLayout) {
      case 'logo-left':
        return (
          <div className="flex items-start gap-4">
            {renderLogo()}
            {renderDoctorInfo()}
          </div>
        );
      
      case 'logo-right':
        return (
          <div className="flex items-start gap-4">
            {renderDoctorInfo()}
            {renderLogo()}
          </div>
        );
      
      case 'logo-center':
        return (
          <div className="flex flex-col items-center gap-3">
            {renderLogo()}
            {renderDoctorInfo()}
          </div>
        );
      
      case 'two-column':
        return (
          <div className="grid grid-cols-2 gap-6">
            <div className="flex justify-start">
              {renderLogo()}
            </div>
            <div className="flex items-center">
              {renderDoctorInfo()}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-start gap-4">
            {renderLogo()}
            {renderDoctorInfo()}
          </div>
        );
    }
  };

  return (
    <div 
      className={`mb-4 ${showBottomBorder ? 'border-b-2' : ''}`}
      style={{ 
        backgroundColor,
        padding: `${padding}px`,
        borderColor: showBottomBorder ? textColor : 'transparent',
        borderBottomWidth: showBottomBorder ? '2px' : '0'
      }}
    >
      {renderContent()}
    </div>
  );
}

export default DocumentHeaderElement;
