import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, ArrowLeft } from 'lucide-react'
import {
  getAllServices,
  getServiceBySlug,
  getProfessionalsByService,
  getAllCities,
} from '@/lib/data'
import { ProfessionalCard } from '@/components/professional-card'
import { JsonLd } from '@/components/json-ld'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Props {
  params: Promise<{ tjanst: string }>
}

export async function generateStaticParams() {
  const services = await getAllServices()
  return services.map((s) => ({ tjanst: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tjanst } = await params
  const service = await getServiceBySlug(tjanst)
  if (!service) return { title: 'Tjänst hittades inte' }
  return {
    title: `${service.name} – Hitta specialister`,
    description: service.description,
    openGraph: {
      title: `${service.name} | Doktorkollen`,
      description: service.description,
    },
  }
}

export default async function TjanstDetailPage({ params }: Props) {
  const { tjanst } = await params
  const [service, professionals, cities] = await Promise.all([
    getServiceBySlug(tjanst),
    getProfessionalsByService(tjanst),
    getAllCities(),
  ])

  if (!service) notFound()

  const citiesWithPros = cities.filter((city) =>
    professionals.some((p) => p.citySlug === city.slug)
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalSpecialty',
    name: service.name,
    description: service.longDescription,
    url: `https://doktorkollen.com/tjanst/${service.slug}`,
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="container mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        {/* Back */}
        <Link
          href="/tjanst"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Alla tjänster
        </Link>

        {/* Header */}
        <div className="max-w-3xl mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{service.name}</h1>
          <p className="text-lg text-muted-foreground mb-6">{service.longDescription}</p>

          {service.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {service.specialties.map((spec) => (
                <Badge key={spec} variant="brand">
                  {spec}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Professionals */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Tillgängliga vårdgivare ({professionals.length})
          </h2>
          {professionals.length === 0 ? (
            <p className="text-muted-foreground">
              Inga vårdgivare hittades för denna tjänst ännu.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {professionals.map((pro) => (
                <ProfessionalCard key={pro.id} professional={pro} />
              ))}
            </div>
          )}
        </section>

        {/* Cities */}
        {citiesWithPros.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Städer med {service.name.toLowerCase()}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {citiesWithPros.map((city) => (
                <Link key={city.slug} href={`/tjanst/${service.slug}/${city.slug}`}>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-white hover:border-brand hover:shadow-sm transition-all duration-200 text-center group">
                    <MapPin className="h-5 w-5 text-brand" />
                    <span className="text-sm font-medium text-foreground group-hover:text-brand transition-colors">
                      {city.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
