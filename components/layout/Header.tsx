'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface HeaderProps {
  userEmail?: string
}

export function Header({ userEmail }: HeaderProps) {
  const pathname = usePathname()
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Patients', href: '/patients' },
    { name: 'Appointments', href: '/appointments' },
    { name: 'Templates', href: '/templates' },
    { name: 'Documents', href: '/documents' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg transition-transform group-hover:scale-105">
            A
          </div>
          <span className="hidden font-bold text-xl sm:inline-block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Arog
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="hidden sm:inline-block text-sm text-muted-foreground max-w-[150px] truncate">
              {userEmail}
            </span>
          )}
          <Link 
            href="/profile"
            className="hidden sm:inline-flex items-center justify-center rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Profile
          </Link>
          <form action="/api/auth/logout" method="post">
            <button 
              className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Mobile navigation */}
      <nav className="md:hidden border-t px-4 py-3 overflow-x-auto scrollbar-thin">
        <div className="flex space-x-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all duration-200",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
