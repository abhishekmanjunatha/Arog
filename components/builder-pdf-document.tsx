'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import type { BuilderElement, PrefillData } from '@/types/builder'

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
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
  // Patient Info styles
  patientInfoContainer: {
    marginVertical: 6,
    padding: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  patientInfoLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 3,
  },
  patientInfoValue: {
    fontSize: 12,
    color: '#1f2937',
  },
  // Document Header styles
  documentHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  documentHeaderLogo: {
    marginRight: 16,
  },
  documentHeaderInfo: {
    flex: 1,
  },
  documentHeaderName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  documentHeaderDesignation: {
    fontSize: 12,
    marginBottom: 2,
  },
  documentHeaderEducation: {
    fontSize: 10,
    marginBottom: 6,
  },
  documentHeaderContact: {
    flexDirection: 'row',
    marginTop: 4,
  },
  documentHeaderContactText: {
    fontSize: 10,
    marginRight: 20,
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
  prefillData?: PrefillData
}

export function BuilderPDFDocument({ 
  title, 
  patientName,
  doctorName,
  clinicName,
  elements, 
  formData,
  createdAt,
  prefillData,
}: BuilderPDFDocumentProps) {

  // Get patient info value for patient info elements
  const getPatientInfoValue = (element: BuilderElement): string => {
    if (!prefillData?.patient) {
      return '—';
    }
    const patient = prefillData.patient;
    switch (element.type) {
      case 'patientName':
        return patient.name || '—';
      case 'patientEmail':
        return patient.email || '—';
      case 'patientPhone':
        return patient.phone || '—';
      case 'patientAddress':
        return patient.address || '—';
      case 'patientAge':
        return patient.age ? `${patient.age} years` : '—';
      case 'patientGender':
        return patient.gender || '—';
      case 'patientBloodGroup':
        return patient.blood_group || '—';
      default:
        return '—';
    }
  };

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
      const alignment = element.properties.alignment || 'left'
      const fontSize = element.properties.fontSize === 'large' ? 16 : 
                       element.properties.fontSize === 'small' ? 12 : 14
      return (
        <Text style={[styles.sectionHeader, { width: widthPercent, textAlign: alignment, fontSize }]}>
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

    // Handle document header
    if (element.type === 'documentHeader') {
      // Use prefillData.doctor as fallback for doctor info
      const doctorFromPrefill = prefillData?.doctor;
      const doctorNameValue = element.properties.doctorName || doctorFromPrefill?.name || doctorName || 'Dr. [Name]';
      const designation = element.properties.designation || '';
      const education = element.properties.education || '';
      const phone = element.properties.phone || '';
      const email = element.properties.email || '';
      const logoSrc = element.properties.logoSrc;
      const logoWidth = element.properties.logoWidth || 60;
      const logoHeight = element.properties.logoHeight || 60;
      const showDoctorName = element.properties.showDoctorName !== false;
      const showDesignation = element.properties.showDesignation !== false;
      const showEducation = element.properties.showEducation !== false;
      const showPhone = element.properties.showPhone !== false;
      const showEmail = element.properties.showEmail !== false;
      const backgroundColor = element.properties.headerBackgroundColor || '#ffffff';
      const textColor = element.properties.headerTextColor || '#1f2937';
      const padding = element.properties.headerPadding || 16;
      const showBottomBorder = element.properties.showBottomBorder !== false;
      const headerLayout = element.properties.headerLayout || 'logo-left';
      const alignment = element.properties.alignment || 'left';
      
      // Determine text alignment style
      const textAlignStyle = alignment === 'center' ? 'center' : alignment === 'right' ? 'right' : 'left';
      
      return (
        <View style={[
          styles.documentHeader, 
          { 
            width: widthPercent, 
            backgroundColor,
            padding,
            borderBottomWidth: showBottomBorder ? 2 : 0,
            borderBottomColor: '#0891b2',
            borderBottomStyle: 'solid',
            flexDirection: headerLayout === 'logo-right' ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
          }
        ]}>
          {/* Logo - works with base64 data URLs or CORS-enabled URLs */}
          {logoSrc && (
            <View style={{ marginRight: headerLayout === 'logo-right' ? 0 : 16, marginLeft: headerLayout === 'logo-right' ? 16 : 0 }}>
              <Image 
                src={logoSrc}
                style={{ 
                  width: logoWidth, 
                  height: logoHeight, 
                  objectFit: 'contain',
                }}
                cache={false}
              />
            </View>
          )}
          
          {/* Doctor Info */}
          <View style={[styles.documentHeaderInfo, { alignItems: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start' }]}>
            {showDoctorName && (
              <Text style={[styles.documentHeaderName, { color: textColor, textAlign: textAlignStyle }]}>{doctorNameValue}</Text>
            )}
            {showDesignation && designation && (
              <Text style={[styles.documentHeaderDesignation, { color: textColor, textAlign: textAlignStyle }]}>{designation}</Text>
            )}
            {showEducation && education && (
              <Text style={[styles.documentHeaderEducation, { color: textColor, textAlign: textAlignStyle }]}>{education}</Text>
            )}
            {(showPhone && phone) || (showEmail && email) ? (
              <View style={[styles.documentHeaderContact, { justifyContent: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start' }]}>
                {showPhone && phone && (
                  <Text style={[styles.documentHeaderContactText, { color: textColor }]}>Tel: {phone}</Text>
                )}
                {showEmail && email && (
                  <Text style={[styles.documentHeaderContactText, { color: textColor }]}>Email: {email}</Text>
                )}
              </View>
            ) : null}
          </View>
        </View>
      );
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
    
    // Handle patient info elements
    if (['patientName', 'patientEmail', 'patientPhone', 'patientAddress', 'patientAge', 'patientGender', 'patientBloodGroup'].includes(element.type)) {
      // These elements are display-only and render patient data from prefillData
      const value = getPatientInfoValue(element);
      const showLabel = element.properties.showLabel !== false;
      const fontWeight = element.properties.fontWeight || 'normal';
      const fontSize = element.properties.fontSize || 'medium';
      const alignment = element.properties.alignment || 'left';
      
      const fontWeightStyle = fontWeight === 'bold' || fontWeight === 'semibold' ? 'bold' : 'normal';
      const fontSizeNum = fontSize === 'large' ? 14 : fontSize === 'small' ? 10 : 12;
      
      return (
        <View style={[styles.patientInfoContainer, { width: widthPercent, alignItems: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start' }]}>
          {showLabel && (
            <Text style={styles.patientInfoLabel}>{element.label}:</Text>
          )}
          <Text style={[styles.patientInfoValue, { fontWeight: fontWeightStyle, fontSize: fontSizeNum, textAlign: alignment }]}>
            {value}
          </Text>
        </View>
      );
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
  // Separate header and footer elements from content elements
  const documentHeaders = elements.filter(el => el.type === 'documentHeader')
  const footerElements = elements.filter(el => el.type === 'footer')
  const contentElements = elements.filter(el => el.type !== 'documentHeader' && el.type !== 'footer')
  
  const rows = calculateGridRows(contentElements)

  return (
    <Document title={title}>
      <Page size="A4" style={styles.page}>
        {/* Document Headers - Always at the top */}
        {documentHeaders.length > 0 ? (
          documentHeaders.map((headerEl, idx) => (
            <View key={`doc-header-${idx}`} style={{ marginBottom: 15 }}>
              {renderSingleElement(headerEl, '100%')}
            </View>
          ))
        ) : (
          /* Default Header if no documentHeader element */
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              Patient: {patientName}
              {clinicName && ` • ${clinicName}`}
            </Text>
          </View>
        )}

        {/* Form Fields - Rendered with Grid Layout */}
        <View style={[styles.section, { flexGrow: 1 }]}>
          {rows.map((rowData, index) => renderRow(rowData, index))}
        </View>

        {/* Custom Footer Elements - Always at the bottom */}
        {footerElements.length > 0 ? (
          footerElements.map((footerEl, idx) => (
            <View key={`footer-${idx}`} style={{ marginTop: 'auto' }}>
              {renderSingleElement(footerEl, '100%')}
            </View>
          ))
        ) : (
          /* Default Footer if no footer element */
          <View style={styles.footer}>
            <Text>
              Generated on {new Date(createdAt).toLocaleDateString()} at {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {doctorName && ` • ${doctorName}`}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  )
}
