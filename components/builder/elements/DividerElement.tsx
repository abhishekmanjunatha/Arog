'use client';

/**
 * Divider Element Renderer
 * Renders a horizontal divider line in forms
 */

import React from 'react';
import { BuilderElement } from '@/types/builder';

interface DividerElementProps {
  element: BuilderElement;
}

export function DividerElement({ element }: DividerElementProps) {
  return (
    <div className="py-3">
      <hr className="border-gray-300" />
    </div>
  );
}

export default DividerElement;
