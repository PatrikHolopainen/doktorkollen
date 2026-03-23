import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import {
  getAllConditions,
  getConditionBySlug,
  getAllCities,
  getCityBySlug,
  getProfessionalsByCityAndCondition,
} from '@/lib/data'
import { ProfessionalCard } from '@/components/professional-card'
import { MapView } from '@/components/map-view'
import { JsonLd } from '@/components/json-ld'

interface Props {
  params: { tillstand: string; stad: string }
}

// Render on demand — too many combos to pre-render (conditions × cities)
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [condition, city] = await Promise.all([
    getConditionBySlug(params.tillstand),
    getCityBySlug(params.stad),
  ])
  if (!condition || !city) return { title: 'Sidan hittades inte' }
  return {
    title: `${condition.name} i ${city.name} – Specialister`,
    description: `Hitta specialister för ${condition.name.toLowerCase()} i ${city.name}. Jämför vårdgivare och boka tid.`,
    openGraph: {
      title: `${condition.name} i ${city.name} | Doktorkollen`,
      description: `Hitta specialister för ${condition.name.toLowerCase()} i ${city.name}.`,
    },
  }
}

export default async function TillstandStadPage({ params }: Props) {
  const [condition, city, professionals] = await Promise.all([
    getConditionBySlug(params.tillstand),
    getCityBySlug(params.stad),
    getProfessionalsByCityAndCondition(params.stad, params.tillstand),
  ])

  if (!condition || !city) notFound()

  const markers = professionals
    .filter((p) => p.lat !== 0 && p.lng !== 0)
    .map((p) => ({
      id: p.id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      url: `/vardgivare/${p.slug}`,
      subtitle: p.title,
    }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${condition.name} i ${city.name}`,
    description: `Specialister för ${condition.name.toLowerCase()} i ${city.name}`,
    numberOfItems: professionals.length,
    itemListElement: professionals.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `https://doktorkollen.com/vardgivare/${p.slug}`,
    })),
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="container mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/tillstand" className="hover:text-brand transition-colors">
            Tillstånd
          </Link>
          <span>/</span>
          <Link href={`/tillstand/${condition.slug}`} className="hover:text-brand transition-colors">
            {condition.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">{city.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {condition.name} i {city.name}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Hitta specialister för {condition.name.toLowerCase()} i {city.name}.
            Vi har {professionals.length} vårdgivare som behandlar detta tillstånd i området.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Professionals */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-foreground mb-5">
              Specialister ({professionals.length})
            </h2>
            {professionals.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">
                  Inga specialister hittades för {condition.name.toLowerCase()} i {city.name}.
                </p>
                <Link
                  href={`/tillstand/${condition.slug}`}
                  className="mt-3 inline-flex items-center gap-1 text-sm text-brand hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Se alla specialister för {condition.name.toLowerCase()}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {professionals.map((pro) => (
                  <ProfessionalCard key={pro.id} professional={pro} />
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-foreground mb-5">Karta</h2>
            <MapView
              markers={markers}
              center={[city.lat, city.lng]}
              zoom={12}
              className="w-full h-80 rounded-lg overflow-hidden border border-border"
            />
          </div>
        </div>
      </div>
    </>
  )
}
