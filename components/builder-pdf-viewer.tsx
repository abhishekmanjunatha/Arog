'use client'

import React, { useEffect, useState } from 'react'
import type { BuilderElement, PrefillData } from '@/types/builder'

interface BuilderPDFViewerProps {
  title: string
  patientName: string
  doctorName?: string
  clinicName?: string
  elements: BuilderElement[]
  formData: Record<string, any>
  createdAt: string
  prefillData?: PrefillData
}

export function BuilderPDFViewer(props: BuilderPDFViewerProps) {
  const [PDFViewer, setPDFViewer] = useState<any>(null)
  const [BuilderPDFDoc, setBuilderPDFDoc] = useState<any>(null)

  useEffect(() => {
    // Dynamically import @react-pdf/renderer on client side only
    Promise.all([
      import('@react-pdf/renderer'),
      import('./builder-pdf-document')
    ]).then(([reactPdf, pdfDoc]) => {
      setPDFViewer(() => reactPdf.PDFViewer)
      setBuilderPDFDoc(() => pdfDoc.BuilderPDFDocument)
    })
  }, [])

  if (!PDFViewer || !BuilderPDFDoc) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e7eb',
          borderTopColor: '#0891b2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <span style={{ color: '#6b7280', fontSize: '14px' }}>Loading PDF viewer...</span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <PDFViewer width="100%" height="100%">
        <BuilderPDFDoc {...props} />
      </PDFViewer>
    </div>
  )
}
