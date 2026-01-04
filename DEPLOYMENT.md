# Deployment Guide for Arog Doctor Platform

## Prerequisites

Before deploying, ensure you have:

1. **Supabase Project Setup**
   - Create a project at [supabase.com](https://supabase.com)
   - Note your project URL and anon key
   - Run all migrations from `supabase/migrations/` directory in order

2. **Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)
   - Connect your GitHub repository (recommended) or use Vercel CLI

## Database Setup

### Step 1: Run Migrations

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run each migration file in order:
   - `20260104000001_create_doctors_table.sql`
   - `20260104000002_create_patients_table.sql`
   - `20260104000003_create_appointments_table.sql`
   - `20260104000004_create_templates_table.sql`
   - `20260104000005_create_documents_table.sql`

### Step 2: Verify Database

After running migrations, verify:
- All 5 tables created (doctors, patients, appointments, templates, documents)
- RLS policies enabled on all tables
- Triggers created (doctor profile auto-creation, timestamp updates, immutable documents)

## Vercel Deployment

### Option 1: Deploy via GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure project settings

3. **Environment Variables**
   
   Add these in Vercel project settings:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your deployment URL

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Post-Deployment Setup

### 1. Create First Doctor Account

1. Visit your deployed app
2. Click "Sign Up"
3. Enter your credentials
4. Check email for verification (Supabase sends confirmation)
5. Verify email and login
6. Complete your doctor profile

### 2. Update Supabase Email Templates (Optional)

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Customize confirmation and password reset emails
3. Add your app's URL to templates

### 3. Configure Domain (Optional)

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update Supabase redirect URLs in Authentication settings

### 4. Enable Additional Features (Optional)

**Email Settings:**
- Configure custom SMTP in Supabase → Settings → Auth → SMTP Settings
- Use services like SendGrid, Mailgun, or AWS SES

**Storage (Future):**
- Currently PDFs are generated on-demand (no storage)
- If you add document storage later, configure in Supabase → Storage

## PWA Installation

After deployment, users can install the app:

**On Mobile (Android/iOS):**
1. Visit the app URL in browser
2. Look for "Add to Home Screen" prompt
3. Tap "Add" or "Install"
4. App icon appears on home screen

**On Desktop (Chrome/Edge):**
1. Visit the app URL
2. Click install icon in address bar
3. Click "Install"
4. App opens as standalone window

## Monitoring & Maintenance

### Check Application Health

1. **Vercel Analytics**
   - View in Vercel dashboard
   - Monitor performance and errors

2. **Supabase Logs**
   - Database logs in Supabase → Logs → Postgres
   - API logs in Supabase → Logs → API

3. **Error Tracking (Optional)**
   - Integrate Sentry for error monitoring
   - Add to `next.config.js`

### Regular Maintenance

- **Database Backups**: Automatic in Supabase (point-in-time recovery)
- **Security Updates**: Keep dependencies updated with `npm audit`
- **Performance**: Monitor Vercel Analytics for slow pages

## Troubleshooting

### Build Fails

1. Check build logs in Vercel
2. Ensure all environment variables are set
3. Verify `package.json` scripts are correct
4. Test build locally: `npm run build`

### Database Connection Issues

1. Verify Supabase URL and anon key
2. Check RLS policies are enabled
3. Ensure migrations ran successfully
4. Test connection in Supabase SQL Editor

### Authentication Not Working

1. Confirm email verification is enabled
2. Check Supabase Auth settings
3. Verify redirect URLs match deployment URL
4. Check browser console for errors

### PDF Generation Issues

1. Verify `@react-pdf/renderer` is installed
2. Check browser compatibility (modern browsers only)
3. Test in different browsers
4. Check console for errors

## Security Checklist

- [ ] All migrations run successfully
- [ ] RLS policies enabled on all tables
- [ ] Environment variables set in Vercel
- [ ] Email verification enabled in Supabase
- [ ] Password strength requirements configured
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] No sensitive data in client-side code
- [ ] Middleware protecting authenticated routes

## Support & Documentation

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

## Scaling Considerations

**Current Setup (Free Tier):**
- Good for 1-50 concurrent users
- Supabase: 500MB database, 2GB bandwidth
- Vercel: 100GB bandwidth, unlimited deployments

**When to Upgrade:**
- More than 50 regular users
- Database size > 500MB
- Need for increased bandwidth
- Require advanced analytics

**Upgrade Path:**
- Supabase Pro: $25/month (8GB database, 50GB bandwidth)
- Vercel Pro: $20/month (1TB bandwidth, advanced features)

## Success Indicators

Your deployment is successful when:
- ✅ App loads at deployment URL
- ✅ Can create account and login
- ✅ Doctor profile auto-created
- ✅ Can create patients, appointments, templates
- ✅ Can generate documents and view as PDF
- ✅ PWA installable on mobile/desktop
- ✅ No console errors in browser
- ✅ All routes accessible and working

---

**Note**: This is a V1 deployment guide. As the application evolves, update this document with new features and configuration requirements.
