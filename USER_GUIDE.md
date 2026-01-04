# Arog Doctor Platform - User Guide

## Getting Started

### First Time Setup

1. **Create Your Account**
   - Visit the app URL
   - Click "Sign Up"
   - Enter your email and password
   - Verify your email (check inbox/spam)
   - Login with your credentials

2. **Complete Your Profile**
   - Click your email in header → "Profile"
   - Fill in your details:
     - Name (required)
     - Specialization
     - License number
     - Clinic information
     - Contact details
   - Click "Save Changes"

3. **Install as PWA (Recommended)**
   
   **On Mobile:**
   - Open app in browser
   - Tap "Add to Home Screen" when prompted
   - Or use browser menu → "Install App"
   
   **On Desktop:**
   - Look for install icon in address bar
   - Click to install as desktop app
   - Access from Start menu/Applications

## Core Features

### 1. Patient Management

**Add New Patient:**
1. Go to Dashboard → "Patients" or click "Patients" in header
2. Click "Add Patient"
3. Fill in patient details:
   - Name, phone, email (basic info)
   - Date of birth, gender, blood group
   - Address and emergency contact
   - Medical history and allergies
4. Click "Add Patient"

**View Patient Details:**
- Click on patient name in list
- See all information, medical history
- Quick actions: Schedule appointment, Generate document

**Edit Patient:**
- Open patient detail page
- Click "Edit" button
- Update information
- Click "Save Changes"

**Deactivate Patient:**
- Open patient detail page
- Click "Deactivate Patient"
- Patient moves to inactive list
- Can be restored anytime

**Search Patients:**
- Use search box on Patients page
- Filter by active/inactive status
- Results update as you type

### 2. Appointment Management

**Schedule Appointment:**
1. Go to "Appointments" → "Schedule Appointment"
   - Or from patient detail page → "Schedule Appointment"
2. Select patient (or pre-filled if from patient page)
3. Choose date and time
4. Set duration (default 30 minutes)
5. Add chief complaint (optional)
6. Click "Schedule Appointment"

**View Appointments:**
- Go to "Appointments"
- Filter by:
  - Date (select specific day)
  - Status (scheduled, completed, cancelled, no-show)
- Click appointment to view details

**Update Appointment:**
1. Open appointment detail page
2. Click "Edit" to modify details
   - Or use quick status buttons:
     - "Mark Completed"
     - "Cancel"
     - "No Show"
3. Add diagnosis and notes during/after appointment

**Generate Document from Appointment:**
- Open appointment detail
- Click "Generate Document"
- Select template
- Preview and generate

---

## Document Templates

### Template Versions

Arog supports two types of templates:

| Feature | V1 (Variable Template) | V2 (Form Builder) |
|---------|----------------------|-------------------|
| Creation | Text with {{variables}} | Drag-and-drop builder |
| Field Types | Text only | Text, Number, Date, Dropdown, etc. |
| Prefill | Manual variable mapping | Auto-configured prefill |
| Calculations | Not supported | BMI, Age, and more |
| Layout | Free-form text | Grid-based layout |
| Badge | V1 | Builder V2 |

### Creating V1 Templates (Variable-Based)

1. Go to "Templates" → "Create Template"
2. Enter template details:
   - Name (e.g., "Standard Prescription")
   - Category (prescription, certificate, etc.)
   - Description (optional)
3. List variables you'll use (comma-separated)
4. Write template content using variables:
   - Example: `Patient Name: {{patient.name}}`
   - Example: `Diagnosis: {{appointment.diagnosis}}`
5. Click "Create Template"

### Creating V2 Templates (Form Builder) ⭐ NEW

The Form Builder provides a visual drag-and-drop interface for creating sophisticated medical forms.

**Getting Started:**
1. Go to "Templates" → "Create Builder Template"
2. Enter template name, category, and description
3. You'll see the 3-panel builder interface:
   - **Left Panel:** Element palette (drag elements from here)
   - **Center Panel:** Canvas (drop and arrange elements)
   - **Right Panel:** Properties (configure selected element)

**Adding Elements:**
1. Click or drag an element from the left palette
2. Element appears on the canvas
3. Click element to select and configure

**Available Elements:**

| Element | Use Case | Notes |
|---------|----------|-------|
| Text Input | Short text fields | Names, IDs, single lines |
| Number Input | Numeric data | Weight, height, counts |
| Paragraph | Long text | Notes, history, descriptions |
| Dropdown | Single selection | Lists with many options |
| Radio Buttons | Single selection | 2-5 visible options |
| Date Picker | Dates | Appointments, DOB |
| Calculated | Auto-calculated | BMI, Age, formulas |
| Header | Section titles | Organize your form |
| Divider | Visual separation | Between sections |

