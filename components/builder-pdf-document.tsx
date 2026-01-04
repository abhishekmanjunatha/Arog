'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import type { BuilderElement } from '@/types/builder'

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#0891b2',
    borderBottomStyle: 'solid',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
  },
  section: {
    marginBottom: 15,
  },
  // Grid row for side-by-side layout
  gridRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  // Grid column with flexible width
  gridCol: {
    paddingHorizontal: 4,
  },
  fieldContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    paddingBottom: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 11,
    color: '#111827',
  },
  divider: {
    marginVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    borderBottomStyle: 'solid',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    color: '#0891b2',
  },
  calculatedField: {
    backgroundColor: '#fef3c7',
    padding: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'center',
  },
  customFooter: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    borderTopStyle: 'solid',
  },
  customFooterText: {
    fontSize: 9,
    color: '#666666',
  },
  imageContainer: {
    marginVertical: 10,
  },
  image: {
    maxWidth: '100%',
  },
  imageCaption: {
    fontSize: 9,
    color: '#666666',
    marginTop: 4,
  },
})

interface BuilderPDFDocumentProps {
  title: string
  patientName: string
  doctorName?: string
  clinicName?: string
  elements: BuilderElement[]
  formData: Record<string, any>
  createdAt: string
}

export function BuilderPDFDocument({ 
  title, 
  patientName,
  doctorName,
  clinicName,
  elements, 
  formData,
  createdAt,
}: BuilderPDFDocumentProps) {

  const renderFieldValue = (element: BuilderElement): string => {
    const value = formData[element.name]
    
    if (value === undefined || value === null || value === '') {
      return '—'
    }
    
    if (element.type === 'date' && value) {
      try {
        return new Date(value).toLocaleDateString()
      } catch {
        return String(value)
      }
    }
    
    return String(value)
  }

  // Group elements by row for grid layout
  const groupElementsByRow = (elements: BuilderElement[]) => {
    const rows: { row: number; elements: BuilderElement[] }[] = []
    
    elements.forEach((element) => {
      const rowIndex = element.position?.row ?? rows.length
      const existingRow = rows.find(r => r.row === rowIndex)
      
      if (existingRow) {
        existingRow.elements.push(element)
      } else {
        rows.push({ row: rowIndex, elements: [element] })
      }
    })
    
    // Sort rows by row number and elements within each row by column
    rows.sort((a, b) => a.row - b.row)
    rows.forEach(row => {
      row.elements.sort((a, b) => (a.position?.col ?? 0) - (b.position?.col ?? 0))
    })
    
    return rows
  }

  const renderSingleElement = (element: BuilderElement, widthPercent: string) => {
    // Handle divider - full width
    if (element.type === 'divider') {
      return <View style={[styles.divider, { width: widthPercent }]} />
    }
    
    // Handle header - full width
    if (element.type === 'header') {
      return (
        <Text style={[styles.sectionHeader, { width: widthPercent }]}>
          {element.label}
        </Text>
      )
    }

    // Handle image elements
    if (element.type === 'image') {
      const src = element.properties.src
      const caption = element.properties.caption
      const imgWidth = element.properties.width || 200
      const alignment = element.properties.alignment || 'center'
      
      if (!src) return null
      
      const alignStyle = alignment === 'center' 
        ? { alignItems: 'center' as const } 
        : alignment === 'right' 
          ? { alignItems: 'flex-end' as const } 
          : { alignItems: 'flex-start' as const }
      
      return (
        <View style={[styles.imageContainer, alignStyle, { width: widthPercent }]}>
          <Image 
            src={src} 
            style={{ width: imgWidth, maxWidth: '100%' }}
          />
          {caption && (
            <Text style={[styles.imageCaption, { textAlign: alignment }]}>{caption}</Text>
          )}
        </View>
      )
    }

    // Handle footer elements
    if (element.type === 'footer') {
      const content = element.properties.content || 'Footer'
      const alignment = element.properties.alignment || 'center'
      const showLine = element.properties.showLine !== false
      
      return (
        <View style={[showLine ? styles.customFooter : { marginTop: 20 }, { width: widthPercent }]}>
          <Text style={[styles.customFooterText, { textAlign: alignment }]}>
            {content}
          </Text>
        </View>
      )
    }
    
    // Regular fields
    const value = renderFieldValue(element)
    const isCalculated = element.type === 'calculated'
    
    return (
      <View style={[styles.fieldContainer, ...(isCalculated ? [styles.calculatedField] : []), { width: widthPercent }]}>
        <Text style={styles.fieldLabel}>{element.label}:</Text>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
    )
  }

  const renderRow = (rowData: { row: number; elements: BuilderElement[] }, index: number) => {
    const { elements: rowElements } = rowData
    
    // Calculate total width used in this row
    const totalWidth = rowElements.reduce((sum, el) => sum + (el.position?.width ?? 12), 0)
    
    // If only one element and it's full width, render directly
    if (rowElements.length === 1 && (rowElements[0].position?.width ?? 12) === 12) {
      return (
        <View key={index} style={{ marginBottom: 8 }}>
          {renderSingleElement(rowElements[0], '100%')}
        </View>
      )
    }
    
    // Render as a row with multiple columns
    return (
      <View key={index} style={styles.gridRow}>
        {rowElements.map((element, elIndex) => {
          const elementWidth = element.position?.width ?? 12
          const widthPercent = `${(elementWidth / 12) * 100}%`
          
          return (
            <View key={elIndex} style={[styles.gridCol, { width: widthPercent }]}>
              {renderSingleElement(element, '100%')}
            </View>
          )
        })}
      </View>
    )
  }

  const rows = groupElementsByRow(elements)

  return (
    <Document title={title}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Patient: {patientName}
            {clinicName && ` • ${clinicName}`}
          </Text>
        </View>

        {/* Form Fields - Rendered with Grid Layout */}
        <View style={styles.section}>
          {rows.map((rowData, index) => renderRow(rowData, index))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Generated on {new Date(createdAt).toLocaleDateString()} at {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {doctorName && ` • ${doctorName}`}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
