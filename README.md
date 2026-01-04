# Arog Doctor Platform

A modern, PWA-first medical practice management platform for doctors and health practitioners. Built with Next.js 14, Supabase, and TypeScript.

## Features

### ✅ Core Functionality

- **Patient Management**: Complete CRUD operations with soft delete, search, and filtering
- **Appointment Scheduling**: Calendar view, status tracking (scheduled, completed, cancelled, no-show)
- **Document Templates**: Reusable templates with variable substitution for medical documents
- **Document Generation**: On-demand PDF generation from templates (no storage)
- **Authentication**: Secure login/signup with Supabase Auth
- **Doctor Profiles**: Automatic profile creation with clinic information

### 🔒 Security & Privacy

- **Row Level Security (RLS)**: Complete data isolation between doctors
- **Immutable Documents**: Generated documents cannot be modified or deleted
- **Soft Deletes**: Patient and template records preserved for audit trail
- **Protected Routes**: Middleware-based authentication on all sensitive pages

### 📱 PWA Features

- **Installable**: Works as standalone app on mobile and desktop
- **Offline-Ready**: Service worker caching for offline access
- **Fast Performance**: Optimized build and runtime caching
- **App Shortcuts**: Quick access to dashboard, patients, and appointments

### 🎨 User Experience

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Modern UI**: Clean interface built with Tailwind CSS and shadcn/ui
- **Quick Actions**: Contextual shortcuts from patient and appointment pages
- **Live Preview**: See generated documents before creating them

## Tech Stack

- **Framework**: Next.js 14.2.35 (App Router)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth
- **PDF Generation**: @react-pdf/renderer
- **PWA**: next-pwa
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd arog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run database migrations**
   - Go to Supabase Dashboard → SQL Editor
   - Run each file in `supabase/migrations/` in order (000001 → 000005)

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   - Navigate to `http://localhost:3000`
   - Sign up to create your doctor account

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Usage

See [USER_GUIDE.md](USER_GUIDE.md) for comprehensive user documentation.

## Project Structure

```
arog/
├── app/                      # Next.js app directory
│   ├── actions/             # Server actions
│   ├── appointments/        # Appointment management
│   ├── documents/           # Document generation
│   ├── patients/            # Patient management
│   ├── templates/           # Template management
│   └── ...
├── components/              # React components
├── lib/                     # Utilities and helpers
├── types/                   # TypeScript type definitions
├── supabase/migrations/    # Database migrations
└── public/                 # Static assets & PWA files
```

## Key Features

**Patient Management:**
- Add, edit, view patients
- Soft delete with restore
- Search and filtering
- Medical history and allergies

**Appointments:**
- Schedule with date/time
- Status tracking
- Link to patients
- Clinical notes

**Templates:**
- Variable substitution (`{{patient.name}}`, etc.)
- Categories (prescription, certificate, etc.)
- Reusable across patients
- Preview before use

**Documents:**
- Generate from templates
- Auto-fill patient/doctor data
- PDF download
- Immutable records

## Security

- ✅ Row Level Security on all tables
- ✅ Middleware route protection
- ✅ Email verification required
- ✅ Immutable document records
- ✅ Data isolation per doctor

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS/Android)

## License

[Your License Here]

## Support

- [User Guide](USER_GUIDE.md)
- [Deployment Guide](DEPLOYMENT.md)
- GitHub Issues

---

**Version**: 1.0  
**Status**: Production Ready ✅

- All Supabase tables use Row Level Security (RLS)
- Access scoped by `doctor_id = auth.uid()`
- No public access to patient or document data
- PDFs generated on-demand, not stored

## License

Private - All rights reserved
