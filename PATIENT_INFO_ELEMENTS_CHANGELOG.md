# Patient Information Elements - Implementation Summary

## Overview
Added 6 special patient information elements to the template builder system that automatically display patient data in documents. These are read-only, auto-filled elements with customizable display properties.

## New Element Types Added

1. **Patient Name** (`patientName`) - 👤
2. **Patient Email** (`patientEmail`) - 📧
3. **Patient Phone** (`patientPhone`) - 📞
4. **Patient Address** (`patientAddress`) - 📍
5. **Age & Gender** (`patientAgeGender`) - 🎂
6. **Blood Group** (`patientBloodGroup`) - 🩸

## Features

### Display Properties
Each patient info element supports:
- **Show Label**: Toggle label visibility
- **Label Position**: Top, Left, or Inline
- **Font Weight**: Normal, Medium, Semi-Bold, Bold
- **Font Size**: Small, Medium, Large
- **Text Transform**: None, UPPERCASE, lowercase, Capitalize
- **Text Alignment**: Left, Center, Right

### Auto-Fill Behavior
- Elements automatically populate with patient data
- Read-only (users cannot edit)
- Display placeholder text when data is unavailable
- Work in both form view and PDF output

## Files Modified

### Type Definitions
- **types/builder.ts**
  - Added 6 new element types to `ElementType` union
  - Added patient info properties to `ElementProperties` interface
  - Extended `PrefillData.patient` with `blood_group`, `address`, and `age` fields

### Builder Core
- **lib/builder-utils.ts**
  - Added to `ELEMENT_TYPES` array
  - Added to `ELEMENT_TYPE_LABELS` mapping
  - Added to `ELEMENT_TYPE_ICONS` mapping (emojis)
  - Added default properties in `createDefaultElement()` for each patient info type
  - Updated `canBePrefilled()` to exclude patient info elements (they have dedicated auto-fill)
  - Updated `canBeRequired()` to exclude patient info elements (always auto-filled)

### Builder UI Components
- **components/builder/ElementPalette.tsx**
  - Added 6 new elements to the palette with Lucide icons
  - Icons: User, Mail, Phone, MapPin, UserCircle, Droplet

- **components/builder/CanvasElement.tsx**
  - Imported 6 new Lucide icons
  - Added patient info icons to `ELEMENT_ICONS` mapping
  - Added patient info rendering in canvas preview with styled display

- **components/builder/PropertiesPanel.tsx**
  - Added patient info properties section in `TypeSpecificProperties`
  - Configuration UI for all display properties
  - Info banner explaining auto-fill behavior

### Form Rendering
- **components/builder/elements/PatientInfoElement.tsx** (NEW FILE)
  - Created dedicated component for rendering patient info elements
  - Handles all display property styles
  - Auto-fills from `prefillData.patient`
  - Shows "Not provided" placeholder for missing data

- **components/builder/elements/index.ts**
  - Exported `PatientInfoElement`

- **components/builder/FormRenderer.tsx**
  - Imported `PatientInfoElement`
  - Added cases for all 6 patient info types in `renderElement()`
  - Updated `validateForm()` to skip patient info elements (read-only)

### PDF Generation
- **components/builder-pdf-document.tsx**
  - Added patient info element rendering in PDF
  - Applied display properties (font weight, size, alignment)
  - Added `patientInfoContainer`, `patientInfoLabel`, and `patientInfoValue` styles
  - Styled with light blue background matching form view

## Usage

### Adding to Templates
1. Open template builder
2. Find patient info elements in the Element Palette
3. Drag or click to add to canvas
4. Configure display properties in Properties Panel

### Displaying in Documents
When a document is generated:
1. System automatically provides patient data in `prefillData`
2. Patient info elements render with data from `prefillData.patient`
3. Elements display "Not provided" if patient data is missing
4. Styling is preserved in both form view and PDF

## Data Flow
```
Patient Record (Database)
    ↓
PrefillData Object
    ↓
PatientInfoElement Component
    ↓
Rendered Display (Form/PDF)
```

## Technical Notes

### Auto-Fill Logic
- Patient info elements bypass the standard prefill engine
- They directly access `prefillData.patient` fields
- Age is calculated separately (not stored in database)
- Gender and age combined in single `patientAgeGender` element

### Validation
- Patient info elements excluded from form validation
- Cannot be marked as "required" (always auto-filled)
- Cannot have prefill configuration (they auto-fill by design)

### Styling
- Canvas preview shows blue gradient background
- PDF uses light blue background (`#eff6ff`)
- All style properties applied consistently in both views

## Testing Checklist
- [x] Elements appear in ElementPalette
- [ ] Elements can be added to canvas
- [ ] Properties panel shows correct options
- [ ] Canvas preview displays correctly
- [ ] Form renderer shows patient data
- [ ] PDF generation includes patient info
- [ ] Styling properties work as expected
- [ ] Missing data shows placeholder text

## Future Enhancements
- Consider adding more patient fields (allergies, medical history)
- Add conditional visibility based on data availability
- Support for custom date formatting (date_of_birth)
- Localization support for labels
