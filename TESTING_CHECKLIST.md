# Builder Engine V2 - Testing Checklist

This document provides a comprehensive testing checklist for the Builder Engine V2 implementation.

## Test Environment Setup

Before testing, ensure:
- [ ] Feature flag enabled: `NEXT_PUBLIC_ENABLE_BUILDER_V2=true`
- [ ] Database migrations applied (builder_version column exists)
- [ ] At least one patient exists in the system
- [ ] At least one appointment exists

---

## Phase 1: Template Creation

### 1.1 Create Builder Template
- [ ] Navigate to Templates → "Create Builder Template"
- [ ] Enter template name, category, description
- [ ] Verify 3-panel layout loads (palette, canvas, properties)

### 1.2 Element Palette
- [ ] All 9 element types visible in palette
- [ ] Can click element to add to canvas
- [ ] Can drag element to canvas
- [ ] Elements appear in correct order

### 1.3 Canvas Operations
- [ ] Empty state shows "Start building your form"
- [ ] Elements can be selected (blue border appears)
- [ ] Can drag to reorder elements
- [ ] Can delete element (with confirmation)
- [ ] Can duplicate element
- [ ] Undo/Redo works correctly

### 1.4 Properties Panel
- [ ] Shows "Select an element" when none selected
- [ ] Shows element properties when selected
- [ ] Label field updates element preview
- [ ] Field name auto-generates from label
- [ ] Required checkbox toggles correctly
- [ ] Layout width selector works (full, half, third, etc.)

### 1.5 Element-Specific Properties
| Element | Test |
|---------|------|
| Text | Placeholder, default value |
| Number | Min, max, step, placeholder |
| Paragraph | Rows setting |
| Dropdown | Add/remove/edit options |
| Radio | Add/remove/edit options |
| Date | Default value |
| Calculated | Calculation type dropdown |
| Header | Font size, alignment |
| Divider | Renders as horizontal line |

### 1.6 Prefill Configuration
- [ ] Prefill toggle enables/disables
- [ ] Source dropdown shows: Patient, Doctor, Appointment, System
- [ ] Field dropdown updates based on source
- [ ] Read-only checkbox works
- [ ] Prefill badge appears on canvas element

### 1.7 Validation
- [ ] Save shows errors for invalid schema
- [ ] Duplicate field names detected
- [ ] Empty labels show warning
- [ ] Missing options for dropdown/radio detected
- [ ] Can dismiss validation modal
- [ ] "Save Anyway" works for warnings-only

### 1.8 Save Template
- [ ] Save button triggers validation
- [ ] Valid template saves successfully
- [ ] Redirects to template list or detail page
- [ ] Template appears in list with "Builder V2" badge

---

## Phase 2: Template Editing

### 2.1 Edit Existing Template
- [ ] Can open edit page for V2 template
- [ ] Existing elements load correctly
- [ ] Can modify element properties
- [ ] Can add new elements
- [ ] Can delete elements
- [ ] Can reorder elements
- [ ] Save updates template

### 2.2 Template List
- [ ] V1 templates show "V1" badge
- [ ] V2 templates show "Builder V2" badge
- [ ] Correct edit link based on version

---

## Phase 3: Document Generation

### 3.1 Create Document from V2 Template
- [ ] Navigate to Documents → New (Builder)
- [ ] Select V2 template from dropdown
- [ ] Select patient
- [ ] Select appointment (optional)
- [ ] Form renders with all elements

### 3.2 Form Rendering
- [ ] All element types render correctly
- [ ] Grid layout respected (elements at correct widths)
- [ ] Labels and placeholders display correctly
- [ ] Required fields marked with asterisk

### 3.3 Prefill Functionality
- [ ] Patient fields auto-populate (name, phone, etc.)
- [ ] Doctor fields auto-populate
- [ ] System date/time populate correctly
- [ ] Read-only fields are disabled (gray background, lock icon)
- [ ] Cannot edit read-only prefilled values

### 3.4 Calculated Fields
| Calculation | Test Steps | Expected Result |
|-------------|------------|-----------------|
| BMI | Enter weight (70kg), height (1.75m) | BMI = 22.86 |
| Age | Enter DOB (1990-01-15) | Age in years |
| Age (months) | Enter DOB for infant | Age in months |

