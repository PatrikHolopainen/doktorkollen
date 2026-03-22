import type { Metadata } from 'next'
import { getAllConditions } from '@/lib/data'
import { ConditionsFilter } from '@/components/conditions-filter'
import { JsonLd } from '@/components/json-ld'

export const metadata: Metadata = {
  title: 'Medicinska tillstånd',
  description:
    'Information om vanliga medicinska tillstånd i Sverige. Depression, ryggsmärta, hypertoni, eksem, ångest, migrän, diabetes typ 2, knäartros med mera.',
  openGraph: {
    title: 'Medicinska tillstånd | Doktorkollen',
    description: 'Hitta information och specialister för ditt tillstånd.',
  },
}

export default async function TillstandPage() {
  const conditions = await getAllConditions()

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Medicinska tillstånd',
    description: 'Lista över medicinska tillstånd på Doktorkollen',
    numberOfItems: conditions.length,
    itemListElement: conditions.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      url: `https://doktorkollen.com/tillstand/${c.slug}`,
    })),
  }

  return (
    <>
      <JsonLd data={itemListJsonLd} />
      <div className="container mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Medicinska tillstånd
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Läs om symptom, behandlingar och hitta specialister för vanliga medicinska tillstånd.
          </p>
        </div>

        <ConditionsFilter conditions={conditions} />
      </div>
    </>
  )
}
