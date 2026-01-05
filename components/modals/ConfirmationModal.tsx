'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive' | 'warning' | 'info'
  loading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirm()
    } finally {
      setIsProcessing(false)
    }
  }

  const variantConfig = {
    default: {
      icon: CheckCircle2,
      iconClass: 'text-primary bg-primary/10',
      buttonVariant: 'default' as const,
    },
    destructive: {
      icon: AlertTriangle,
      iconClass: 'text-destructive bg-destructive/10',
      buttonVariant: 'destructive' as const,
    },
    warning: {
      icon: AlertTriangle,
      iconClass: 'text-amber-600 bg-amber-100 dark:bg-amber-900/20',
      buttonVariant: 'default' as const,
    },
    info: {
      icon: Info,
      iconClass: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      buttonVariant: 'default' as const,
    },
  }

  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="text-center">
        {/* Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-4">
          <div className={`p-3 rounded-full ${config.iconClass}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>

        {/* Message */}
        <p className="text-sm text-muted-foreground mb-6">{message}</p>

        {/* Actions - Mobile responsive */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing || loading}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={isProcessing || loading}
            className="w-full sm:w-auto"
          >
            {isProcessing || loading ? 'Processing...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
