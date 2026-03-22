import Link from 'next/link'
import { Cross } from 'lucide-react'

const footerLinks = [
  { href: '/tjanst', label: 'Tjänster' },
  { href: '/tillstand', label: 'Tillstånd' },
  { href: '/vardgivare', label: 'Vårdgivare' },
  { href: '/klinik', label: 'Kliniker' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-white mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white">
                <Cross className="h-4 w-4" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Doktor<span className="text-brand">kollen</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Hitta rätt vårdgivare – enkelt och snabbt.
            </p>
            <p className="text-xs text-muted-foreground">
              Din guide till svensk sjukvård och hälsovård.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Utforska</h3>
            <ul className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-brand transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Kontakt</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href="mailto:info@doktorkollen.com"
                  className="text-sm text-muted-foreground hover:text-brand transition-colors"
                >
                  info@doktorkollen.com
                </a>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Sverige</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Doktorkollen. Alla rättigheter förbehållna.
          </p>
          <p className="text-xs text-muted-foreground">
            Informationen på denna sida ersätter inte professionell medicinsk rådgivning.
          </p>
        </div>
      </div>
    </footer>
  )
}
