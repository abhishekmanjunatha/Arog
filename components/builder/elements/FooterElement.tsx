'use client';

/**
 * Footer Element Renderer
 * Renders document footer sections with customization options
 */

import React from 'react';
import { BuilderElement } from '@/types/builder';

interface FooterElementProps {
  element: BuilderElement;
}

export function FooterElement({ element }: FooterElementProps) {
  const content = element.properties.content || 'Footer Text';
  const alignment = element.properties.alignment || 'center';
  const fontSize = element.properties.fontSize || 'small';
  const showLine = element.properties.showLine !== false;
  const textColor = element.properties.textColor || '#666666';
  const backgroundColor = element.properties.backgroundColor || 'transparent';
  const paddingTop = element.properties.paddingTop || 16;
  const paddingBottom = element.properties.paddingBottom || 8;
  
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  return (
    <div 
      className="w-full"
      style={{ 
        backgroundColor,
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`
      }}
    >
      {showLine && (
        <hr className="border-gray-300 mb-3" />
      )}
      <div className={`${alignClasses[alignment]} ${sizeClasses[fontSize]}`} style={{ color: textColor }}>
        {content.split('\n').map((line: string, index: number) => (
          <p key={index} className="leading-relaxed">
            {line || '\u00A0'}
          </p>
        ))}
      </div>
    </div>
  );
}

export default FooterElement;