**Configuring Elements:**
Click an element to see its properties:
- **Label:** Display name users see
- **Field Name:** Internal name (auto-generated, editable)
- **Required:** Mark as mandatory
- **Layout:** Set element width (full, half, third, etc.)
- **Type-specific options:** Placeholder, options, calculation type

**Grid Layout System:**
- Forms use a 12-column grid
- Set element width in Properties → Layout
- Common widths:
  - Full width (12/12) - Default
  - Half width (6/12) - Two fields per row
  - Third width (4/12) - Three fields per row
  - Quarter width (3/12) - Four fields per row

**Prefill Configuration:**
Auto-populate fields with patient/doctor/system data:
1. Select an element
2. In Properties, find "Prefill Configuration"
3. Enable prefill
4. Select source: Patient, Doctor, Appointment, or System
5. Select field: e.g., patient_name, doctor_clinic
6. Enable "Read-only" to prevent editing prefilled values

**Available Prefill Fields:**

| Source | Fields |
|--------|--------|
| Patient | name, phone, email, age, gender, id |
| Doctor | name, clinic, id |
| Appointment | date, time, id |
| System | current_date, current_time, place |

**Calculated Fields:**
Auto-calculate values based on other form fields:

| Calculation | Formula | Required Fields |
|-------------|---------|-----------------|
| BMI | weight / (height²) | weight, height (in kg, m) |
| Age | Years from DOB | date_of_birth |
| Age in Months | Months from DOB | date_of_birth |
| Days Between | Date difference | Two date fields |
| BSA | Body Surface Area | weight, height |
| Ideal Body Weight | Height-based | height, gender |
| Creatinine Clearance | Kidney function | age, weight, creatinine, gender |
| Corrected Calcium | Adjusted calcium | calcium, albumin |

**Saving Templates:**
1. Click "Save Template" in toolbar
2. Validation runs automatically:
   - Errors (red) - Must fix before saving
   - Warnings (yellow) - Can save, but review recommended
3. Template saves and you can use it for document generation

**Undo/Redo:**
- Click undo (↶) to reverse last action
- Click redo (↷) to restore undone action
- Works for add, edit, delete, reorder operations

**Preview Form:**
- Click the eye icon (👁) in toolbar
- See how the form will look when filling
- Close preview to return to editing

### Upgrading V1 to V2

If you have existing V1 templates, you can upgrade them:

1. Open the template detail page
2. Click "Upgrade to V2" button (only shown for V1 templates)
3. Review the migration preview:
   - Variables are converted to form elements
   - Field types are inferred from names
   - Prefill settings auto-detected where possible
4. Click "Start Migration"
5. After migration, edit the template to fine-tune

**Note:** The original template content/layout is not migrated. You may need to configure elements after migration.

---

### V1 Template Variables Reference

For V1 (variable-based) templates, use these placeholders:

*Doctor Variables:*
- `{{doctor.name}}` - Your name
- `{{doctor.specialization}}` - Your specialization
- `{{doctor.license_number}}` - License number
- `{{doctor.clinic_name}}` - Clinic name
- `{{doctor.clinic_address}}` - Clinic address
- `{{doctor.phone}}` - Contact number
- `{{doctor.email}}` - Email address

*Patient Variables:*
- `{{patient.name}}` - Patient name
- `{{patient.age}}` - Calculated age
- `{{patient.gender}}` - Gender
- `{{patient.phone}}` - Phone number
- `{{patient.email}}` - Email
- `{{patient.blood_group}}` - Blood group
- `{{patient.address}}` - Address
- `{{patient.date_of_birth}}` - Date of birth
- `{{patient.emergency_contact}}` - Emergency contact name
- `{{patient.emergency_phone}}` - Emergency phone

*Appointment Variables (optional):*
- `{{appointment.appointment_date}}` - Appointment date
- `{{appointment.appointment_time}}` - Appointment time
- `{{appointment.chief_complaint}}` - Chief complaint
- `{{appointment.diagnosis}}` - Diagnosis
- `{{appointment.notes}}` - Appointment notes
- `{{appointment.duration_minutes}}` - Duration

*Document Variables:*
- `{{document.date}}` - Today's date
- `{{document.id}}` - Document ID
- `{{document.created_at}}` - Creation timestamp

---

### Managing Templates

**Edit Template:**
- Open template detail page
- Click "Edit"
- For V1: Modify content and variables
- For V2: Use the visual builder
- Click "Save Changes"

