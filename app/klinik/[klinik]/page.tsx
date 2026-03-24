import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Phone, Mail, Globe, CalendarDays, ArrowLeft } from 'lucide-react'
import {
  getAllClinics,
  getClinicBySlug,
  getProfessionalsForClinic,
} from '@/lib/data'
import { ProfessionalCard } from '@/components/professional-card'
import { MapView } from '@/components/map-view'
import { JsonLd } from '@/components/json-ld'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface Props {
  params: Promise<{ klinik: string }>
}

export async function generateStaticParams() {
  const clinics = await getAllClinics()
  // Pre-render only clinics with real coordinates; the rest render on-demand
  return clinics
    .filter((c) => c.lat !== 0 && c.lng !== 0)
    .slice(0, 2000)
    .map((c) => ({ klinik: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { klinik } = await params
  const clinic = await getClinicBySlug(klinik)
  if (!clinic) return { title: 'Klinik hittades inte' }
  return {
    title: `${clinic.name} – ${clinic.city}`,
    description: clinic.description.slice(0, 160),
    openGraph: {
      title: `${clinic.name} | Doktorkollen`,
      description: clinic.description.slice(0, 160),
    },
  }
}

export default async function KlinikProfilePage({ params }: Props) {
  const { klinik } = await params
  const clinic = await getClinicBySlug(klinik)
  if (!clinic) notFound()

  const professionals = await getProfessionalsForClinic(clinic)

  const markers = clinic.lat !== 0 && clinic.lng !== 0
    ? [{ id: clinic.id, name: clinic.name, lat: clinic.lat, lng: clinic.lng, url: `/klinik/${clinic.slug}`, subtitle: `${clinic.address}, ${clinic.city}` }]
    : []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: clinic.name,
    description: clinic.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinic.address,
      addressLocality: clinic.city,
      addressCountry: 'SE',
    },
    telephone: clinic.phone,
    email: clinic.email,
    url: clinic.website,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: clinic.lat,
      longitude: clinic.lng,
    },
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="container mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        {/* Back */}
        <Link
          href="/klinik"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Alla kliniker
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light">
                  <span className="text-brand font-bold">
                    {clinic.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{clinic.name}</h1>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-brand shrink-0" />
                  <span className="text-sm">
                    {clinic.address}, {clinic.city}
                  </span>
                </div>
                {clinic.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 text-brand shrink-0" />
                    <a href={`tel:${clinic.phone}`} className="text-sm hover:text-brand transition-colors">
                      {clinic.phone}
                    </a>
                  </div>
                )}
                {clinic.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 text-brand shrink-0" />
                    <a href={`mailto:${clinic.email}`} className="text-sm hover:text-brand transition-colors">
                      {clinic.email}
                    </a>
                  </div>
                )}
                {clinic.website && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4 text-brand shrink-0" />
                    <a
                      href={clinic.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:text-brand transition-colors"
                    >
                      {clinic.website.replace('https://', '')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <Button variant="brand" size="lg" asChild className="shrink-0">
              <a href={clinic.bookingUrl} target="_blank" rel="noopener noreferrer">
                <CalendarDays className="h-5 w-5 mr-2" />
                Boka tid
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Om kliniken</h2>
              <p className="text-foreground leading-relaxed">{clinic.description}</p>
            </section>

            {/* Services */}
            {clinic.services.length > 0 && (
              <section className="bg-white rounded-xl border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Tjänster</h2>
                <div className="flex flex-wrap gap-2">
                  {clinic.services.map((service) => (
                    <Badge key={service} variant="brand">
                      {service}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Professionals */}
            {professionals.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-5">
                  Vårdgivare på kliniken
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {professionals.map((pro) => (
                    <ProfessionalCard key={pro.id} professional={pro} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Map */}
            {markers.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Hitta hit</h2>
                <MapView
                  markers={markers}
                  zoom={14}
                  className="w-full h-64 rounded-lg overflow-hidden border border-border"
                />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${clinic.address}, ${clinic.city}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-sm text-brand hover:underline block"
                >
                  Öppna i Google Maps →
                </a>
              </div>
            )}

            {/* Contact */}
            <div className="bg-brand-light border border-brand/20 rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3">Kontakta oss</h3>
              <div className="space-y-2">
                {clinic.phone && (
                  <a
                    href={`tel:${clinic.phone}`}
                    className="flex items-center gap-2 text-sm text-foreground hover:text-brand transition-colors"
                  >
                    <Phone className="h-4 w-4 text-brand" />
                    {clinic.phone}
                  </a>
                )}
                {clinic.email && (
                  <a
                    href={`mailto:${clinic.email}`}
                    className="flex items-center gap-2 text-sm text-foreground hover:text-brand transition-colors"
                  >
                    <Mail className="h-4 w-4 text-brand" />
                    {clinic.email}
                  </a>
                )}
              </div>
              <Separator className="my-4" />
              <Button variant="brand" className="w-full" asChild>
                <a href={clinic.bookingUrl} target="_blank" rel="noopener noreferrer">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Boka tid online
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
