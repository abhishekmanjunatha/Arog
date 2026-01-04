# Supabase Database Migrations

This directory contains SQL migration files for the Arog Doctor Platform database schema.

## Migration Files

Run these migrations in order in your Supabase SQL Editor:

1. **20260104000001_create_doctors_table.sql**
   - Creates `doctors` table linked to Supabase Auth
   - Auto-creates doctor profile on user signup
   - RLS: Doctors can only access their own profile

2. **20260104000002_create_patients_table.sql**
   - Creates `patients` table with soft delete support
   - RLS: Scoped by `doctor_id` - complete isolation
   - Indexes for fast search by name, phone

3. **20260104000003_create_appointments_table.sql**
   - Creates `appointments` table with status enum
   - Links doctors and patients
   - RLS: Scoped by `doctor_id`
   - No hard deletes (clinical data)

4. **20260104000004_create_templates_table.sql**
   - Creates `templates` table with JSON schema
   - Validates schema has required fields
   - RLS: Scoped by `doctor_id`
   - Soft delete only (is_active flag)

5. **20260104000005_create_documents_table.sql**
   - Creates `documents` table
   - **IMMUTABLE** - cannot be updated or deleted
   - Stores structured JSON data
   - RLS: Scoped by `doctor_id`

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Copy and paste each migration file in order
4. Click **Run** for each migration

### Option 2: Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref tohaiaadjikiecdnrywh

# Run all migrations
supabase db push
```

## Architecture Principles Enforced

- ✅ Patient is the center of the system
- ✅ Appointments are clinical events
- ✅ Documents are generated from templates
- ✅ Generated documents are **immutable**
- ✅ Templates define structure, not data
- ✅ All data isolated by `doctor_id`
- ✅ **No hard deletes** of medical data

## Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- Doctors can only access their own data
- Complete data isolation between doctors
- No public access to any data

## Testing RLS Policies

After running migrations, test RLS by:

1. Creating a test user/doctor
2. Inserting sample patients
3. Trying to access data from a different user (should fail)

## Schema Diagram

```
auth.users (Supabase Auth)
    ↓ (auto-creates via trigger)
doctors
    ├── patients (1:many)
    │   └── appointments (many:many via appointments)
    ├── templates (1:many)
    └── documents (1:many)
        ├── → patient_id
        ├── → appointment_id (optional)
        └── → template_id
```

## Next Steps

After running migrations:
1. Update TypeScript types to match schema
2. Test database access from Next.js app
3. Build authentication flow