### 3.5 Form Validation
- [ ] Required fields prevent submission if empty
- [ ] Number min/max enforced
- [ ] Error messages display clearly
- [ ] Errors clear when field corrected

### 3.6 Document Submission
- [ ] Submit button enabled when valid
- [ ] Document saves to database
- [ ] Redirects to document detail page
- [ ] Document appears in documents list

---

## Phase 4: PDF Export

### 4.1 PDF Generation
- [ ] Click "Download PDF" on document detail
- [ ] PDF viewer opens in new tab
- [ ] PDF contains all form data

### 4.2 PDF Content Verification
- [ ] Header elements formatted correctly
- [ ] Dividers appear as horizontal lines
- [ ] Labels and values properly paired
- [ ] Prefilled values included
- [ ] Calculated values included
- [ ] Grid layout approximated in PDF

### 4.3 PDF Download
- [ ] Can download PDF to device
- [ ] PDF opens in external viewer
- [ ] File name includes template/patient name

---

## Phase 5: Migration (V1 to V2)

### 5.1 Migrate Template
- [ ] "Upgrade to V2" button visible on V1 template
- [ ] Button not visible on V2 template
- [ ] Click opens migration modal
- [ ] Preview shows what will change

### 5.2 Migration Execution
- [ ] Click "Start Migration"
- [ ] Migration completes successfully
- [ ] Changes listed in result
- [ ] Warnings shown if applicable
- [ ] Template now shows V2 badge

### 5.3 Post-Migration
- [ ] Can edit migrated template in builder
- [ ] Elements converted from variables
- [ ] Field types inferred correctly
- [ ] Prefill settings auto-detected

---

## Phase 6: Edge Cases

### 6.1 Empty States
- [ ] Empty template (no elements) - warning shown
- [ ] Empty canvas drop zone works
- [ ] Empty form submission blocked

### 6.2 Large Templates
- [ ] Template with 20+ elements loads
- [ ] Template with 50+ elements loads (performance check)
- [ ] Scrolling works in canvas and form

### 6.3 Special Characters
- [ ] Labels with special characters work
- [ ] Field names sanitized correctly
- [ ] Unicode characters display in PDF

### 6.4 Browser Compatibility
- [ ] Chrome - all features work
- [ ] Edge - all features work
- [ ] Firefox - all features work
- [ ] Safari - all features work

### 6.5 Mobile Responsiveness
- [ ] Builder layout adapts (may be limited)
- [ ] Form filling works on mobile
- [ ] PDF download works on mobile

---

## Phase 7: Backward Compatibility

### 7.1 V1 Templates Still Work
- [ ] V1 templates listed correctly
- [ ] Can edit V1 templates (original editor)
- [ ] V1 document generation works
- [ ] V1 PDF export works

### 7.2 Mixed Environment
- [ ] Can have both V1 and V2 templates
- [ ] Template list shows correct badges
- [ ] Correct editor opens for each version

---

## Performance Benchmarks

| Operation | Target | Actual |
|-----------|--------|--------|
| Builder page load | < 2s | |
| Add element | < 100ms | |
| Save template (10 elements) | < 1s | |
| Load form (20 fields) | < 500ms | |
| Calculate BMI | < 50ms | |
| Generate PDF | < 3s | |

---

## Test Data Recommendations

### Sample Template: "Basic Consultation Form"
```
Elements:
1. Header: "Patient Information"
2. Text: Patient Name (prefill: patient.name, readonly)
3. Number: Age (prefill: patient.age, readonly)
4. Text: Gender (prefill: patient.gender, readonly)
5. Divider
6. Header: "Vitals"
7. Number: Weight (kg)
8. Number: Height (m)
9. Calculated: BMI
10. Divider
11. Header: "Clinical Notes"
12. Paragraph: Chief Complaint
13. Paragraph: Examination Findings
14. Paragraph: Diagnosis
15. Paragraph: Treatment Plan
16. Divider
17. Date: Follow-up Date
18. Text: Doctor (prefill: doctor.name, readonly)
19. Date: Date (prefill: system.current_date, readonly)
```

---

## Sign-Off

| Tester | Date | Result | Notes |
|--------|------|--------|-------|
| | | | |

---

**Document Version**: 1.0
**Last Updated**: January 2026
