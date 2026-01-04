import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-background to-muted">
      <div className="text-center space-y-8 max-w-3xl">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-primary">
            Arog Doctor Platform
          </h1>
          <p className="text-xl text-muted-foreground">
            Professional healthcare management system for doctors
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link href="/login">
            <Button size="lg" className="w-40">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline" className="w-40">
              Create Account
            </Button>
          </Link>
        </div>

        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="space-y-2">
            <div className="text-3xl">👥</div>
            <h3 className="font-semibold">Patient Management</h3>
            <p className="text-sm text-muted-foreground">
              Manage patient records, appointments, and medical history
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">📝</div>
            <h3 className="font-semibold">Document Generation</h3>
            <p className="text-sm text-muted-foreground">
              Create prescriptions and medical documents from templates
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">🔒</div>
            <h3 className="font-semibold">Secure & Private</h3>
            <p className="text-sm text-muted-foreground">
              Healthcare-grade security with complete data isolation
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

