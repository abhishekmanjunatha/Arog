'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  content: {
    whiteSpace: 'pre-wrap',
  },
  line: {
    marginBottom: 4,
  },
})

interface PDFDocumentProps {
  content: string
  title: string
}

export function PDFDocument({ content, title }: PDFDocumentProps) {
  // Split content into lines for better rendering
  const lines = content.split('\n')

  return (
    <Document title={title}>
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          {lines.map((line, index) => (
            <Text key={index} style={styles.line}>
              {line || ' '}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  )
}
