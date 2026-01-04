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
  // Medical History styles
  medicalHistoryContainer: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  medicalHistoryLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
  },
  medicalHistoryParagraph: {
    fontSize: 10,
    color: '#111827',
    marginBottom: 4,
    lineHeight: 1.4,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 8,
  },
  bulletPoint: {
    fontSize: 10,
    marginRight: 6,
    color: '#6b7280',
  },
  bulletText: {
    fontSize: 10,
    color: '#111827',
    flex: 1,
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

  // Calculate rows dynamically based on element widths
  // This mimics how CSS Grid flows elements (12-column grid)
  const calculateGridRows = (elements: BuilderElement[]) => {
    const rows: { elements: BuilderElement[] }[] = []
    let currentRow: BuilderElement[] = []
    let currentRowWidth = 0
    
    elements.forEach((element) => {
      const elementWidth = element.position?.width ?? 12
      
      // Check if element fits in current row (12 columns total)
      if (currentRowWidth + elementWidth > 12) {
        // Element doesn't fit, start a new row
        if (currentRow.length > 0) {
          rows.push({ elements: currentRow })
        }
        currentRow = [element]
        currentRowWidth = elementWidth
      } else {
        // Element fits in current row
        currentRow.push(element)
        currentRowWidth += elementWidth
      }
      
      // If we've exactly filled the row, start a new one
      if (currentRowWidth === 12) {
        rows.push({ elements: currentRow })
        currentRow = []
        currentRowWidth = 0
      }
    })
    
    // Don't forget the last row if it has elements
    if (currentRow.length > 0) {
      rows.push({ elements: currentRow })
    }
    
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

    // Handle medical history - rich text with bullets/lists
    if (element.type === 'medicalHistory') {
      const value = formData[element.name]
      if (!value) {
        return (
          <View style={[styles.medicalHistoryContainer, { width: widthPercent }]}>
            <Text style={styles.medicalHistoryLabel}>{element.label}:</Text>
            <Text style={styles.medicalHistoryParagraph}>—</Text>
          </View>
        )
      }

      // Parse the text to identify bullets, numbered lists, and paragraphs
      const lines = String(value).split('\n')
      const renderMedicalHistoryContent = () => {
        return lines.map((line, idx) => {
          const trimmedLine = line.trim()
          
          // Skip empty lines
          if (!trimmedLine) return null
          
          // Bullet point (starts with - or *)
          if (/^[-*]\s/.test(trimmedLine)) {
            return (
              <View key={idx} style={styles.bulletItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>{trimmedLine.replace(/^[-*]\s/, '')}</Text>
              </View>
            )
          }
          
          // Numbered list (starts with number.)
          if (/^\d+\.\s/.test(trimmedLine)) {
            const match = trimmedLine.match(/^(\d+)\.\s(.*)/)
            if (match) {
              return (
                <View key={idx} style={styles.bulletItem}>
                  <Text style={styles.bulletPoint}>{match[1]}.</Text>
                  <Text style={styles.bulletText}>{match[2]}</Text>
                </View>
              )
            }
          }
          
          // Regular paragraph
          return (
            <Text key={idx} style={styles.medicalHistoryParagraph}>{trimmedLine}</Text>
          )
        }).filter(Boolean)
      }

      return (
        <View style={[styles.medicalHistoryContainer, { width: widthPercent }]}>
          <Text style={styles.medicalHistoryLabel}>{element.label}:</Text>
          {renderMedicalHistoryContent()}
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

  const renderRow = (rowData: { elements: BuilderElement[] }, index: number) => {
    const { elements: rowElements } = rowData
    
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

  // Calculate rows dynamically based on widths (mimics CSS Grid behavior)
  const rows = calculateGridRows(elements)

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
