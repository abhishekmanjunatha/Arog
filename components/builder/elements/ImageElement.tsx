'use client';

/**
 * Image Element Renderer
 * Renders images in forms with customization options
 */

import React from 'react';
import { BuilderElement } from '@/types/builder';

interface ImageElementProps {
  element: BuilderElement;
}

export function ImageElement({ element }: ImageElementProps) {
  const src = element.properties.src || '';
  const alt = element.properties.alt || 'Image';
  const width = element.properties.width || 200;
  const height = element.properties.height || 'auto';
  const alignment = element.properties.alignment || 'center';
  const objectFit = (element.properties.objectFit || 'contain') as 'contain' | 'cover' | 'fill' | 'none';
  const borderRadius = element.properties.borderRadius || 0;
  const caption = element.properties.caption || '';
  
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  const fitClasses = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
  };

  // Show placeholder if no src
  if (!src) {
    return (
      <div className={`flex ${alignClasses[alignment]} py-2`}>
        <div 
          className="border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center rounded-lg"
          style={{ 
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height === 'auto' ? '150px' : height
          }}
        >
          <div className="text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">No image selected</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${alignClasses[alignment]} py-2`}>
      <div className={`flex ${alignClasses[alignment]}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={`${fitClasses[objectFit]}`}
          style={{ 
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
            maxWidth: '100%'
          }}
        />
      </div>
      {caption && (
        <p className={`text-sm text-gray-500 mt-2 ${alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left'}`}>
          {caption}
        </p>
      )}
    </div>
  );
}

export default ImageElement;
