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

### 3. Document Templates

**Create Template:**
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

**Available Variables:**

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

**Edit Template:**
- Open template detail page
- Click "Edit"
- Modify content and variables
- Click "Save Changes"

**Deactivate Template:**
- Open template detail page
- Click "Deactivate"
- Template won't appear in document generation
- Can be reactivated anytime

### 4. Document Generation

**Generate Document:**
1. From Dashboard → "Documents" → "Generate Document"
   - Or from Patient page → "Generate Document"
   - Or from Appointment page → "Generate Document"
2. Select template
3. Select patient (pre-filled if from patient/appointment page)
4. Select appointment (optional, pre-filled if available)
5. Preview document with filled data
6. Click "Generate Document"

**View Document:**
- Go to "Documents"
- Click "View" on any document
- See rendered content
- Click "Download PDF" to get PDF version

**Important Notes:**
- Documents are **immutable** (cannot be edited or deleted)
- This ensures medical record integrity
- Always review preview before generating
- PDFs generated on-demand (not stored)

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

**Last Updated**: Phase 9 - January 2026
**Version**: 1.0
