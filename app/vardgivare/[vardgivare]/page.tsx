import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, CalendarDays, Building2, ArrowLeft } from 'lucide-react'
import {
  getAllProfessionals,
  getProfessionalBySlug,
  getRelatedProfessionals,
  getClinicsForProfessional,
  getAllConditions,
} from '@/lib/data'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ProfessionalCard } from '@/components/professional-card'
import { ClinicCard } from '@/components/clinic-card'
import { MapView } from '@/components/map-view'
import { JsonLd } from '@/components/json-ld'

interface Props {
  params: Promise<{ vardgivare: string }>
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export async function generateStaticParams() {
  const professionals = await getAllProfessionals()
  return professionals.map((p) => ({ vardgivare: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vardgivare } = await params
  const professional = await getProfessionalBySlug(vardgivare)
  if (!professional) return { title: 'Vårdgivare hittades inte' }
  return {
    title: `${professional.name} – ${professional.title} i ${professional.city}`,
    description: professional.introduction.slice(0, 160),
    openGraph: {
      title: `${professional.name} | Doktorkollen`,
      description: professional.introduction.slice(0, 160),
    },
  }
}

export default async function VardgivareProfilePage({ params }: Props) {
  const { vardgivare } = await params
  const professional = await getProfessionalBySlug(vardgivare)
  if (!professional) notFound()

  const [related, clinics, allConditions] = await Promise.all([
    getRelatedProfessionals(professional),
    getClinicsForProfessional(professional),
    getAllConditions(),
  ])

  const proConditions = allConditions.filter((c) =>
    c.id ? professional.conditionIds.includes(c.id) : false
  )

  const nearbyMarkers = [
    {
      id: professional.id,
      name: professional.name,
      lat: professional.lat,
      lng: professional.lng,
      url: `/vardgivare/${professional.slug}`,
      subtitle: professional.title,
    },
    ...related.map((r) => ({
      id: r.id,
      name: r.name,
      lat: r.lat,
      lng: r.lng,
      url: `/vardgivare/${r.slug}`,
      subtitle: r.title,
    })),
  ].filter((m) => m.lat !== 0 && m.lng !== 0)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: professional.name,
    jobTitle: professional.title,
    description: professional.introduction,
    address: {
      '@type': 'PostalAddress',
      addressLocality: professional.city,
      addressCountry: 'SE',
    },
    url: `https://doktorkollen.com/vardgivare/${professional.slug}`,
    medicalSpecialty: professional.specialties,
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="container mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        {/* Back */}
        <Link
          href="/vardgivare"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Alla vårdgivare
        </Link>

        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar className="h-24 w-24 text-2xl">
              <AvatarFallback className="text-2xl">
                {getInitials(professional.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {professional.name}
              </h1>
              <p className="text-lg text-muted-foreground mt-1">{professional.title}</p>

              <div className="flex items-center gap-2 mt-3">
                <MapPin className="h-4 w-4 text-brand shrink-0" />
                <span className="text-sm text-muted-foreground">{professional.city}</span>
              </div>

              {professional.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {professional.specialties.map((spec) => (
                    <Badge key={spec} variant="brand">
                      {spec}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="sm:text-right">
              <Button variant="brand" size="lg" asChild>
                <a
                  href={professional.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <CalendarDays className="h-5 w-5" />
                  Boka tid
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Introduction */}
            <section className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Om {professional.name}</h2>
              <p className="text-foreground leading-relaxed">{professional.introduction}</p>
            </section>

            {/* Clinics */}
            {clinics.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  <Building2 className="h-5 w-5 inline mr-2 text-brand" />
                  Mottagningar
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {clinics.map((clinic) => (
                    <ClinicCard key={clinic.id} clinic={clinic} />
                  ))}
                </div>
              </section>
            )}

            {/* Conditions */}
            {proConditions.length > 0 && (
              <section className="bg-white rounded-xl border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Behandlar bland annat
                </h2>
                <div className="flex flex-wrap gap-2">
                  {proConditions.map((condition) => (
                    <Link key={condition.id} href={`/tillstand/${condition.slug}`}>
                      <Badge variant="muted" className="hover:bg-brand-light cursor-pointer transition-colors">
                        {condition.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Related */}
            {related.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Liknande vårdgivare
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {related.map((pro) => (
                    <ProfessionalCard key={pro.id} professional={pro} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Map */}
            {nearbyMarkers.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Plats</h2>
                <MapView
                  markers={nearbyMarkers}
                  zoom={13}
                  className="w-full h-64 rounded-lg overflow-hidden border border-border"
                />
              </div>
            )}

            {/* Booking CTA */}
            <div className="bg-brand-light border border-brand/20 rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-2">Boka tid</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Boka en tid direkt med {professional.name}.
              </p>
              <Button variant="brand" className="w-full" asChild>
                <a href={professional.bookingUrl} target="_blank" rel="noopener noreferrer">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Gå till bokning
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
