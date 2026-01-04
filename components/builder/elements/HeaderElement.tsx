'use client';

/**
 * Header Element Renderer
 * Renders section headers in forms
 */

import React from 'react';
import { BuilderElement } from '@/types/builder';

interface HeaderElementProps {
  element: BuilderElement;
}

export function HeaderElement({ element }: HeaderElementProps) {
  const fontSize = element.properties.fontSize || 'large';
  const alignment = element.properties.alignment || 'left';
  
  const sizeClasses = {
    large: 'text-xl font-bold',
    medium: 'text-lg font-semibold',
    small: 'text-base font-medium',
  };
  
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`py-2 ${alignClasses[alignment]}`}>
      <h3 className={`text-gray-900 ${sizeClasses[fontSize]}`}>
        {element.label || 'Section Header'}
      </h3>
    </div>
  );
}

export default HeaderElement;