**Deactivate Template:**
- Open template detail page
- Click "Deactivate"
- Template won't appear in document generation
- Can be reactivated anytime

---

## Document Generation

### Generating Documents

**From Dashboard:**
1. Go to "Documents" → "Generate Document"
2. Select a template (V1 or V2)
3. Select patient
4. Select appointment (optional)
5. Fill in any additional fields
6. Click "Generate Document"

**From Patient Page:**
1. Open patient detail
2. Click "Generate Document"
3. Patient is pre-selected
4. Choose template and continue

**From Appointment Page:**
1. Open appointment detail
2. Click "Generate Document"
3. Patient and appointment are pre-selected
4. Choose template and continue

### V2 Builder Documents

When using a V2 Builder template:
1. Fields are displayed as a proper form
2. Prefilled fields show patient/doctor data automatically
3. Read-only prefilled fields are locked (gray with lock icon)
4. Calculated fields update in real-time as you enter data
5. Required fields are marked with red asterisk
6. Validation runs before submission

### Viewing Documents

- Go to "Documents" in navigation
- See list of all generated documents
- Click to view document details
- Click "Download PDF" to export

### PDF Export

- PDFs are generated on-demand
- V2 templates generate professional form-style PDFs
- Headers, dividers, and sections are properly formatted
- Calculated values are included in the PDF

**Important:**
- Documents are **immutable** - cannot be edited or deleted
- This ensures medical record integrity
- Always review before generating
- PDFs are generated fresh each time (not stored)

**Filter Documents:**
- Click patient name in documents list to filter by that patient
- Or use "View All Documents" from patient page

### 5. Dashboard

Quick overview showing:
- Total patients (active)
- Upcoming appointments
- Active templates
- Generated documents

Click any stat card to go to that section.

## Tips & Best Practices

### For Efficient Workflow

1. **Use Quick Actions**
   - Patient page → Schedule appointment or generate document
   - Appointment page → Generate prescription/certificate
   - Saves navigation time

2. **Create Template Library**
   - Make templates for common documents:
     - Standard prescription
     - Medical certificate
     - Lab requisition
     - Referral letter
   - Reuse templates with auto-filled patient data

3. **Update During Appointment**
   - Open appointment during consultation
   - Add chief complaint, diagnosis, notes
   - Generate document immediately after
   - All data pre-filled automatically

4. **Patient Records**
   - Keep medical history updated
   - Note allergies prominently
   - Update emergency contacts regularly
   - Use soft delete instead of hard delete

### Security & Privacy

1. **Always Logout**
   - Especially on shared devices
   - Click email → "Logout"

2. **Strong Password**
   - Use unique password
   - Change periodically
   - Don't share credentials

3. **Device Security**
   - Enable device lock if using PWA
   - Don't leave app open unattended
   - Use private/incognito for public devices

4. **Data Privacy**
   - This app is for single doctor use
   - All data is isolated (RLS policies)
   - Other doctors cannot see your data
   - Documents are immutable for compliance

## Troubleshooting

### Can't Login
- Check email verification (check spam folder)
- Try password reset if forgotten
- Clear browser cache and try again

### Patient Not Showing
- Check "Show inactive" filter
- Use search box
- Refresh page

### Document Not Generating
- Verify template is active
- Check all required fields filled
- Ensure patient and template selected
- Check browser console for errors

### PDF Not Loading
- Try different browser (Chrome/Edge recommended)
- Check internet connection
- Disable browser extensions temporarily
- Try incognito/private mode

### App Not Installing (PWA)
- Use supported browser (Chrome, Edge, Safari)
- Ensure HTTPS connection
- Check if already installed
- Try from different device

## Keyboard Shortcuts

- `Ctrl/Cmd + K`: Quick search (coming soon)
- `Esc`: Close modals/dialogs
- `Tab`: Navigate between form fields

## Support

For technical issues:
1. Check this guide first
2. Clear browser cache
3. Try incognito mode
4. Check deployment logs if self-hosted
5. Contact your system administrator

## Updates & Maintenance

- App updates automatically (PWA refreshes in background)
- New features rolled out seamlessly
- Database migrations handled by admin
- No manual updates needed

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | January 2026 | Builder Engine V2 - Drag-and-drop form builder, prefill engine, calculation engine, grid layout, V1-to-V2 migration |
| 1.0 | December 2025 | Initial release - Patients, Appointments, Templates (V1), Documents, PDF export |

---

**Last Updated**: January 2026 (Builder Engine V2)
**Version**: 2.0
