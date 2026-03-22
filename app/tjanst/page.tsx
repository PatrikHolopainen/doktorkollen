import type { Metadata } from 'next'
import { getAllServices } from '@/lib/data'
import { ServicesFilter } from '@/components/services-filter'
import { JsonLd } from '@/components/json-ld'

export const metadata: Metadata = {
  title: 'Medicinska tjänster',
  description:
    'Utforska medicinska tjänster i Sverige. Psykologi, kardiologi, fysioterapi, dermatologi, ortopedi, gynekologi, neurologi och allmänmedicin.',
  openGraph: {
    title: 'Medicinska tjänster | Doktorkollen',
    description: 'Hitta rätt specialist för din hälsa.',
  },
}

export default async function TjanstPage() {
  const services = await getAllServices()

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Medicinska tjänster',
    description: 'Lista över medicinska tjänster på Doktorkollen',
    numberOfItems: services.length,
    itemListElement: services.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.name,
      url: `https://doktorkollen.com/tjanst/${s.slug}`,
    })),
  }

  return (
    <>
      <JsonLd data={itemListJsonLd} />
      <div className="container mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Medicinska tjänster
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Hitta rätt specialist för din hälsa. Vi listar legitimerade vårdgivare inom alla
            medicinska specialiteter.
          </p>
        </div>

        <ServicesFilter services={services} />
      </div>
    </>
  )
}
