import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch dashboard stats
  const { count: patientsCount } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', user.id)
    .eq('is_active', true)

  const today = new Date().toISOString().split('T')[0]
  const { count: todayAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', user.id)
    .gte('appointment_date', today)
    .lt('appointment_date', new Date(Date.now() + 86400000).toISOString())

  const { count: templatesCount } = await supabase
    .from('templates')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', user.id)
    .eq('is_active', true)

  const { count: documentsCount } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', user.id)

  const stats = [
    {
      title: 'Total Patients',
      value: patientsCount || 0,
      href: '/patients',
      icon: '👥',
      change: null,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: "Today's Appointments",
      value: todayAppointments || 0,
      href: '/appointments',
      icon: '📅',
      change: null,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Active Templates',
      value: templatesCount || 0,
      href: '/templates',
      icon: '📝',
      change: null,
      color: 'from-amber-500 to-orange-500'
    },
    {
      title: 'Documents Generated',
      value: documentsCount || 0,
      href: '/documents',
      icon: '📄',
      change: null,
      color: 'from-emerald-500 to-green-500'
    }
  ]

  const quickActions = [
    {
      title: 'Add Patient',
      description: 'Register a new patient',
      href: '/patients/new',
      icon: '👤',
      color: 'hover:border-blue-500 hover:bg-blue-50'
    },
    {
      title: 'New Appointment',
      description: 'Schedule appointment',
      href: '/appointments/new',
      icon: '📅',
      color: 'hover:border-purple-500 hover:bg-purple-50'
    },
    {
      title: 'Create Template',
      description: 'Design new document',
      href: '/templates/new',
      icon: '📝',
      color: 'hover:border-amber-500 hover:bg-amber-50'
    },
    {
      title: 'Generate Document',
      description: 'Create from template',
      href: '/documents/new',
      icon: '📄',
      color: 'hover:border-emerald-500 hover:bg-emerald-50'
    }
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header userEmail={user.email || ''} />
      
      <main className="flex-1 gradient-bg">
        <div className="container mx-auto px-4 py-8 lg:px-6 lg:py-10">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome back!</h1>
            <p className="text-lg text-muted-foreground">
              Here's what's happening with your practice today
            </p>
          </div>
          
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat) => (
              <Link key={stat.title} href={stat.href} className="block group">
                <Card className="card-hover border-0 shadow-md overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${stat.color}`} />
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <span className="text-3xl opacity-60 group-hover:scale-110 transition-transform">
                      {stat.icon}
                    </span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">Quick Actions</CardTitle>
              <CardDescription>Frequently used actions to manage your practice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    href={action.href}
                    className={`group flex flex-col gap-3 rounded-xl border-2 p-6 transition-all duration-200 ${action.color}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-4xl group-hover:scale-110 transition-transform">
                        {action.icon}
                      </span>
                      <svg
                        className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity - Placeholder for future */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
                <CardDescription>Latest patient registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-2">No recent patients</p>
                  <Link href="/patients/new">
                    <Button variant="outline" size="sm">Add First Patient</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Next scheduled appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-2">No upcoming appointments</p>
                  <Link href="/appointments/new">
                    <Button variant="outline" size="sm">Schedule Appointment</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
