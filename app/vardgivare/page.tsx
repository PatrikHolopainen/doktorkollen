import type { Metadata } from 'next'
import { getAllProfessionals, getAllCities } from '@/lib/data'
import { ProfessionalsFilter } from '@/components/professionals-filter'
import { JsonLd } from '@/components/json-ld'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Vårdgivare',
  description:
    'Hitta legitimerade läkare, psykologer, fysioterapeuter och specialister i Sverige. Bläddra bland våra vårdgivare och boka tid.',
  openGraph: {
    title: 'Vårdgivare | Doktorkollen',
    description: 'Hitta rätt läkare och specialist för din hälsa.',
  },
}

export default async function VardgivarePage() {
  const [professionals, cities] = await Promise.all([getAllProfessionals(), getAllCities()])

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Vårdgivare',
    description: 'Lista över vårdgivare på Doktorkollen',
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
      <JsonLd data={itemListJsonLd} />
      <div className="container mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Vårdgivare</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Hitta legitimerade läkare, psykologer, fysioterapeuter och specialister runt om i
            Sverige.
          </p>
        </div>

        <ProfessionalsFilter professionals={professionals} cities={cities} />
      </div>
    </>
  )
}
