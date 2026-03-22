import Link from 'next/link'
import { Search, ArrowRight, Heart, Users, Building2, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ServiceCard } from '@/components/service-card'
import { ConditionCard } from '@/components/condition-card'
import { JsonLd } from '@/components/json-ld'
import { getAllServices, getAllConditions } from '@/lib/data'

const stats = [
  { label: 'Vårdgivare', value: '500+' },
  { label: 'Kliniker', value: '120+' },
  { label: 'Städer', value: '50+' },
  { label: 'Tjänster', value: '30+' },
]

const quickLinks = [
  {
    href: '/tjanst',
    label: 'Tjänster',
    description: 'Psykologi, kardiologi, fysioterapi med mera',
    icon: Heart,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    href: '/tillstand',
    label: 'Tillstånd',
    description: 'Depression, ryggsmärta, migrän och fler',
    icon: Activity,
    color: 'bg-green-50 text-green-600',
  },
  {
    href: '/vardgivare',
    label: 'Vårdgivare',
    description: 'Läkare, psykologer, fysioterapeuter',
    icon: Users,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    href: '/klinik',
    label: 'Kliniker',
    description: 'Mottagningar och kliniker runt om i Sverige',
    icon: Building2,
    color: 'bg-orange-50 text-orange-600',
  },
]

export default async function HomePage() {
  const [services, conditions] = await Promise.all([getAllServices(), getAllConditions()])

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Doktorkollen',
    url: 'https://doktorkollen.com',
    description: 'Hitta rätt vårdgivare i Sverige – enkelt och snabbt.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://doktorkollen.com/vardgivare?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <JsonLd data={websiteJsonLd} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-light/30 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-light text-brand text-sm font-medium mb-6">
                <Heart className="h-4 w-4" />
                <span>Sveriges sjukvårdskatalog</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-4">
                Hitta rätt{' '}
                <span className="text-brand">vårdgivare</span>{' '}
                – enkelt och snabbt
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                Sök bland hundratals läkare, psykologer, fysioterapeuter och specialister.
                Läs om medicinska tjänster och tillstånd på svenska.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Link href="/vardgivare">
                    <input
                      readOnly
                      placeholder="Sök vårdgivare, tjänst eller tillstånd..."
                      className="w-full h-12 pl-10 pr-4 rounded-lg border border-border bg-white text-sm cursor-pointer hover:border-brand transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30"
                    />
                  </Link>
                </div>
                <Button variant="brand" size="xl" asChild>
                  <Link href="/vardgivare">
                    Sök
                    <ArrowRight className="h-5 w-5 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* SVG Illustration */}
            <div className="hidden lg:flex justify-center animate-fade-in">
              <svg
                viewBox="0 0 400 320"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full max-w-md"
                aria-hidden="true"
              >
                {/* Doctor figure */}
                <circle cx="200" cy="80" r="45" fill="#E8F4FD" />
                <circle cx="200" cy="70" r="28" fill="#1D6FA4" opacity="0.2" />
                <rect x="165" y="110" width="70" height="90" rx="12" fill="#1D6FA4" opacity="0.15" />
                {/* Medical cross */}
                <rect x="193" y="125" width="14" height="40" rx="4" fill="#1D6FA4" opacity="0.6" />
                <rect x="178" y="138" width="44" height="14" rx="4" fill="#1D6FA4" opacity="0.6" />
                {/* Clipboard */}
                <rect x="260" y="100" width="80" height="110" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="2" />
                <rect x="270" y="118" width="60" height="6" rx="3" fill="#E2E8F0" />
                <rect x="270" y="132" width="50" height="6" rx="3" fill="#E2E8F0" />
                <rect x="270" y="146" width="55" height="6" rx="3" fill="#E2E8F0" />
                <rect x="270" y="160" width="40" height="6" rx="3" fill="#10B981" opacity="0.5" />
                {/* Heart rate */}
                <path
                  d="M60 200 L90 200 L100 175 L115 225 L130 185 L145 210 L160 200 L200 200"
                  stroke="#1D6FA4"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Location pins */}
                <circle cx="80" cy="260" r="12" fill="#10B981" opacity="0.2" />
                <circle cx="80" cy="260" r="5" fill="#10B981" />
                <circle cx="200" cy="270" r="12" fill="#1D6FA4" opacity="0.2" />
                <circle cx="200" cy="270" r="5" fill="#1D6FA4" />
                <circle cx="320" cy="255" r="12" fill="#10B981" opacity="0.2" />
                <circle cx="320" cy="255" r="5" fill="#10B981" />
                {/* Connecting lines */}
                <line x1="80" y1="260" x2="200" y2="270" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="200" y1="270" x2="320" y2="255" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="4 4" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-white py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-brand">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Utforska katalogen</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Välj en kategori för att hitta rätt vård för dina behov
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {quickLinks.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-xl border border-border bg-white p-6 hover:shadow-md transition-all duration-200 hover:border-brand/30 animate-fade-in"
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.color} mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  <div className="mt-3 flex items-center text-sm text-brand font-medium">
                    <span>Utforska</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Populära tjänster</h2>
              <p className="text-muted-foreground mt-1">Hitta specialister inom ditt område</p>
            </div>
            <Link
              href="/tjanst"
              className="hidden sm:flex items-center text-sm text-brand font-medium hover:underline"
            >
              Visa alla
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.slice(0, 4).map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Button variant="brand-outline" asChild>
              <Link href="/tjanst">Visa alla tjänster</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Vanliga tillstånd</h2>
              <p className="text-muted-foreground mt-1">Information och hjälp vid medicinska tillstånd</p>
            </div>
            <Link
              href="/tillstand"
              className="hidden sm:flex items-center text-sm text-brand font-medium hover:underline"
            >
              Visa alla
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {conditions.slice(0, 4).map((condition) => (
              <ConditionCard key={condition.id} condition={condition} />
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Button variant="brand-outline" asChild>
              <Link href="/tillstand">Visa alla tillstånd</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-brand">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Redo att hitta din vårdgivare?
          </h2>
          <p className="text-brand-light text-lg mb-8 max-w-xl mx-auto">
            Bläddra bland hundratals legitimerade vårdgivare och hitta rätt specialist för dig.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              size="lg"
              className="bg-white text-brand hover:bg-brand-light border-white"
              asChild
            >
              <Link href="/vardgivare">
                <Users className="h-5 w-5 mr-2" />
                Hitta vårdgivare
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent text-white border-white hover:bg-white/10"
              asChild
            >
              <Link href="/klinik">
                <Building2 className="h-5 w-5 mr-2" />
                Sök kliniker
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
