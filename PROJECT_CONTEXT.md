# Project Context — Doctor Platform V1

## Goal
Build a V1 Doctor / Health Practitioner web app (PWA-first) that supports:
- Patient management
- Appointment tracking
- Template-based medical document generation
- Secure doctor-only access

This is a healthcare-style system. Correctness, audit safety, and clean architecture are more important than speed.

---

## Tech Stack
- Frontend: Next.js (App Router)
- Auth: Supabase Auth
- Database: Supabase PostgreSQL
- Storage: Supabase Storage (PDFs)
- Hosting: Vercel
- Language: TypeScript

Do NOT introduce:
- New frameworks
- New auth providers
- Client-side state libraries unless explicitly asked

---

## Core Architecture Principles (DO NOT VIOLATE)

1. Patient is the center of the system.
2. Appointments are clinical events.
3. Documents are generated from templates.
4. Generated documents are immutable.
5. Templates define structure, not data.
6. All data is isolated by doctor_id.
7. No hard deletes of medical data.

---

## Modules
1. Authentication
2. Doctor Profile
3. Patients
4. Appointments
5. Document Portal
   - Templates
   - Builder Engine
   - Generated Documents

---

## Document Portal (Critical)

- Templates are reusable blueprints.
- Templates define elements using JSON schema.
- Supported elements (V1):
  - text
  - number
  - paragraph
  - dropdown
  - radio
  - date
  - calculated (BMI)
  - divider
- Fields may be:
  - Prefilled (patient, doctor, appointment, system)
  - Editable or read-only
- Documents are generated from templates and saved as:
  - Structured JSON data
  - Generated PDF
- Documents are immutable once created.

---

## Entry Points
- Appointment Detail Page:
  - Create Prescription
  - Create Document
- Patient Profile Page:
  - New Document (auto-select latest appointment)

---

## Security
- Supabase Row Level Security enforced on all tables.
- doctor_id must match auth.uid().
- No public access to patient or document data.

---

## Development Rules
- Build incrementally.
- Follow existing patterns.
- Do not over-engineer V1.
- Ask before changing architecture.
