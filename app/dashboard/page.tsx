import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { Users, Calendar, FileText, Folder, UserPlus, CalendarPlus, FilePlus, PlusCircle, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch patients for appointment creation
  const { data: patients } = await supabase
    .from('patients')
    .select('id, name')
    .eq('doctor_id', user.id)
    .eq('is_active', true)
    .order('name')

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
      icon: Users,
      change: null,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: "Today's Appointments",
      value: todayAppointments || 0,
      href: '/appointments',
      icon: Calendar,
      change: null,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Active Templates',
      value: templatesCount || 0,
      href: '/templates',
      icon: Folder,
      change: null,
      color: 'from-amber-500 to-orange-500'
    },
    {
      title: 'Documents Generated',
      value: documentsCount || 0,
      href: '/documents',
      icon: FileText,
      change: null,
      color: 'from-emerald-500 to-green-500'
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
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Link key={stat.title} href={stat.href} className="block group">
                  <Card className="border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-200 overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${stat.color}`} />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <div className="p-2 rounded-lg bg-muted group-hover:scale-110 transition-transform">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-md mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Quick Actions</CardTitle>
              <CardDescription>Frequently used actions to manage your practice</CardDescription>
            </CardHeader>
            <CardContent>
              <QuickActions patients={patients || []} />
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
