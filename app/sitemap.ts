import type { MetadataRoute } from 'next'
import {
  getAllServices,
  getAllConditions,
  getAllProfessionals,
  getAllClinics,
  getAllCities,
} from '@/lib/data'

const BASE = 'https://doktorkollen.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, conditions, professionals, clinics, cities] = await Promise.all([
    getAllServices(),
    getAllConditions(),
    getAllProfessionals(),
    getAllClinics(),
    getAllCities(),
  ])

  const now = new Date()

  const entries: MetadataRoute.Sitemap = [
    // Static pages
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/tjanst`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/tillstand`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/vardgivare`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/klinik`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },

    // Services
    ...services.map((s) => ({
      url: `${BASE}/tjanst/${s.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),

    // Services × cities
    ...services.flatMap((s) =>
      cities.map((c) => ({
        url: `${BASE}/tjanst/${s.slug}/${c.slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    ),

    // Conditions
    ...conditions.map((c) => ({
      url: `${BASE}/tillstand/${c.slug}`,
      lastModified: c.lastModified ? new Date(c.lastModified) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),

    // Conditions × cities
    ...conditions.flatMap((c) =>
      cities.map((city) => ({
        url: `${BASE}/tillstand/${c.slug}/${city.slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    ),

    // Professionals
    ...professionals.map((p) => ({
      url: `${BASE}/vardgivare/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),

    // Clinics
    ...clinics.map((c) => ({
      url: `${BASE}/klinik/${c.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]

  return entries
}
