'use client'

import React, { useEffect, useState } from 'react'

interface PDFViewerProps {
  content: string
  title: string
}

export function PDFViewer({ content, title }: PDFViewerProps) {
  const [PDFViewer, setPDFViewer] = useState<any>(null)
  const [PDFDocument, setPDFDocument] = useState<any>(null)

  useEffect(() => {
    // Dynamically import @react-pdf/renderer on client side only
    Promise.all([
      import('@react-pdf/renderer'),
      import('./pdf-document')
    ]).then(([reactPdf, pdfDoc]) => {
      setPDFViewer(() => reactPdf.PDFViewer)
      setPDFDocument(() => pdfDoc.PDFDocument)
    })
  }, [])

  if (!PDFViewer || !PDFDocument) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        Loading PDF viewer...
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <PDFViewer width="100%" height="100%">
        <PDFDocument content={content} title={title} />
      </PDFViewer>
    </div>
  )
}
