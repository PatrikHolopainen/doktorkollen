import path from 'path'
import type { Clinic, City } from './types'

let _clinicsCache: Clinic[] | null = null
let _citiesCache: City[] | null = null

function slugify(str = '') {
  return str.toLowerCase()
    .replace(/å/g, 'a').replace(/ä/g, 'a').replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

type Raw1177Clinic = {
  slug?: string; name: string; city?: string; region?: string
  phone?: string; website?: string; street?: string; postcode?: string
  lat?: number; lng?: number; services?: string[]; url1177?: string
  description?: string; hasOnlineBooking?: boolean
}

function readClinicsFile(): Raw1177Clinic[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs')
    const p  = path.join(process.cwd(), 'data', '1177-clinics.json')
    return JSON.parse(fs.readFileSync(p, 'utf8')) as Raw1177Clinic[]
  } catch {
    return []
  }
}

export function loadClinics(): Clinic[] {
  if (_clinicsCache) return _clinicsCache

  const raw = readClinicsFile()
  const seen = new Set<string>()

  _clinicsCache = raw
    .filter(c => c.name && c.city)
    .map((c): Clinic => {
      let slug = c.slug ?? slugify(c.name)
      if (seen.has(slug)) slug = `${slug}-${slugify(c.city ?? '')}`
      seen.add(slug)

      return {
        id:              `1177-${slug}`,
        slug,
        name:            c.name,
        address:         c.street ?? '',
        city:            c.city ?? '',
        citySlug:        slugify(c.city ?? ''),
        phone:           c.phone ?? '',
        email:           '',
        website:         c.website ?? '',
        bookingUrl:      c.url1177 ?? '',
        lat:             c.lat ?? 0,
        lng:             c.lng ?? 0,
        professionalIds: [],
        services:        c.services ?? [],
        description:     c.description ?? '',
      }
    })

  return _clinicsCache
}

export function loadCities(): City[] {
  if (_citiesCache) return _citiesCache

  // City coordinates (rough centre points for Sweden's major cities)
  const CITY_COORDS: Record<string, [number, number]> = {
    stockholm:   [59.3293, 18.0686],
    goteborg:    [57.7089, 11.9746],
    malmo:       [55.6050, 13.0038],
    uppsala:     [59.8588, 17.6389],
    linkoping:   [58.4108, 15.6214],
    vasteras:    [59.6099, 16.5448],
    orebro:      [59.2741, 15.2066],
    helsingborg: [56.0467, 12.6945],
    norrkoping:  [58.5877, 16.1924],
    jonkoping:   [57.7826, 14.1618],
    umea:        [63.8258, 20.2630],
    lund:        [55.7047, 13.1910],
    boras:       [57.7210, 12.9401],
    sundsvall:   [62.3908, 17.3069],
    gavle:       [60.6749, 17.1413],
    sodertälje:  [59.1955, 17.6253],
    eskilstuna:  [59.3666, 16.5077],
    karlstad:    [59.4022, 13.5115],
    vaxjo:       [56.8777, 14.8091],
    lulea:       [65.5848, 22.1547],
  }

  const clinics = readClinicsFile()
  const cityMap = new Map<string, { name: string; slug: string; count: number }>()

  for (const c of clinics) {
    if (!c.city) continue
    const slug = slugify(c.city)
    if (!cityMap.has(slug)) {
      cityMap.set(slug, { name: c.city, slug, count: 1 })
    } else {
      cityMap.get(slug)!.count++
    }
  }

  // Keep cities with at least 3 clinics, add coordinates
  _citiesCache = Array.from(cityMap.values())
    .filter(c => c.count >= 3)
    .sort((a, b) => b.count - a.count)
    .slice(0, 50)
    .map(c => {
      const coords = CITY_COORDS[c.slug] ?? [59.33, 18.07]
      return { slug: c.slug, name: c.name, lat: coords[0], lng: coords[1] }
    })

  return _citiesCache
}
