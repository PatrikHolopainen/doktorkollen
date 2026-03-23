import path from 'path'
import type { Professional } from './types'

let _cache: Professional[] | null = null

function slugify(str = '') {
  return str.toLowerCase()
    .replace(/å/g, 'a').replace(/ä/g, 'a').replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function loadProfessionals(): Professional[] {
  if (_cache) return _cache

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs') as typeof import('fs')

  function readJson<T>(filePath: string): T[] {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T[]
    } catch {
      return []
    }
  }

  const dataDir = path.join(process.cwd(), 'data')
  const seen    = new Set<string>()
  const result: Professional[] = []

  function add(p: Professional) {
    if (seen.has(p.slug)) {
      // Disambiguate duplicate slugs with index
      p = { ...p, slug: `${p.slug}-${seen.size}` }
    }
    seen.add(p.slug)
    result.push(p)
  }

  // ── Sophiahemmet ────────────────────────────────────────────────────────
  type SophiaDoc = {
    name: string; firstName?: string; lastName?: string
    credential?: string; specialty?: string; careArea?: string
    careTaker?: string; clinicName?: string; clinicUrl?: string
    location?: string; house?: string; photoUrl?: string
    lat?: number; lng?: number
  }

  const sophiaDoctors = readJson<SophiaDoc>(path.join(dataDir, 'sophiahemmet-doctors.json'))
  for (const d of sophiaDoctors) {
    if (!d.name) continue
    const slug = slugify(d.name)
    const specialty = d.specialty ?? d.careArea?.replace(/-/g, ' ') ?? null
    const clinic    = d.clinicName ?? (d.careTaker ? d.careTaker.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : null)
    add({
      id:           `sophiahemmet-${slug}`,
      slug,
      name:         d.name,
      title:        d.credential ?? 'Leg. läkare',
      specialties:  specialty ? [specialty] : [],
      clinicIds:    [],
      citySlug:     'stockholm',
      city:         'Stockholm',
      introduction: '',
      bookingUrl:   d.clinicUrl ?? '',
      lat:          d.lat ?? 0,
      lng:          d.lng ?? 0,
      imageUrl:     d.photoUrl ?? undefined,
      conditionIds: [],
      serviceIds:   [],
      source:       'sophiahemmet',
      clinicName:   clinic ?? undefined,
      clinicUrl:    d.clinicUrl ?? undefined,
    } as Professional & Record<string, unknown>)
  }

  // ── Aleris ──────────────────────────────────────────────────────────────
  type AlerisDoc = {
    name: string; title?: string; clinicName?: string
    clinicUrl?: string; city?: string; lat?: number; lng?: number
  }

  const alerisDoctors = readJson<AlerisDoc>(path.join(dataDir, 'aleris-doctors.json'))
  for (const d of alerisDoctors) {
    if (!d.name) continue
    const slug    = slugify(d.name)
    const city    = d.city ?? 'Sverige'
    const citySlug = slugify(city)
    add({
      id:           `aleris-${slug}`,
      slug,
      name:         d.name,
      title:        d.title ?? 'Läkare',
      specialties:  [],
      clinicIds:    [],
      citySlug,
      city,
      introduction: '',
      bookingUrl:   d.clinicUrl ?? '',
      lat:          d.lat ?? 0,
      lng:          d.lng ?? 0,
      imageUrl:     undefined,
      conditionIds: [],
      serviceIds:   [],
      source:       'aleris',
      clinicName:   d.clinicName ?? undefined,
      clinicUrl:    d.clinicUrl ?? undefined,
    } as Professional & Record<string, unknown>)
  }

  _cache = result
  return _cache
}
