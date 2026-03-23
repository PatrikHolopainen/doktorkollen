import type { Metadata } from 'next'
import { getAllClinics, getAllCities } from '@/lib/data'
import { ClinicsFilter } from '@/components/clinics-filter'
import { JsonLd } from '@/components/json-ld'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Kliniker',
  description:
    'Hitta kliniker och vårdmottagningar i Sverige. Psykologcenter, hjärtmottagningar, hudkliniker, ortopedkliniker med mera.',
  openGraph: {
    title: 'Kliniker | Doktorkollen',
    description: 'Hitta rätt klinik för din hälsa.',
  },
}

export default async function KlinikPage() {
  const [clinics, cities] = await Promise.all([getAllClinics(), getAllCities()])

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Kliniker',
    description: 'Lista över kliniker på Doktorkollen',
    numberOfItems: clinics.length,
    itemListElement: clinics.slice(0, 100).map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      url: `https://doktorkollen.com/klinik/${c.slug}`,
    })),
  }

  return (
    <>
      <JsonLd data={itemListJsonLd} />
      <div className="container mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Kliniker</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Hitta kliniker och mottagningar nära dig. Bläddra, filtrera efter stad och
            boka tid direkt.
          </p>
        </div>

        <ClinicsFilter clinics={clinics} cities={cities} />
      </div>
    </>
  )
}
