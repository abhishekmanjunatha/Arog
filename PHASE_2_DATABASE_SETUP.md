# Phase 2: Database Setup - Instructions

## ✅ What's Been Created

All database schema files are ready in `supabase/migrations/`:

1. ✅ Doctors table with auto-profile creation
2. ✅ Patients table with soft delete
3. ✅ Appointments table with status tracking
4. ✅ Templates table with JSON schema validation
5. ✅ Documents table with immutability enforcement
6. ✅ Row Level Security (RLS) policies on all tables
7. ✅ TypeScript types matching the schema

## 🚀 Next Steps: Run Migrations in Supabase

### Step 1: Access Supabase SQL Editor

1. Go to https://app.supabase.com
2. Select your project: **tohaiaadjikiecdnrywh**
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run Each Migration File

Copy and paste each file in this exact order, then click **Run**:

#### Migration 1: Doctors Table
```sql
-- Copy contents from: supabase/migrations/20260104000001_create_doctors_table.sql
-- This creates the doctors table and auto-profile trigger
```

#### Migration 2: Patients Table
```sql
-- Copy contents from: supabase/migrations/20260104000002_create_patients_table.sql
-- This creates the patients table with soft delete
```

#### Migration 3: Appointments Table
```sql
-- Copy contents from: supabase/migrations/20260104000003_create_appointments_table.sql
-- This creates appointments with status enum
```

#### Migration 4: Templates Table
```sql
-- Copy contents from: supabase/migrations/20260104000004_create_templates_table.sql
-- This creates templates with JSON schema validation
```

#### Migration 5: Documents Table
```sql
-- Copy contents from: supabase/migrations/20260104000005_create_documents_table.sql
-- This creates immutable documents table
```

### Step 3: Verify Setup

After running all migrations, verify in Supabase:

1. **Table Editor** → You should see 5 new tables:
   - `doctors`
   - `patients`
   - `appointments`
   - `templates`
   - `documents`

2. **Authentication** → **Policies** → Each table should have RLS policies

3. **SQL Editor** → Run this test query:
```sql
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('doctors', 'patients', 'appointments', 'templates', 'documents')
ORDER BY table_name, ordinal_position;
```

## 🔐 Security Features Enabled

- ✅ **Row Level Security (RLS)** on all tables
- ✅ **Doctor isolation** - Each doctor can only access their own data
- ✅ **Immutable documents** - Cannot be updated or deleted
- ✅ **Soft deletes** - Patients and templates use `is_active` flag
- ✅ **Foreign key constraints** - Data integrity enforced
- ✅ **Auto-timestamps** - `created_at` and `updated_at` managed automatically

## 📊 Architecture Compliance

All core principles from PROJECT_CONTEXT.md are enforced:

| Principle | Implementation |
|-----------|----------------|
| Patient is the center | ✅ All clinical data links to patient |
| Appointments are clinical events | ✅ Separate table with status tracking |
| Documents from templates | ✅ `template_id` foreign key |
| Documents are immutable | ✅ Triggers prevent UPDATE/DELETE |
| Templates define structure | ✅ JSON schema validation |
| Data isolated by doctor_id | ✅ RLS policies enforce |
| No hard deletes | ✅ Soft delete or prevent delete |

## 🧪 Testing the Setup

After migrations, you can test by:

1. Creating a test account (Sign up via your app)
2. Check that a doctor profile was auto-created
3. Try inserting test data via SQL Editor

## ⚠️ Important Notes

1. **Documents are PERMANENT** - They cannot be updated or deleted once created
2. **No cross-doctor access** - RLS ensures complete isolation
3. **Templates require valid JSON** - Must have `version` and `elements`
4. **Auto-timestamps** - Don't manually set `updated_at`, it's automatic

## 🎯 Next Phase

After successfully running migrations:
- **Phase 3**: Build authentication UI (login/signup)
- Test database access from Next.js
- Build Doctor Profile page

---

**Need Help?** Check the migration files in `supabase/migrations/` - each has detailed comments explaining the schema.
