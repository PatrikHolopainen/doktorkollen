import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, AlertTriangle, ArrowRight, MapPin, ExternalLink, Stethoscope } from 'lucide-react'
import {
  getAllConditions,
  getConditionBySlug,
  getProfessionalsByCondition,
  getAllCities,
} from '@/lib/data'
import { ProfessionalCard } from '@/components/professional-card'
import { JsonLd } from '@/components/json-ld'
import { Badge } from '@/components/ui/badge'

interface Props {
  params: { tillstand: string }
}

export async function generateStaticParams() {
  const conditions = await getAllConditions()
  return conditions.map((c) => ({ tillstand: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const condition = await getConditionBySlug(params.tillstand)
  if (!condition) return { title: 'Tillstånd hittades inte' }
  return {
    title: `${condition.name} – Symptom, behandling och specialister`,
    description: condition.description,
    openGraph: {
      title: `${condition.name} | Doktorkollen`,
      description: condition.description,
    },
  }
}

export default async function TillstandDetailPage({ params }: Props) {
  const [condition, professionals, cities] = await Promise.all([
    getConditionBySlug(params.tillstand),
    getProfessionalsByCondition(params.tillstand),
    getAllCities(),
  ])

  if (!condition) notFound()

  const citiesWithPros = cities.filter((city) =>
    professionals.some((p) => p.citySlug === city.slug)
  )

  const whenToSeek = condition.whenToSeekCare ?? condition.whenToVisit ?? null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name: condition.name,
    description: condition.description,
    url: `https://doktorkollen.com/tillstand/${condition.slug}`,
    signOrSymptom: condition.symptoms.map((s) => ({
      '@type': 'MedicalSymptom',
      name: s,
    })),
    ...(condition.treatments?.length ? {
      possibleTreatment: condition.treatments.map((t) => ({
        '@type': 'MedicalTherapy',
        name: t,
      })),
    } : {}),
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
          <span className="text-foreground">{condition.name}</span>
        </nav>

        {/* Header */}
        <div className="max-w-3xl mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {condition.name}
          </h1>
          <p className="text-lg text-muted-foreground">{condition.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Symptoms */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-5">Vanliga symptom</h2>
              <ul className="space-y-2">
                {condition.symptoms.map((symptom) => (
                  <li key={symptom} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-health shrink-0 mt-0.5" />
                    <span className="text-foreground">{symptom}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Treatments */}
            {condition.treatments && condition.treatments.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-5">Behandlingsalternativ</h2>
                <ul className="space-y-2">
                  {condition.treatments.map((treatment) => (
                    <li key={treatment} className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-brand shrink-0 mt-2" />
                      <span className="text-foreground">{treatment}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* When to visit */}
            {whenToSeek && (
              <section>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h2 className="text-lg font-semibold text-foreground mb-2">
                        När ska du söka vård?
                      </h2>
                      <p className="text-foreground">{whenToSeek}</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* FAQ */}
            {condition.faq && condition.faq.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-5">
                  Vanliga frågor
                </h2>
                <div className="space-y-4">
                  {condition.faq.map((item, i) => (
                    <div key={i} className="border border-border rounded-xl p-5 bg-white">
                      <h3 className="font-semibold text-foreground mb-2">{item.question}</h3>
                      <p className="text-muted-foreground">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Professionals */}
            {professionals.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-5">
                  Specialister som behandlar {condition.name.toLowerCase()}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {professionals.map((pro) => (
                    <ProfessionalCard key={pro.id} professional={pro} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick facts */}
            <div className="border border-border rounded-xl p-5 bg-white">
              <h3 className="font-semibold text-foreground mb-4">Snabbfakta</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wide">Symptom</dt>
                  <dd className="mt-1 text-sm text-foreground">{condition.symptoms.length} kända symptom</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wide">Behandlingar</dt>
                  <dd className="mt-1 text-sm text-foreground">{condition.treatments?.length ?? 0} behandlingsalternativ</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wide">Specialister</dt>
                  <dd className="mt-1 text-sm text-foreground">{professionals.length} på Doktorkollen</dd>
                </div>
              </dl>
            </div>

            {/* Cities */}
            {citiesWithPros.length > 0 && (
              <div className="border border-border rounded-xl p-5 bg-white">
                <h3 className="font-semibold text-foreground mb-4">Städer med specialister</h3>
                <div className="space-y-2">
                  {citiesWithPros.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/tillstand/${condition.slug}/${city.slug}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-brand-light/50 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-brand" />
                        <span className="text-sm text-foreground group-hover:text-brand transition-colors">
                          {city.name}
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-brand transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Specialties */}
            {condition.specialties && condition.specialties.length > 0 && (
              <div className="border border-border rounded-xl p-5 bg-white">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-brand" />
                  Behandlande specialiteter
                </h3>
                <div className="flex flex-wrap gap-2">
                  {condition.specialties.map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Source */}
            {condition.source && condition.sourceUrl && (
              <div className="border border-border rounded-xl p-4 bg-white">
                <p className="text-xs text-muted-foreground mb-2">Källa</p>
                <a
                  href={condition.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-brand hover:underline"
                >
                  {condition.source}
                  <ExternalLink className="h-3 w-3" />
                </a>
                {condition.lastModified && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Uppdaterad: {new Date(condition.lastModified).toLocaleDateString('sv-SE')}
                  </p>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-brand-light border border-brand/20 rounded-xl p-4">
              <p className="text-xs text-muted-foreground">
                Informationen på denna sida är generell och ersätter inte professionell medicinsk
                rådgivning. Konsultera alltid en läkare för diagnos och behandling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
