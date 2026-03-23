'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Cross, Mail, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SearchTrigger } from '@/components/search-dialog'
import type { Service, Condition } from '@/lib/types'

interface NavbarProps {
  services: Pick<Service, 'slug' | 'name'>[]
  conditions: Pick<Condition, 'slug' | 'name'>[]
}

function NavDropdown({
  label,
  href,
  items,
  basePath,
  isActive,
}: {
  label: string
  href: string
  items: { slug: string; name: string }[]
  basePath: string
  isActive: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        className={cn(
          'flex items-center gap-0.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150',
          isActive
            ? 'text-brand bg-brand-light'
            : 'text-foreground hover:text-brand hover:bg-brand-light/60'
        )}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <Link
          href={href}
          onClick={(e) => e.stopPropagation()}
          className="hover:no-underline"
        >
          {label}
        </Link>
        <ChevronDown className={cn('h-3.5 w-3.5 ml-0.5 transition-transform duration-150', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full pt-1 z-50"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="w-56 rounded-lg border border-border bg-white shadow-lg py-1.5 max-h-80 overflow-y-auto">
            <Link
              href={href}
              className="block px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light/60 border-b border-border mb-1"
              onClick={() => setOpen(false)}
            >
              Visa alla {label.toLowerCase()}
            </Link>
            {items.map((item) => (
              <Link
                key={item.slug}
                href={`${basePath}/${item.slug}`}
                className="block px-4 py-1.5 text-sm text-foreground hover:text-brand hover:bg-brand-light/60"
                onClick={() => setOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function Navbar({ services, conditions }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [mobileExpanded, setMobileExpanded] = React.useState<string | null>(null)
  const pathname = usePathname()

  React.useEffect(() => {
    setMobileOpen(false)
    setMobileExpanded(null)
  }, [pathname])

  const staticLinks = [
    { href: '/vardgivare', label: 'Vårdgivare' },
    { href: '/klinik', label: 'Kliniker' },
  ]

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
          <NavDropdown
            label="Tjänster"
            href="/tjanst"
            items={services}
            basePath="/tjanst"
            isActive={pathname.startsWith('/tjanst')}
          />
          <NavDropdown
            label="Tillstånd"
            href="/tillstand"
            items={conditions}
            basePath="/tillstand"
            isActive={pathname.startsWith('/tillstand')}
          />
          {staticLinks.map((link) => (
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
          <SearchTrigger />
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
            {/* Tjänster expandable */}
            <div>
              <div className="flex items-center justify-between">
                <Link
                  href="/tjanst"
                  className={cn(
                    'flex-1 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    pathname.startsWith('/tjanst')
                      ? 'text-brand bg-brand-light'
                      : 'text-foreground hover:text-brand hover:bg-brand-light/60'
                  )}
                >
                  Tjänster
                </Link>
                <button
                  className="p-2 text-muted-foreground"
                  onClick={() => setMobileExpanded(mobileExpanded === 'tjanst' ? null : 'tjanst')}
                >
                  <ChevronDown className={cn('h-4 w-4 transition-transform', mobileExpanded === 'tjanst' && 'rotate-180')} />
                </button>
              </div>
              {mobileExpanded === 'tjanst' && (
                <div className="ml-4 border-l border-border pl-3 py-1 flex flex-col gap-0.5">
                  {services.map((s) => (
                    <Link key={s.slug} href={`/tjanst/${s.slug}`} className="py-1.5 text-sm text-muted-foreground hover:text-brand">
                      {s.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Tillstånd expandable */}
            <div>
              <div className="flex items-center justify-between">
                <Link
                  href="/tillstand"
                  className={cn(
                    'flex-1 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    pathname.startsWith('/tillstand')
                      ? 'text-brand bg-brand-light'
                      : 'text-foreground hover:text-brand hover:bg-brand-light/60'
                  )}
                >
                  Tillstånd
                </Link>
                <button
                  className="p-2 text-muted-foreground"
                  onClick={() => setMobileExpanded(mobileExpanded === 'tillstand' ? null : 'tillstand')}
                >
                  <ChevronDown className={cn('h-4 w-4 transition-transform', mobileExpanded === 'tillstand' && 'rotate-180')} />
                </button>
              </div>
              {mobileExpanded === 'tillstand' && (
                <div className="ml-4 border-l border-border pl-3 py-1 flex flex-col gap-0.5 max-h-60 overflow-y-auto">
                  {conditions.map((c) => (
                    <Link key={c.slug} href={`/tillstand/${c.slug}`} className="py-1.5 text-sm text-muted-foreground hover:text-brand">
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {staticLinks.map((link) => (
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
