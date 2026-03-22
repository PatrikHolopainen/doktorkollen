'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Cross, Mail, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navLinks = [
  { href: '/tjanst', label: 'Tjänster' },
  { href: '/tillstand', label: 'Tillstånd' },
  { href: '/vardgivare', label: 'Vårdgivare' },
  { href: '/klinik', label: 'Kliniker' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white group-hover:bg-brand-dark transition-colors duration-200">
            <Cross className="h-4 w-4" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Doktor<span className="text-brand">kollen</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150',
                pathname.startsWith(link.href)
                  ? 'text-brand bg-brand-light'
                  : 'text-foreground hover:text-brand hover:bg-brand-light/60'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/vardgivare"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Sök</span>
          </Link>
          <Button variant="brand" size="sm" asChild>
            <a href="mailto:info@doktorkollen.com">
              <Mail className="h-4 w-4 mr-1.5" />
              Kontakt
            </a>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-foreground hover:bg-accent transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Öppna meny"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white animate-fade-in">
          <nav className="container mx-auto flex flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  pathname.startsWith(link.href)
                    ? 'text-brand bg-brand-light'
                    : 'text-foreground hover:text-brand hover:bg-brand-light/60'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border mt-2">
              <a
                href="mailto:info@doktorkollen.com"
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-brand hover:bg-brand-light rounded-md transition-colors"
              >
                <Mail className="h-4 w-4" />
                info@doktorkollen.com
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
