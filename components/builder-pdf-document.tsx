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
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    paddingBottom: 6,
  },
  fieldLabel: {
    width: '40%',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  fieldValue: {
    width: '60%',
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
    marginBottom: 8,
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

  const renderElement = (element: BuilderElement, index: number) => {
    // Skip dividers and headers - handle them separately
    if (element.type === 'divider') {
      return <View key={index} style={styles.divider} />
    }
    
    if (element.type === 'header') {
      return (
        <Text key={index} style={styles.sectionHeader}>
          {element.label}
        </Text>
      )
    }

    // Handle image elements
    if (element.type === 'image') {
      const src = element.properties.src
      const alt = element.properties.alt || 'Image'
      const caption = element.properties.caption
      const width = element.properties.width || 200
      const alignment = element.properties.alignment || 'center'
      
      if (!src) return null
      
      const alignStyle = alignment === 'center' 
        ? { alignItems: 'center' as const } 
        : alignment === 'right' 
          ? { alignItems: 'flex-end' as const } 
          : { alignItems: 'flex-start' as const }
      
      return (
        <View key={index} style={[styles.imageContainer, alignStyle]}>
          <Image 
            src={src} 
            style={{ width: width, maxWidth: '100%' }}
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
        <View key={index} style={showLine ? styles.customFooter : { marginTop: 20 }}>
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
      <View key={index} style={isCalculated ? [styles.fieldRow, styles.calculatedField] : styles.fieldRow}>
        <Text style={styles.fieldLabel}>{element.label}:</Text>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
    )
  }

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

        {/* Form Fields */}
        <View style={styles.section}>
          {elements.map((element, index) => renderElement(element, index))}
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
