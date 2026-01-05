/**
 * Keyboard Shortcuts Guide for Modal System
 * 
 * Global Shortcuts:
 * - ESC: Close any open modal
 * - TAB: Navigate forward through modal inputs
 * - SHIFT + TAB: Navigate backward through modal inputs
 * - ENTER: Submit form (when focused on input/textarea)
 * 
 * Modal Features:
 * - Auto-focus: Modal automatically focuses first interactive element
 * - Focus trap: Tab navigation stays within modal
 * - Focus restore: Returns focus to trigger element on close
 * - Backdrop click: Click outside modal to close
 * 
 * Accessibility:
 * - ARIA labels: All modals have proper role="dialog" and aria-modal="true"
 * - Screen reader support: Title and description properly announced
 * - Keyboard navigation: Fully accessible without mouse
 * 
 * Mobile Optimizations:
 * - Touch-friendly: Larger hit areas on mobile
 * - Responsive sizing: Adapts to screen size
 * - Scroll management: Prevents body scroll when modal open
 * - Full-height support: Modals can expand to fit content
 */

export const KEYBOARD_SHORTCUTS = {
  CLOSE_MODAL: 'Escape',
  NEXT_FIELD: 'Tab',
  PREVIOUS_FIELD: 'Shift+Tab',
  SUBMIT_FORM: 'Enter',
} as const

export const MODAL_ACCESSIBILITY_FEATURES = [
  'Auto-focus management',
  'Focus trap within modal',
  'Focus restoration on close',
  'ESC key to close',
  'Backdrop click to close',
  'ARIA labels and roles',
  'Screen reader support',
  'Keyboard-only navigation',
] as const
